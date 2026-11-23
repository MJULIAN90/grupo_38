// src/services/messagesApi.js
// Encapsula la petición de red. OJO: esta es la versión con el bug —
// no valida res.ok antes de parsear la respuesta como JSON.

const MESSAGES_URL = "/api/messages";

export async function fetchMessages() {
  const res = await fetch(MESSAGES_URL);
  return res.json();
}
