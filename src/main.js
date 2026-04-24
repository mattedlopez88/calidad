import { loadFromFile } from './loader.js';
import { searchById, listByCity, sortByAge, filterByAgeRange } from './search.js';
import { buildAgeHistogram } from './stats.js';
import { measure } from './timing.js';
import {
  renderCounts,
  renderTableHeader,
  renderResults,
  renderTiming,
  renderInvalid,
  renderError,
  renderHistogram,
} from './ui/render.js';

const $ = (id) => document.getElementById(id);

const state = {
  clients: [],
  invalid: [],
  columns: [],
  loaded: false,
};

const CONTROL_IDS = [
  'inputId', 'inputCiudad', 'inputMin', 'inputMax',
  'btnSort', 'btnClear', 'btnSearchId', 'btnSearchCity', 'btnFilterAge',
];

function setControlsEnabled(enabled) {
  for (const id of CONTROL_IDS) {
    const el = $(id);
    if (el) el.disabled = !enabled;
  }
}

function showResultsSection(show) {
  $('results').hidden = !show;
  $('invalid').hidden = !show;
  $('stats').hidden = !show;
}

function showResults(results, elapsedMs) {
  renderResults($('resultsBody'), results, state.columns);
  renderTiming($('timing'), results.length, elapsedMs);
}

async function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const result = await loadFromFile(file);
  if (!result.ok) {
    renderError($('error'), result.error);
    return;
  }
  renderError($('error'), '');

  state.clients = result.valid;
  state.invalid = result.invalid;
  state.columns = result.columns;
  state.loaded = true;

  renderCounts($('counts'), {
    total: result.valid.length + result.invalid.length,
    valid: result.valid.length,
    invalid: result.invalid.length,
  });
  renderTableHeader($('resultsHead'), result.columns);
  renderInvalid($('invalidList'), result.invalid);
  showResultsSection(true);
  showResults(result.valid, 0);
  renderHistogram($('chart'), buildAgeHistogram(result.valid, 10));
  setControlsEnabled(true);
}

function clearFilters() {
  $('inputId').value = '';
  $('inputCiudad').value = '';
  $('inputMin').value = '';
  $('inputMax').value = '';
  renderError($('error'), '');
  showResults(state.clients, 0);
}

function wire() {
  $('fileInput').addEventListener('change', handleFile);

  $('btnSearchId').addEventListener('click', () => {
    const { result, elapsedMs } = measure(() => searchById(state.clients, $('inputId').value));
    showResults(result, elapsedMs);
  });

  $('btnSearchCity').addEventListener('click', () => {
    const { result, elapsedMs } = measure(() => listByCity(state.clients, $('inputCiudad').value));
    showResults(result, elapsedMs);
  });

  $('btnSort').addEventListener('click', () => {
    const { result, elapsedMs } = measure(() => sortByAge(state.clients));
    showResults(result, elapsedMs);
  });

  $('btnFilterAge').addEventListener('click', () => {
    const { result, elapsedMs } = measure(() =>
      filterByAgeRange(state.clients, $('inputMin').value, $('inputMax').value),
    );
    if (!result.ok) {
      renderError($('error'), result.error);
      showResults([], elapsedMs);
      return;
    }
    renderError($('error'), '');
    showResults(result.results, elapsedMs);
  });

  $('btnClear').addEventListener('click', clearFilters);

  setControlsEnabled(false);
  showResultsSection(false);
}

wire();
