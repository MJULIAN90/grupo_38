import { navigateTo } from './router.js';

export function setupLinkInterception() {
  
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/')) return;

    // No interceptar: Ctrl/Cmd-click, target blank, links externos
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (link.target === '_blank') return;
    if (link.origin !== window.location.origin) return;

    event.preventDefault();
    navigateTo(href);
  });
}