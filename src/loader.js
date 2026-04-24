import { parse } from 'csv-parse/sync';
import { validateRows, normalizeHeader, missingRequired } from './validator.js';

const ALLOWED_MIME = new Set(['', 'text/csv', 'application/vnd.ms-excel']);
const FILE_ERROR = 'El archivo debe ser un .csv';

export function validateFile(file) {
  if (!file || typeof file.name !== 'string') {
    return { ok: false, error: FILE_ERROR };
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith('.csv')) {
    return { ok: false, error: FILE_ERROR };
  }
  const type = file.type ?? '';
  if (type !== '' && !ALLOWED_MIME.has(type)) {
    return { ok: false, error: FILE_ERROR };
  }
  return { ok: true };
}

export function parseCsvText(text) {
  const all = parse(text, {
    relax_column_count: true,
    skip_records_with_error: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (all.length === 0) {
    return { ok: false, error: 'El archivo CSV está vacío' };
  }

  const columns = normalizeHeader(all[0]);
  const missing = missingRequired(columns);
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Faltan columnas requeridas: ${missing.join(', ')}`,
    };
  }

  const { valid, invalid } = validateRows(all.slice(1), columns, { startLine: 2 });
  return { ok: true, columns, valid, invalid };
}

export async function loadFromFile(file) {
  const check = validateFile(file);
  if (!check.ok) return { ok: false, error: check.error };
  const text = await file.text();
  return parseCsvText(text);
}
