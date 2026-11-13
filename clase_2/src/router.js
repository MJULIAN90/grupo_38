import { renderHome } from './views/home.js';
import { renderChat } from './views/chat.js';
import { renderAbout } from './views/about.js';
import { renderNotFound } from './views/notFound.js';

const routes = {
  '/': renderHome,
  '/chat': renderChat,
  '/about': renderAbout,
  otro:'otro'
};

// bracket notation
// routes[path]  // path es una variable 

// // dot notation
// routes['/chat']
// routes.otro

export function router() {
  const path = window.location.pathname; // /chat
  console.log('Routing to:', path);

  const render = routes[path] || renderNotFound; // traemos la clave para ver que funcion ejecutamos
  render(); //routes[path]  = renderHome
}

export function navigateTo(path) {
  history.pushState(null, '', path);
  
  // !
  router(); // CRÍTICO — sin esto, la URL cambia pero la vista no
}