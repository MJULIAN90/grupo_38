// src/views/chatView.js
// Vista del chat: pinta los mensajes iniciales, carga los del servidor
// y conecta el formulario.
//
// loadMessages maneja los tres estados: loading, success y error.
// fetchMessages() lanza una excepción si la API responde 404/500; el catch
// muestra el error en la UI y el finally siempre apaga el loading.
// El botón "Reintentar" vuelve a llamar a loadMessages.

import { fetchMessages } from "../services/messagesApi.js";
import { toMessageView } from "../transform/message.js";
import { renderMessages, addMessageBubble, setLoading, setError } from "../ui/chatUI.js";

const seedMessages = [
  { author: "bot", text: "¡Hola! Este chat ya arranca con algunos mensajes para poder probar el scroll sin escribir nada." },
  { author: "me", text: "Buenísimo, vamos a ver si el layout aguanta en mobile." },
  { author: "bot", text: "Probá abrir esto en DevTools, modo Responsive, 375px de ancho." },
  { author: "bot", text: "Achicá la ventana o probá en DevTools con un ancho de celular y fijate si tenés que scrollear toda la página para encontrar el cuadro de escribir." },
  { author: "me", text: "Dale, lo reviso en un rato." },
  { author: "bot", text: "https://rickandmortyapi.com/api/character/estelinkeslargoatropositoparaestresarelancho" },
  { author: "bot", text: "Mientras tanto, esta pantalla también intenta pedir más mensajes al servidor." },
  { author: "bot", text: "Ese pedido va a /api/messages, que a propósito siempre responde 404." },
  { author: "me", text: "Ah, por eso dice 'Cargando mensajes...' y no se va nunca." },
  { author: "bot", text: "Exacto, ese es el bug #1 de esta clase." },
  { author: "bot", text: "El bug #2 es de layout: fijate si el input para escribir queda siempre visible." },
  { author: "me", text: "Ahí vamos a necesitar mirar el CSS de .app, .messages y .composer." },
  { author: "bot", text: "Cuando termines de diagnosticar los dos, armamos los prompts para pedirle ayuda a la IA." },
  { author: "bot", text: "Spoiler: la evidencia que recolectes en DevTools es lo más importante del prompt." },
];

async function loadMessages() {
  setLoading(true);
  setError(false);
  try {
    const data = await fetchMessages();
    renderMessages(data.messages.map(toMessageView));
  } catch (err) {
    console.error("Error loading messages:", err);
    setError(true);
  } finally {
    setLoading(false);
  }
}

function handleComposerSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("composer-input");
  const text = input.value.trim();
  if (!text) return;
  addMessageBubble(toMessageView({ author: "me", text }));
  input.value = "";
}

export function initChatView() {
  renderMessages(seedMessages.map(toMessageView));

  document.getElementById("retry-btn")?.addEventListener("click", loadMessages);
  document.getElementById("composer").addEventListener("submit", handleComposerSubmit);

  loadMessages();
}
