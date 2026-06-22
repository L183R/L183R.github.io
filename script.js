const GITHUB_USER = "L183R";
const BACKGROUND_MUSIC = "Cuatro Sombras Verdes.mp3";

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
  }
};

const state = {
  currentCategory: "ciberseguridad",
  currentCategoryIndex: 0,
  musicReady: false
};

const categoryKeys = Object.keys(projectCategories);
const categoryButtons = document.querySelectorAll(".coin-button");
const stageMap = document.querySelector("#stage-map");
const categoryGrid = document.querySelector("#category-grid");
const totalCounter = document.querySelector("#total-counter");
const categoryCounter = document.querySelector("#category-counter");
const fighterStage = document.querySelector("#fighter-stage");
const fighterTitle = document.querySelector("#fighter-title");
const fighterDescription = document.querySelector("#fighter-description");
const fighterRoster = document.querySelector("#fighter-roster");
const musicToggle = document.querySelector("#music-toggle");
const backgroundMusic = document.querySelector("#background-music");

backgroundMusic?.setAttribute("src", BACKGROUND_MUSIC);

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
    if (element.classList.contains("coin-button")) {
      element.setAttribute("aria-pressed", String(element.dataset.category === categoryKey));
    }
  });
}

function getCurrentProjectCards() {
  return [...fighterRoster.querySelectorAll(".fighter-card[href]")];
}

function focusFirstProject() {
  getCurrentProjectCards()[0]?.focus({ preventScroll: true });
}

function focusCategoryButton(categoryKey = state.currentCategory) {
  document.querySelector(`.coin-button[data-category="${categoryKey}"]`)?.focus({ preventScroll: true });
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

function changeCategory(categoryKey, { focusMenu = false, scrollToFighter = false } = {}) {
  state.currentCategory = categoryKey;
  state.currentCategoryIndex = categoryKeys.indexOf(categoryKey);
  setActiveCategory(categoryKey);
  renderFighterSelect(categoryKey);

  if (focusMenu) focusCategoryButton(categoryKey);
  if (scrollToFighter) document.querySelector(".fighter-select").scrollIntoView({ behavior: "smooth", block: "start" });
}

function changeCategoryByOffset(offset) {
  const nextIndex = (state.currentCategoryIndex + offset + categoryKeys.length) % categoryKeys.length;
  changeCategory(categoryKeys[nextIndex], { focusMenu: true, scrollToFighter: true });
}

function renderCategoryGrid() {
  categoryGrid.innerHTML = Object.entries(projectCategories).map(([key, category]) => {
    const projectList = category.projects.length
      ? category.projects.map((project) => `<li><a href="${getProjectUrl(project)}" target="_blank" rel="noopener noreferrer">${project}</a></li>`).join("")
      : `<li class="empty-slot">Bonus bloqueado · esperando práctica</li>`;

    return `
      <article class="stage-card" data-category="${key}" style="--accent: ${category.color}" tabindex="0" role="button" aria-label="Seleccionar ${category.name}">
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
    const selectCard = () => {
      startBackgroundMusic();
      changeCategory(card.dataset.category, { scrollToFighter: true });
    };
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      selectCard();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCard();
      }
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

function startBackgroundMusic() {
  if (!backgroundMusic || !musicToggle || state.musicReady) return;

  backgroundMusic.volume = 0.42;
  backgroundMusic.play()
    .then(() => {
      state.musicReady = true;
      musicToggle.classList.add("is-playing");
      musicToggle.textContent = "♫ Música ON";
      musicToggle.setAttribute("aria-pressed", "true");
    })
    .catch(() => {
      musicToggle.textContent = "♫ Activar música";
      musicToggle.setAttribute("aria-pressed", "false");
    });
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

function handleKeyboardNavigation(event) {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;

  const key = event.key.toLowerCase();
  const movementKeys = ["arrowleft", "a", "arrowright", "d", "arrowup", "w", "arrowdown", "s"];
  if (!movementKeys.includes(key)) return;

  event.preventDefault();
  startBackgroundMusic();

  if (key === "arrowleft" || key === "a") {
    changeCategoryByOffset(-1);
    return;
  }

  if (key === "arrowright" || key === "d") {
    changeCategoryByOffset(1);
    return;
  }

  if (key === "arrowdown" || key === "s") {
    document.querySelector(".fighter-select").scrollIntoView({ behavior: "smooth", block: "start" });
    focusFirstProject();
    return;
  }

  document.querySelector(".stage-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  focusCategoryButton();
}

categoryButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    startBackgroundMusic();
    changeCategory(button.dataset.category, { scrollToFighter: true });
  });
});

musicToggle?.addEventListener("click", toggleBackgroundMusic);
document.addEventListener("keydown", handleKeyboardNavigation);

totalCounter.textContent = getTotalProjects().toString().padStart(2, "0");
categoryCounter.textContent = Object.keys(projectCategories).length.toString().padStart(2, "0");
renderCategoryGrid();
renderStageMap();
changeCategory(state.currentCategory);
