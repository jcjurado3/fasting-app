const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/store.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { normalizeJournal, suggestedMoment } = loaded.exports;
const fast = { id: 'test', start: '2026-10-10T12:00:00Z', mealAt: '2026-10-10T12:00:00Z', meal: '' };

test('older journals gain check-in logs without losing what they already stored', () => {
  const journal = normalizeJournal({ fasts: [fast], waterGoal: 2500 });
  assert.equal(journal.fasts.length, 1);
  assert.equal(journal.waterGoal, 2500);
  assert.deepEqual(journal.checkins, []);
  assert.deepEqual(journal.sleep, []);
  assert.deepEqual(journal.workouts, []);
});
test('a fresh journal does not share its check-in lists', () => {
  const first = normalizeJournal(null);
  first.checkins.push({ id: 'a' });
  assert.equal(normalizeJournal(undefined).checkins.length, 0);
});
test('the suggested check-in follows before, each day, and after', () => {
  assert.equal(suggestedMoment(undefined, 0), 'before');
  assert.equal(suggestedMoment(fast, 10), 'day-1');
  assert.equal(suggestedMoment(fast, 30), 'day-2');
  assert.equal(suggestedMoment(fast, 50), 'day-3');
  assert.equal(suggestedMoment(fast, 72), 'after');
  assert.equal(suggestedMoment({ ...fast, end: fast.start }, 5), 'after');
});
