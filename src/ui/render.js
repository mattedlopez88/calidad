import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const REASON_LABELS = {
  MISSING_FIELD: 'Campo faltante',
  INVALID_AGE: 'Edad inválida',
  INVALID_EMAIL: 'Email inválido',
  DUPLICATE_ID: 'ID duplicado',
  COLUMN_COUNT_MISMATCH: 'Número de columnas incorrecto',
};

export function renderCounts(el, { total, valid, invalid }) {
  el.textContent = `Total: ${total} · Válidos: ${valid} · Inválidos: ${invalid}`;
}

export function renderTableHeader(theadEl, columns) {
  theadEl.replaceChildren();
  const tr = document.createElement('tr');
  for (const col of columns) {
    const th = document.createElement('th');
    th.textContent = col;
    tr.appendChild(th);
  }
  theadEl.appendChild(tr);
}

export function renderResults(tbodyEl, clients, columns) {
  tbodyEl.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const c of clients) {
    const tr = document.createElement('tr');
    for (const col of columns) {
      const td = document.createElement('td');
      const v = c[col];
      td.textContent = v == null ? '' : String(v);
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }
  tbodyEl.appendChild(frag);
}

export function renderTiming(el, count, elapsedMs) {
  const shown = elapsedMs >= 10 ? elapsedMs.toFixed(0) : elapsedMs.toFixed(2);
  el.textContent = `${count} resultados en ${shown} ms`;
}

export function renderInvalid(listEl, invalidRows) {
  listEl.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const row of invalidRows) {
    const li = document.createElement('li');
    const reason = REASON_LABELS[row.reason] ?? row.reason;
    li.textContent = `Línea ${row.line} — ${reason}: ${JSON.stringify(row.raw)}`;
    frag.appendChild(li);
  }
  listEl.appendChild(frag);
}

export function renderError(el, message) {
  el.textContent = message ?? '';
  el.hidden = !message;
}

let chartInstance = null;
export function renderHistogram(canvas, { labels, counts }) {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  if (labels.length === 0) return;
  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Clientes por rango de edad', data: counts }],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}
