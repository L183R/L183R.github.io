const GITHUB_USER = "L183R";
const BACKGROUND_MUSIC = "Cuatro Sombras Verdes.mp3";

const projectCategories = {
  ciberseguridad: {
    name: "Ciberseguridad",
    character: "Guardian Shell",
    image: "ciberseguridad.png",
    icon: "▣",
    stage: "Zona 01",
    description: "Scripts, defensa, análisis y automatización de investigaciones.",
    color: "#9cffb1",
    projects: [
      { name: "gestor-tickets", description: "Sistema para ordenar incidencias, priorizar tareas y mantener una cola operativa de soporte." },
      { name: "csv_to_hash_sha256_comparator", description: "Utilidad para comparar hashes SHA-256 desde CSV y detectar coincidencias o cambios sospechosos." },
      { name: "PowPowerCrawler", description: "Crawler experimental para rastrear objetivos, recolectar datos y preparar reconocimiento técnico." },
      { name: "Password-manager", description: "Gestor de contraseñas pensado como caja fuerte personal para credenciales y secretos." },
      { name: "Buscador", description: "Buscador práctico para filtrar información y acelerar revisiones dentro de conjuntos de datos." }
    ]
  },
  juegos: {
    name: "Juegos",
    character: "Pixel Brawler",
    image: "juegos.png",
    icon: "◆",
    stage: "Zona 02",
    description: "Cartuchos jugables con disparos, tensión, criaturas y sistemas interactivos.",
    color: "#ff7ac8",
    projects: [
      { name: "Necrosis", description: "Experiencia oscura de supervivencia con atmósfera hostil y combate contra criaturas." },
      { name: "Alien-PewPew", description: "Shooter arcade de ciencia ficción: apunta, esquiva y dispara contra oleadas alienígenas." }
    ]
  },
  entrenamiento: {
    name: "Entrenamiento",
    character: "Training Master",
    image: "entrenamiento.png",
    icon: "▲",
    stage: "Zona 03",
    description: "Repos para practicar, aprender y pulir habilidades técnicas.",
    color: "#7ee7ff",
    projects: [
      { name: "L183R.github.io", description: "Portafolio arcade retro para navegar mis repositorios como una pantalla de selección." }
    ]
  }
};

const state = {
  mode: "boot",
  currentCategory: "ciberseguridad",
  currentCategoryIndex: 0,
  currentProjectIndex: 0,
  musicReady: false,
  autoplayAttempted: false
};

const categoryKeys = Object.keys(projectCategories);
const categoryButtons = document.querySelectorAll(".coin-button");
const stageMap = document.querySelector("#stage-map");
const totalCounter = document.querySelector("#total-counter");
const fighterStage = document.querySelector("#fighter-stage");
const fighterTitle = document.querySelector("#fighter-title");
const fighterDescription = document.querySelector("#fighter-description");
const fighterRoster = document.querySelector("#fighter-roster");
const musicToggle = document.querySelector("#music-toggle");
const backgroundMusic = document.querySelector("#background-music");
const arcadeStatus = document.querySelector("#arcade-status");
const screenTitle = document.querySelector("#screen-title");
const screenSubtitle = document.querySelector("#screen-subtitle");
const screenPrompt = document.querySelector("#screen-prompt");
const screenCopyright = document.querySelector("#screen-copyright");
const menuLabel = document.querySelector("#menu-label");

backgroundMusic?.setAttribute("src", BACKGROUND_MUSIC);

function getTotalProjects() {
  return Object.values(projectCategories).reduce((total, category) => total + category.projects.length, 0);
}

function getProjectUrl(projectName) {
  return `https://github.com/${GITHUB_USER}/${projectName}`;
}

function getAllProjects() {
  return Object.entries(projectCategories).flatMap(([categoryKey, category]) =>
    category.projects.map((project) => ({ ...project, category: categoryKey, categoryName: category.name }))
  );
}

function getCurrentCategory() {
  return projectCategories[state.currentCategory];
}

function getCurrentProject() {
  return getCurrentCategory().projects[state.currentProjectIndex];
}

function setActiveCategory(categoryKey) {
  document.querySelectorAll("[data-category]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.category === categoryKey && state.mode !== "boot");
    if (element.classList.contains("coin-button")) {
      element.setAttribute("aria-pressed", String(element.dataset.category === categoryKey && state.mode !== "boot"));
    }
  });
}

