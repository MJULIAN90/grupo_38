// dictionary.js
// -----------------------------------------------------------------------
// Bot de respuestas por "diccionario": busca la frase que escribió el
// usuario entre un conjunto de frases conocidas (con sinónimos) y devuelve
// la respuesta asociada. No usa ninguna IA ni red — es 100% local,
// pensado como ejercicio de "matching de texto", separado del chat con
// mock de la Messages API que ya tenemos en hw/.
//
// Se puede usar tanto en el navegador (ver index.html de esta carpeta)
// como en Node, para probarlo sin UI:
//   node -e "console.log(require('./dictionary.js').buscarRespuesta('como estas?'))"
// -----------------------------------------------------------------------

// Cada entrada tiene una lista de "keywords" (formas distintas de
// preguntar lo mismo) y una única "respuesta". Podés agregar más
// entradas, o más keywords a una entrada existente, sin tocar la lógica
// de búsqueda de abajo.
const DICCIONARIO = [
  {
    keywords: ["hola", "buenas", "que tal", "hey", "buen dia", "buenas tardes", "buenas noches"],
    respuesta: "Hola, mi nombre es IA. ¿En qué te puedo ayudar?",
  },
  {
    keywords: ["como estas", "como andas", "todo bien", "como te va"],
    respuesta: "Yo estoy muy bien, ¿y vos?",
  },
  {
    keywords: ["cual es tu nombre", "como te llamas", "quien sos", "con quien hablo"],
    respuesta: "Me llamo IA, un gusto.",
  },
  {
    keywords: ["donde vives", "donde estas", "de donde sos"],
    respuesta: "Vivo en la nube, en un servidor en algún lugar del mundo.",
  },
  {
    keywords: ["que haces", "que estas haciendo"],
    respuesta: "Estoy acá, charlando con vos.",
  },
  {
    keywords: ["cuantos anios tenes", "cuantos años tenes", "que edad tenes"],
    respuesta: "No tengo edad, soy solo código.",
  },
  {
    keywords: ["quien te creo", "quien te hizo", "quien te programo"],
    respuesta: "Me armó un estudiante de Henry practicando JavaScript.",
  },
  {
    keywords: ["gracias", "muchas gracias", "te agradezco"],
    respuesta: "¡De nada! Para eso estoy.",
  },
  {
    keywords: ["chau", "adios", "nos vemos", "hasta luego", "bye"],
    respuesta: "¡Chau! Que tengas un buen día.",
  },
];

const RESPUESTA_DEFAULT =
  "No entendí bien eso. Probá preguntarme cómo estoy, cuál es mi nombre, o simplemente saludame.";

// Umbral de similitud para el fallback "difuso" (0 a 1). Más alto = más
// exigente (menos falsos positivos, pero menos tolerante a errores de
// tipeo).
const UMBRAL_SIMILITUD = 0.6;

// --- Normalización ---
// Pasa todo a minúsculas, saca tildes, signos de puntuación y espacios
// de más, para que "¿Cómo estás?" y "como estas" terminen siendo lo
// mismo a la hora de comparar.
function normalizar(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // saca tildes/diacríticos
    .replace(/[¿?¡!.,;:]/g, "")        // saca signos de puntuación comunes
    .replace(/\s+/g, " ")
    .trim();
}

// --- Distancia de Levenshtein ---
// Cantidad mínima de inserciones/borrados/reemplazos de un caracter para
// convertir "a" en "b". La usamos para el matching "difuso" (errores de
// tipeo, variantes cortas).
function distanciaLevenshtein(a, b) {
  const filas = a.length + 1;
  const columnas = b.length + 1;
  const dp = Array.from({ length: filas }, () => new Array(columnas).fill(0));

  for (let i = 0; i < filas; i++) dp[i][0] = i;
  for (let j = 0; j < columnas; j++) dp[0][j] = j;

  for (let i = 1; i < filas; i++) {
    for (let j = 1; j < columnas; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // borrado
        dp[i][j - 1] + 1,       // inserción
        dp[i - 1][j - 1] + costo // reemplazo
      );
    }
  }
  return dp[filas - 1][columnas - 1];
}

// Convierte la distancia en un puntaje de similitud entre 0 y 1
// (1 = idénticos, 0 = completamente distintos).
function similitud(a, b) {
  const largoMax = Math.max(a.length, b.length);
  if (largoMax === 0) return 1;
  return 1 - distanciaLevenshtein(a, b) / largoMax;
}

// --- Búsqueda principal ---
// Estrategia, en orden:
//   1. Coincidencia exacta (texto normalizado === keyword normalizada).
//   2. Coincidencia por inclusión (la keyword aparece adentro de lo que
//      escribió el usuario, o viceversa) — para frases con palabras de
//      más ("hola, como estas hoy?" igual encuentra "como estas").
//   3. Coincidencia difusa por similitud (Levenshtein) — para errores de
//      tipeo o variantes cortas que no entran en los dos casos de arriba.
//   4. Si nada supera el umbral, se devuelve la respuesta por default.
function buscarRespuesta(textoUsuario) {
  const entrada = normalizar(textoUsuario);
  if (!entrada) return RESPUESTA_DEFAULT;

  // 1) y 2): exacta o por inclusión, en una sola pasada.
  // Si hay varias keywords que matchean por inclusión, nos quedamos con
  // la más larga (la más específica).
  let mejorPorInclusion = null;

  for (const entry of DICCIONARIO) {
    for (const kw of entry.keywords) {
      const kwNorm = normalizar(kw);

      if (entrada === kwNorm) {
        return entry.respuesta; // match exacto: no hace falta seguir buscando
      }

      const incluye = entrada.includes(kwNorm) || kwNorm.includes(entrada);
      if (incluye) {
        if (!mejorPorInclusion || kwNorm.length > mejorPorInclusion.largo) {
          mejorPorInclusion = { respuesta: entry.respuesta, largo: kwNorm.length };
        }
      }
    }
  }

  if (mejorPorInclusion) return mejorPorInclusion.respuesta;

  // 3) Difusa: la keyword con mayor similitud contra todo el texto.
  let mejorScore = 0;
  let mejorRespuestaDifusa = null;

  for (const entry of DICCIONARIO) {
    for (const kw of entry.keywords) {
      const score = similitud(entrada, normalizar(kw));
      if (score > mejorScore) {
        mejorScore = score;
        mejorRespuestaDifusa = entry.respuesta;
      }
    }
  }

  if (mejorScore >= UMBRAL_SIMILITUD) return mejorRespuestaDifusa;

  // 4) Nada superó el umbral.
  return RESPUESTA_DEFAULT;
}

// Disponible como módulo de Node (para probarlo por consola) y, si se
// carga con <script src="dictionary.js"> en un navegador, como variables
// globales para usar directo en index.html.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { buscarRespuesta, DICCIONARIO, normalizar, similitud };
}
