# Clase 5 – Chat SPA: diagnóstico y fix de 2 bugs

App de chat mobile-first hecha con HTML, CSS y JavaScript puro (sin frameworks).
Esta clase tiene dos bugs plantados a propósito. Este documento deja registro de
cómo se diagnosticaron, qué se cambió y los prompts usados para pedir ayuda a la IA.
También incluye una sección de perfiles (nombre, avatar y bio) persistida en
`localStorage`.

## Estructura del proyecto

```
clase_5/
├── index.html
├── styles.css
├── server.js                       # servidor estático; /api/messages responde 404 a propósito
└── src/
    ├── services/
    │   ├── messagesApi.js          # petición de red
    │   └── profilesStorage.js      # perfiles en localStorage
    ├── transform/
    │   ├── message.js              # mensaje crudo -> formato de la UI
    │   └── profile.js              # normalización y validación de perfiles
    ├── ui/
    │   ├── chatUI.js               # DOM del chat
    │   ├── profileUI.js            # DOM de perfiles
    │   └── navigationUI.js         # cambio chat <-> perfiles
    └── views/
        ├── appView.js              # punto de entrada
        ├── chatView.js             # orquestador del chat
        └── profileView.js          # orquestador de perfiles
```

Para correrlo: `node server.js` y abrir `http://localhost:5500`.

---

## Bug #1 – "Cargando mensajes..." infinito

### Evidencia (DevTools)

- **Network:** `GET /api/messages` responde `404 Not Found`.
- **Consola:** `Error loading messages: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
- **Headers de la respuesta:** `Content-Type: text/html`, así que el servidor devolvió una página HTML de error.
- **UI:** se queda en "Cargando mensajes..." y no muestra ningún error.

### Causa

1. `fetch()` no lanza error con un 404. Como `fetchMessages()` no revisaba `res.ok`, intentaba leer la respuesta como JSON.
2. `data.messages.map(...)` o `res.json()` fallaba y saltaba al `catch`.
3. `setLoading(false)` estaba después de la línea que fallaba, por lo que nunca se ejecutaba.
4. El `catch` solo hacía `console.error`, sin `setError(true)`, así que no se veía ningún aviso.

### Fix

**`src/services/messagesApi.js`**

Antes:

```javascript
export async function fetchMessages() {
  const res = await fetch(MESSAGES_URL);
  return res.json();
}
```

Después:

```javascript
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
```

**`src/views/chatView.js`** (función `loadMessages`)

Antes:

```javascript
async function loadMessages() {
  setLoading(true);
  try {
    const data = await fetchMessages();
    renderMessages(data.messages.map(toMessageView));
    setLoading(false);
  } catch (err) {
    console.error("Error loading messages:", err);
  }
}
```

Después:

```javascript
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
```

También se actualizó el comentario de cabecera del archivo, que describía el bug.

### Resultado

- Un 404 o 500 ahora lanza un error en el servicio.
- El `finally` apaga siempre el loading.
- El `catch` muestra el recuadro rojo "Ocurrió un error al cargar los mensajes."
- El botón **Reintentar** vuelve a llamar a `loadMessages` y oculta el error anterior.

### Prompt enviado a la IA

Se adjuntaron tres capturas: la app con "Cargando mensajes...", la consola con el error de JSON y la pestaña Network con el 404.

````markdown
Contexto:
SPA de chat mobile-first (vanilla JS). States: loading/success/error.

Objetivo:
- Si la API responde 404/500, mostrar error en UI y desactivar loading.
- Permitir reintentar.

Restricciones:
- No usar frameworks ni librerías nuevas.
- Mantener estructura modular (services/ui/transform).

Evidencia:
- Network muestra 404 en GET /api/messages.
- La UI queda colgada en "loading" y no muestra mensaje de error.
- Snippet actual (src/views/chatView.js):

```javascript
async function loadMessages() {
  setLoading(true);
  try {
    const data = await fetchMessages();
    renderMessages(data.messages.map(toMessageView));
    setLoading(false);
  } catch (err) {
    console.error("Error loading messages:", err);
  }
}
```
````


---

## Bug #2 – Layout responsive (el input queda fuera de pantalla)

### Evidencia (DevTools)

- En 375px de ancho, `document.body.scrollHeight` (~1200px) era mayor que `window.innerHeight` (667px): la página entera scrolleaba.
- `.composer` no se veía al cargar; había que scrollear todo el body hacia abajo.
- `.messages` no tenía `overflow` ni altura definida: crecía tanto como su contenido.

Mediciones antes del fix (con el error 404 activo):

| Ancho x alto | `body.scrollHeight` | `innerHeight` | Composer visible | Scroll lateral |
|---|---|---|---|---|
| 320 x 640 | 1465 | 640 | No | Sí (326px contra 320px) |
| 375 x 667 | 1267 | 667 | No | No |
| 1024 x 768 | 817 | 768 | No | No |

### Causa

- `.app` mide `100vh` y es un contenedor flex en columna, pero `.messages` no tenía `flex: 1` ni `overflow`.
- Un hijo flex tiene por defecto `min-height: auto` (no baja de la altura de su contenido), por eso `.messages` empujaba a `.composer` fuera de la pantalla.
- Como `.app` se desbordaba y el `body` no tenía `overflow: hidden`, scrolleaba la página entera.
- El scroll lateral en 320px lo causaban la URL larga sin espacios y el `input`, que no podía achicarse.

### Fix (`styles.css`)

```css
html, body { height: 100%; overflow: hidden; }

