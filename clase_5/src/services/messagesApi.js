// src/services/messagesApi.js
// Encapsula la petición de red. Valida res.ok antes de parsear, así un
// 404/500 se convierte en una excepción que la vista puede manejar.

const MESSAGES_URL = "/api/messages";

export async function fetchMessages() {
  const res = await fetch(MESSAGES_URL);
  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status} al pedir ${MESSAGES_URL}`);
  }
  const data = await res.json();
  if (!Array.isArray(data?.messages)) {
    throw new Error("Respuesta inválida: falta el arreglo 'messages'");
  }
  return data;
}
