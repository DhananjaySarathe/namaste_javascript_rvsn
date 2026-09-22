/* Interview-level definitions.
   For each idea: the sentence you would say out loud first, a plain-language
   expansion, one small example with its real output, and the follow-up
   questions that usually come next.
   Code here is plain text. The renderer escapes it; the page never runs it. */
const LESSON_DEFINITIONS = (() => {
  const esc = value => String(value).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /* term(name, {say, detail, analogy, code, output, env, probe}) */
  const term = (name, spec) => Object.assign({ name, env: 'any', probe: [] }, spec);

  const terms = {

    /* ---------------- Season 1 · Core ---------------- */

    ep1: [
      term('Execution context', {
        say: 'An execution context is the environment JavaScript builds to run a piece of code: it holds the variables that code can see, and it tracks the statement being executed.',
        detail: `<p>The engine creates one for the script itself, and a brand-new one for every function call — including two calls to the same function. Each context has two halves: a <b>memory</b> half (the <i>variable environment</i>) where names and values live, and a <b>code</b> half (the <i>thread of execution</i>) that runs statements one at a time.</p><p>Almost every other topic in this course — hoisting, scope, closures — is really a statement about how these contexts are built and linked.</p>`,
        analogy: 'A desk set up for one job. The drawer holds everything that job needs; your hands do the work in order. A second job gets its own desk, not a shared one.',
        code: `var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
console.log(square(n));`,
        output: '4',
        probe: [
          ['How many execution contexts does this program create?', 'Two: the global one, plus one function context for the square(n) call.'],
          ['Does writing a function create its execution context?', 'No. The context is created when the function is called, and destroyed when it returns.']
        ]
      }),
      term('Single-threaded and synchronous', {
        say: 'Single-threaded means JavaScript runs on one call stack, so one thing at a time. Synchronous means each statement finishes before the next one starts.',
        detail: `<p>They answer two different questions: <i>how many at once</i> (one) and <i>in what order</i> (one after another, each finishing first). Both describe the JavaScript thread, not the whole browser — the browser can be fetching a file or counting down a timer while your code runs.</p><p>This is exactly why a long loop freezes a page: nothing else can use the thread until it ends.</p>`,
        analogy: 'One cashier, one queue. The cashier serves a customer to completion before calling the next — but the kitchen behind them keeps cooking the whole time.',
        code: `console.log('first');
const total = 4 * 3;
console.log(total);
console.log('last');`,
        output: 'first\n12\nlast',
        probe: [
          ['If JavaScript is single-threaded, how does a page load data without freezing?', 'The browser performs the request outside the JavaScript thread and hands the result back later through the event loop.'],
          ['Is single-threaded the same as synchronous?', 'No. Single-threaded is about how many call stacks; synchronous is about ordering on that one stack.']
        ]
      })
    ],

    ep2: [
      term('Call stack', {
        say: 'The call stack is the stack of execution contexts the engine is currently inside. Calling a function pushes a frame on top; returning pops it off.',
        detail: `<p>The frame on top is what is running now. When it returns, it is removed and the caller resumes exactly where it left off. An empty stack means this run of synchronous work is over.</p><p>Every frame carries its own locals, which is why recursion works: ten nested calls mean ten frames with ten separate sets of variables. Too many frames without returning gives <code>RangeError: Maximum call stack size exceeded</code>.</p>`,
        analogy: 'A stack of plates. You only ever add or remove from the top, never the middle.',
        code: `function inner() { return 'done'; }
function outer() { return inner(); }
console.log(outer());`,
        output: 'done',
        probe: [
          ['What is a stack trace actually showing you?', 'The frames that were on the stack when the error was thrown, innermost first.'],
          ['Does an empty call stack mean the program has finished?', 'No. Timers, listeners and pending promises can still bring work back later.']
        ]
      }),
      term('The two phases of an execution context', {
        say: 'Every execution context runs in two phases: a memory-creation phase that sets up all the declarations first, then a code-execution phase that runs the statements.',
        detail: `<p>In phase one the engine scans the code and allocates every declaration: <code>var</code> names get <code>undefined</code>, function declarations get the complete function, and <code>let</code>/<code>const</code> names are created but deliberately left uninitialized.</p><p>In phase two the statements run and fill in real values. Nearly every “what does this print?” puzzle is explained by something being <i>read</i> in phase two that was only <i>prepared</i> in phase one.</p>`,
        code: `console.log(a);
console.log(typeof greet);
var a = 5;
function greet() {}
console.log(a);`,
        output: 'undefined\nfunction\n5',
        probe: [
          ['Why is a undefined rather than an error?', 'Phase one already created the var binding and set it to undefined.'],
          ['Do let and const get the same treatment?', 'They are created in phase one too, but left uninitialized — reading one before its line throws.']
        ]
      })
    ],

    ep3: [
      term('Hoisting', {
        say: 'Hoisting is the fact that declarations are set up before any code in that scope runs, so a name can be used on a line above its declaration. A var starts as undefined, a function declaration is already fully callable, and a let or const exists but cannot be touched until its line runs.',
        detail: `<p>Nothing physically moves in your file. The memory-creation phase simply registers the declarations first, which makes them <i>look</i> lifted to the top.</p><p>Keep the three behaviours apart: reading a <code>var</code> early gives <code>undefined</code>; calling a function declaration early works; reading a <code>let</code>/<code>const</code> early throws a <code>ReferenceError</code> from the temporal dead zone. A function <i>expression</i> assigned to <code>var</code> is <b>not</b> callable early — the variable holds <code>undefined</code>, so calling it is a <code>TypeError</code>.</p>`,
        analogy: 'The venue prints the guest list before the doors open. var guests are on the list with no badge yet, function guests walk straight in, let guests are listed but held at the door until their name is called.',
        code: `greet();
console.log(x);
var x = 7;
function greet() { console.log('hello'); }`,
        output: 'hello\nundefined',
        probe: [
          ['Is hoisting the engine moving your code to the top?', 'No. Declarations are registered during the memory phase; the source is untouched.'],
          ['Why is calling a var-assigned arrow early a TypeError, not a ReferenceError?', 'The binding exists and holds undefined, and undefined is simply not callable.'],
          ['Are let and const hoisted?', 'Yes, they are created — but uninitialized, which is precisely what makes the temporal dead zone throw.']
        ]
      })
    ],

    ep4: [
      term('Variable environment', {
        say: 'The variable environment is the memory half of an execution context — the set of bindings belonging to that one call.',
        detail: `<p>Every call gets its own. Two variables with the same name in two different functions are two different bindings; assigning to one cannot touch the other, and calling the same function twice never reuses the first call’s locals.</p>`,
        code: `var x = 1;
function a() { var x = 10; console.log(x); }
function b() { var x = 100; console.log(x); }
a();
b();
console.log(x);`,
        output: '10\n100\n1',
        probe: [
          ['Does a local declaration copy the outer value?', 'No. It creates a separate binding that starts as undefined until it is assigned.'],
          ['What if the function has no local x?', 'The lookup continues outward along the scope chain to wherever x is declared.']
        ]
      })
    ],

    ep5: [
      term('Global execution context and the global object', {
        say: 'Before any of your code runs, the engine creates a global execution context. In a browser the host also supplies a global object, window, and at the top level of a classic script this is that same window.',
        detail: `<p>An empty file still gets all of it. In a classic browser script, top-level <code>var</code> and function declarations become properties on <code>window</code>; top-level <code>let</code> and <code>const</code> do not, and anything declared inside a function never does.</p><p>In an ES module, top-level <code>this</code> is <code>undefined</code> and nothing you declare lands on <code>window</code>. Node.js has no <code>window</code> at all. <code>globalThis</code> is the portable way to reach the global object anywhere.</p>`,
        code: `var lessonValue = 10;
let otherValue = 20;
function sample() { var insideOnly = 30; }
console.log(this === window);
console.log(window.lessonValue);
console.log(window.otherValue);
console.log(window.insideOnly);`,
        output: 'true\n10\nundefined\nundefined',
        env: 'browser',
        probe: [
          ['Is this === window always true?', 'No. Only at the top level of a classic browser script. Inside a function, in a module, or in Node it differs.'],
          ['Why is window.otherValue undefined?', 'Top-level let and const create bindings in the global scope without creating global-object properties.']
        ]
      })
    ],

    ep6: [
      term('undefined', {
        say: 'undefined is a real value. It is what JavaScript puts in a binding that has been created but not given a value yet.',
        detail: `<p>You also get it from a function that returns nothing, from a missing object property, and from a parameter you did not pass. It is a value you can store, compare and log.</p><p>Read it as “the engine filled this in”, and keep <code>null</code> for “I deliberately set this to empty”.</p>`,
        code: `var a;
console.log(a);
console.log(a === undefined);
function noReturn() {}
console.log(noReturn());
console.log({}.missing);`,
        output: 'undefined\ntrue\nundefined\nundefined',
        probe: [
          ['undefined versus null?', 'undefined is the engine’s default for an unassigned binding; null is an empty value you assign on purpose.'],
          ['Should you assign undefined by hand?', 'Prefer not to. It destroys the signal that the value was never set.']
        ]
      }),
      term('“Not defined” (ReferenceError)', {
        say: 'Not defined is not a value — it is an error. It means the name could not be found anywhere along the scope chain.',
        detail: `<p><code>undefined</code> means <i>the binding exists, nothing is in it yet</i>. <code>ReferenceError: x is not defined</code> means <i>there is no such binding</i>. An uncaught one stops the rest of that synchronous run.</p><p><code>typeof</code> is the one exception: <code>typeof missingName</code> returns the string <code>"undefined"</code> instead of throwing.</p>`,
        code: `var declared;
console.log(declared);            // the binding exists, with no value yet
console.log(typeof missingName);  // typeof never throws on a missing name
// console.log(missingName);      // ReferenceError: missingName is not defined`,
        output: 'undefined\nundefined',
        probe: [
          ['Is “not defined” a JavaScript value?', 'No. It is wording inside a ReferenceError message.'],
          ['Why does typeof on a missing name not throw?', 'typeof on an unresolvable identifier is specified to return the string "undefined".']
        ]
      })
    ],

    ep7: [
      term('Scope', {
        say: 'Scope is the region of code in which a name can be resolved.',
        detail: `<p>JavaScript uses <b>lexical</b> scope: where a function is <i>written</i> decides what it can see, not where it is <i>called</i> from. Functions create a scope, and blocks create one for <code>let</code> and <code>const</code>.</p>`,
        code: `const value = 'global';
function read() { console.log(value); }
function caller() {
  const value = 'caller';
  read();
}
caller();`,
        output: 'global',
        probe: [
          ['Why does read() not see the caller’s value?', 'Lookup follows where read was written, not who called it. That is what lexical means.']
        ]
      }),
      term('Lexical environment', {
        say: 'A lexical environment is a scope’s own bindings plus a reference to its parent environment — the environment of the place it was written in.',
        detail: `<p>Every execution context gets one. The “plus a reference to the parent” half is the whole trick: it is what links scopes into a chain, and it is what makes closures possible.</p><p>The chain ends at the global environment, whose parent is <code>null</code>.</p>`,
        code: `function outer() {
  const a = 10;
  function inner() {
    const b = 20;
    console.log(a + b);
  }
  inner();
}
outer();`,
        output: '30',
        probe: [
          ['What is the parent of the global lexical environment?', 'null. That is where the chain ends, and why an unresolved name throws.']
        ]
      }),
      term('Scope chain', {
        say: 'The scope chain is the path the engine walks to resolve a name: the current environment first, then its lexical parent, and so on up to global. The first match wins.',
        detail: `<p>If the chain runs out, you get <code>ReferenceError: ... is not defined</code>.</p><p>Do not confuse it with the call stack. The call stack records <i>who called whom</i> at runtime; the scope chain records <i>what is written inside what</i> in the source. The same function can have many different stacks and always the same chain.</p>`,
        code: `const level = 'global';
function outer() {
  function inner() { console.log(level); }
  inner();
}
outer();`,
        output: 'global',
        probe: [
          ['Call stack versus scope chain?', 'Call stack is runtime call order; scope chain is source nesting.'],
          ['Can an outer function see an inner function’s variables?', 'No. Lookup only travels outward, never inward.']
        ]
      })
    ],

    ep8: [
      term('Temporal Dead Zone (TDZ)', {
        say: 'The temporal dead zone is the stretch between a let or const binding being created at the top of its block and the line that actually initializes it. Touching the name inside that window throws a ReferenceError.',
        detail: `<p>The binding exists the whole time — which is why the message is “Cannot access ‘y’ before initialization”, not “y is not defined”. <code>var</code> has no TDZ because it is initialized to <code>undefined</code> immediately.</p><p>The zone ends at the declaration line, not at the end of the block. <code>typeof</code> does not protect you here: it throws too.</p>`,
        analogy: 'The seat is reserved in your name from the moment the show starts, but you are not allowed to sit in it until your name is called.',
        code: `console.log(x);      // var has no TDZ
// console.log(y);   // ReferenceError: Cannot access 'y' before initialization
var x = 1;
let y = 2;
console.log(x, y);`,
        output: 'undefined\n1 2',
        probe: [
          ['Are let and const hoisted?', 'Yes — created in the memory phase but left uninitialized, which is exactly what the TDZ is.'],
          ['Does typeof make a TDZ access safe?', 'No. typeof on a binding still in its TDZ throws.']
        ]
      }),
      term('var vs let vs const', {
        say: 'var is function-scoped, hoisted as undefined, and can be redeclared. let and const are block-scoped with a temporal dead zone; let can be reassigned, const cannot.',
        detail: `<p>Default to <code>const</code>, use <code>let</code> when the value genuinely changes, and avoid <code>var</code> in new code.</p><p><code>const</code> freezes the <b>binding</b>, not the value. A <code>const</code> object can still have its properties changed; use <code>Object.freeze</code> if you want shallow immutability.</p>`,
        code: `const list = [1];
list.push(2);
console.log(list);
// list = [];  // TypeError: Assignment to constant variable
let counter = 0;
counter += 1;
console.log(counter);`,
        output: '[1, 2]\n1',
        probe: [
          ['Can you redeclare a let in the same scope?', 'No — SyntaxError. var allows it silently.'],
          ['Is a const object immutable?', 'No. Only the binding is fixed.']
        ]
      })
    ],

    ep9: [
      term('Block scope', {
        say: 'A block — anything inside a pair of braces — is its own scope for let and const. var ignores blocks entirely and belongs to the nearest enclosing function.',
        detail: `<p>That difference is behind most <code>var</code> surprises: a <code>var</code> declared inside an <code>if</code> or a <code>for</code> is visible across the whole function.</p>`,
        code: `{
  var functionScoped = 'var';
  let blockScoped = 'let';
  console.log(functionScoped, blockScoped);
}
console.log(functionScoped);
// console.log(blockScoped); // ReferenceError: blockScoped is not defined`,
        output: 'var let\nvar',
        probe: [
          ['Why does a for (var i…) loop with setTimeout print the same number every time?', 'var gives one shared binding for the whole loop; let gives a fresh binding per iteration.']
        ]
      }),
      term('Shadowing', {
        say: 'Shadowing is declaring a name in an inner scope that already exists in an outer scope. Inside that inner scope the outer one is hidden, not overwritten — it comes back as soon as you leave.',
        detail: `<p><b>Illegal shadowing</b> is the case worth remembering: you cannot shadow a <code>let</code> with a <code>var</code> in an inner block, because that <code>var</code> would escape the block and collide with the <code>let</code>. The other direction — shadowing a <code>var</code> with a <code>let</code> — is fine.</p>`,
        code: `let a = 'outer';
{
  let a = 'inner';
  console.log(a);
}
console.log(a);
// { var a = 'illegal'; }  // SyntaxError: Identifier 'a' has already been declared`,
        output: 'inner\nouter',
        probe: [
          ['Why is let outside plus var inside a block a SyntaxError?', 'var is function-scoped, so it would cross the block boundary and land in the same scope as the let.']
        ]
      })
    ],

    /* ---------------- Season 1 · Closures ---------------- */

    ep10: [
      term('Closure', {
        say: 'A closure is a function together with the lexical environment it was created in. The function keeps access to those outer variables even after the outer function has finished and left the call stack.',
        detail: `<p>Technically every function in JavaScript is a closure. It only becomes interesting when the inner function <b>outlives</b> the outer call: because the inner function still references that environment, the environment stays reachable and is not collected.</p><p>A closure captures the <b>binding</b>, not a snapshot of the value — if the variable changes later, the closure sees the new value. And every call of the outer function creates a fresh environment, so two counters built from one factory never share state.</p><p>Where it shows up in real code: private state (module and factory patterns), <code>once</code> and memoize wrappers, partial application and currying, and callbacks that need to remember something.</p>`,
        analogy: 'A function packs a backpack the moment it is created. Wherever it is carried afterwards, it still has everything it packed.',
        code: `function counter() {
  let count = 0;
  return function increment() { return ++count; };
}
const first = counter();
const second = counter();
console.log(first(), first(), second());`,
        output: '1 2 1',
        probe: [
          ['Why do first and second not share a count?', 'Each counter() call creates its own lexical environment.'],
          ['Does a closure copy the variable?', 'No. It holds a reference to the binding, so later changes are visible to it.'],
          ['Are closures memory leaks?', 'No. They retain state on purpose. A leak is unwanted retention — a listener you never remove, a cache that only grows.']
        ]
      })
    ],

    ep11: [
      term('Closures in loops (per-iteration binding)', {
        say: 'With var, every callback in the loop closes over one shared binding, so they all read its final value. With let, each iteration gets its own binding, so each callback reads its own value.',
        detail: `<p>The loop always finishes before any <code>setTimeout</code> callback runs, even with a delay of <code>0</code> — callbacks only run once the synchronous work is done. The only question is <i>which binding</i> each callback reads.</p><p>If you are stuck with <code>var</code>, wrap the body in a function call so each iteration gets a fresh parameter binding.</p>`,
        code: `for (var i = 1; i <= 3; i++) setTimeout(() => console.log(i), 0);
for (let j = 1; j <= 3; j++) setTimeout(() => console.log(j), 0);`,
        output: '4\n4\n4\n1\n2\n3',
        probe: [
          ['Why 4 and not 3?', 'The loop only exits after the increment that makes the condition false, so the shared i ends at 4.'],
          ['Fix the var version without changing var to let.', 'Wrap the body: (function (n) { setTimeout(() => console.log(n), 0); })(i); — the parameter is a fresh binding per call.']
        ]
      })
    ],

    ep12: [
      term('Data privacy with closures', {
        say: 'Closures are how JavaScript gets private state: put the variable inside a factory function and return only the operations allowed to touch it.',
        detail: `<p>Nothing outside the factory has a name for that variable, so it can only change through the functions you expose. Two calls of the factory produce two entirely independent states.</p><p>This is the module pattern, and it is why closures appear in almost every real codebase.</p>`,
        code: `function makeAccount(balance) {
  return {
    deposit(amount) { balance += amount; return balance; },
    read() { return balance; }
  };
}
const account = makeAccount(100);
account.deposit(50);
account.balance = 9999;
console.log(account.read());`,
        output: '150',
        probe: [
          ['Why did account.balance = 9999 not change the balance?', 'That created an ordinary public property. The closed-over variable is a different binding with no public name.'],
          ['How does this compare with # private class fields?', 'Both hide state. Closures do it per instance through scope; # fields are a language-level feature on classes.']
        ]
      }),
      term('Closure memory leak', {
        say: 'A closure keeps its captured environment alive for as long as the closure itself is reachable. It becomes a leak only when that reachable closure is something you no longer need.',
        detail: `<p>The usual culprits are an event listener you never remove, an interval you never clear, and a cache that only grows. The fix is lifetime management — <code>removeEventListener</code>, <code>clearInterval</code>, dropping the reference — not avoiding closures.</p><p>You cannot force collection. You control reachability; the engine decides timing.</p>`,
        code: `function attach(button) {
  let clicks = 0;
  const onClick = () => { clicks += 1; };
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
const detach = attach(document.getElementById('demo'));
detach(); // the listener, the closure and clicks can now be collected`,
        output: '',
        env: 'browser',
        probe: [
          ['Is retaining state a leak?', 'No. It is a leak only when the retained state is no longer needed and nothing releases it.'],
          ['Can you force garbage collection?', 'No. You only control whether something is still reachable.']
        ]
      })
    ],

    /* ---------------- Season 1 · Functions ---------------- */

    ep13: [
      term('First-class functions', {
        say: 'First-class functions means functions are values: you can store one in a variable, pass it as an argument, return it from another function, and put it in an array or object.',
        detail: `<p>This single property is what makes callbacks, higher-order functions, closures and the whole functional style possible.</p>`,
        code: `const shout = text => text.toUpperCase();
const actions = { shout };
function run(fn, value) { return fn(value); }
console.log(run(actions.shout, 'hello'));`,
        output: 'HELLO',
        probe: [
          ['Is “first-class” the same as “higher-order”?', 'No. First-class describes functions being values; higher-order describes a function that takes or returns one.']
        ]
      }),
      term('Function statement vs function expression', {
        say: 'A function statement — a declaration — starts the line with the function keyword and is hoisted complete, so you can call it above its own line. A function expression assigns a function to a variable and only exists once that assignment runs.',
        detail: `<p>An <b>anonymous function</b> has no name of its own and can only appear where a value is expected. A <b>named function expression</b> gives it a name usable only inside its own body, which helps with self-reference and stack traces.</p>`,
        code: `declared();
// expressed(); // TypeError: expressed is not a function
function declared() { console.log('declaration'); }
var expressed = function () { console.log('expression'); };
expressed();`,
        output: 'declaration\nexpression',
        probe: [
          ['Why is calling expressed early a TypeError and not a ReferenceError?', 'var already created the binding holding undefined, and undefined is not callable.'],
          ['What is a named function expression good for?', 'Referring to itself inside its own body, and clearer stack traces.']
        ]
      })
    ],

    ep14: [
      term('Callback function', {
        say: 'A callback is a function you hand to other code so that code can call it back later — when it finishes, on every item, or whenever an event happens.',
        detail: `<p>Callbacks are how JavaScript expresses “later” without blocking the thread. Pass the function, do not call it: <code>setTimeout(greet, 0)</code>, never <code>setTimeout(greet(), 0)</code>.</p><p>Not every callback is asynchronous — <code>map</code> calls yours immediately. Their two classic problems are deep nesting (callback hell) and handing over control of when and how often your function runs (inversion of control). Promises address both.</p>`,
        code: `function fetchThen(done) {
  setTimeout(() => done('data'), 0);
}
fetchThen(result => console.log('got', result));
console.log('sync first');`,
        output: 'sync first\ngot data',
        probe: [
          ['Are all callbacks asynchronous?', 'No. Array.map runs its callback synchronously; setTimeout runs yours later.']
        ]
      }),
      term('Event listener', {
        say: 'addEventListener registers a function with the browser for a given event on a given element. The browser calls it each time that event is dispatched.',
        detail: `<p>Registering is not calling. The handler stays registered until you remove it, and handlers usually close over local state, which is why cleanup matters.</p><p>To remove one you need the <b>same function reference</b> you added — an inline arrow literal can never be removed later, because each literal creates a new function.</p>`,
        code: `const button = document.getElementById('demo');
function attachCounter() {
  let count = 0;
  const onClick = () => console.log('clicked', ++count);
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
const cleanup = attachCounter();`,
        output: '',
        env: 'browser',
        probe: [
          ['Why can you not remove element.addEventListener("click", () => {})?', 'removeEventListener needs the identical reference, and each arrow literal is a different function object.']
        ]
      })
    ],

    /* ---------------- Season 1 · Async ---------------- */

    ep15: [
      term('Event loop', {
        say: 'The event loop is the scheduler that lets a single-threaded language do asynchronous work: whenever the call stack is empty, it picks up the next finished piece of work and runs its callback.',
        detail: `<p>The order it enforces: finish the current synchronous code → drain the <b>entire</b> microtask queue → run <b>one</b> task from the task queue → drain microtasks again → repeat, with rendering in between in a browser.</p><p>Nothing ever interrupts running code halfway. That run-to-completion rule is why a zero-delay timer still prints after your last synchronous log.</p>`,
        analogy: 'A host who never interrupts a speaker. Only when the floor is free do they call the next person — and they always clear the priority list before the general queue.',
        code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
        output: 'A\nD\nC\nB',
        probe: [
          ['Why does C come before B?', 'Promise reactions are microtasks and drain before the next task; the timer callback is a task.'],
          ['Can a microtask interrupt a running function?', 'No. It waits for the next microtask checkpoint.']
        ]
      }),
      term('Web APIs (host APIs)', {
        say: 'Web APIs are capabilities the browser provides, not the language: timers, the DOM and events, fetch, storage, geolocation. Your code registers work with them and receives a callback later.',
        detail: `<p>They are reached through the global object, which is why <code>setTimeout</code> and <code>fetch</code> are available without importing anything. Node.js provides a different set — same engine, different host.</p>`,
        code: `console.log(typeof setTimeout);  // supplied by the host
console.log(typeof Promise);     // part of the language itself`,
        output: 'function\nfunction',
        probe: [
          ['Is setTimeout part of JavaScript?', 'No. The ECMAScript specification does not define it; the host environment supplies it.']
        ]
      }),
      term('Task queue vs microtask queue', {
        say: 'The task queue — also called the callback queue — holds things like timer callbacks and event handlers. The microtask queue holds promise reactions, queueMicrotask callbacks and mutation observers, and it has higher priority.',
        detail: `<p>After each task, the event loop drains the microtask queue completely, including microtasks queued by other microtasks, before it takes the next task.</p><p>That priority is also a hazard: a microtask that keeps queuing another microtask can starve timers and rendering indefinitely.</p>`,
        code: `setTimeout(() => console.log('task'), 0);
queueMicrotask(() => {
  console.log('microtask 1');
  queueMicrotask(() => console.log('microtask 2'));
});
console.log('sync');`,
        output: 'sync\nmicrotask 1\nmicrotask 2\ntask',
        probe: [
          ['Does a promise always beat a timer?', 'Not automatically. A still-pending promise has no reaction to queue — ordering depends on when it settles.'],
          ['What is starvation?', 'Microtasks that keep refilling their own queue, so the loop never returns to tasks or rendering.']
        ]
      })
    ],

    ep16: [
      term('Engine vs runtime', {
        say: 'The engine — V8, SpiderMonkey, JavaScriptCore — implements the language. The runtime is the engine plus everything the host adds: a browser adds the DOM and fetch, Node adds the file system and its module system.',
        detail: `<p>Chrome and Node both embed V8 and are still very different runtimes. That is the cleanest way to answer “is JavaScript the same everywhere?”: the language is, the surroundings are not.</p>`,
        code: `console.log([1, 2, 3].map(n => n * 2));  // the language: from the engine
console.log(typeof setTimeout);          // the host: from the runtime around it`,
        output: '[2, 4, 6]\nfunction',
        probe: [
          ['Can two runtimes share an engine?', 'Yes. Node and Chrome both use V8 but expose different host APIs.']
        ]
      }),
      term('JIT compilation', {
        say: 'Modern engines parse your source into a syntax tree, run it through a fast bytecode interpreter, and then just-in-time compile the code that runs often into optimized machine code.',
        detail: `<p>In V8 the interpreter is <b>Ignition</b>, and the optimizing tiers include <b>Sparkplug</b>, <b>Maglev</b> and <b>TurboFan</b>. Optimizations rest on the types the engine has actually observed; when an assumption breaks, the engine <i>deoptimizes</i> and keeps running correctly, just slower.</p><p>The safe interview answer: JavaScript is neither purely interpreted nor purely compiled — engines combine both, and the specification mandates neither.</p>`,
        code: `function add(a, b) { return a + b; }
let total = 0;
for (let i = 0; i < 1e5; i++) total = add(total, 1);
console.log(total);`,
        output: '100000',
        probe: [
          ['What is deoptimization?', 'When a runtime assumption behind the optimized code stops holding, the engine drops to a slower tier and continues correctly.']
        ]
      }),
      term('Garbage collection (mark-and-sweep)', {
        say: 'The engine automatically frees memory that is no longer reachable. It starts from roots such as the global object and the call stack, marks everything reachable from them, and sweeps away the rest.',
        detail: `<p>The rule is <b>reachability</b>, not “unused”. An object you never touch again but still reference is not collected. V8 does this generationally and largely concurrently.</p><p>You cannot force or schedule collection. You influence it only by dropping references.</p>`,
        code: `let data = { big: 'payload' };
let alias = data;
data = null;      // still reachable through alias
alias = null;     // now unreachable and eligible for collection
console.log(data, alias);`,
        output: 'null null',
        probe: [
          ['Does setting a variable to null free memory immediately?', 'No. It makes the object eligible; the collector decides when.'],
          ['Why can closures look like leaks?', 'They keep their environment reachable by design — a problem only when the closure itself outlives its usefulness.']
        ]
      })
    ],

    ep17: [
      term('setTimeout’s delay is a minimum, not a promise', {
        say: 'setTimeout(fn, 5000) means “do not run this before 5000 ms”, not “run this at 5000 ms”. The callback only runs once the call stack is empty and the event loop reaches it.',
        detail: `<p>If synchronous code is still running when the timer becomes ready, the callback waits. A ten-second blocking loop pushes a five-second timer out to at least ten seconds.</p><p><code>setTimeout(fn, 0)</code> is the same rule with the smallest delay: still deferred until after the current synchronous run. Browsers additionally clamp deeply nested timers to roughly 4 ms and throttle background tabs.</p>`,
        analogy: 'An alarm reminding you to speak. The alarm goes off on time; you still cannot speak until whoever has the floor stops talking.',
        code: `const start = Date.now();
console.log('Start');
setTimeout(() => console.log('timer waited at least 50 ms:', Date.now() - start >= 50), 50);
console.log('End');
while (Date.now() - start < 100) { /* deliberately blocking */ }
console.log('Loop finished');`,
        output: 'Start\nEnd\nLoop finished\ntimer waited at least 50 ms: true',
        probe: [
          ['Does a delay of 0 mean run now?', 'No. It still waits for the current synchronous run to finish.'],
          ['How do you avoid blocking the thread with heavy work?', 'Split it into chunks that yield between them, or move it to a Web Worker.']
        ]
      })
    ],

    /* ---------------- Season 1 · Functional ---------------- */

    ep18: [
      term('Higher-order function', {
        say: 'A higher-order function is one that takes a function as an argument, returns a function, or both.',
        detail: `<p><code>map</code>, <code>filter</code>, <code>setTimeout</code> and <code>addEventListener</code> all take functions. A factory that returns a pre-configured function is the other half of the definition.</p><p>The point is separating what repeats (the traversal) from what varies (the logic), so each piece stays small and testable.</p>`,
        code: `const multiplyBy = factor => value => value * factor;
const double = multiplyBy(2);
console.log([1, 2, 3].map(double));`,
        output: '[2, 4, 6]',
        probe: [
          ['Is a callback the same as a higher-order function?', 'No. The callback is the function passed in; the higher-order function is the one receiving or returning it.'],
          ['What is currying?', 'Turning a multi-argument function into a chain of single-argument functions that each return a function — a direct use of closures.']
        ]
      })
    ],

    ep19: [
      term('map', {
        say: 'map returns a new array of the same length, where each element has been replaced by whatever your callback returned.',
        detail: `<p>It never mutates the original. The classic bug is a braced arrow body with no <code>return</code> — you get an array of <code>undefined</code>.</p>`,
        code: `const nums = [5, 1, 3];
console.log(nums.map(n => n * 2));
console.log(nums.map(n => { n * 2; }));
console.log(nums);`,
        output: '[10, 2, 6]\n[undefined, undefined, undefined]\n[5, 1, 3]',
        probe: [
          ['map versus forEach?', 'map builds and returns a new array; forEach returns undefined and exists for side effects.']
        ]
      }),
      term('filter', {
        say: 'filter returns a new array containing the original elements for which your callback returned a truthy value.',
        detail: `<p>The callback is a <i>predicate</i>: its return value decides keep-or-drop, it is not what lands in the result. Order is preserved and the result can be shorter or empty.</p>`,
        code: `const nums = [5, 1, 3, 2, 6];
console.log(nums.filter(n => n % 2));
console.log(nums.filter(n => n > 4));`,
        output: '[5, 1, 3]\n[5, 6]',
        probe: [
          ['Why does n % 2 work as a predicate?', 'It gives 1 (truthy) for odd and 0 (falsy) for even, and filter only checks truthiness.']
        ]
      }),
      term('reduce', {
        say: 'reduce folds an array down to a single result. It carries an accumulator across the elements, and whatever your callback returns becomes the next accumulator.',
        detail: `<p>The shape is <code>arr.reduce((acc, current) => nextAcc, initialValue)</code>. The “single” result can be a number, a string, an object or another array — a frequency table is still one value.</p><p>Always pass an initial value. Without one, reduce uses the first element as the seed, and an empty array throws a <code>TypeError</code>.</p>`,
        code: `const nums = [5, 1, 3, 2, 6];
console.log(nums.reduce((sum, n) => sum + n, 0));
console.log(nums.reduce((max, n) => Math.max(max, n), -Infinity));
console.log([].reduce((sum, n) => sum + n, 0));`,
        output: '17\n6\n0',
        probe: [
          ['Why is 0 a bad seed for a maximum?', 'For an all-negative array it returns 0, a value that is not in the array. Use -Infinity, or the first element.'],
          ['Can reduce replace map and filter?', 'Yes, but reach for it only when it reads more clearly. A filter().map() chain is usually plainer.']
        ]
      })
    ],

    /* ---------------- Season 2 · Promises ---------------- */

    s2ep1: [
      term('Callback hell (pyramid of doom)', {
        say: 'Callback hell is what you get when each asynchronous step is nested inside the previous one’s callback: the code grows sideways, and error handling has to be repeated at every level.',
        detail: `<p>It is a readability problem rather than a correctness one. Promises flatten the nesting into a chain with one place to handle errors, and <code>async</code>/<code>await</code> makes the same logic read top to bottom.</p>`,
        code: `const step = (name, done) => setTimeout(() => done(name), 0);
step('order', order => {
  step('payment', payment => {
    step('summary', summary => {
      console.log(order, payment, summary);
    });
  });
});`,
        output: 'order payment summary',
        probe: [
          ['Is nesting the only problem with callbacks?', 'No. Inversion of control is the deeper one.']
        ]
      }),
      term('Inversion of control', {
        say: 'Inversion of control is handing your callback to someone else’s code and trusting it to call your function once, at the right time, with the right arguments — and to call it at all.',
        detail: `<p>You have given up the guarantee. A buggy API could call it twice, never call it, call it too early, or swallow the error it threw.</p><p>A promise hands control back: it settles exactly once and is immutable afterwards, and your handlers are invoked by the promise machinery rather than by the third party.</p>`,
        code: `function unreliable(callback) {
  callback('done');
  callback('done again'); // nothing stops this
}
unreliable(result => console.log(result));

Promise.resolve('done').then(result => console.log('promise:', result));`,
        output: 'done\ndone again\npromise: done',
        probe: [
          ['How exactly does a promise fix inversion of control?', 'It can settle only once and its outcome is immutable, so your handler cannot be invoked twice with different results.']
        ]
      })
    ],

    s2ep2: [
      term('Promise', {
        say: 'A promise is an object representing a value that is not available yet. You attach handlers to it now, and it calls them once the underlying operation succeeds or fails.',
        detail: `<p>It gives three guarantees a raw callback API does not: it settles <b>once</b>, its settled value is <b>immutable</b>, and handlers attached <i>after</i> it settled still run. That is what makes a promise safe to pass around and hand to several consumers.</p>`,
        code: `const p = Promise.resolve('order-1');
p.then(id => console.log('first handler', id));
p.then(id => console.log('second handler', id));
console.log('sync runs first');`,
        output: 'sync runs first\nfirst handler order-1\nsecond handler order-1',
        probe: [
          ['Can a promise go from fulfilled to rejected later?', 'No. It settles once and stays that way.'],
          ['Does attaching .then after it has already settled still work?', 'Yes. The handler is queued as a microtask.']
        ]
      }),
      term('Promise states', {
        say: 'A promise is in exactly one of three states: pending, fulfilled with a value, or rejected with a reason. Fulfilled and rejected together are called settled.',
        detail: `<p>“Resolved” is not a fourth state. Resolving a promise <i>with another promise</i> means it adopts that promise’s eventual outcome — so a resolved promise can still be pending.</p>`,
        code: `const pending = new Promise(() => {});
const fulfilled = Promise.resolve(1);
const rejected = Promise.reject(new Error('nope'));
rejected.catch(error => console.log('handled:', error.message));
console.log(typeof pending.then, typeof fulfilled.then);`,
        output: 'function function\nhandled: nope',
        probe: [
          ['Settled versus resolved?', 'Settled means fulfilled or rejected. Resolved means the outcome has been locked to something, which may itself still be pending.']
        ]
      }),
      term('Promise chaining', {
        say: '.then always returns a new promise, which is why you can chain. Whatever a handler returns becomes the next .then’s input — and if it returns a promise, the chain waits for that promise.',
        detail: `<p>The most common chaining bug is forgetting to <code>return</code> inside a <code>.then</code>: the chain does not wait, and the next step receives <code>undefined</code>.</p>`,
        code: `Promise.resolve(2)
  .then(n => n * 3)
  .then(n => Promise.resolve(n + 1))
  .then(n => console.log('result', n));`,
        output: 'result 7',
        probe: [
          ['What does .then return?', 'A new promise — that is what makes chaining work.'],
          ['What happens if a .then handler throws?', 'Its returned promise rejects, and control skips ahead to the next .catch.']
        ]
      })
    ],

    s2ep3: [
      term('Promise constructor and the executor', {
        say: 'new Promise((resolve, reject) => {…}) wraps an API that is not promise-based. The executor function runs immediately and synchronously; you call resolve or reject when the work finishes.',
        detail: `<p>Only the first <code>resolve</code> or <code>reject</code> counts; later calls are ignored. Throwing inside the executor rejects the promise.</p><p>You only need the constructor to wrap callback-based APIs. Wrapping something that already returns a promise is the well-known “promise constructor antipattern”.</p>`,
        code: `const wait = ms => new Promise(resolve => {
  console.log('executor runs now');
  setTimeout(() => resolve('waited ' + ms), ms);
});
wait(0).then(message => console.log(message));
console.log('after the call');`,
        output: 'executor runs now\nafter the call\nwaited 0',
        probe: [
          ['Is the executor asynchronous?', 'No. It runs synchronously during the constructor call.'],
          ['What if you call resolve twice?', 'The second call is ignored. The promise is already settled.']
        ]
      }),
      term('Error handling in a chain (.catch and .finally)', {
        say: 'A rejection skips every .then until it finds a .catch. Where you put that .catch decides what it protects and whether the chain can carry on.',
        detail: `<p>A <code>.catch</code> at the end covers the whole chain. A <code>.catch</code> in the middle handles that step and lets the chain continue with a recovery value. <code>.finally</code> runs either way and passes the outcome through untouched.</p><p>A <code>.catch</code> that returns normally produces a <b>fulfilled</b> promise — to keep the failure propagating, rethrow inside it.</p>`,
        code: `Promise.reject(new Error('payment failed'))
  .then(() => console.log('skipped'))
  .catch(error => { console.log('recovered from:', error.message); return 'cash'; })
  .then(method => console.log('paid with', method))
  .finally(() => console.log('chain finished'));`,
        output: 'recovered from: payment failed\npaid with cash\nchain finished',
        probe: [
          ['Does a .catch placed before a .then protect that later .then?', 'No. A catch only sees rejections from the steps above it.'],
          ['How do you stop a catch from silently swallowing a failure?', 'Rethrow inside it, so the returned promise rejects again.']
        ]
      })
    ],

    s2ep4: [
      term('async function', {
        say: 'Marking a function async makes it always return a promise. A returned value becomes the fulfillment value; a thrown error becomes a rejection.',
        detail: `<p>If you return a promise from an async function, the outer promise adopts its outcome instead of wrapping it twice.</p><p><code>async</code> on its own changes nothing about execution — it only changes the return value and permits <code>await</code> inside.</p>`,
        code: `async function getData() { return 'value'; }
async function fails() { throw new Error('boom'); }
console.log(getData() instanceof Promise);
getData().then(v => console.log('fulfilled with', v));
fails().catch(e => console.log('rejected with', e.message));`,
        output: 'true\nfulfilled with value\nrejected with boom',
        probe: [
          ['Must an async function contain await?', 'No. async only changes the return value into a promise.']
        ]
      }),
      term('await', {
        say: 'await pauses the async function until the promise it is given settles, then hands you the value — or throws the rejection reason. It never blocks the thread; the rest of the program keeps running.',
        detail: `<p>The function’s frame is suspended and taken off the call stack, then resumed as a microtask once the promise settles. That is why the code after an <code>await</code> behaves like a <code>.then</code> callback even though it reads like an ordinary next line.</p><p>Two awaits in a row run sequentially. To run independent work concurrently, start both promises first and await them afterwards — or use <code>Promise.all</code>.</p>`,
        code: `const wait = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
async function run() {
  const both = [wait(20, 'slow'), wait(10, 'fast')];   // both start now
  console.log(await both[0], await both[1]);
}
run();
console.log('not blocked');`,
        output: 'not blocked\nslow fast',
        probe: [
          ['Does await block the main thread?', 'No. It suspends only that async function; everything else keeps running.'],
          ['Why is awaiting inside a loop often slow?', 'Each iteration waits for the previous one. If the work is independent, collect the promises and Promise.all them.'],
          ['How do you handle errors around await?', 'try/catch around the await, or .catch on the promise the async function returns.']
        ]
      })
    ],

    s2ep5: [
      term('Promise.all', {
        say: 'Promise.all waits for every promise to fulfill and gives you an array of their values in input order. If any one rejects, it rejects immediately with that reason.',
        detail: `<p>All-or-nothing. Rejecting early does not cancel the others — they keep running, their results are simply discarded. Use it when you need every piece before you can continue.</p>`,
        code: `const ok = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
Promise.all([ok(20, 'A'), ok(10, 'B'), ok(0, 'C')])
  .then(values => console.log(values));`,
        output: '["A", "B", "C"]',
        probe: [
          ['Does an early rejection cancel the other promises?', 'No. Promises cannot be cancelled; the remaining work still runs.'],
          ['What order are the results in?', 'Input order, regardless of which finished first.']
        ]
      }),
      term('Promise.allSettled', {
        say: 'Promise.allSettled waits for every promise to settle and never rejects. You get one entry per input: {status: "fulfilled", value} or {status: "rejected", reason}.',
        detail: `<p>Use it when you want the full report rather than an early exit — a dashboard where one failing widget should not blank the page.</p>`,
        code: `Promise.allSettled([Promise.resolve('A'), Promise.reject('B failed')])
  .then(results => console.log(results.map(r => r.status + ':' + (r.value || r.reason))));`,
        output: '["fulfilled:A", "rejected:B failed"]',
        probe: [
          ['Can allSettled reject?', 'In practice no. It waits for every outcome and fulfills with the report.']
        ]
      }),
      term('Promise.race', {
        say: 'Promise.race settles as soon as the first input settles — whether that first one fulfilled or rejected. The fastest wins, even if it lost.',
        detail: `<p>The classic use is a timeout: race the real work against a promise that rejects after N milliseconds.</p>`,
        code: `const ok = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
const fail = (ms, r) => new Promise((_, rej) => setTimeout(() => rej(r), ms));
Promise.race([ok(20, 'slow'), fail(0, 'fast failure')])
  .then(v => console.log('won:', v), e => console.log('lost:', e));`,
        output: 'lost: fast failure',
        probe: [
          ['race versus any?', 'race takes the first settlement of any kind; any takes the first fulfillment and ignores rejections until every input has failed.']
        ]
      }),
      term('Promise.any', {
        say: 'Promise.any gives you the first promise that fulfills and ignores rejections along the way. It rejects only if every input rejects — with an AggregateError holding all the reasons.',
        detail: `<p>Use it for “any working source will do”: several mirrors, several endpoints, the first one that answers.</p>`,
        code: `const ok = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
const fail = (ms, r) => new Promise((_, rej) => setTimeout(() => rej(r), ms));
Promise.any([fail(0, 'A failed'), ok(10, 'B')])
  .then(v => console.log('first success:', v));
Promise.any([fail(20, 'X'), fail(30, 'Y')])
  .catch(e => console.log(e.constructor.name, e.errors));`,
        output: 'first success: B\nAggregateError ["X", "Y"]',
        probe: [
          ['What is AggregateError?', 'The error type Promise.any rejects with. Its .errors array holds every input reason, in input order.']
        ]
      })
    ],

    /* ---------------- Season 2 · this ---------------- */

    s2ep6: [
      term('this', {
        say: 'this is decided by how a function is called, not where it is written. In a method call it is the object before the dot; in a plain call it is undefined in strict mode and the global object otherwise; with new it is the newly created object; and call, apply or bind set it explicitly.',
        detail: `<p>Read the call expression and work down that list. Arrow functions are the exception — they have no <code>this</code> of their own and use the one from the scope they were written in.</p><p>The classic bug is detaching a method: <code>const f = obj.method; f()</code> loses the receiver, because the object was never part of the function.</p>`,
        code: `const obj = {
  value: 10,
  read() { return this && this.value; }
};
const detached = obj.read;
console.log(obj.read());
console.log(detached());
console.log(detached.call(obj));`,
        output: '10\nundefined\n10',
        probe: [
          ['Why does a detached method lose this?', 'this comes from the call expression. With no obj. in front of the call, there is no receiver.'],
          ['What is this at the top level of a classic browser script?', 'The window object.']
        ]
      }),
      term('call, apply and bind', {
        say: 'All three set this explicitly. call invokes right away with the arguments listed one by one, apply invokes right away with the arguments in an array, and bind does not invoke at all — it returns a new function with this, and optionally some leading arguments, locked in.',
        detail: `<p>Remember it as “<b>c</b>all = <b>c</b>ommas, <b>a</b>pply = <b>a</b>rray, bind = later”. A bound function cannot be rebound: the first bind wins.</p>`,
        code: `function describe(city, country) {
  return this.name + ' from ' + city + ', ' + country;
}
const person = { name: 'Asha' };
console.log(describe.call(person, 'Mumbai', 'India'));
console.log(describe.apply(person, ['Pune', 'India']));
const bound = describe.bind(person, 'Delhi');
console.log(bound('India'));`,
        output: 'Asha from Mumbai, India\nAsha from Pune, India\nAsha from Delhi, India',
        probe: [
          ['Which one does not call the function?', 'bind. It returns a new function you invoke later.'],
          ['Can you rebind an already-bound function?', 'No. The original binding sticks.']
        ]
      }),
      term('Arrow functions and this', {
        say: 'An arrow function has no this of its own. It uses the this of the scope where it was written, and call, apply and bind cannot change that.',
        detail: `<p>That makes arrows ideal <i>inside</i> a method: a callback keeps the method’s <code>this</code> with no <code>bind</code> and no <code>const self = this</code>. It makes them wrong <i>as</i> a method: an arrow property on an object literal takes <code>this</code> from the enclosing scope, not from the object.</p><p>Arrows also have no <code>arguments</code> object and cannot be called with <code>new</code>.</p>`,
        code: `const obj = {
  value: 10,
  regular() {
    return [1].map(() => this.value)[0];   // arrow keeps the method's this
  },
  arrowMethod: () => (this === undefined ? 'undefined' : 'the enclosing this, not obj')
};
console.log(obj.regular());
console.log(obj.arrowMethod());`,
        output: '10\nthe enclosing this, not obj',
        probe: [
          ['Can bind change an arrow’s this?', 'No. There is no own this to set.'],
          ['When is an arrow the wrong choice?', 'As an object method, as a constructor, and anywhere you need arguments or a dynamic this — such as a DOM handler that should receive the element.']
        ]
      })
    ],

    /* ---------------- Season 2 · Preparation ---------------- */

    s2react: [
      term('Destructuring', {
        say: 'Destructuring pulls values out of an object or array into variables in one statement, with optional renaming and defaults.',
        detail: `<p>A default only applies when the value is <code>undefined</code> — not for <code>null</code>, <code>0</code> or an empty string. This is the syntax behind almost every React props and hook example.</p>`,
        code: `const user = { name: 'Asha', address: { city: 'Pune' } };
const { name, address: { city }, role = 'member' } = user;
console.log(name, city, role);
const [first, , third = 30] = [10, 20];
console.log(first, third);`,
        output: 'Asha Pune member\n10 30',
        probe: [
          ['When does a destructuring default apply?', 'Only when the value is undefined.']
        ]
      }),
      term('Spread vs rest', {
        say: 'They share the same three dots but point in opposite directions: spread expands an existing array or object into a new one, rest collects the remaining items into a new array or object.',
        detail: `<p>Spread copies one level deep. Nested objects are still shared between the copy and the original, which is the usual cause of “I copied it but the original changed too”.</p>`,
        code: `const original = { name: 'Asha', city: 'Pune' };
const { name, ...rest } = original;             // rest: collects
const copy = { ...original, name: 'Mira' };     // spread: expands
console.log(name, rest, copy);
const sum = (...values) => values.reduce((a, b) => a + b, 0);
console.log(sum(1, 2, 3), Math.max(...[1, 9, 4]));`,
        output: 'Asha {city: "Pune"} {name: "Mira", city: "Pune"}\n6 9',
        probe: [
          ['Is spread a deep copy?', 'No. It copies the top level only; nested objects stay shared.']
        ]
      }),
      term('Optional chaining and nullish coalescing', {
        say: 'The ?. operator reads a property only if the thing before it is not null or undefined, returning undefined instead of throwing. The ?? operator supplies a fallback only when the left side is null or undefined.',
        detail: `<p>The difference from <code>||</code> matters: <code>||</code> also replaces <code>0</code>, <code>''</code> and <code>false</code>, which are often perfectly valid values.</p>`,
        code: `const user = null;
console.log(user?.address?.city);
const settings = { count: 0 };
console.log(settings.count || 10);
console.log(settings.count ?? 10);`,
        output: 'undefined\n10\n0',
        probe: [
          ['Does ?. swallow every error?', 'No. It only guards null and undefined. Calling a value that exists but is not a function still throws.']
        ]
      })
    ]
  };

  /* ---------- rendering ---------- */

  function codeBlock(code, file) {
    return `<div class="code"><div class="code-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="fname">${esc(file)}</span></div><pre>${esc(code)}</pre></div>`;
  }

  function card(entry, lessonId) {
    const envNote = entry.env === 'browser'
      ? '<p class="def-env">Browser example — it uses browser-only APIs, so run it on a page rather than in Node.</p>' : '';
    return `<article class="def-card" id="${lessonId}-def-${entry.slug}">
      <h4 class="def-term">${esc(entry.name)}</h4>
      <p class="def-say"><span class="def-label">Say this first</span>${esc(entry.say)}</p>
      ${entry.detail ? `<div class="def-detail">${entry.detail}</div>` : ''}
      ${entry.analogy ? `<p class="def-analogy"><span class="def-label">Intuition</span>${esc(entry.analogy)}</p>` : ''}
      ${envNote}
      ${entry.code ? codeBlock(entry.code, 'definition.js') : ''}
      ${entry.output ? `<div class="expected-output"><b>Expected result</b><pre>${esc(entry.output)}</pre></div>` : ''}
      ${entry.probe.length ? `<details class="def-probe"><summary>Follow-ups an interviewer usually asks (${entry.probe.length})</summary>
        <dl>${entry.probe.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join('')}</dl></details>` : ''}
    </article>`;
  }

  function slug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  for (const [id, list] of Object.entries(terms)) {
    list.forEach(entry => { entry.slug = slug(entry.name); entry.lesson = id; });
  }

  function has(id) { return Boolean(terms[id] && terms[id].length); }

  function render(id) {
    if (!has(id)) return '';
    const list = terms[id];
    return `<section class="definitions" id="${id}-definitions">
      <div class="def-kicker">Interview definitions · ${list.length} term${list.length === 1 ? '' : 's'}</div>
      <p class="def-lede">If someone asks “what is this?”, open with the bold sentence, then reach for the example. The detail below it is what you add when they ask you to go deeper.</p>
      ${list.map(entry => card(entry, id)).join('')}
    </section>`;
  }

  function all() {
    return Object.entries(terms).flatMap(([id, list]) => list.map(entry => ({ ...entry, lesson: id })));
  }

  function count() { return all().length; }

  function renderGlossary(query, titleFor) {
    const needle = (query || '').trim().toLowerCase();
    const byName = entry => entry.name.toLowerCase().includes(needle);
    const byText = entry => byName(entry)
      || entry.say.toLowerCase().includes(needle)
      || (entry.detail || '').toLowerCase().includes(needle);
    // Prefer term-name hits: searching "this" should surface the this keyword,
    // not every definition whose explanation happens to use the word.
    const named = needle ? all().some(byName) : false;
    const matches = entry => !needle || (named ? byName(entry) : byText(entry));
    const groups = Object.entries(terms)
      .map(([id, list]) => [id, list.filter(matches)])
      .filter(([, list]) => list.length);
    const found = groups.reduce((sum, [, list]) => sum + list.length, 0);
    const scopeNote = needle && !named
      ? `<p class="glossary-note">No term is named “${esc(query)}”, so these matched inside the explanations.</p>` : '';
    const body = groups.length
      ? groups.map(([id, list]) => `<div class="glossary-group">
          <div class="glossary-group-head"><button class="glossary-jump" data-go="${id}">${esc(titleFor(id))} →</button></div>
          ${list.map(entry => card(entry, 'glossary-' + id)).join('')}
        </div>`).join('')
      : `<p class="glossary-empty">No term matches “${esc(query)}”. Try closure, hoisting, event loop, this, or promise.</p>`;
    return `<section class="episode visible">
      <div class="ep-head">
        <span class="tag">▪ Definitions</span>
        <h2>Glossary</h2>
        <div class="tldr">Every interview definition in one place: the sentence to say first, a worked example with its real output, and the follow-ups that usually come next.</div>
      </div>
      <div class="glossary-search">
        <label for="glossaryQuery">Search ${count()} terms</label>
        <input id="glossaryQuery" type="search" placeholder="closure, hoisting, event loop, this…" value="${esc(query || '')}" autocomplete="off">
        <span class="glossary-count">${found} shown</span>
      </div>
      ${scopeNote}
      ${body}
    </section>`;
  }

  return { terms, render, renderGlossary, all, count, has };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = LESSON_DEFINITIONS;
