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

const state = {
  currentCategory: "ciberseguridad"
};

const categoryButtons = document.querySelectorAll(".coin-button");
const stageMap = document.querySelector("#stage-map");
const categoryGrid = document.querySelector("#category-grid");
const totalCounter = document.querySelector("#total-counter");
const categoryCounter = document.querySelector("#category-counter");
const fighterStage = document.querySelector("#fighter-stage");
const fighterTitle = document.querySelector("#fighter-title");
const fighterDescription = document.querySelector("#fighter-description");
const fighterRoster = document.querySelector("#fighter-roster");

function getTotalProjects() {
  return Object.values(projectCategories).reduce((total, category) => total + category.projects.length, 0);
}

function getProjectUrl(projectName) {
  return `https://github.com/${GITHUB_USER}/${projectName}`;
}

function getAllProjects() {
  return Object.entries(projectCategories).flatMap(([categoryKey, category]) =>
    category.projects.map((name) => ({ name, category: categoryKey, categoryName: category.name }))
  );
}

function setActiveCategory(categoryKey) {
  document.querySelectorAll("[data-category]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.category === categoryKey);
  });
}

function renderFighterSelect(categoryKey = state.currentCategory) {
  const category = projectCategories[categoryKey];
  fighterStage.textContent = `${category.stage} · ${category.name}`;
  fighterTitle.textContent = `Elige ${category.name}`;
  fighterDescription.textContent = category.description;

  fighterRoster.innerHTML = category.projects.length
    ? category.projects.map((project, index) => `
      <a class="fighter-card" href="${getProjectUrl(project)}" target="_blank" rel="noopener noreferrer" style="--accent: ${category.color}">
        <span class="fighter-card__sprite">${index + 1}</span>
        <h3>${project}</h3>
        <p>Jugador listo · abrir repo en GitHub</p>
      </a>
    `).join("")
    : `
      <article class="fighter-card fighter-card--empty" style="--accent: ${category.color}">
        <span class="fighter-card__sprite">?</span>
        <h3>Bonus bloqueado</h3>
        <p>Ranura reservada para futuras prácticas y rutas de entrenamiento.</p>
      </article>
    `;
}

function changeCategory(categoryKey) {
  state.currentCategory = categoryKey;
  setActiveCategory(categoryKey);
  renderFighterSelect(categoryKey);
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
      changeCategory(card.dataset.category);
      document.querySelector(".fighter-select").scrollIntoView({ behavior: "smooth", block: "start" });
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

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeCategory(button.dataset.category);
    document.querySelector(".fighter-select").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


totalCounter.textContent = getTotalProjects().toString().padStart(2, "0");
categoryCounter.textContent = Object.keys(projectCategories).length.toString().padStart(2, "0");
renderCategoryGrid();
renderStageMap();
changeCategory(state.currentCategory);
