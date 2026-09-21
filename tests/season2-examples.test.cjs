const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = ['study-guides.js', 'season2-guides.js'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const guides = vm.runInNewContext(source + '; STUDY_GUIDES');

// Run each displayed example in a fresh classic-script environment.
// Native promises and timers preserve the ordering the notes teach.
async function execute(code, fetchMode = 'success') {
  const logs = [];
  const pending = new Set();
  let callbackError;
  const record = (...values) => logs.push(values.map(value => {
    if (value && typeof value.then === 'function') return '[Promise]';
    return String(value);
  }).join(' '));
  const sandbox = {
    console: { log: record },
    setTimeout(callback, delay) {
      const timer = setTimeout(() => {
        pending.delete(timer);
        try { callback(); } catch (error) { callbackError = error; }
      }, delay);
      pending.add(timer);
      return timer;
    },
    setInterval(callback, delay) {
      const timer = setInterval(() => {
        try { callback(); } catch (error) { callbackError = error; }
      }, delay);
      pending.add(timer);
      return timer;
    },
    clearInterval(timer) { clearInterval(timer); pending.delete(timer); },
    fetch: async () => {
      if (fetchMode === 'network') throw new Error('Offline');
      return {
        ok: fetchMode !== 'http', status: fetchMode === 'http' ? 404 : 200,
        json: async () => {
          if (fetchMode === 'json') throw new Error('Invalid JSON');
          return { login: 'sample-user' };
        }
      };
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try {
    vm.runInContext(code, sandbox, { timeout: 1000 });
    const deadline = Date.now() + 2000;
    do {
      // End-of-turn checkpoint drains chains and may schedule another timer.
      await new Promise(resolve => setImmediate(resolve));
      if (pending.size) await new Promise(resolve => setTimeout(resolve, 5));
      assert.ok(Date.now() < deadline, 'example did not finish');
    } while (pending.size);
    await new Promise(resolve => setImmediate(resolve));
    if (callbackError) throw callbackError;
    return logs.join('\n');
  } finally {
    for (const timer of pending) { clearTimeout(timer); clearInterval(timer); }
  }
}

test('guide coverage, script syntax, navigation entries, and source links', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  inline.forEach(match => new vm.Script(match[1]));
  const episodes = vm.runInNewContext(inline[0][1] + '; CONTENT');
  for (const id of ['s2ep1','s2ep2','s2ep3','s2ep4','s2ep5','s2ep6','s2react']) {
    assert.ok(episodes.some(ep => ep.id === id));
    assert.ok(guides[id].sections.length >= 5);
    assert.ok(guides[id].recall.length >= 4);
    assert.match(guides[id].video, /^[\w-]{11}$/);
    assert.ok(guides[id].references.every(([,url]) => url.startsWith('https://')));
    for (const section of guides[id].sections) {
      if (section.code) new vm.Script(section.code);
      assert.ok(section.time === null || (Number.isInteger(section.time) && section.time >= 0));
    }
  }
  assert.ok(html.indexOf('src="study-guides.js"') < html.indexOf('src="season2-guides.js"'));
  assert.ok(episodes.findIndex(ep=>ep.id==='s2ep4') < episodes.findIndex(ep=>ep.id==='s2ep5'));
});

for (const [id, guide] of Object.entries(guides).filter(([id]) => id.startsWith('s2'))) {
  for (const part of guide.sections) {
    if (!part.code || part.code.includes('document.') || part.code.includes('fetch(')) continue;
    test(`${id}: ${part.title}`, async () => {
      assert.equal(await execute(part.code), part.output);
    });
  }
}

for (const id of ['s2ep2','s2ep4']) {
  const part = guides[id].sections.find(part => part.code.includes('fetch('));
  for (const [mode, message] of [['success','sample-user'],['http','HTTP 404'],['network','Offline'],['json','Invalid JSON']]) {
    test(`${id}: fetch ${mode}`, async () => {
      const output = await execute(part.code, mode);
      const last = output.split('\n').at(-1);
      assert.equal(last, mode === 'success' ? message : (id === 's2ep2' ? 'Request failed: ' : 'Unable to load user: ') + message);
    });
  }
}
