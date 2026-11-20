const BASE_URL = "https://rickandmortyapi.com/api/character/";

export function buildUrl(name) {
  const params = new URLSearchParams({ name });
  return `${BASE_URL}?${params.toString()}`;
}

export async function fetchCharacters(name) {
  const url = buildUrl(name);
  const res = await fetch(url);
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}
