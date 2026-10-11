const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/fast-dots.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { hourDots, secondDots, windowRemaining, formatHoursLeft, elapsedWholeSeconds, secondOfMinute } = loaded.exports;

function distance(dot) { return Math.hypot(dot.x - 100, dot.y - 100); }

test('one dot stands for each hour of the 72-hour window', () => {
  assert.equal(hourDots.length, 72);
  assert.ok(distance(hourDots[0]) > distance(hourDots[71]));
});

test('remaining time counts down from 72 hours and stops at zero', () => {
  assert.deepEqual(windowRemaining(0), { hours: 72, seconds: 259200 });
  assert.equal(windowRemaining(10.5).seconds, 221400);
  assert.deepEqual(windowRemaining(72), { hours: 0, seconds: 0 });
  assert.deepEqual(windowRemaining(80), { hours: 0, seconds: 0 });
  assert.equal(formatHoursLeft(0), '72');
  assert.equal(formatHoursLeft(54.26), '17.7');
});

test('the inner ring advances one step each second and wraps each minute', () => {
  assert.equal(secondDots.length, 60);
  assert.equal(elapsedWholeSeconds(0), 0);
  assert.equal(secondOfMinute(0), 0);
  assert.equal(elapsedWholeSeconds(5 / 3600), 5);
  assert.equal(secondOfMinute(5 / 3600), 5);
  assert.equal(secondOfMinute(59 / 3600), 59);
  assert.equal(secondOfMinute(60 / 3600), 0);
  assert.equal(elapsedWholeSeconds(60 / 3600), 60);
});
