// src/services/profilesStorage.js
// Persistencia de perfiles en localStorage. Este módulo no toca el DOM:
// solo lee y escribe datos para que la vista los muestre.

const PROFILES_KEY = "chat.profiles";
const ACTIVE_PROFILE_KEY = "chat.activeProfileId";

function readProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    throw new Error("No se pudo guardar el perfil en este navegador.");
  }
}

export function getProfiles() {
  return readProfiles();
}

export function addProfile(profile) {
  const profiles = [profile, ...readProfiles().filter((item) => item.id !== profile.id)];
  writeProfiles(profiles);
  return profiles;
}

export function removeProfile(id) {
  const profiles = readProfiles().filter((item) => item.id !== id);
  writeProfiles(profiles);

  if (getActiveProfileId() === id) {
    setActiveProfileId(null);
  }

  return profiles;
}

export function getActiveProfileId() {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function setActiveProfileId(id) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  } catch {
    // Si localStorage está bloqueado, la UI sigue funcionando en memoria.
  }
}

export function getActiveProfile() {
  const id = getActiveProfileId();
  if (!id) return null;

  return readProfiles().find((profile) => profile.id === id) ?? null;
}
