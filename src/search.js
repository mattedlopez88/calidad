export function searchById(clients, id) {
  if (id == null) return [];
  const target = String(id).trim();
  if (target === '') return [];
  const match = clients.find((c) => c.id === target);
  return match ? [match] : [];
}

export function listByCity(clients, ciudad) {
  if (ciudad == null) return [];
  const target = String(ciudad).trim().toLowerCase();
  if (target === '') return [];
  return clients.filter((c) => c.ciudad.toLowerCase() === target);
}

export function sortByAge(clients) {
  return [...clients].sort((a, b) => a.edad - b.edad);
}

function parseBound(v) {
  if (v == null || v === '') return { has: false };
  const n = Number(v);
  if (Number.isNaN(n)) return { has: false };
  return { has: true, value: n };
}

export function filterByAgeRange(clients, min, max) {
  const lo = parseBound(min);
  const hi = parseBound(max);
  if (lo.has && hi.has && lo.value > hi.value) {
    return { ok: false, results: [], error: 'El mínimo no puede ser mayor que el máximo' };
  }
  const minN = lo.has ? lo.value : -Infinity;
  const maxN = hi.has ? hi.value : Infinity;
  return { ok: true, results: clients.filter((c) => c.edad >= minN && c.edad <= maxN) };
}
