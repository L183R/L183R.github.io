const GITHUB_USER = "L183R";

const projectCategories = {
  ciberseguridad: {
    name: "Ciberseguridad",
    icon: "▣",
    stage: "Zona 01",
    description: "Patrulla técnica para scripts, defensa, análisis y automatización de investigaciones.",
    color: "#20e35f",
    projects: [
      "gestor-tickets",
      "csv_to_hash_sha256_comparator",
      "PowPowerCrawler",
      "Password-manager",
      "Buscador"
    ]
  },
  juegos: {
    name: "Juegos",
    icon: "◆",
    stage: "Zona 02",
    description: "Cartuchos jugables con disparos, tensión, criaturas y sistemas interactivos.",
    color: "#ff8a20",
    projects: ["Necrosis", "Alien-PewPew"]
  },
  aprendizaje: {
    name: "Aprendizaje",
    icon: "★",
    stage: "Bonus",
    description: "Sala de entrenamiento reservada para prácticas, notas y rutas de estudio.",
    color: "#26b7ff",
    projects: []
  }
};

const categoryAliases = {
  cyber: "ciberseguridad",
  ciber: "ciberseguridad",
  seguridad: "ciberseguridad",
  games: "juegos",
  game: "juegos",
  aprendizaje: "aprendizaje",
  learn: "aprendizaje",
  learning: "aprendizaje"
};

const state = {
  currentCategory: null,
  currentPath: "~",
  history: [],
  historyIndex: -1
};

const output = document.querySelector("#terminal-output");
const form = document.querySelector("#terminal-form");
const input = document.querySelector("#terminal-command");
const lineTemplate = document.querySelector("#line-template");
const categoryButtons = document.querySelectorAll(".coin-button");
const stageMap = document.querySelector("#stage-map");
const categoryGrid = document.querySelector("#category-grid");
const totalCounter = document.querySelector("#total-counter");
const categoryCounter = document.querySelector("#category-counter");

