// src/views/profileView.js
// Orquestador de la sección de perfiles: conecta el formulario, la lista,
// la persistencia en localStorage y la navegación con el chat.

import {
  addProfile,
  getProfiles,
  removeProfile,
  getActiveProfile,
  getActiveProfileId,
  setActiveProfileId,
} from "../services/profilesStorage.js";
import { toProfile, validateProfile } from "../transform/profile.js";
import {
  renderProfileList,
  renderActiveProfileSummary,
  readProfileForm,
  resetProfileForm,
  showFieldErrors,
  clearProfileErrors,
  showFormNotice,
  clearFormNotice,
} from "../ui/profileUI.js";
import { onOpenProfiles, onBackToChat, showChatView, showProfilesView } from "../ui/navigationUI.js";

function refresh() {
  const profiles = getProfiles();
  const storedActiveId = getActiveProfileId();
  const activeId = profiles.some((profile) => profile.id === storedActiveId) ? storedActiveId : null;

  if (storedActiveId && !activeId) {
    setActiveProfileId(null);
  }

  renderProfileList(profiles, activeId, {
    onActivate(id) {
      setActiveProfileId(id);
      refresh();

      const profile = profiles.find((item) => item.id === id);
      if (profile) showFormNotice(`Perfil activo: ${profile.avatar} ${profile.name}.`, "info");
    },

    onDelete(id) {
      const profile = profiles.find((item) => item.id === id);
      if (!profile) return;

      if (!window.confirm(`¿Eliminar el perfil "${profile.name}"?`)) return;

      removeProfile(id);
      refresh();
      showFormNotice("Perfil eliminado.", "info");
    },
  });

  renderActiveProfileSummary(getActiveProfile());
}

export function initProfileView() {
  refresh();

  onOpenProfiles(() => {
    showProfilesView();
    clearFormNotice();
    refresh();
  });

  onBackToChat(() => {
    showChatView();
  });

  document.getElementById("profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    clearProfileErrors();
    clearFormNotice();

    const formData = readProfileForm();
    const { valid, errors } = validateProfile(formData);

    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    try {
      const profile = toProfile(formData);
      addProfile(profile);
      setActiveProfileId(profile.id);
      resetProfileForm();
      refresh();
      showFormNotice(`Perfil "${profile.name}" guardado y activo.`);
    } catch (error) {
      console.error("Error guardando el perfil:", error);
      showFormNotice(error.message || "No se pudo guardar el perfil.", "error");
    }
  });
}
