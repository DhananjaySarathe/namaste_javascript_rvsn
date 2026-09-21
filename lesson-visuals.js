/* Small, deterministic teaching models; no timers or user-code evaluation. */
const LESSON_VISUALS = (() => {
  const frame = (line, note, panels) => ({line, note, panels});
  const traces = {
    execution: {
      title: 'Watch memory and the call stack',
      intro: 'Step through two calls. The active frame is shown first; each call gets its own local bindings.',
      code: 'var n = 2;\nfunction square(num) {\n  var ans = num * num;\n  return ans;\n}\nvar square2 = square(n);\nvar square4 = square(4);',
      steps: [
        frame(0, 'Preparation: var bindings contain undefined; the function declaration is available. This is a teaching model of bindings, not physical memory.', {'Call stack · top first':['Global'], 'Global bindings':['n: undefined','square: function','square2: undefined','square4: undefined']}),
        frame(1, 'The assignment stores 2 in the existing n binding.', {'Call stack · top first':['Global'], 'Global bindings':['n: 2','square: function','square2: undefined','square4: undefined']}),
        frame(6, 'square(n) passes 2. The global assignment waits for the return value.', {'Call stack · top first':['square(2) ← active','Global ← suspended'], 'Local bindings':['num: 2','ans: undefined'], 'Global bindings':['n: 2','square2: undefined','square4: undefined']}),
        frame(3, 'The first invocation calculates its own ans.', {'Call stack · top first':['square(2) ← active','Global'], 'Local bindings':['num: 2','ans: 4']}),
        frame(4, 'Return 4, remove this call frame, and complete the square2 assignment.', {'Call stack · top first':['Global'], 'Global bindings':['n: 2','square2: 4','square4: undefined']}),
        frame(7, 'The second call creates a fresh environment. The previous ans is not reused.', {'Call stack · top first':['square(4) ← active','Global ← suspended'], 'Local bindings':['num: 4','ans: undefined']}),
        frame(3, 'This invocation computes 16.', {'Call stack · top first':['square(4) ← active','Global'], 'Local bindings':['num: 4','ans: 16']}),
        frame(4, 'Return 16 and complete the square4 assignment.', {'Call stack · top first':['Global'], 'Global bindings':['n: 2','square2: 4','square4: 16']}),
        frame(0, 'The script finishes. Its stack frame leaves; this does not imply that all global bindings disappear.', {'Call stack · top first':[], 'Global bindings':['n: 2','square2: 4','square4: 16']})
      ]
    },
    scope: {
      title: 'Follow the lexical scope chain',
      intro: 'Calling a function from another function does not change where its names are looked up.',
      code: 'const x = "global";\nfunction read() {\n  console.log(x);\n}\nfunction caller() {\n  const x = "caller";\n  read();\n}\ncaller();',
      steps: [
        frame(9, 'caller begins. It has its own x, separate from the global x.', {'Call stack · top first':['caller','Global'], 'Bindings':['caller.x: "caller"','global.x: "global"']}),
        frame(7, 'caller invokes read. Stack order records who called whom.', {'Call stack · top first':['read','caller','Global'], 'Lexical chain · lookup direction':['read → Global → end']}),
        frame(3, 'Lookup starts in read. There is no local x, so follow read’s lexical parent: Global.', {'Lookup path':['read: x not found','↓ Global: x = "global"'], 'Not on this lookup path':['caller.x: "caller"']}),
        frame(3, 'Print global. The lexical parent comes from where read was defined, not where it was called.', {'Console':['global'], 'Two different relationships':['Call stack: read → caller → Global','Scope chain: read → Global']})
      ]
    },
    closure: {
      title: 'A returned function keeps access to its binding',
      intro: 'Watch the outer frame leave while its captured state remains reachable.',
      code: 'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next());\nconsole.log(next());',
      steps: [
        frame(2, 'The outer call initializes a new count binding.', {'Call stack · top first':['makeCounter','Global'], 'Outer lexical environment':['count: 0']}),
        frame(3, 'Creating the arrow also gives it access to its surrounding environment.', {'Call stack · top first':['makeCounter','Global'], 'Reference path':['arrow → outer environment → count: 0']}),
        frame(5, 'makeCounter returns. next references the arrow; the captured binding is still reachable.', {'Call stack · top first':['Global'], 'Reference path':['next → arrow → retained environment','count: 0']}),
        frame(6, 'next reads and increments that same count binding, returning 1.', {'Call stack · top first':['next (arrow)','Global'], 'Retained environment':['count: 1'], 'Console':['1']}),
        frame(7, 'The next invocation increments the same binding again. A closure is not a frozen snapshot.', {'Call stack · top first':['next (arrow)','Global'], 'Retained environment':['count: 2'], 'Console':['1','2']}),
        frame(0, 'After the script, no call is active. next can still reach count. A separate makeCounter() call would create separate state.', {'Call stack · top first':[], 'Reference path':['next → arrow → retained count: 2'], 'Console':['1','2']})
      ]
    },
    loop: {
      title: 'Shared var versus per-iteration let',
      intro: 'Both loops finish before their timer callbacks run. Compare the bindings each callback will read.',
      code: 'for (var i = 1; i <= 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// Run separately, replacing var with let.',
      steps: [
        frame(2, 'First iteration registers a callback. It remembers access to a binding, not a copied number.', {'var · one shared binding':['callback 1 → i: 1'], 'let · iteration bindings':['callback 1 → i₁: 1']}),
        frame(2, 'Second iteration: var reuses i; let supplies a new iteration binding.', {'var · one shared binding':['callbacks 1, 2 → i: 2'], 'let · iteration bindings':['callback 1 → i₁: 1','callback 2 → i₂: 2']}),
        frame(2, 'Third iteration registers the final callback.', {'var · one shared binding':['callbacks 1, 2, 3 → i: 3'], 'let · iteration bindings':['callback 1 → i₁: 1','callback 2 → i₂: 2','callback 3 → i₃: 3']}),
        frame(1, 'The final increment makes the loop condition false. Shared i is now 4; captured let bindings remain 1, 2, 3.', {'var · after loop':['callbacks 1, 2, 3 → i: 4'], 'let · captured bindings':['callback 1 → i₁: 1','callback 2 → i₂: 2','callback 3 → i₃: 3']}),
        frame(0, 'Once the script finishes, callbacks run. Their output differs because their binding relationships differ.', {'var · console':['4','4','4'], 'let · console':['1','2','3']})
      ]
    },
    event: {
      title: 'Move through the event loop',
      intro: 'One browser script, a timer, and two promise reactions. Queue order reads from top to bottom.',
      code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => {\n  console.log("C");\n  Promise.resolve().then(() => console.log("D"));\n});\nconsole.log("E");',
      steps: [
        frame(1, 'The script logs A synchronously.', {'Call stack':['Script'], 'Microtasks':[], 'Timer / task':[], 'Console':['A']}),
        frame(2, 'The browser registers the timer. Zero delay does not interrupt the script.', {'Call stack':['Script'], 'Microtasks':[], 'Timer / task':['B: registered with browser'], 'Console':['A']}),
        frame(3, 'The promise is already fulfilled, so attaching this handler queues a reaction.', {'Call stack':['Script'], 'Microtasks':['C handler'], 'Timer / task':['B: waiting / eligible'], 'Console':['A']}),
        frame(7, 'Synchronous work logs E, then the script finishes.', {'Call stack':[], 'Microtasks':['C handler'], 'Timer / task':['B: waiting / eligible'], 'Console':['A','E']}),
        frame(4, 'At the microtask checkpoint, run the C handler.', {'Call stack':['C handler'], 'Microtasks':[], 'Timer / task':['B: waiting / eligible'], 'Console':['A','E','C']}),
        frame(5, 'C queues another microtask before returning.', {'Call stack':['C handler'], 'Microtasks':['D handler'], 'Timer / task':['B: waiting / eligible'], 'Console':['A','E','C']}),
        frame(5, 'The checkpoint drains newly added microtasks too. D runs before the timer task.', {'Call stack':['D handler'], 'Microtasks':[], 'Timer / task':['B: waiting / eligible'], 'Console':['A','E','C','D']}),
        frame(2, 'After the checkpoint, the eligible timer task can run. Actual wall-clock delay is not modeled.', {'Call stack':['B callback'], 'Microtasks':[], 'Timer / task':[], 'Console':['A','E','C','D','B']}),
        frame(0, 'All work in this example is complete. Browsers have multiple task sources; this is the timer case.', {'Call stack':[], 'Microtasks':[], 'Timer / task':[], 'Console':['A','E','C','D','B']})
      ]
    },
    await: {
      title: 'await suspends a function, not the thread',
      intro: 'Even an already-fulfilled promise resumes the async function later.',
      code: 'async function run() {\n  console.log("inside");\n  await Promise.resolve(42);\n  console.log("resumed");\n}\nconsole.log("start");\nrun();\nconsole.log("end");',
      steps: [
        frame(6, 'The script starts synchronously.', {'Call stack · top first':['Script'], 'Continuation':[], 'Console':['start']}),
        frame(2, 'Calling run executes its body immediately until await.', {'Call stack · top first':['run','Script'], 'Continuation':[], 'Console':['start','inside']}),
        frame(3, 'await suspends run. Its continuation is queued as a microtask; the caller can continue.', {'Call stack · top first':['Script'], 'Continuation':['run: resume after await (queued)'], 'Console':['start','inside']}),
        frame(8, 'The rest of the script logs end. No synchronous waiting loop is involved.', {'Call stack · top first':['Script'], 'Continuation':['run: resume after await (queued)'], 'Console':['start','inside','end']}),
        frame(4, 'After the script finishes, the microtask resumes run.', {'Call stack · top first':['run (resumed)'], 'Continuation':[], 'Console':['start','inside','end','resumed']}),
        frame(0, 'run finishes and its returned promise fulfills with undefined. Awaiting a pending promise would resume only after its outcome becomes available.', {'Call stack · top first':[], 'Continuation':[], 'Console':['start','inside','end','resumed']})
      ]
    }
  };
  const locations = {ep2:'execution',ep7:'scope',ep10:'closure',ep11:'loop',ep15:'event',s2ep4:'await',s2ep5:'promises'};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function outcomes(time, failed) {
    const inputs = [{name:'P1',at:3},{name:'P2',at:1},{name:'P3',at:2}].map(p => ({...p, state:time < p.at ? 'pending' : failed.includes(p.name) ? 'rejected' : 'fulfilled'}));
    const settled = inputs.filter(p => p.state !== 'pending').sort((a,b) => a.at-b.at);
    const firstBad = settled.find(p => p.state === 'rejected');
    const firstGood = settled.find(p => p.state === 'fulfilled');
    return {inputs, results:{
      all: firstBad ? `Rejected: ${firstBad.name} error` : time < 3 ? 'Pending' : 'Fulfilled: [P1 value, P2 value, P3 value]',
      allSettled:time < 3 ? 'Pending' : `Fulfilled: [${inputs.map(p => `${p.name}: ${p.state}`).join(', ')}]`,
      race: !settled.length ? 'Pending' : `${settled[0].state === 'fulfilled' ? 'Fulfilled' : 'Rejected'}: ${settled[0].name} ${settled[0].state === 'fulfilled' ? 'value' : 'error'}`,
      any:firstGood ? `Fulfilled: ${firstGood.name} value` : time < 3 ? 'Pending' : 'Rejected: AggregateError [P1 error, P2 error, P3 error]'
    }};
  }
  function traceBody(key, at) {
    const trace = traces[key], step = trace.steps[at];
    return `<div class="visual-code" aria-label="Example code">${trace.code.split('\n').map((line,i) => `<div class="${step.line === i+1 ? 'current-line' : ''}"><span aria-hidden="true">${i+1}</span><code>${esc(line) || ' '}</code>${step.line === i+1 ? '<b class="sr-only"> ← current line</b>' : ''}</div>`).join('')}</div>
      <div class="visual-panels">${Object.entries(step.panels).map(([name,items]) => `<section><h4>${esc(name)}</h4><ol>${items.length ? items.map(item => `<li>${esc(item)}</li>`).join('') : '<li class="visual-empty">Empty</li>'}</ol></section>`).join('')}</div>`;
  }
  function render(id) {
    const key = locations[id];
    if (!key) return '';
    const promise = key === 'promises';
    return `<section class="lesson-visual" id="${id}-visual" data-visual="${key}" data-step="0"><div class="visual-kicker">Explore the concept</div><h3>${promise ? 'Same promises, four different decisions' : traces[key].title}</h3><p>${promise ? 'P1 finishes at 3 seconds, P2 at 1 second, P3 at 2 seconds. All three start together. Choose failures, then advance the shared clock.' : traces[key].intro}</p>
      ${promise ? '<fieldset class="visual-options"><legend>Which promises reject?</legend>'+['P1','P2','P3'].map(p => `<label><input type="checkbox" value="${p}" ${p==='P2'?'checked':''}> ${p}</label>`).join('')+'</fieldset>' : ''}
      <div class="visual-stage">${promise ? promiseBody(0,['P2']) : traceBody(key,0)}</div>
      <div class="visual-controls"><button type="button" data-visual-action="back" disabled>Previous step</button><button type="button" data-visual-action="next">Next step →</button><button type="button" data-visual-action="reset">Restart</button><span class="visual-position">${promise ? 'Time: 0 s' : `Step 1 of ${traces[key].steps.length}`}</span></div>
      <p class="visual-note" aria-live="polite" aria-atomic="true">${promise ? promiseNote : esc(traces[key].steps[0].note)}</p></section>`;
  }
  const promiseNote = 'These are simulated settlement times. Each API receives [P1, P2, P3]. Early settlement does not cancel the other promises. allSettled entries also contain a value or reason; here the diagram shows their status.';
  function promiseBody(time, failed) {
    const state = outcomes(time,failed);
    return `<div class="promise-timeline"><div class="timeline-axis"><span>0 s</span><span>1 s</span><span>2 s</span><span>3 s</span></div>${state.inputs.map(p => `<div class="promise-lane"><b>${p.name}</b><div class="promise-track"><span style="width:${Math.min(time,p.at)/3*100}%" class="${p.state}"></span><i style="left:${p.at/3*100}%" aria-hidden="true"></i></div><span>${p.state}</span></div>`).join('')}</div><div class="visual-panels promise-results">${Object.entries(state.results).map(([api,result]) => `<section><h4>Promise.${api}</h4><p>${esc(result)}</p></section>`).join('')}</div>`;
  }
  function update(root, at) {
    const key = root.dataset.visual;
    const max = key === 'promises' ? 3 : traces[key].steps.length-1;
    at = Math.max(0,Math.min(at,max)); root.dataset.step = at;
    const failed = [...root.querySelectorAll('input:checked')].map(input => input.value);
    root.querySelector('.visual-stage').innerHTML = key === 'promises' ? promiseBody(at,failed) : traceBody(key,at);
    root.querySelector('.visual-position').textContent = key === 'promises' ? `Time: ${at} s` : `Step ${at+1} of ${max+1}`;
    root.querySelector('.visual-note').textContent = key === 'promises' ? `At ${at} seconds. ${Object.entries(outcomes(at,failed).results).map(([api,result])=>`${api}: ${result}`).join('. ')}. ${promiseNote}` : traces[key].steps[at].note;
    root.querySelector('[data-visual-action="back"]').disabled = at === 0;
    root.querySelector('[data-visual-action="next"]').disabled = at === max;
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-visual-action]');
      if (!button) return;
      const root = button.closest('[data-visual]');
      update(root,button.dataset.visualAction === 'reset' ? 0 : Number(root.dataset.step)+(button.dataset.visualAction === 'next' ? 1 : -1));
    });
    document.addEventListener('change', event => {
      const root = event.target.closest('[data-visual="promises"]');
      if (root) update(root,Number(root.dataset.step));
    });
  }
  return {render, locations, traces, outcomes};
})();
