// src/ui/profileUI.js
// Todo lo que toca el DOM de la sección de perfiles: leer el formulario,
// mostrar errores y pintar la lista de perfiles.

const formEl = document.getElementById("profile-form");
const nameEl = document.getElementById("profile-name");
const bioEl = document.getElementById("profile-bio");
const nameErrorEl = document.getElementById("profile-name-error");
const bioErrorEl = document.getElementById("profile-bio-error");
const statusEl = document.getElementById("profile-status");
const listEl = document.getElementById("profile-list");
const emptyEl = document.getElementById("profile-empty");
const activeSummaryEl = document.getElementById("active-profile-summary");

export function readProfileForm() {
  const avatar = formEl.querySelector('input[name="avatar"]:checked')?.value ?? "🙂";

  return {
    name: nameEl.value,
    avatar,
    bio: bioEl.value,
  };
}

export function resetProfileForm() {
  formEl.reset();
  clearProfileErrors();
  nameEl.focus();
}

export function clearProfileErrors() {
  nameErrorEl.hidden = true;
  nameErrorEl.textContent = "";
  bioErrorEl.hidden = true;
  bioErrorEl.textContent = "";
}

export function showFieldErrors(errors) {
  if (errors.name) {
    nameErrorEl.textContent = errors.name;
    nameErrorEl.hidden = false;
  }

  if (errors.bio) {
    bioErrorEl.textContent = errors.bio;
    bioErrorEl.hidden = false;
  }
}

export function showFormNotice(message, type = "success") {
  statusEl.textContent = message;
  statusEl.className = `profile-status profile-status--${type}`;
  statusEl.hidden = false;
}

export function clearFormNotice() {
  statusEl.hidden = true;
  statusEl.textContent = "";
  statusEl.className = "profile-status";
}

export function renderProfileList(profiles, activeId, { onActivate, onDelete }) {
  listEl.replaceChildren();
  emptyEl.hidden = profiles.length > 0;

  profiles.forEach((profile) => {
    const card = document.createElement("article");
    card.className = "profile-card";
    if (profile.id === activeId) card.classList.add("profile-card--active");

    const avatar = document.createElement("span");
    avatar.className = "profile-card__avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = profile.avatar;

    const body = document.createElement("div");
    body.className = "profile-card__body";

    const name = document.createElement("h4");
    name.textContent = profile.name;

    const bio = document.createElement("p");
    bio.textContent = profile.bio || "Sin bio todavía.";

    body.append(name, bio);

    const actions = document.createElement("div");
    actions.className = "profile-card__actions";

    if (profile.id === activeId) {
      const badge = document.createElement("span");
      badge.className = "profile-badge";
      badge.textContent = "Activo";
      actions.appendChild(badge);
    } else {
      const activateButton = document.createElement("button");
      activateButton.type = "button";
      activateButton.className = "btn btn--ghost";
      activateButton.textContent = "Usar";
      activateButton.addEventListener("click", () => onActivate(profile.id));
      actions.appendChild(activateButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn--danger";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => onDelete(profile.id));
    actions.appendChild(deleteButton);

    card.append(avatar, body, actions);
    listEl.appendChild(card);
  });
}

export function renderActiveProfileSummary(profile) {
  if (!profile) {
    activeSummaryEl.textContent = "Sin perfil activo";
    activeSummaryEl.classList.remove("topbar__profile--active");
    activeSummaryEl.removeAttribute("title");
    return;
  }

  activeSummaryEl.textContent = `${profile.avatar} ${profile.name}`;
  activeSummaryEl.classList.add("topbar__profile--active");
  activeSummaryEl.title = `Perfil activo: ${profile.name}`;
}
