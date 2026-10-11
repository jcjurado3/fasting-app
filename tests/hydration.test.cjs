const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/hydration.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { hydrationFill, hydrationSeams, hydrationNote } = loaded.exports;

test('the bar fills toward the daily reference and stops at full', () => {
  assert.equal(hydrationFill(0, 2000), 0);
  assert.equal(hydrationFill(250, 2000), 12.5);
  assert.equal(hydrationFill(2000, 2000), 100);
  assert.equal(hydrationFill(2600, 2000), 100);
  assert.equal(hydrationFill(250, 0), 0);
});

test('each earlier sip leaves a seam inside the fill', () => {
  assert.deepEqual(hydrationSeams([250, 250], 2000), [12.5]);
  assert.deepEqual(hydrationSeams([250], 2000), []);
  assert.deepEqual(hydrationSeams([], 2000), []);
});

test('the note follows an empty day, the reference, and a little past it', () => {
  assert.equal(hydrationNote(0, 2000), 'Small sips, throughout the day.');
  assert.equal(hydrationNote(2000, 2000), "Today's reference is met.");
  assert.equal(hydrationNote(2250, 2000), "A little past today's reference.");
});