function renderArcadeScreen() {
  const category = getCurrentCategory();
  const project = getCurrentProject();
  const isBoot = state.mode === "boot";
  const isCharacter = state.mode === "character";
  const isStage = state.mode === "stage";
  const isProject = state.mode === "project";

  document.body.dataset.screen = state.mode;
  arcadeStatus.textContent = isBoot ? "CREDITS 0" : "CREDITS 1";
  screenTitle.textContent = isBoot ? "Mi repo" : isCharacter ? "Select Character" : isStage ? "Select Stage" : project.name;
  screenSubtitle.textContent = isBoot
    ? "L183R"
    : isCharacter
      ? "Clasificaciones de repos"
      : isStage
        ? `${category.character} · ${category.description}`
        : project.description;
  screenPrompt.textContent = isBoot
    ? "Push Enter"
    : isCharacter
      ? "←/→ elige clasificación · Enter confirma"
      : isStage
        ? "←/→ elige repo · Enter abre ficha"
        : "Enter abre GitHub · Escape vuelve a Select Stage";

  if (screenCopyright) screenCopyright.hidden = !isBoot;

  renderStageMap();
  renderFighterSelect();
  setActiveCategory(state.currentCategory);
}


function updateRosterCarousel() {
  const selectedIndex = state.mode === "character" ? state.currentCategoryIndex : state.currentProjectIndex;
  fighterRoster.style.setProperty("--carousel-offset", `calc(${selectedIndex} * (var(--card-width) + clamp(12px, 1.8vw, 18px)) * -1)`);
}

function renderFighterSelect() {
  const category = getCurrentCategory();
  const project = getCurrentProject();
  fighterStage.textContent = state.mode === "boot" ? "BOOT 1989" : state.mode === "character" ? "SELECT CHARACTER" : `${category.stage} · ${category.name}`;
  fighterTitle.textContent = state.mode === "boot" ? "Credits 0" : state.mode === "character" ? "Select Character" : state.mode === "project" ? project.name : "Select Stage";
  fighterDescription.textContent = state.mode === "boot" ? "Insert coin(s) · Push Enter" : state.mode === "character" ? "Elige una clasificación para cargar sus repos." : state.mode === "project" ? project.description : category.description;
  if (menuLabel) menuLabel.textContent = state.mode === "boot" ? "Insert coin" : state.mode === "character" ? "Class select" : state.mode === "project" ? "Repo card" : "Stage select";

  if (state.mode === "character") {
    fighterRoster.innerHTML = categoryKeys.map((categoryKey, index) => {
      const item = projectCategories[categoryKey];
      return `
        <button class="fighter-card fighter-card--button ${categoryKey === state.currentCategory ? "is-selected" : ""}" type="button" data-category="${categoryKey}" style="--accent: ${item.color}">
          <span class="fighter-card__sprite fighter-card__sprite--portrait" aria-hidden="true"><img src="${item.image}" alt="" loading="lazy"></span>
          <h3>${item.name}</h3>
          <p>${String(index + 1).padStart(2, "0")} · ${item.character}<br>${item.description}</p>
        </button>
      `;
    }).join("");
    updateRosterCarousel();
    return;
  }

  fighterRoster.innerHTML = category.projects.map((repo, index) => `
    <button class="fighter-card fighter-card--button ${index === state.currentProjectIndex ? "is-selected" : ""}" type="button" data-project-index="${index}" style="--accent: ${category.color}">
      <span class="fighter-card__sprite">${String(index + 1).padStart(2, "0")}</span>
      <h3>${repo.name}</h3>
      <p>${repo.description}</p>
    </button>
  `).join("");
  updateRosterCarousel();
}

function changeCategory(categoryKey) {
  state.currentCategory = categoryKey;
  state.currentCategoryIndex = categoryKeys.indexOf(categoryKey);
  state.currentProjectIndex = 0;
  renderArcadeScreen();
}

function changeCategoryByOffset(offset) {
  const nextIndex = (state.currentCategoryIndex + offset + categoryKeys.length) % categoryKeys.length;
  changeCategory(categoryKeys[nextIndex]);
}

function changeProjectByOffset(offset) {
  const projects = getCurrentCategory().projects;
  state.currentProjectIndex = (state.currentProjectIndex + offset + projects.length) % projects.length;
  renderArcadeScreen();
}

