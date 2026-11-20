function statusToDotClass(status) {
  const value = (status || "").toLowerCase();
  if (value === "alive") return "alive";
  if (value === "dead") return "dead";
  return "unknown";
}

export function renderCard(profile) {
  const dotClass = statusToDotClass(profile.status);

  return `
    <article class="card">
      <img class="card-img" src="${profile.image}" alt="${profile.name}" />
      <div class="card-body">
        <h2 class="card-name">${profile.name}</h2>
        <p class="card-meta">${profile.species}</p>
        <p class="card-status">
          <span class="status-dot ${dotClass}"></span>
          ${profile.status}
        </p>
        <dl class="card-detail">
          <dt>Origen</dt><dd>${profile.originName}</dd>
          <dt>Ubicación</dt><dd>${profile.locationName}</dd>
        </dl>
      </div>
    </article>
  `;
}