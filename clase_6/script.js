// --- Elementos del DOM ---
const sendButton = document.getElementById("send-btn");
const inputEl = document.getElementById("chat-input");
const personaSelect = document.getElementById("persona-select");

// --- Mock de la API ---
let callCount = 0;

async function mockFetchAI(payload) {
  callCount++;
  await wait(800); // simula latencia

  if (callCount % 5 === 0) {
    // cada 5 calls → simula 429
    const err = new Error("Rate limit");
    err.status = 429;
    err.retryAfterSeconds = 3;
    throw err;
  }

  // El "cerebro" de la respuesta mock viene de dictionary.js: busca la
  // frase más parecida a lo que escribió el usuario y devuelve su
  // respuesta (ver extra_diccionario/ para la lógica completa).
  const ultimoMensaje = payload.messages.at(-1)?.content ?? "";
  const respuestaTexto = buscarRespuesta(ultimoMensaje);

  return {
    content: [{ type: "text", text: respuestaTexto }],
    usage: { input_tokens: 110, output_tokens: 28 },
    stop_reason: "end_turn",
  };
}

// --- Personajes (reto extra) ---
const PERSONAS = {
  mentor: "Sos un mentor técnico directo. Máximo 3 líneas. Sin markdown.",
  detective:
    "Sos un detective noir lacónico. Hablás en metáforas oscuras. Máximo 2 líneas.",
  chef: "Sos un chef italiano apasionado. Todo lo relacionás con comida. Máximo 3 líneas.",
};

// --- System prompt (personaje propio por defecto) ---
let SYSTEM_PROMPT = PERSONAS.mentor;

function changePersona(key) {
  SYSTEM_PROMPT = PERSONAS[key] ?? PERSONAS.mentor;
  messages = []; // reseteá el historial al cambiar de personaje
  renderMessages();
  clearStatus();
}

// --- Payload ---
function buildPayload(messages) {
  return {
    model: "claude-sonnet-4-20250514",
    system: SYSTEM_PROMPT,
    temperature: 0.3,
    max_tokens: 150,
    messages,
  };
}

// --- Normalización de respuesta ---
function normalizeAIResponse(raw) {
  const blocks = Array.isArray(raw?.content) ? raw.content : [];
  return blocks
    .filter((b) => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("")
    .trim();
}

// --- Historial ---
let messages = [];

// --- Estado de UI ---
let isLoading = false;
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Orquestador ---
async function sendMessage(userText) {
  if (isLoading) return;
  if (!userText.trim()) return;

  isLoading = true;
  disableSendButton();
  clearStatus();
  messages.push({ role: "user", content: userText });
  renderMessages();
  inputEl.value = "";
  showTyping();

  const payload = buildPayload(messages);

  try {
    const raw = await mockFetchAI(payload);
    hideTyping();
    messages.push({ role: "assistant", content: normalizeAIResponse(raw) });
    renderMessages();
  } catch (err) {
    hideTyping();
    if (err.status === 429) {
      const secs = err.retryAfterSeconds ?? 5;
      showRetryState(secs); // UI: "Reintentando en 3..."
      await wait(secs * 1000);
      showTyping();
      try {
        const raw2 = await mockFetchAI(payload);
        hideTyping();
        messages.push({
          role: "assistant",
          content: normalizeAIResponse(raw2),
        });
        renderMessages();
        clearStatus();
      } catch {
        hideTyping();
        messages.pop(); // sacá el mensaje de usuario fallido
        renderMessages();
        showError("No se pudo enviar. Intentá de nuevo.");
      }
    } else {
      showError("Error inesperado.");
      console.error(err);
    }
  } finally {
    isLoading = false;
    enableSendButton(); // siempre se libera, incluso si hay error
  }
}

// --- Debounce ---
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSend = debounce(sendMessage, 300);

sendButton.addEventListener("click", () => debouncedSend(inputEl.value));
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") debouncedSend(inputEl.value);
});

if (personaSelect) {
  personaSelect.addEventListener("change", () =>
    changePersona(personaSelect.value),
  );
}

// --- Render ---
function renderMessages() {
  const container = document.getElementById("chat-messages");
  container.innerHTML = messages
    .map(
      (msg) => `
    <div class="message message--${msg.role}">
      <span class="message-role">${msg.role === "user" ? "Vos" : "AI"}</span>
      <p class="message-text">${msg.content}</p>
    </div>
  `,
    )
    .join("");
  container.scrollTop = container.scrollHeight;
}

function disableSendButton() {
  document.getElementById("send-btn").disabled = true;
}
function enableSendButton() {
  document.getElementById("send-btn").disabled = false;
}

function showRetryState(secs) {
  const el = document.getElementById("status");
  el.textContent = `Reintentando en ${secs}s...`;
  el.className = "chat-status chat-status--retry";
}
function showError(msg) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "chat-status chat-status--error";
}
function clearStatus() {
  const el = document.getElementById("status");
  el.textContent = "";
  el.className = "chat-status";
}

// --- Indicador de "escribiendo..." ---
function showTyping() {
  const container = document.getElementById("chat-messages");
  if (document.getElementById("typing-indicator")) return;
  const el = document.createElement("div");
  el.id = "typing-indicator";
  el.className = "message message--assistant message--typing";
  el.innerHTML = `
    <span class="message-role">AI</span>
    <p class="message-text typing-dots"><span></span><span></span><span></span></p>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}
function hideTyping() {
  document.getElementById("typing-indicator")?.remove();
}
