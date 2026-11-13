export function renderHome() {
  document.querySelector('#app').innerHTML = `
    <h1>Home</h1>
    <p>Navegá a <a href="/chat">Chat</a> o <a href="/about">About</a>.</p>
  `;
}