// --- Elementos del DOM ---
const sendButton = document.getElementById("send-btn");
const inputEl = document.getElementById("chat-input");

// --- Mock de la API ---
let callCount = 0;

async function mockFetchAI(payload) {
  callCount++;
  await wait(800); // simula latencia

  if (callCount % 5 === 0) {                  // cada 5 calls → simula 429
    const err = new Error("Rate limit");
    err.status = 429;
    err.retryAfterSeconds = 3;
    throw err;
  }

  return {
    content: [{ type: "text", text: `Respuesta mock a: "${payload.messages.at(-1)?.content}"` }],
    usage: { input_tokens: 110, output_tokens: 28 },
    stop_reason: "end_turn"
  };
}

// --- System prompt ---
const SYSTEM_PROMPT = `
Sos un mentor técnico directo y claro.
Tono: conciso, preciso, sin vueltas.
Longitud: máximo 3 líneas por respuesta.
Si no sabés algo, decilo y hacé UNA sola pregunta de aclaración.
Sin markdown. Sin listas. Solo texto plano.
`.trim();

// --- Payload ---
function buildPayload(messages) {
  return {
    model: "claude-sonnet-4-20250514",
    system: SYSTEM_PROMPT,
    temperature: 0.3,
    max_tokens: 150,
    messages
  };
}

// --- Normalización de respuesta ---
function normalizeAIResponse(raw) {
  const blocks = Array.isArray(raw?.content) ? raw.content : [];

  return blocks
    .filter(b => b?.type === "text" && typeof b.text === "string")
    .map(b => b.text)
    .join("")
    .trim();
}

// --- Historial ---
let messages = [];

// --- Estado de UI ---
let isLoading = false;
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

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

  const payload = buildPayload(messages);

  try {
    const raw = await mockFetchAI(payload);
    messages.push({ role: "assistant", content: normalizeAIResponse(raw) });
    renderMessages();
  } catch (err) {
    if (err.status === 429) {
      const secs = err.retryAfterSeconds ?? 5;
      showRetryState(secs);               // UI: "Reintentando en 3..."
      await wait(secs * 1000);

      try {
        const raw2 = await mockFetchAI(payload);
        messages.push({ role: "assistant", content: normalizeAIResponse(raw2) });
        renderMessages();
        clearStatus();
      } catch {
        messages.pop();                   // sacá el mensaje de usuario fallido
        renderMessages();
        showError("No se pudo enviar. Intentá de nuevo.");
      }
    } else {
      showError("Error inesperado.");
      console.error(err);
    }
  } finally {
    isLoading = false;
    enableSendButton();                   // siempre se libera, incluso si hay error
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
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") debouncedSend(inputEl.value);
});

// --- Render ---
function renderMessages() {
  const container = document.getElementById("chat-messages");
  
  container.innerHTML = messages.map(msg => `
    <div class="message message--${msg.role}">
      <span class="message-role">${msg.role === "user" ? "Vos" : "AI"}</span>
      <p class="message-text">${msg.content}</p>
    </div>
  `).join("");
  container.scrollTop = container.scrollHeight;
}

function disableSendButton() {
  document.getElementById("send-btn").disabled = true;
}
function enableSendButton() {
  document.getElementById("send-btn").disabled = false;
}
function showRetryState(secs) {
  document.getElementById("status").textContent = `Reintentando en ${secs}s...`;
}
function showError(msg) {
  document.getElementById("status").textContent = msg;
}
function clearStatus() {
  document.getElementById("status").textContent = "";
}
