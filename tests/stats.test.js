import { buildAgeHistogram } from '../src/stats.js';

describe('buildAgeHistogram', () => {
  test('retorna vacío para input vacío', () => {
    expect(buildAgeHistogram([], 10)).toEqual({ labels: [], counts: [] });
  });

  test('retorna vacío con bucketSize inválido', () => {
    expect(buildAgeHistogram([{ edad: 30 }], 0)).toEqual({ labels: [], counts: [] });
    expect(buildAgeHistogram([{ edad: 30 }], -5)).toEqual({ labels: [], counts: [] });
  });

  test('un solo bucket cuando todas las edades caen en el mismo rango', () => {
    const { labels, counts } = buildAgeHistogram(
      [{ edad: 22 }, { edad: 25 }, { edad: 29 }],
      10,
    );
    expect(labels).toEqual(['20-29']);
    expect(counts).toEqual([3]);
  });

  test('distribución despareja abarca todos los buckets intermedios', () => {
    const clients = [
      { edad: 18 }, { edad: 21 }, { edad: 22 },
      { edad: 35 },
      { edad: 58 }, { edad: 59 },
    ];
    const { labels, counts } = buildAgeHistogram(clients, 10);
    expect(labels).toEqual(['10-19', '20-29', '30-39', '40-49', '50-59']);
    expect(counts).toEqual([1, 2, 1, 0, 2]);
  });

  test('ignora registros con edad no numérica', () => {
    const clients = [{ edad: 20 }, { edad: NaN }, { edad: '30' }, { edad: 25 }];
    const { counts } = buildAgeHistogram(clients, 10);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(2);
  });
});
