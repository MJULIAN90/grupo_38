// src/ui/chatUI.js
// Todo lo que toca el DOM vive acá: pintar mensajes y los estados
// de loading / error.

const messagesEl = document.getElementById("messages");
const loadingEl = document.getElementById("loading-indicator");
const errorEl = document.getElementById("error-state");

export function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
}

export function setError(isError) {
  errorEl.hidden = !isError;
}

export function addMessageBubble({ author, text }) {
  const bubble = document.createElement("p");
  bubble.className = author === "me" ? "bubble bubble--me" : "bubble";
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
}

export function renderMessages(messages) {
  messages.forEach(addMessageBubble);
}
