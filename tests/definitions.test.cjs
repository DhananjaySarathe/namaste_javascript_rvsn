const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const definitions = require(path.join(root, 'definitions.js'));

// Print values the way the notes show them, so a displayed result can be
// compared with what the example actually produces.
function format(value, depth = 0) {
  if (typeof value === 'string') return depth ? JSON.stringify(value) : value;
  if (Array.isArray(value)) return '[' + value.map(item => format(item, depth + 1)).join(', ') + ']';
  const name = value && value.constructor && value.constructor.name;
  if (value && typeof value === 'object' && name === 'Object') {
    return '{' + Object.entries(value).map(([key, item]) => key + ': ' + format(item, depth + 1)).join(', ') + '}';
  }
  return String(value);
}

async function execute(code) {
  const logs = [];
  const pending = new Set();
  let callbackError;
  const sandbox = {
    console: { log: (...values) => logs.push(values.map(value => format(value)).join(' ')) },
    queueMicrotask,
    Date,
    Math,
    setTimeout(callback, delay) {
      const timer = setTimeout(() => {
        pending.delete(timer);
        try { callback(); } catch (error) { callbackError = error; }
      }, delay);
      pending.add(timer);
      return timer;
    },
    clearTimeout(timer) { clearTimeout(timer); pending.delete(timer); }
  };
  vm.createContext(sandbox);
  try {
    vm.runInContext(code, sandbox, { timeout: 2000 });
    const deadline = Date.now() + 3000;
    do {
      await new Promise(resolve => setImmediate(resolve));
      if (pending.size) await new Promise(resolve => setTimeout(resolve, 5));
      assert.ok(Date.now() < deadline, 'example did not finish');
    } while (pending.size);
    await new Promise(resolve => setImmediate(resolve));
    if (callbackError) throw callbackError;
    return logs.join('\n');
  } finally {
    for (const timer of pending) clearTimeout(timer);
  }
}

test('every lesson with a guide has at least one definition, and each term is complete', () => {
  const source = ['study-guides.js', 'season2-guides.js']
    .map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  const guides = vm.runInNewContext(source + '; STUDY_GUIDES');
  for (const id of Object.keys(guides)) {
    assert.ok(definitions.has(id), `lesson ${id} has no interview definition`);
  }
  for (const entry of definitions.all()) {
    assert.ok(entry.name.length > 1, 'term needs a name');
    assert.ok(entry.say.length > 40, `${entry.name}: the spoken answer is too short`);
    assert.ok(entry.probe.length >= 1, `${entry.name}: needs at least one follow-up`);
    assert.ok(entry.probe.every(([q, a]) => q.length > 5 && a.length > 5), `${entry.name}: incomplete follow-up`);
    if (entry.code) new vm.Script(entry.code);
  }
});

test('index.html loads the definitions script and exposes a glossary route', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /src="definitions\.js"/);
  assert.match(html, /href="definitions\.css"/);
  assert.match(html, /data-go="glossary"/);
});

for (const entry of definitions.all()) {
  if (!entry.code || entry.env === 'browser') continue;
  test(`${entry.lesson}: ${entry.name}`, async () => {
    assert.equal(await execute(entry.code), entry.output);
  });
}
