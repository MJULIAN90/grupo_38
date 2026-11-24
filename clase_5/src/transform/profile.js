// src/transform/profile.js
// Normaliza los datos del formulario y valida lo mínimo antes de guardarlos.

const MAX_NAME_LENGTH = 40;
const MAX_BIO_LENGTH = 160;
const DEFAULT_AVATAR = "🙂";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `profile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toProfile({ id, name, avatar, bio, createdAt } = {}) {
  return {
    id: id ?? createId(),
    name: String(name ?? "").trim(),
    avatar: String(avatar ?? "").trim() || DEFAULT_AVATAR,
    bio: String(bio ?? "").trim(),
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

export function validateProfile({ name, bio } = {}) {
  const errors = {};
  const cleanName = String(name ?? "").trim();
  const cleanBio = String(bio ?? "").trim();

  if (!cleanName) {
    errors.name = "Escribí un nombre para el perfil.";
  } else if (cleanName.length > MAX_NAME_LENGTH) {
    errors.name = `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.`;
  }

  if (cleanBio.length > MAX_BIO_LENGTH) {
    errors.bio = `La bio no puede superar los ${MAX_BIO_LENGTH} caracteres.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export { MAX_NAME_LENGTH, MAX_BIO_LENGTH, DEFAULT_AVATAR };
