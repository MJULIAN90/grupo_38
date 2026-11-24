// src/ui/navigationUI.js
// Alterna entre la vista del chat y la sección de perfiles.

const chatViewEl = document.getElementById("chat-view");
const profilesViewEl = document.getElementById("profiles-view");
const openProfilesButton = document.getElementById("profiles-open");
const backToChatButton = document.getElementById("profiles-back");

export function showChatView() {
  profilesViewEl.hidden = true;
  chatViewEl.hidden = false;
  openProfilesButton.setAttribute("aria-expanded", "false");
}

export function showProfilesView() {
  chatViewEl.hidden = true;
  profilesViewEl.hidden = false;
  openProfilesButton.setAttribute("aria-expanded", "true");
  document.getElementById("profile-name")?.focus();
}

export function onOpenProfiles(handler) {
  openProfilesButton.addEventListener("click", handler);
}

export function onBackToChat(handler) {
  backToChatButton.addEventListener("click", handler);
}
