const GITHUB_USER = "L183R";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`;

const categoryDefinitions = {
  ciberseguridad: ["security", "cyber", "pentest", "malware", "forensics", "osint", "crypto", "exploit", "hacking"],
  programacion: ["programming", "programacion", "code", "script", "api", "web", "python", "javascript", "java", "go", "rust"],
  ctf: ["ctf", "capture-the-flag", "writeup", "pwn", "reversing", "challenge", "hackthebox", "tryhackme"],
  juegos: ["game", "games", "juego", "juegos", "unity", "godot", "pygame", "arcade"],
  otros: ["misc", "otros", "tools", "utilities", "utilidades"]
};

const categoryNames = {
  ciberseguridad: "Ciberseguridad",
  programacion: "Programación",
  ctf: "CTF",
  juegos: "Juegos",
  otros: "Otros"
};

const repoCategoryOverrides = {
  "gestor-tickets": "otros",
  "alien-pewpew": "juegos",
  "password-manager": "otros",
  "powpowercrawler": "ciberseguridad",
  "csv_to_hash_sha256_comparator": "ciberseguridad",
  "autoinfinitycraft": "juegos",
  atica: "programacion"
};

const hiddenRepos = new Set([
  "l183r.github.io",
  "ia-test",
  "pokemonheroes",
  "buscador"
]);

const fallbackRepos = [
  {
    name: "repositorios-publicos",
    description: "No se pudieron cargar los repos desde GitHub. Prueba el comando refresh.",
    html_url: `https://github.com/${GITHUB_USER}`,
    language: "GitHub",
    topics: ["programacion"],
    updated_at: new Date().toISOString()
  }
];

const state = {
  repos: [],
  currentCategory: null,
  currentPath: "~",
  history: [],
  historyIndex: -1
};

const output = document.querySelector("#terminal-output");
const form = document.querySelector("#terminal-form");
const input = document.querySelector("#terminal-command");
const lineTemplate = document.querySelector("#line-template");
const categoryButtons = document.querySelectorAll(".category-button");

function normalize(text = "") {
  return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectCategory(repo) {
  const normalizedName = normalize(repo.name);
  if (repoCategoryOverrides[normalizedName]) {
    return repoCategoryOverrides[normalizedName];
  }

  const searchableText = normalize([
    repo.name,
    repo.description,
    repo.language,
    ...(repo.topics || [])
  ].filter(Boolean).join(" "));

  const matched = Object.entries(categoryDefinitions).find(([, keywords]) =>
    keywords.some((keyword) => searchableText.includes(keyword))
  );

  return matched ? matched[0] : "otros";
}

function shouldShowRepo(repo) {
  return !hiddenRepos.has(normalize(repo.name));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(date));
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
  addLine("Inicializando terminal de repositorios públicos...", "success");
  addLine(`Usuario GitHub: ${GITHUB_USER}`, "muted");
  addLine("Escribe 'help' para ver comandos disponibles o usa los botones de categorías.");
  addLine();
}

function printHelp() {
  addLine("Comandos disponibles:", "success");
  addLine("  help                         Muestra esta ayuda");
  addLine("  ls                           Lista categorías o repositorios");
  addLine(`  cd <categoria>               Entra en ${Object.keys(categoryDefinitions).join(", ")}`);
  addLine("  cat <repo>                   Muestra detalles de un repositorio");
  addLine("  open <repo>                  Abre el repositorio en GitHub");
  addLine("  pwd                          Muestra la ruta actual");
  addLine("  clear                        Limpia la terminal");
  addLine("  refresh                      Recarga repositorios desde GitHub");
}

function getVisibleRepos() {
  if (!state.currentCategory) {
    return state.repos;
  }
  return state.repos.filter((repo) => repo.category === state.currentCategory);
}

function printCategories() {
  addLine("Categorías disponibles:", "success");
  Object.keys(categoryDefinitions).forEach((category) => {
    const count = state.repos.filter((repo) => repo.category === category).length;
    addLine(`  ${category.padEnd(16)} ${count} repositorio(s) - ${categoryNames[category]}`);
  });
}

