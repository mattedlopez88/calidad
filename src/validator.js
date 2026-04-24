export const REASONS = Object.freeze({
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_AGE: 'INVALID_AGE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  DUPLICATE_ID: 'DUPLICATE_ID',
  COLUMN_COUNT_MISMATCH: 'COLUMN_COUNT_MISMATCH',
});

export const REQUIRED_COLUMNS = ['id', 'nombre', 'email', 'ciudad', 'edad'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimValue(v) {
  return typeof v === 'string' ? v.trim() : v;
}

export function normalizeHeader(header) {
  if (!Array.isArray(header)) return [];
  return header.map((c) => (typeof c === 'string' ? c.trim().toLowerCase() : ''));
}

export function missingRequired(columns) {
  return REQUIRED_COLUMNS.filter((r) => !columns.includes(r));
}

export function validateRow(row, line, seenIds, columns) {
  if (!Array.isArray(row) || row.length !== columns.length) {
    return { ok: false, invalid: { line, raw: row, reason: REASONS.COLUMN_COUNT_MISMATCH } };
  }

  const record = {};
  columns.forEach((col, i) => {
    record[col] = trimValue(row[i]);
  });

  for (const field of REQUIRED_COLUMNS) {
    const v = record[field];
    if (v === '' || v == null) {
      return { ok: false, invalid: { line, raw: row, reason: REASONS.MISSING_FIELD } };
    }
  }

  const edad = Number(record.edad);
  if (Number.isNaN(edad)) {
    return { ok: false, invalid: { line, raw: row, reason: REASONS.INVALID_AGE } };
  }

  if (!EMAIL_RE.test(record.email)) {
    return { ok: false, invalid: { line, raw: row, reason: REASONS.INVALID_EMAIL } };
  }

  if (seenIds.has(record.id)) {
    return { ok: false, invalid: { line, raw: row, reason: REASONS.DUPLICATE_ID } };
  }

  return { ok: true, client: { ...record, edad } };
}

export function validateRows(rows, columns, { startLine = 2 } = {}) {
  const valid = [];
  const invalid = [];
  const seen = new Set();

  rows.forEach((row, idx) => {
    const line = startLine + idx;
    const result = validateRow(row, line, seen, columns);
    if (result.ok) {
      valid.push(result.client);
      seen.add(result.client.id);
    } else {
      invalid.push(result.invalid);
    }
  });

  return { valid, invalid };
}