.app {
  height: 100vh;
  height: 100dvh;            /* mobile: descuenta la barra de URL */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar, .loading-indicator, .error-state, .composer { flex-shrink: 0; }

.messages {
  flex: 1;                   /* ocupa el espacio entre header y composer */
  min-height: 0;             /* clave: permite achicarse y scrollear */
  min-width: 0;
  overflow-y: auto;          /* el scroll vive acá */
  overflow-x: hidden;
  /* resto igual */
}

.bubble { overflow-wrap: anywhere; }   /* corta URLs largas */

.composer { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
.composer input { min-width: 0; }
```

Breakpoints agregados:

- **Hasta 359px:** menos padding y burbujas de hasta 85% de ancho.
- **768px o más:** `.app` centrado con `max-width: 720px`.
- **1024px o más:** `max-width: 860px`.

### Resultado

Mediciones después del fix (misma prueba):

| Ancho x alto | `body.scrollHeight` | `innerHeight` | Composer visible | Scroll lateral |
|---|---|---|---|---|
| 320 x 640 | 640 | 640 | Sí | No |
| 375 x 667 | 667 | 667 | Sí | No |
| 768 x 1024 | 1024 | 1024 | Sí | No |
| 1024 x 768 | 768 | 768 | Sí | No |

Criterios de éxito cumplidos: `document.body.scrollHeight === window.innerHeight`, solo
scrollea `.messages`, el input queda fijo y visible, y no hay scroll lateral.

### Cómo verificarlo en DevTools

1. Abrir `http://localhost:5500`, F12 y modo responsive (Ctrl+Shift+M) en 375x667, 320 y 768.
2. Recargar con Ctrl+Shift+R para evitar el CSS en caché.
3. En la consola: `[document.body.scrollHeight, window.innerHeight]`. Ambos valores deben ser iguales.
4. En la consola: `[document.documentElement.scrollWidth, document.documentElement.clientWidth]`. No debe haber diferencia.
5. Verificar que el input se ve abajo sin scrollear y que solo se mueve la zona de mensajes.

---

### Prompt enviado a la IA

Se adjuntaron tres capturas: el chat en una ventana angosta con el input fuera de pantalla, el banner de error con los mensajes, y la página scrolleada hasta abajo para encontrar el input.

````markdown
Contexto:
Chat SPA, layout mobile-first (vanilla JS). .app ocupa toda la pantalla
(height: 100vh) y adentro va un header, un panel de mensajes y un
formulario para escribir.

Objetivo:
- Header fijo
- Panel de mensajes con scroll interno (sin scroll en el body)
- Input siempre visible abajo, sin tener que scrollear la página
- Sin desborde horizontal

Restricciones:
- Solo CSS, cambios mínimos en HTML si es imprescindible.
- Soporte breakpoints: 320/768/1024. Sin librerías.

Evidencia:
- En mobile (375px de ancho), document.body.scrollHeight (~1200px) es
  mayor que window.innerHeight (667px): la página entera scrollea.
- El formulario para escribir (.composer) no se ve al cargar la página;
  hay que scrollear todo el body hacia abajo para encontrarlo.
- .messages no tiene ninguna propiedad de overflow ni de altura definida:
  simplemente crece tanto como haga falta para mostrar todo su contenido.

HTML relevante (index.html):
<div class="app">
  <header class="topbar">...</header>
  <main class="messages">...</main>
  <form class="composer">...</form>
</div>

CSS actual (styles.css):
.app { height: 100vh; display: flex; flex-direction: column; }
.messages { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.composer { display: flex; }
.composer input { flex: 1; }

Formato de salida:
1. Diagnóstico de por qué .messages no scrollea solo,
2. Propuesta de CSS con explicación,
3. Pasos concretos para verificar en DevTools.

Criterios de éxito:
- document.body.scrollHeight === window.innerHeight (la página ya no
  scrollea; solo scrollea .messages)
- Input fijo y visible sin scrollear
- Sin scroll lateral en body
```
````


---

## Sección de perfiles (funcionalidad agregada)

Se agregó una sección para **crear perfiles** con nombre, avatar y bio, sin backend:
los datos se guardan en `localStorage`.

### Cómo se usa

1. En el header del chat, tocar **Perfiles**.
2. Completar el formulario:
   - **Nombre** (obligatorio, máximo 40 caracteres).
   - **Avatar** (se elige entre emojis).
   - **Bio** (opcional, máximo 160 caracteres).
3. Al guardar, el perfil queda creado y pasa a ser el **perfil activo** (se muestra en el header).
4. En **Tus perfiles** se puede cambiar el perfil activo con **Usar** o eliminarlo con **Eliminar**.
5. **Volver al chat** regresa a la vista del chat sin perder los perfiles.

### Persistencia

| Clave de `localStorage` | Contenido |
|---|---|
| `chat.profiles` | Arreglo JSON con los perfiles creados |
| `chat.activeProfileId` | `id` del perfil activo |

Se puede inspeccionar en DevTools → **Application** → **Local Storage** → `http://localhost:5500`.

### Archivos nuevos

- `src/services/profilesStorage.js`: lectura/escritura en `localStorage`.
- `src/transform/profile.js`: normalización y validación de los datos.
- `src/ui/profileUI.js`: formulario, errores, lista y resumen del perfil activo.
- `src/ui/navigationUI.js`: alterna entre chat y perfiles.
- `src/views/profileView.js`: orquestador de la sección.
- `src/views/appView.js`: nuevo punto de entrada; inicializa chat y perfiles.

`index.html` ahora carga `src/views/appView.js` en lugar de `chatView.js`.

---

## Detalles menores pendientes (fuera del alcance de los dos bugs)

- `server.js` tiene un `console.log('hola')` suelto que imprime en cada petición.
- `server.js` concatena `url.pathname` en la ruta del archivo sin sanear (posible path traversal). Aceptable en una clase local, no en producción.
- Si el servidor corriendo en el puerto 5500 no es el `server.js` de esta carpeta (por ejemplo, Live Server), el 404 llega como `text/html` en vez de JSON. El fix funciona igual en ambos casos.
