const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/guide.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { convertGlucose, gkiScore, gkiZone, phaseAt } = loaded.exports;

test('mg/dL glucose is converted before the ketone ratio', () => assert.equal(gkiScore(90, 2, 'mg/dL'), 2.5));
test('mmol/L glucose divides directly by ketones', () => assert.equal(gkiScore(4, 2, 'mmol/L'), 2));
test('missing or non-positive readings do not produce a score', () => {
  assert.equal(gkiScore(0, 1, 'mg/dL'), null);
  assert.equal(gkiScore(90, 0, 'mg/dL'), null);
  assert.equal(gkiScore(Number.NaN, 1, 'mg/dL'), null);
});
test('glucose converts both ways with the factor of 18', () => {
  assert.equal(convertGlucose(90, 'mg/dL', 'mmol/L'), 5);
  assert.equal(convertGlucose(5, 'mmol/L', 'mg/dL'), 90);
});
test('shared GKI edges belong to the deeper band', () => {
  assert.equal(gkiZone(9.1).tone, 'none');
  assert.equal(gkiZone(9).tone, 'low');
  assert.equal(gkiZone(6).tone, 'mid');
  assert.equal(gkiZone(3).state, 'High therapeutic');
  assert.equal(gkiZone(1).tone, 'high');
  assert.equal(gkiZone(0.99).tone, 'peak');
});
test('the autophagy map changes at 12, 24, 48, and 72 hours', () => {
  assert.equal(phaseAt(0).title, 'Fed state');
  assert.equal(phaseAt(11.9).hour, 0);
  assert.equal(phaseAt(12).title, 'Glycogen easing');
  assert.equal(phaseAt(47.9).title, 'Ketosis shift');
  assert.equal(phaseAt(48).title, 'Peak window');
  assert.equal(phaseAt(72).title, 'Gentle return');
  assert.equal(phaseAt(100).glance, 'Refeed');
});
