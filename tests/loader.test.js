import { validateFile, parseCsvText } from '../src/loader.js';
import { REASONS } from '../src/validator.js';

describe('validateFile', () => {
  test('rechaza extensión incorrecta', () => {
    expect(validateFile({ name: 'a.txt', type: 'text/plain' }).ok).toBe(false);
  });

  test('rechaza MIME incorrecto aunque la extensión sea .csv', () => {
    expect(validateFile({ name: 'a.csv', type: 'application/pdf' }).ok).toBe(false);
  });

  test('acepta .csv con text/csv', () => {
    expect(validateFile({ name: 'a.csv', type: 'text/csv' }).ok).toBe(true);
  });

  test('acepta .csv con MIME vacío', () => {
    expect(validateFile({ name: 'a.csv', type: '' }).ok).toBe(true);
  });

  test('acepta .csv con application/vnd.ms-excel', () => {
    expect(validateFile({ name: 'a.csv', type: 'application/vnd.ms-excel' }).ok).toBe(true);
  });

  test('acepta extensión en mayúsculas', () => {
    expect(validateFile({ name: 'DATA.CSV', type: '' }).ok).toBe(true);
  });

  test('rechaza archivo nulo', () => {
    expect(validateFile(null).ok).toBe(false);
  });
});

describe('parseCsvText', () => {
  test('parsea CSV válido', () => {
    const text = 'id,nombre,email,ciudad,edad\nC001,Ana,ana@x.com,Quito,30\n';
    const r = parseCsvText(text);
    expect(r.ok).toBe(true);
    expect(r.columns).toEqual(['id', 'nombre', 'email', 'ciudad', 'edad']);
    expect(r.valid).toHaveLength(1);
    expect(r.invalid).toHaveLength(0);
  });

  test('rechaza CSV sin columnas requeridas', () => {
    const text = 'foo,bar\n1,2\n';
    const r = parseCsvText(text);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Faltan columnas/);
  });

  test('soporta orden distinto de columnas', () => {
    const text = 'email,id,nombre,ciudad,edad\nana@x.com,C001,Ana,Quito,30\n';
    const r = parseCsvText(text);
    expect(r.ok).toBe(true);
    expect(r.valid[0]).toMatchObject({ id: 'C001', nombre: 'Ana', edad: 30 });
  });

  test('líneas mal formadas no hacen throw y aparecen como inválidas', () => {
    const text = [
      'id,nombre,email,ciudad,edad',
      'C001,Ana,ana@x.com,Quito,30',
      'C002,SoloTres,x@x.com',
      'C003,Bad,no-email,Loja,40',
      'C004,NaN,nan@x.com,Ambato,abc',
    ].join('\n');
    const r = parseCsvText(text);
    expect(r.ok).toBe(true);
    expect(r.valid).toHaveLength(1);
    const reasons = r.invalid.map((i) => i.reason).sort();
    expect(reasons).toContain(REASONS.COLUMN_COUNT_MISMATCH);
    expect(reasons).toContain(REASONS.INVALID_EMAIL);
    expect(reasons).toContain(REASONS.INVALID_AGE);
  });

  test('rechaza CSV vacío', () => {
    expect(parseCsvText('').ok).toBe(false);
  });
});
