import { validateRow, validateRows, REASONS, REQUIRED_COLUMNS } from '../src/validator.js';

const COLS = REQUIRED_COLUMNS;

describe('validateRow', () => {
  test('acepta una fila válida', () => {
    const r = validateRow(['C001', 'Ana', 'ana@x.com', 'Quito', '30'], 2, new Set(), COLS);
    expect(r.ok).toBe(true);
    expect(r.client).toEqual({ id: 'C001', nombre: 'Ana', email: 'ana@x.com', ciudad: 'Quito', edad: 30 });
  });

  test('rechaza cuenta de columnas incorrecta', () => {
    const r = validateRow(['C001', 'Ana', 'ana@x.com', 'Quito'], 2, new Set(), COLS);
    expect(r.ok).toBe(false);
    expect(r.invalid.reason).toBe(REASONS.COLUMN_COUNT_MISMATCH);
  });

  test('rechaza campos faltantes', () => {
    const r = validateRow(['C001', '', 'ana@x.com', 'Quito', '30'], 2, new Set(), COLS);
    expect(r.ok).toBe(false);
    expect(r.invalid.reason).toBe(REASONS.MISSING_FIELD);
  });

  test('rechaza edad no numérica', () => {
    const r = validateRow(['C001', 'Ana', 'ana@x.com', 'Quito', 'treinta'], 2, new Set(), COLS);
    expect(r.ok).toBe(false);
    expect(r.invalid.reason).toBe(REASONS.INVALID_AGE);
  });

  test('rechaza email inválido', () => {
    const r = validateRow(['C001', 'Ana', 'no-email', 'Quito', '30'], 2, new Set(), COLS);
    expect(r.ok).toBe(false);
    expect(r.invalid.reason).toBe(REASONS.INVALID_EMAIL);
  });

  test('rechaza id duplicado', () => {
    const seen = new Set(['C001']);
    const r = validateRow(['C001', 'Ana', 'ana@x.com', 'Quito', '30'], 3, seen, COLS);
    expect(r.ok).toBe(false);
    expect(r.invalid.reason).toBe(REASONS.DUPLICATE_ID);
  });
});

describe('validateRows', () => {
  test('separa válidos e inválidos con línea correcta', () => {
    const rows = [
      ['C001', 'Ana', 'ana@x.com', 'Quito', '30'],
      ['C002', '', 'luis@x.com', 'Loja', '25'],
      ['C001', 'Dup', 'dup@x.com', 'Ambato', '40'],
      [],
    ];
    const { valid, invalid } = validateRows(rows, COLS, { startLine: 2 });
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe('C001');
    expect(invalid).toHaveLength(3);
    expect(invalid[0].line).toBe(3);
    expect(invalid[0].reason).toBe(REASONS.MISSING_FIELD);
    expect(invalid[1].line).toBe(4);
    expect(invalid[1].reason).toBe(REASONS.DUPLICATE_ID);
    expect(invalid[2].line).toBe(5);
    expect(invalid[2].reason).toBe(REASONS.COLUMN_COUNT_MISMATCH);
  });

  test('soporta columnas en orden distinto y extra', () => {
    const cols = ['nombre', 'id', 'edad', 'email', 'ciudad', 'extra'];
    const rows = [['Ana', 'C001', '30', 'ana@x.com', 'Quito', 'xyz']];
    const { valid, invalid } = validateRows(rows, cols);
    expect(invalid).toHaveLength(0);
    expect(valid[0]).toMatchObject({ id: 'C001', nombre: 'Ana', edad: 30, extra: 'xyz' });
  });
});
