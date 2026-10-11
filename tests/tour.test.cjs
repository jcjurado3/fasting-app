const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/tour.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { tourSteps, tourStep, placeTourCard } = loaded.exports;

test('the tour ends by choosing a profile and then signing in', () => {
  assert.equal(tourSteps.at(-2).id, 'profile');
  assert.equal(tourSteps.at(-1).id, 'sign-in');
  assert.equal(tourSteps.at(-2).target, 'profile');
  assert.equal(tourSteps.at(-1).target, 'sign-in');
  assert.equal(tourStep(99).id, 'sign-in');
  assert.equal(tourSteps.some((step) => step.body.includes('@')), false);
});

test('the card sits beside a wide target, docks on a phone, and centers the welcome', () => {
  const wide = { width: 1280, height: 900 };
  assert.equal(placeTourCard(null, wide).placement, 'center');
  assert.equal(placeTourCard({ top: 200, height: 280, left: 400, width: 320 }, wide).placement, 'below');
  assert.equal(placeTourCard({ top: 700, height: 160, left: 400, width: 320 }, wide).placement, 'above');
  assert.equal(placeTourCard({ top: 80, height: 40, left: 900, width: 120 }, { width: 390, height: 844 }).placement, 'dock');
});
