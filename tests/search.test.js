import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsvText } from '../src/loader.js';
import { searchById, listByCity, sortByAge, filterByAgeRange } from '../src/search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures', 'clientes.sample.csv');
const PERF_ITERATIONS = 50;
const PERF_LIMIT_MS = 500;

function loadFixture() {
  const text = fs.readFileSync(FIXTURE, 'utf8');
  const { valid } = parseCsvText(text);
  return valid;
}

const sampleClients = [
  { id: 'C001', nombre: 'Ana', email: 'a@x.com', ciudad: 'Quito', edad: 30 },
  { id: 'C002', nombre: 'Luis', email: 'b@x.com', ciudad: 'Loja', edad: 25 },
  { id: 'C003', nombre: 'Eva', email: 'c@x.com', ciudad: 'quito', edad: 40 },
  { id: 'C004', nombre: 'Jorge', email: 'd@x.com', ciudad: 'Ambato', edad: 18 },
];

describe('searchById (RF2)', () => {
  test('encuentra al cliente', () => {
    expect(searchById(sampleClients, 'C002')).toEqual([sampleClients[1]]);
  });
  test('retorna vacío si no existe', () => {
    expect(searchById(sampleClients, 'Z999')).toEqual([]);
  });
  test('retorna vacío si el id está vacío', () => {
    expect(searchById(sampleClients, '')).toEqual([]);
    expect(searchById(sampleClients, null)).toEqual([]);
  });
  test('rendimiento < 500 ms', () => {
    const clients = loadFixture();
    let max = 0;
    for (let i = 0; i < PERF_ITERATIONS; i++) {
      const t0 = performance.now();
      searchById(clients, 'C0250');
      max = Math.max(max, performance.now() - t0);
    }
    expect(max).toBeLessThan(PERF_LIMIT_MS);
  });
});

describe('listByCity (RF3)', () => {
  test('case-insensitive', () => {
    const r = listByCity(sampleClients, 'QUITO');
    expect(r.map((c) => c.id).sort()).toEqual(['C001', 'C003']);
  });
  test('vacío si no hay match', () => {
    expect(listByCity(sampleClients, 'Manta')).toEqual([]);
  });
  test('rendimiento < 500 ms', () => {
    const clients = loadFixture();
    let max = 0;
    for (let i = 0; i < PERF_ITERATIONS; i++) {
      const t0 = performance.now();
      listByCity(clients, 'Quito');
      max = Math.max(max, performance.now() - t0);
    }
    expect(max).toBeLessThan(PERF_LIMIT_MS);
  });
});

describe('sortByAge (RF4)', () => {
  test('ordena ascendente y no muta', () => {
    const copy = [...sampleClients];
    const sorted = sortByAge(sampleClients);
    expect(sorted.map((c) => c.edad)).toEqual([18, 25, 30, 40]);
    expect(sampleClients).toEqual(copy);
  });
  test('rendimiento < 500 ms', () => {
    const clients = loadFixture();
    let max = 0;
    for (let i = 0; i < PERF_ITERATIONS; i++) {
      const t0 = performance.now();
      sortByAge(clients);
      max = Math.max(max, performance.now() - t0);
    }
    expect(max).toBeLessThan(PERF_LIMIT_MS);
  });
});

describe('filterByAgeRange (RF5)', () => {
  test('filtra con ambos límites inclusive', () => {
    const { ok, results } = filterByAgeRange(sampleClients, 25, 30);
    expect(ok).toBe(true);
    expect(results.map((c) => c.id).sort()).toEqual(['C001', 'C002']);
  });
  test('límite abierto si falta min', () => {
    const { results } = filterByAgeRange(sampleClients, '', 25);
    expect(results.map((c) => c.id).sort()).toEqual(['C002', 'C004']);
  });
  test('límite abierto si falta max', () => {
    const { results } = filterByAgeRange(sampleClients, 30, '');
    expect(results.map((c) => c.id).sort()).toEqual(['C001', 'C003']);
  });
  test('min > max devuelve error sin intercambiar', () => {
    const { ok, results, error } = filterByAgeRange(sampleClients, 50, 10);
    expect(ok).toBe(false);
    expect(results).toEqual([]);
    expect(error).toBeTruthy();
  });
  test('rendimiento < 500 ms', () => {
    const clients = loadFixture();
    let max = 0;
    for (let i = 0; i < PERF_ITERATIONS; i++) {
      const t0 = performance.now();
      filterByAgeRange(clients, 20, 60);
      max = Math.max(max, performance.now() - t0);
    }
    expect(max).toBeLessThan(PERF_LIMIT_MS);
  });
});