function normalize(text = "") {
  return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getTotalProjects() {
  return Object.values(projectCategories).reduce((total, category) => total + category.projects.length, 0);
}

function resolveCategory(category) {
  const normalized = normalize(category);
  return projectCategories[normalized] ? normalized : categoryAliases[normalized];
}

function getProjectUrl(projectName) {
  return `https://github.com/${GITHUB_USER}/${projectName}`;
}

function getAllProjects() {
  return Object.entries(projectCategories).flatMap(([categoryKey, category]) =>
    category.projects.map((name) => ({ name, category: categoryKey, categoryName: category.name }))
  );
}

function addLine(text = "", variant = "") {
  const line = lineTemplate.content.firstElementChild.cloneNode(true);
  line.textContent = text;
  if (variant) {
    line.classList.add(`terminal-line--${variant}`);
  }
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function addCommand(command) {
  addLine(`${GITHUB_USER}@github:${state.currentPath}$ ${command}`, "command");
}

function printWelcome() {
  addLine("Gabinete encendido. Créditos: 01", "success");
  addLine("Fases cargadas: ciberseguridad · juegos · aprendizaje", "muted");
  addLine("Escribe 'help', 'stage <zona>' o pulsa un cartucho para desplegar repos.");
  addLine();
}

function printHelp() {
  addLine("Comandos disponibles:", "success");
  addLine("  help                         Muestra esta ayuda");
  addLine("  ls                           Lista categorías o proyectos");
  addLine("  cd/stage <categoria>         Entra en ciberseguridad, juegos o aprendizaje");
  addLine("  cat <proyecto>               Muestra detalles del proyecto");
  addLine("  open <proyecto>              Abre el repositorio en GitHub");
  addLine("  pwd                          Muestra la ruta actual");
  addLine("  clear                        Limpia la terminal");
  addLine("  home                         Vuelve al mapa principal");
}

function printCategories() {
  addLine("Pantalla de selección:", "success");
  Object.entries(projectCategories).forEach(([key, category]) => {
    addLine(`  ${category.stage.padEnd(8)} ${key.padEnd(16)} ${String(category.projects.length).padStart(2, "0")} repo(s)`);
  });
}

function printProjects(categoryKey = state.currentCategory) {
  const category = projectCategories[categoryKey];
  if (!category.projects.length) {
    addLine(`${category.name} no tiene cartucho insertado todavía: bonus listo para futuro entrenamiento.`, "muted");
    return;
  }

  category.projects.forEach((project, index) => {
    addLine(`  ${(index + 1).toString().padStart(2, "0")}  ${project}  →  ${getProjectUrl(project)}`, "repo");
  });
}

function findProject(projectName) {
  const target = normalize(projectName);
  return getAllProjects().find((project) => normalize(project.name) === target || normalize(project.name).includes(target));
}

function printProjectDetails(projectName) {
  const project = findProject(projectName);
  if (!project) {
    addLine(`Proyecto no encontrado: ${projectName}`, "error");
    return;
  }

  addLine(project.name, "repo");
  addLine(`  Categoría: ${project.categoryName}`);
  addLine(`  Estado: cartucho validado`);
  addLine(`  URL: ${getProjectUrl(project.name)}`);
}

function setActiveCategory(categoryKey) {
  document.querySelectorAll("[data-category]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.category === categoryKey);
  });
}

function changeCategory(category) {
  const categoryKey = resolveCategory(category);
  if (!categoryKey) {
    addLine(`Categoría desconocida: ${category}`, "error");
    addLine(`Usa: ${Object.keys(projectCategories).join(", ")}`, "muted");
    return;
  }

  state.currentCategory = categoryKey;
  state.currentPath = `~/${categoryKey}`;
  setActiveCategory(categoryKey);
  addLine(`Entrando a ${state.currentPath}. Preparado para combate de código.`, "success");
  printProjects(categoryKey);
}

function goHome() {
  state.currentCategory = null;
  state.currentPath = "~";
  setActiveCategory(null);
  addLine("Volviendo a la pantalla de selección.", "success");
  printCategories();
}

function openProject(projectName) {
  const project = findProject(projectName);
  if (!project) {
    addLine(`Proyecto no encontrado: ${projectName}`, "error");
    return;
  }

  addLine(`Abriendo ${getProjectUrl(project.name)}`, "success");
  window.open(getProjectUrl(project.name), "_blank", "noopener,noreferrer");
}

function execute(command) {
  const trimmed = command.trim();
  if (!trimmed) return;

  addCommand(trimmed);
  const [rawAction, ...args] = trimmed.split(/\s+/);
  const action = normalize(rawAction);
  const argument = args.join(" ");

  switch (action) {
    case "help":
    case "ayuda":
      printHelp();
      break;
    case "ls":
      state.currentCategory ? printProjects() : printCategories();
      break;
    case "cd":
    case "stage":
    case "fase":
      if (!argument || argument === "~" || argument === "..") goHome();
      else changeCategory(argument);
      break;
    case "cat":
      argument ? printProjectDetails(argument) : addLine("Uso: cat <proyecto>", "error");
      break;
    case "open":
      argument ? openProject(argument) : addLine("Uso: open <proyecto>", "error");
      break;
    case "pwd":
      addLine(state.currentPath);
      break;
    case "clear":
      output.textContent = "";
      break;
    case "home":
      goHome();
      break;
    default:
      addLine(`Comando no encontrado: ${rawAction}`, "error");
      addLine("Prueba con 'help'.", "muted");
  }
}

function renderCategoryGrid() {
  categoryGrid.innerHTML = Object.entries(projectCategories).map(([key, category]) => {
    const projectList = category.projects.length
      ? category.projects.map((project) => `<li><a href="${getProjectUrl(project)}" target="_blank" rel="noopener noreferrer">${project}</a></li>`).join("")
      : `<li class="empty-slot">Bonus bloqueado · esperando práctica</li>`;

    return `
      <article class="stage-card" data-category="${key}" style="--accent: ${category.color}">
        <div class="stage-card__top">
          <span class="stage-card__badge">${category.icon}</span>
          <span class="stage-card__count">${category.stage} · ${category.projects.length.toString().padStart(2, "0")}</span>
        </div>
        <h3>${category.name}</h3>
        <p>${category.description}</p>
        <ul>${projectList}</ul>
      </article>
    `;
  }).join("");

  categoryGrid.querySelectorAll(".stage-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      addCommand(`stage ${card.dataset.category}`);
      changeCategory(card.dataset.category);
      input.focus();
    });
  });
}

function renderStageMap() {
  const positions = [
    [10, 18], [58, 14], [24, 38], [72, 42], [14, 67], [50, 70], [78, 75]
  ];

  stageMap.innerHTML = getAllProjects().map((project, index) => {
    const [left, top] = positions[index % positions.length];
    const category = projectCategories[project.category];
    return `<a class="map-node" href="${getProjectUrl(project.name)}" target="_blank" rel="noopener noreferrer" style="left: ${left}%; top: ${top}%; --accent: ${category.color}" aria-label="Abrir ${project.name}">■<span>${project.name}</span></a>`;
  }).join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const command = input.value;
  state.history.push(command);
  state.historyIndex = state.history.length;
  input.value = "";
  execute(command);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    state.historyIndex = Math.max(0, state.historyIndex - 1);
    input.value = state.history[state.historyIndex] || "";
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
    input.value = state.history[state.historyIndex] || "";
  }
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    addCommand(`stage ${category}`);
    changeCategory(category);
    input.focus();
  });
});

totalCounter.textContent = getTotalProjects().toString().padStart(2, "0");
categoryCounter.textContent = Object.keys(projectCategories).length.toString().padStart(2, "0");
renderCategoryGrid();
renderStageMap();
printWelcome();
printCategories();
input.focus();
