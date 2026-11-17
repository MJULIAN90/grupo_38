  import { fetchJson } from './api.js';
  import { getState, setState } from './state.js';
  import { render } from './ui.js';

  const API_BASE = 'https://pokeapi.co/api/v2/pokemon';

  async function handleSearch(name) {
    // 1. Pasar a loading (limpiar estado anterior)
    setState({ status: 'loading', data: null, error: null, lastSearch: name });
    render(getState());

    try {
      // 2. Fetch
      const data = await fetchJson(`${API_BASE}/${name}`);

    //   debugger

      console.log('quien es data antes del uupdate', data);
      

      // 3. Éxito
      setState({ status: 'success', data });
      render(getState());

    } catch (err) {
      // 4. Error (HTTP o red)
      setState({ status: 'error', error: err.message });
      render(getState());
    }
  }

  // Botón buscar
  document.querySelector('#search-btn').addEventListener('click', () => {
    const name = document.querySelector('#search-input').value.trim().toLowerCase();
    if (name) handleSearch(name);
  });

  // Enter en el input
  document.querySelector('#search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = e.target.value.trim().toLowerCase();
      if (name) handleSearch(name);
    }
  });

  // Retry
  document.querySelector('#retry-btn').addEventListener('click', () => {
    const { lastSearch } = getState();
    if (lastSearch) handleSearch(lastSearch);
  });