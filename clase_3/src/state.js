const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  data: null,
  error: null,
  lastSearch: null, // Para poder reintentar
};

export function getState() {
  return state;
}

export function setState(updates) {
  console.log("quien es update", updates);
  console.log('como inicia el state', state);

  Object.assign(state, updates);

  console.log('como finaliza el state', state);
}
