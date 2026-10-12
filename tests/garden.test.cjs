const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/garden.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { resolveGardenFast, gardenStatus } = loaded.exports;
const now = Date.parse('2026-10-12T12:00:00Z');

test('your tree uses the open journal, and another profile keeps its own fast', () => {
  const yours = resolveGardenFast({
    yours: true,
    current: { start: '2026-10-11T18:00:00Z' },
    shared: { start: '2026-10-01T00:00:00Z' },
    local: null,
    useShared: true,
  });
  assert.equal(gardenStatus(yours, now).label, 'In progress · 18 hours');

  const shared = resolveGardenFast({
    yours: false,
    current: null,
    shared: { start: '2026-10-10T12:00:00Z', end: '2026-10-11T12:00:00Z' },
    local: { start: '2026-10-12T00:00:00Z' },
    useShared: true,
  });
  assert.equal(gardenStatus(shared, now).label, 'Ended · 24 hours');

  const unpublished = resolveGardenFast({
    yours: false,
    current: null,
    shared: undefined,
    local: { start: '2026-10-10T00:00:00Z' },
    useShared: true,
  });
  assert.equal(gardenStatus(unpublished, now).label, 'In progress · 60 hours');

  const cleared = resolveGardenFast({
    yours: false,
    current: null,
    shared: null,
    local: { start: '2026-10-12T00:00:00Z' },
    useShared: true,
  });
  assert.equal(gardenStatus(cleared, now).label, 'Not started');

  const localOnly = resolveGardenFast({
    yours: false,
    current: null,
    shared: { start: '2026-10-12T11:00:00Z' },
    local: { start: '2026-10-09T12:00:00Z' },
    useShared: false,
  });
  assert.equal(gardenStatus(localOnly, now).label, 'Window complete');
  assert.equal(gardenStatus(null, now).label, 'Not started');
  assert.equal(gardenStatus({ start: '2026-10-12T11:30:00Z' }, now).label, 'In progress · just begun');
});
