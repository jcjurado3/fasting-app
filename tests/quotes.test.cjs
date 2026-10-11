const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve('lib/quotes.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Module(source, module);
loaded.filename = source; loaded.paths = module.paths; loaded._compile(compiled, source);
const { parseQuotes, quotesUrl, STOIC_QUOTES_URL } = loaded.exports;

test('a quote list and a single quote both become clean reflections', () => {
  const list = parseQuotes([
    { text: '  All that exists is the seed.  ', author: ' Marcus Aurelius ' },
    { text: 'All that exists is the seed.', author: 'Marcus Aurelius' },
    { text: '', author: 'Seneca' },
    { text: 'A line', author: '' },
  ]);
  assert.deepEqual(list, [{ text: 'All that exists is the seed.', author: 'Marcus Aurelius' }]);
  assert.deepEqual(parseQuotes({ text: 'You are a little soul carrying around a corpse.', author: 'Epictetus' }), [
    { text: 'You are a little soul carrying around a corpse.', author: 'Epictetus' },
  ]);
});

test('broken rows are left out, and the request stays within the API limit', () => {
  assert.deepEqual(parseQuotes([{ text: 'x'.repeat(901), author: 'Seneca' }, null, 'nope']), []);
  assert.equal(quotesUrl(0), `${STOIC_QUOTES_URL}?num=1`);
  assert.equal(quotesUrl(10), `${STOIC_QUOTES_URL}?num=10`);
  assert.equal(quotesUrl(500), `${STOIC_QUOTES_URL}?num=100`);
});
