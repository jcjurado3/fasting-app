const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/bonsai.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { growthState, GROWTH_MARKS } = loaded.exports;

test('the bonsai opens a new part every 12 hours and finishes at 72', () => {
  const seed = growthState(0);
  assert.equal(seed.stage.title, 'Seed');
  assert.equal(seed.trunk, 0);
  assert.equal(seed.marks.filter((mark) => mark.reached).map((mark) => mark.hour).join(','), '0');

  const sprout = growthState(18);
  assert.equal(sprout.stage.title, 'Sprout');
  assert.equal(sprout.trunk, 1);
  assert.equal(sprout.branches, 0.5);
  assert.equal(sprout.leaves, 0);

  const rooted = growthState(72);
  assert.equal(rooted.stage.title, 'Rooted');
  assert.equal(rooted.settled, 1);
  assert.equal(rooted.marks.every((mark) => mark.reached), true);
  assert.deepEqual(GROWTH_MARKS, [0, 12, 24, 36, 48, 60, 72]);

  const past = growthState(90);
  assert.equal(past.hours, 72);
  assert.equal(past.pastWindow, true);
  assert.equal(growthState(-4).stage.title, 'Seed');
});
