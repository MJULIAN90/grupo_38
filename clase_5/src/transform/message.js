// src/transform/message.js
// Transforma un mensaje "crudo" en el formato que espera la UI.

export function toMessageView(raw) {
  return {
    author: raw?.author === "me" ? "me" : "bot",
    text: raw?.text ?? "",
  };
}
