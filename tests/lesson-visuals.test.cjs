const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('lesson-visuals.js','utf8'),context);
const visuals = vm.runInContext('LESSON_VISUALS',context);
for (let mask=0;mask<8;mask++) {
  test(`Promise diagram matches native APIs across every tick, rejection mask ${mask}`, async () => {
    const names = ['P1','P2','P3'];
    const failed = names.filter((_,i)=> mask & (1<<i));
    const controls = [];
    const promises = names.map(name=>new Promise((resolve,reject)=>controls.push(()=>failed.includes(name)?reject(name+' error'):resolve(name+' value'))));
    const actual = Object.fromEntries(['all','allSettled','race','any'].map(api=>[api,'Pending']));
    for (const api of Object.keys(actual)) Promise[api](promises).then(value=> {
      actual[api] = api==='all' ? `Fulfilled: [${value.join(', ')}]` : api==='allSettled' ? `Fulfilled: [${value.map((p,i)=>`${names[i]}: ${p.status}`).join(', ')}]` : `Fulfilled: ${value}`;
    },error=> {actual[api]= api==='any' ? `Rejected: AggregateError [${error.errors.join(', ')}]` : `Rejected: ${error}`;});
    for (let time=0;time<=3;time++) {
      if (time) controls[[1,2,0][time-1]]();
      await new Promise(setImmediate);
      assert.deepEqual(JSON.parse(JSON.stringify(visuals.outcomes(time,failed).results)),actual);
    }
  });
}
for (const key of ['scope','closure','await','event']) test(`${key} trace console matches executed example`,async()=>{
  const logs=[];const timers=[];
  vm.runInNewContext(visuals.traces[key].code,{console:{log:v=>logs.push(String(v))},setTimeout:cb=>timers.push(cb)});
  await new Promise(setImmediate);
  timers.forEach(cb=>cb());
  assert.deepEqual(logs,Array.from(visuals.traces[key].steps.at(-1).panels.Console));
});
test('var and let callback bindings match both diagram outputs',()=>{
  for(const keyword of ['var','let']) {
    const callbacks=[],logs=[];
    vm.runInNewContext(visuals.traces.loop.code.replace('var i',keyword+' i'),{console:{log:v=>logs.push(String(v))},setTimeout:cb=>callbacks.push(cb)});
    callbacks.forEach(cb=>cb());
    assert.deepEqual(logs,Array.from(visuals.traces.loop.steps.at(-1).panels[keyword+' · console']));
  }
});
test('inline page scripts compile and all visual links render',()=>{
  const html=fs.readFileSync('index.html','utf8');
  for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  for(const id of Object.keys(visuals.locations)) assert.match(visuals.render(id),new RegExp(`id="${id}-visual"`));
});
