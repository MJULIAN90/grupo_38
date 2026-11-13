export function renderAbout() {
  document.querySelector('#app').innerHTML = `
    <h1>about</h1>
    <p>Navegá a <a href="/chat">Chat</a> o <a href="/">Home</a>.</p>
  `;
}