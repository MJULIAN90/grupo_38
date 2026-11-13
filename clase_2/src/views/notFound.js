export function renderNotFound() {
  document.querySelector('#app').innerHTML = `
    <h1>404: ${window.location.pathname} no existe</h1>
    <p>Navegá a <a href="/chat">Chat</a> o <a href="/">Home</a>.</p>
  `;
}