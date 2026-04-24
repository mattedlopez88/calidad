export function measure(fn) {
  const t0 = performance.now();
  const result = fn();
  const elapsedMs = performance.now() - t0;
  return { result, elapsedMs };
}

export function formatMs(ms) {
  return ms >= 10 ? ms.toFixed(0) : ms.toFixed(2);
}
