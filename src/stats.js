export function buildAgeHistogram(clients, bucketSize) {
  if (!Array.isArray(clients) || clients.length === 0) {
    return { labels: [], counts: [] };
  }
  if (!Number.isFinite(bucketSize) || bucketSize <= 0) {
    return { labels: [], counts: [] };
  }

  const ages = [];
  for (const c of clients) {
    if (typeof c.edad === 'number' && Number.isFinite(c.edad)) ages.push(c.edad);
  }
  if (ages.length === 0) return { labels: [], counts: [] };

  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const start = Math.floor(minAge / bucketSize) * bucketSize;
  const end = Math.floor(maxAge / bucketSize) * bucketSize;

  const labels = [];
  const counts = [];
  for (let b = start; b <= end; b += bucketSize) {
    labels.push(`${b}-${b + bucketSize - 1}`);
    counts.push(0);
  }
  for (const age of ages) {
    const idx = Math.floor((age - start) / bucketSize);
    counts[idx] += 1;
  }
  return { labels, counts };
}