function printRepos(repos = getVisibleRepos()) {
  if (!repos.length) {
    addLine("No hay repositorios en esta categoría todavía.", "muted");
    return;
  }

  repos.forEach((repo) => {
    const language = repo.language || "sin lenguaje";
    addLine(`  ${repo.name}  [${language}]  actualizado: ${formatDate(repo.updated_at)}`, "repo");
    if (repo.description) {
      addLine(`      ${repo.description}`, "muted");
    }
  });
}

function findRepo(repoName) {
  const target = normalize(repoName);
  return state.repos.find((repo) => normalize(repo.name) === target || normalize(repo.name).includes(target));
}

function printRepoDetails(repoName) {
  const repo = findRepo(repoName);
  if (!repo) {
    addLine(`Repositorio no encontrado: ${repoName}`, "error");
    return;
  }

  addLine(repo.name, "repo");
  addLine(`  Categoría: ${categoryNames[repo.category] || repo.category}`);
  addLine(`  Lenguaje: ${repo.language || "No especificado"}`);
  addLine(`  Actualizado: ${formatDate(repo.updated_at)}`);
  addLine(`  URL: ${repo.html_url}`);
  addLine(`  Descripción: ${repo.description || "Sin descripción"}`);
  if (repo.topics?.length) {
    addLine(`  Topics: ${repo.topics.join(", ")}`);
  }
}

function changeCategory(category) {
  const normalizedCategory = normalize(category);
  if (!categoryDefinitions[normalizedCategory]) {
    addLine(`Categoría desconocida: ${category}`, "error");
    addLine(`Usa: ${Object.keys(categoryDefinitions).join(", ")}`, "muted");
    return;
  }

  state.currentCategory = normalizedCategory;
  state.currentPath = `~/${normalizedCategory}`;
  addLine(`Entrando en ${state.currentPath}`, "success");
  printRepos();
}

function goHome() {
  state.currentCategory = null;
  state.currentPath = "~";
  addLine("Volviendo a ~", "success");
  printCategories();
}

function openRepo(repoName) {
  const repo = findRepo(repoName);
  if (!repo) {
    addLine(`Repositorio no encontrado: ${repoName}`, "error");
    return;
  }

  addLine(`Abriendo ${repo.html_url}`, "success");
  window.open(repo.html_url, "_blank", "noopener,noreferrer");
}

function execute(command) {
  const trimmed = command.trim();
  if (!trimmed) {
    return;
  }

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
      state.currentCategory ? printRepos() : printCategories();
      break;
    case "cd":
      if (!argument || argument === "~" || argument === "..") {
        goHome();
      } else {
        changeCategory(argument);
      }
      break;
    case "cat":
      argument ? printRepoDetails(argument) : addLine("Uso: cat <repo>", "error");
      break;
    case "open":
      argument ? openRepo(argument) : addLine("Uso: open <repo>", "error");
      break;
    case "pwd":
      addLine(state.currentPath);
      break;
    case "clear":
      output.textContent = "";
      break;
    case "refresh":
      loadRepos(true);
      break;
    default:
      addLine(`Comando no encontrado: ${rawAction}`, "error");
      addLine("Prueba con 'help'.", "muted");
  }
}

async function loadRepos(showMessage = false) {
  if (showMessage) {
    addLine("Consultando GitHub API...", "muted");
  }

  try {
    const response = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) {
      throw new Error(`GitHub API respondió ${response.status}`);
    }
    const repos = await response.json();
    state.repos = repos
      .filter((repo) => !repo.fork && shouldShowRepo(repo))
      .map((repo) => ({ ...repo, category: detectCategory(repo) }));
    addLine(`${state.repos.length} repositorio(s) cargados correctamente.`, "success");
  } catch (error) {
    state.repos = fallbackRepos.map((repo) => ({ ...repo, category: detectCategory(repo) }));
    addLine("No se pudo contactar con GitHub. Mostrando modo de respaldo.", "error");
    addLine(error.message, "muted");
  }

  state.currentCategory ? printRepos() : printCategories();
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
    addCommand(`cd ${category}`);
    changeCategory(category);
    input.focus();
  });
});

printWelcome();
loadRepos();
input.focus();
