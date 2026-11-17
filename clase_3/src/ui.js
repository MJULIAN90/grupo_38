const loading = document.querySelector('#loading');
const content = document.querySelector('#content');
const error = document.querySelector('#error');

export function render(state) {

  // Resetear todo
  loading.classList.add('hidden');
  content.classList.add('hidden');
  error.classList.add('hidden');

  // Mostrar según estado actual
  if (state.status === 'loading') {
    loading.classList.remove('hidden');

  } else if (state.status === 'success') {
    content.classList.remove('hidden');
    content.innerHTML = renderPokemon(state.data);

  } else if (state.status === 'error') {
    error.classList.remove('hidden');
    document.querySelector('#error-message').textContent = state.error;
  }
}

function renderPokemon(data) {
  return `
    <div class="pokemon-card">
      <img src="${data.sprites.front_default}" alt="${data.name}">
      <h2>${data.name}</h2>
      <p>ID: ${data.id} | Altura: ${data.height} | Peso: ${data.weight}</p>
    </div>
  `;
}