function renderStageMap() {
  const isStageLike = state.mode === "stage" || state.mode === "project";
  const items = isStageLike ? getCurrentCategory().projects.map((project, index) => ({ ...project, category: state.currentCategory, index })) : getAllProjects();
  const positions = [[10, 18], [58, 14], [24, 38], [72, 42], [14, 67], [50, 70], [78, 75]];

  stageMap.style.setProperty("--stage-image", `url(${isStageLike ? getCurrentCategory().image : "portada.png"})`);

  stageMap.innerHTML = items.map((project, index) => {
    const [left, top] = positions[index % positions.length];
    const category = projectCategories[project.category];
    const selected = isStageLike && index === state.currentProjectIndex ? " is-selected" : "";
    return `<button class="map-node${selected}" type="button" data-project-index="${index}" style="left: ${left}%; top: ${top}%; --accent: ${category.color}" aria-label="Seleccionar ${project.name}">■<span>${project.name}</span></button>`;
  }).join("");
}

function startBackgroundMusic() {
  if (!backgroundMusic || state.musicReady) return;
  backgroundMusic.volume = 0.42;
  backgroundMusic.play().then(() => {
    state.musicReady = true;
    musicToggle?.classList.add("is-playing");
    if (musicToggle) {
      musicToggle.textContent = "♫ Música ON";
      musicToggle.setAttribute("aria-pressed", "true");
    }
  }).catch(() => {
    if (musicToggle) {
      musicToggle.textContent = "♫ Activar música";
      musicToggle.setAttribute("aria-pressed", "false");
    }
  });
}

function attemptAutoplay() {
  if (state.autoplayAttempted) return;
  state.autoplayAttempted = true;
  startBackgroundMusic();
}

function toggleBackgroundMusic() {
  if (!backgroundMusic || !musicToggle) return;
  if (backgroundMusic.paused) {
    startBackgroundMusic();
    return;
  }
  backgroundMusic.pause();
  state.musicReady = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.textContent = "♫ Música OFF";
  musicToggle.setAttribute("aria-pressed", "false");
}

function confirmSelection() {
  startBackgroundMusic();
  if (state.mode === "boot") state.mode = "character";
  else if (state.mode === "character") state.mode = "stage";
  else if (state.mode === "stage") state.mode = "project";
  else window.open(getProjectUrl(getCurrentProject().name), "_blank", "noopener,noreferrer");
  renderArcadeScreen();
}

function handleKeyboardNavigation(event) {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
  const key = event.key.toLowerCase();
  if (key === "enter") {
    event.preventDefault();
    confirmSelection();
    return;
  }
  if (key === "escape" && state.mode === "project") {
    event.preventDefault();
    state.mode = "stage";
    renderArcadeScreen();
    return;
  }
  if (!["arrowleft", "a", "arrowright", "d"].includes(key) || state.mode === "boot") return;
  event.preventDefault();
  startBackgroundMusic();
  const offset = key === "arrowleft" || key === "a" ? -1 : 1;
  if (state.mode === "character") changeCategoryByOffset(offset);
  else changeProjectByOffset(offset);
}

categoryButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    startBackgroundMusic();
    state.mode = "stage";
    changeCategory(button.dataset.category);
  });
});

fighterRoster.addEventListener("click", (event) => {
  const card = event.target.closest("[data-category], [data-project-index]");
  if (!card) return;
  startBackgroundMusic();
  if (card.dataset.category) {
    state.mode = "stage";
    changeCategory(card.dataset.category);
    return;
  }
  state.currentProjectIndex = Number(card.dataset.projectIndex);
  state.mode = "project";
  renderArcadeScreen();
});

stageMap.addEventListener("click", (event) => {
  const node = event.target.closest("[data-project-index]");
  if (!node || state.mode === "boot" || state.mode === "character") return;
  startBackgroundMusic();
  state.currentProjectIndex = Number(node.dataset.projectIndex);
  state.mode = "project";
  renderArcadeScreen();
});

musicToggle?.addEventListener("click", toggleBackgroundMusic);
document.addEventListener("keydown", handleKeyboardNavigation);
window.addEventListener("load", attemptAutoplay, { once: true });

totalCounter.textContent = getTotalProjects().toString().padStart(2, "0");
renderArcadeScreen();
