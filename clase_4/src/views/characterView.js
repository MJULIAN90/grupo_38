import { fetchCharacters } from "../services/rmApi.js";
import { toCharacterProfile } from "../transform/character.js";
import { renderCard } from "../ui/characterCard.js";

export async function loadCharacters(name) {
  try {
    const data = await fetchCharacters(name);
    const results = data.results;

    if (!results?.length) throw new Error("NO_RESULTS");

    return results.slice(0, 6).map(toCharacterProfile);
  } catch (err) {
    if (err.message === "NO_RESULTS") {
      console.log("No se encontraron personajes.");
    } else {
      console.error("Error:", err.message);
    }
    return [];
  }
}

export function renderGrid(profiles) {
  const container = document.getElementById("card-grid");

  if (!profiles.length) {
    container.innerHTML = `
      <p class="empty-state">
        😕 No se encontraron personajes con ese nombre. Probá con otra búsqueda.
      </p>
    `;
    return;
  }

  container.innerHTML = profiles.map(renderCard).join("");
}

export function renderLoading() {
  const container = document.getElementById("card-grid");
  container.innerHTML = `<p class="empty-state">Cargando personajes...</p>`;
}

const searchForm = document.getElementById("search-form");
if (searchForm) {
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("search-input").value.trim();
    if (!name) return;

    renderLoading();
    const profiles = await loadCharacters(name);
    renderGrid(profiles);
  });
}

// Entrada
renderLoading();
loadCharacters("rick").then(renderGrid);