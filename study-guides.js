/* Original study explanations, video companions, and extra practice.
   Code is plain text and is escaped by the renderer, never executed by the page. */
const STUDY_GUIDES = {};
function lesson(id, video, sections, recall) {
  STUDY_GUIDES[id] = { video, sections, recall };
}
function section(title, body, code = '', output = '', time = null) {
  return { title, body, code, output, time };
}

lesson('ep1', 'ZvbzSrg0afE', [
  section('The two parts of the execution context',
    `<p>The lesson starts with a model you will reuse throughout the course: an execution context is the environment in which a piece of JavaScript runs. Draw a box with two columns. The memory column holds bindings for names and their values, including functions. The code column represents the work being performed.</p><p>The video calls the memory component the <b>variable environment</b>, and the code component the <b>thread of execution</b>. These are two parts of one model, not two threads running together. A function is a value that can be stored; storing it does not execute its body.</p>`, '', '', 44),
  section('Synchronous and single-threaded answer different questions',
    `<p><b>Single-threaded</b> means one JavaScript operation at a time on this thread. <b>Synchronous</b> means the current synchronous operation finishes before execution proceeds to the next. A function call can move execution into its body and then return to the caller, so “line by line” does not mean simply reading the file from top to bottom without jumps.</p><p>The example below is an added practice exercise. First the multiplication finishes, then its result is assigned, then the log reads that result. Nothing is scheduled for later.</p>`,
    `var price = 4;
var total = price * 3;
console.log(total);`, '12', 130),
  section('The question deliberately left for later',
    `<p>The episode raises AJAX/asynchronous behavior but postpones the explanation. Do not fill that gap with “JavaScript runs every callback in another thread.” Later episodes introduce host APIs, queues, and the event loop.</p><p><b>Added precision:</b> the single-thread model here describes one JavaScript agent, such as a page’s main thread. A browser does other work, and workers can run JavaScript on separate agents. The two-column drawing is a learning model, not a literal diagram of an engine’s physical memory.</p>`, '', '', 178)
], [
  ['Name both components and their alternate names.', 'Memory / variable environment; code / thread of execution.'],
  ['Does storing a function in memory run its body?', 'No. Calling the function executes its body.'],
  ['Why does asynchronous browser work not contradict this lesson?', 'The host can manage pending work while this JavaScript thread executes one operation at a time. The event loop is covered later.']
]);

lesson('ep2', 'iLWTnMzWtj4', [
  section('Trace the whole program, not just the final answer',
    `<p>Use the lesson’s square example. Distinguish <b>declaring</b> the function from <b>invoking</b> it. The name <code>square</code> refers to a function; <code>square(n)</code> calls it. The identifiers <code>square2</code> and <code>square4</code> will receive returned numbers, not copies of the function.</p>`,
    `var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
var square2 = square(n);
var square4 = square(4);
console.log(square2, square4);`, '4 16', 32),
  section('Phase 1: prepare the global bindings',
    `<p>Before the top-level statements execute, the <code>var</code> bindings for <code>n</code>, <code>square2</code>, and <code>square4</code> contain <code>undefined</code>. The function declaration already provides a callable <code>square</code> function. Its body has not run.</p><p>Do not put <code>num</code> or <code>ans</code> in the global memory column. They belong to calls of <code>square</code>. Also, this initialization rule applies to the <code>var</code> examples here; <code>let</code> and <code>const</code> have a temporal dead zone.</p>`, '', '', 80),
  section('Phase 2: first call, return, second call',
    `<ol><li><code>n = 2</code> replaces the initial <code>undefined</code>.</li><li>The declaration’s body is not executed just because execution passes its location.</li><li><code>square(n)</code> evaluates its argument to <code>2</code> and creates a new function execution context. <code>num</code> is the <b>parameter</b>; the value supplied from <code>n</code> is the <b>argument</b>. When the body starts, <code>num</code> is <code>2</code> and local <code>ans</code> is initially <code>undefined</code>.</li><li><code>ans = num * num</code> stores <code>4</code> locally.</li><li><code>return ans</code> sends <code>4</code> back to the suspended assignment; <code>square2</code> becomes <code>4</code>. The function’s stack entry is removed.</li><li><code>square(4)</code> creates a <b>different</b> context: new parameter binding, new local <code>ans</code>, result <code>16</code>. It does not reuse the previous invocation’s local variables.</li></ol>`, '', '', 356),
  section('Call stack: bottom to top, then back again',
    `<p>The active context is at the top. For the first call the stack is <code>Global → square(2)</code>; after return it is <code>Global</code>; then <code>Global → square(4)</code>; then <code>Global</code>. The top-level stack entry also leaves when that script finishes.</p><p>The video also names the execution-context, program, control, runtime, and machine stack. They refer to the call-stack model being taught. An empty stack means this run of synchronous work has finished; it does <b>not</b> prove there are no timers or event handlers waiting. Popping a context also does not force all referenced data to be garbage-collected.</p>`, '', '', 1166)
], [
  ['What is square2 while the first square call is still running?', 'undefined. Its assignment completes only after square returns.'],
  ['Are both square calls on the stack at the same time?', 'No. These calls are sequential, not nested.'],
  ['If a function reaches the end without return, what does the caller receive?', 'undefined. This is an added language clarification.']
]);

lesson('ep3', 'Fnlnw8uY6jo', [
  section('Three experiments with the same program',
    `<p>First call and log after the declarations: the greeting and <code>7</code> appear. Move the call and log above the declarations: the greeting still appears, but <code>x</code> is <code>undefined</code>. Now remove the <code>var x</code> declaration entirely: reading <code>x</code> throws a <code>ReferenceError</code>.</p><p>The change is in how the binding is prepared, not the engine physically moving source lines. Keep each experiment in a fresh script so previous console variables cannot affect the result.</p>`,
    `getName();
console.log(x);
console.log(typeof getName);
var x = 7;
function getName() {
  console.log('Namaste JavaScript');
}`, 'Namaste JavaScript\nundefined\nfunction', 0),
  section('Logging a function is different from calling it',
    `<p><code>console.log(getName)</code> inspects the function value; <code>getName()</code> executes its body. The video logs the function before its declaration to show that the function value is already available. Console formatting of a function varies, so learn the distinction rather than memorizing the browser’s printed representation.</p>`, '', '', 207),
  section('Change only the way the function is created',
    `<p>A function expression or arrow assigned to <code>var</code> is not available early as a callable function. Its variable exists, but contains <code>undefined</code> until the assignment executes. Calling that value produces a <code>TypeError</code>. With <code>let</code> or <code>const</code>, an early access instead hits the temporal dead zone and produces a <code>ReferenceError</code>.</p>`,
    `// Run each case separately.
// A: declaration
declared();                 // works
function declared() {}

// B: var + expression
console.log(expression);    // undefined
expression();               // TypeError; stops this run
var expression = function () {};

// C: var + arrow
arrow();                    // TypeError
var arrow = () => {};`, '', 620),
  section('Reproduce the debugger demonstration',
    `<ol><li>Open a small HTML page loading your script, then open DevTools → Sources.</li><li>Set a breakpoint on the first executable line and reload.</li><li>Inspect the scope: the <code>var</code> value is <code>undefined</code>, while the declaration is a function.</li><li>Step into <code>getName()</code>. Its frame appears above the top-level frame, often labelled “anonymous”.</li><li>Step out. The function frame disappears and the caller resumes.</li></ol><p>A breakpoint pauses <b>before</b> the highlighted statement executes. That is why you can inspect preparation separately from assignment. This debugger procedure is an important part of the lesson, not just a visual extra.</p>`, '', '', 856)
], [
  ['Why does deleting var x change undefined into an error?', 'There is no x binding to resolve in the scope chain, assuming no other x exists.'],
  ['Why is an early var-assigned arrow call a TypeError?', 'The binding is found, but its current value undefined is not callable.'],
  ['Does hoisting mean every name is safe to access early?', 'No. Initialization differs across var, lexical declarations, and function declarations.']
]);

lesson('ep4', 'gSDncyuGw0s', [
  section('Three names that look identical are three bindings',
    `<p>The lesson uses global <code>x = 1</code>, <code>a</code>’s local <code>x = 10</code>, and <code>b</code>’s local <code>x = 100</code>. Creating a local binding does not copy the global value. Each invocation has its own local environment.</p>`,
    `var x = 1;
a();
b();
console.log(x);
function a() {
  var x = 10;
  console.log(x);
}
function b() {
  var x = 100;
  console.log(x);
}`, '10\n100\n1', 0),
  section('Track memory and control together',
    `<ol><li>Global preparation creates <code>x: undefined</code> and callable <code>a</code>/<code>b</code>. Execution sets global <code>x</code> to <code>1</code>.</li><li>Calling <code>a</code> pushes its context. Its own <code>x</code> initially holds <code>undefined</code>, then becomes <code>10</code>. The log finds this local binding.</li><li>Finishing <code>a</code> removes its stack frame. Control returns to the caller; it does not jump directly into <code>b</code> from inside <code>a</code>.</li><li>Calling <code>b</code> repeats this process with a separate local <code>x</code>, now assigned <code>100</code>.</li><li>The final top-level log reads the global binding, still <code>1</code>.</li></ol><p>The environments have separate local bindings, but are not sealed off from their lexical parents. The next scope lesson explains outward lookup.</p>`, '', '', 164),
  section('Debugger exercise and a useful variation',
    `<p>Pause before the first statement in <code>a</code>. The scope panel lets you inspect its local <code>x</code> separately from global <code>x</code>; the call stack tells you which call is active. Step over the assignment to see only the local value change. Repeat for <code>b</code>.</p><p><b>Added practice:</b> move the local log before its declaration. It prints <code>undefined</code>, not the global <code>1</code>, because the local binding exists throughout the function. Remove the local declaration completely and the lookup can reach the outer binding instead.</p>`,
    `var x = 1;
function a() {
  console.log(x);
  var x = 10;
}
a();`, 'undefined', 900)
], [
  ['Why does assigning local x not change global x?', 'The declarations introduce different bindings.'],
  ['What happens if a is called twice?', 'Each call creates a fresh local environment.'],
  ['What does the call stack show versus the scope panel?', 'Active invocation order versus the bindings visible from the selected context.']
]);

lesson('ep5', 'QCRpVw2KXf8', [
  section('An empty script still runs in an environment',
    `<p>Start with an empty JavaScript file loaded by an HTML page. In a browser’s classic script environment, a global object and top-level execution context are available even though you wrote no statements. <code>window</code> exposes browser functionality; top-level <code>this</code> refers to that global object.</p><p><b>Precision:</b> do not infer that every script file creates a fresh browser window. Multiple scripts can share a page’s existing global environment.</p>`,
    `// Run at the top level of a classic browser script.
console.log(this === window);
console.log(globalThis === window);`, 'true\ntrue'),
  section('Global names versus function-local names',
    `<p>In a classic browser script, a top-level <code>var</code> and a top-level function declaration normally create properties accessible through <code>window</code>. A <code>var</code> inside a function belongs to that function, not the page’s global object. Bare identifier lookup and property lookup are different operations.</p>`,
    `var lessonValue = 10;
function sample() {
  var insideOnly = 20;
}
console.log(lessonValue, window.lessonValue, this.lessonValue);
console.log(window.insideOnly);
// console.log(insideOnly); // ReferenceError`, '10 10 10\nundefined'),
  section('Added environment comparison',
    `<ul><li><b>Browser classic script:</b> top-level <code>this === window</code>, including a strict classic script.</li><li><b>ES module:</b> top-level <code>this</code> is <code>undefined</code>; module declarations do not become window properties.</li><li><b>Node.js:</b> there is no browser <code>window</code>. Top-level behavior depends on CommonJS versus ES modules.</li><li><b>Portable global-object access:</b> use <code>globalThis</code>; it does not turn module-local variables into global properties.</li></ul><p>Top-level <code>let</code>/<code>const</code> in a classic script also do not become window properties. A missing property such as <code>window.noSuchProperty</code> evaluates to <code>undefined</code>; a missing bare identifier throws.</p>`)
], [
  ['Why does window.insideOnly return undefined?', 'The local var declaration did not create that global-object property.'],
  ['Is this === window always true in browser JavaScript?', 'No. This statement is about the top level of classic scripts; modules and function calls differ.']
]);

lesson('ep6', 'B7iF6G3EyIk', [
  section('A value versus a failed lookup',
    `<p><code>undefined</code> is an actual primitive value. In the lesson, a <code>var</code> binding starts with this value and keeps it until an assignment occurs. “Not defined” describes a failed name lookup and appears in an error message; it is not a second JavaScript value.</p><p>Run the undeclared-name experiment separately: an uncaught error stops the rest of that synchronous script.</p>`,
    `console.log(a);
var a = 7;
console.log(a);
// Separate experiment:
// console.log(missingName); // ReferenceError`, 'undefined\n7', 30),
  section('Leaving a variable unassigned and checking it',
    `<p>If you declare <code>var a;</code> and never assign a different value, it remains <code>undefined</code>. The lesson checks it with strict equality. The comparison returns a boolean; it does not assign anything.</p><p><b>Added precision:</b> calling undefined a “placeholder” is a useful model here, but it is also returned by functions without an explicit return value and by reads of missing object properties. It is not a reserved keyword.</p>`,
    `var a;
console.log(a === undefined);
a = 10;
console.log(a === undefined);
console.log({}.missing);`, 'true\nfalse\nundefined', 243),
  section('The same variable can hold values of different types',
    `<p>The lesson changes a variable from its initial value to a number and then a string. JavaScript does not permanently fix that variable to the type of its first assigned value. More precisely, this is <b>dynamic typing</b>: values have types, and a mutable binding can hold values of different types.</p><p>“Weak typing” usually refers to implicit conversions between types. Keep that distinction in mind even though the video uses loosely/weakly typed language while discussing this example.</p>`,
    `var value;
console.log(value);
value = 10;
console.log(value);
value = 'hello world';
console.log(value);`, 'undefined\n10\nhello world', 356),
  section('Advice from the lesson, with its boundary',
    `<p>The instructor advises against manually assigning <code>undefined</code> because it can obscure whether a value was ever provided. This is a style recommendation, not an illegal operation. <code>value = undefined</code> is valid. Choose <code>null</code> or <code>undefined</code> deliberately according to the API’s meaning.</p><p><b>Added edge case:</b> <code>typeof missingName</code> returns the string <code>"undefined"</code> for an undeclared identifier, but <code>typeof</code> does not bypass the temporal dead zone of a lexical declaration.</p>`, '', '', 520)
], [
  ['Is undefined the same as no binding?', 'No. A binding or property read can produce the value undefined; failed bare-name lookup throws.'],
  ['Can JavaScript assign undefined explicitly?', 'Yes. The video’s caution is about clarity, not syntax.'],
  ['What does a === undefined do?', 'It compares the current value with undefined without changing a.']
]);

lesson('ep7', 'uH-tVP8MUs8', [
  section('Scope answers two related questions',
    `<p>“What is the scope of <code>b</code>?” asks where the binding is accessible. “Is <code>b</code> in scope here?” asks whether this particular statement can access it. The lesson first reads a global <code>b</code> inside a function, then inside a nested function. Both can reach the outer binding.</p>`,
    `var b = 10;
function a() {
  function c() {
    console.log(b);
  }
  c();
}
a();`, '10', 25),
  section('Move the binding and test both directions',
    `<p>Move <code>b</code> into <code>a</code>. Nested <code>c</code> still finds it, but code outside <code>a</code> cannot reach inward to find that local variable. Scope lookup goes outward through lexical environments; it does not search every function’s memory.</p>`,
    `function a() {
  var b = 10;
  function c() { console.log(b); }
  c();
}
a();
console.log(b);`, '10\nReferenceError (assuming no other b exists)', 174),
  section('Follow every reference in the chain',
    `<p>A lexical environment combines local bindings with a reference to the outer environment. “Lexical” refers to placement in source code. Here the lookup route is <code>c → a → global → null</code>. The last <code>null</code> means there is no further outer environment.</p><ol><li>Search <code>c</code>’s local bindings.</li><li>If the name is absent, follow the reference to <code>a</code>.</li><li>If still absent, follow the global environment.</li><li>If all environments are exhausted, throw a <code>ReferenceError</code>.</li></ol><p>Stop at the <b>first matching binding</b>. A local binding containing <code>undefined</code> is still a match; the engine does not skip it to find an outer value.</p>`, '', '', 432),
  section('The call stack is not the scope chain',
    `<p>The video demonstrates scope and call-stack panels together. A nested closure may appear in the scope panel even before the dedicated closures lesson. The stack describes the calls active <em>now</em>; the lexical chain describes where a function was defined.</p><p><b>Added counterexample:</b> calling <code>read</code> from <code>caller</code> does not make <code>caller</code> its lexical parent.</p>`,
    `var label = 'global';
function read() { console.log(label); }
function caller() {
  var label = 'caller';
  read();
}
caller();`, 'global', 930)
], [
  ['Does a caller’s local variable automatically become visible to the called function?', 'No. The called function follows its definition-time lexical environment.'],
  ['Why does lookup stop at a local undefined value?', 'The binding exists. Only an absent name causes lookup to continue outward.'],
  ['What ends the outer-environment chain?', 'A null outer reference.']
]);

lesson('ep8', 'BNC6slYCj50', [
  section('Binding creation is not initialization',
    `<p><code>let</code> and <code>const</code> bindings exist before their declarations execute, but cannot be accessed until initialized. The interval from entering their scope until initialization is the <b>temporal dead zone</b>. They are not readable bindings containing <code>undefined</code> during this interval.</p><p>Run each experiment in a fresh script. An early ReferenceError prevents later statements from executing; a SyntaxError can prevent the entire script from starting.</p>`,
    `console.log(b); // undefined
var b = 100;
console.log(a); // ReferenceError; execution stops here
let a = 10;`),
  section('Compare three error categories',
    `<ul><li><b>ReferenceError:</b> reading a TDZ binding or a name that cannot be resolved. These are distinct causes even when the error class is the same.</li><li><b>SyntaxError:</b> a duplicate lexical declaration in the same scope, or an ordinary <code>const</code> declaration without an initializer.</li><li><b>TypeError:</b> attempting to reassign an initialized <code>const</code>.</li></ul><p><code>let a;</code> is valid. When that declaration executes, it initializes <code>a</code> to <code>undefined</code> and ends its TDZ. It does not remain in the TDZ until a later numeric or string assignment.</p>`,
    `// Each case is a separate program:
// 1
let value;
console.log(value); // undefined

// 2 (uncomment separately)
// let duplicate = 1;
// let duplicate = 2; // SyntaxError

// 3 (uncomment separately)
// const missing; // SyntaxError

// 4
const fixed = 10;
// fixed = 20; // TypeError`),
  section('Global object and redeclaration distinctions',
    `<p>In a classic browser script, a top-level <code>var</code> is normally accessible through <code>window</code>; top-level <code>let</code>/<code>const</code> are not window properties. DevTools may display them in a “Script” scope. That label is a tool presentation, not a promise about physical memory storage.</p><p>Repeating a compatible <code>var</code> declaration is allowed. Redeclaring a lexical name in the same scope, including a conflicting <code>var</code>, is not. A new inner block can introduce a separate binding; the next lesson explores that distinction.</p>`),
  section('Added edge cases worth understanding',
    `<p><code>const</code> protects a binding from reassignment, not an object from mutation. Prefer it when the binding need not change; use <code>let</code> when it does. Keep declarations close to sensible initialization points rather than assuming that moving every declaration to the top eliminates all TDZ risks.</p>`,
    `const user = { name: 'Asha' };
user.name = 'Mira'; // allowed
console.log(user.name);
// user = {};      // TypeError

// Separate TDZ experiment:
// console.log(typeof later); // ReferenceError
// let later;`, 'Mira')
], [
  ['When does the TDZ of let x; end?', 'When the declaration executes and initializes x to undefined.'],
  ['Why can a duplicate declaration stop earlier console logs?', 'It is an early syntax error in that script; evaluation does not begin.'],
  ['Can a const object change?', 'Its properties can change unless separately restricted; the binding cannot be reassigned.']
]);

lesson('ep9', 'lW_erSjyMeM', [
  section('Why blocks exist',
    `<p>A block groups statements where the grammar accepts a statement, such as the body of <code>if</code>. It also supplies a lexical scope for <code>let</code>/<code>const</code>. A bare block does not create a new function scope for <code>var</code>.</p>`,
    `if (true) {
  var a = 10;
  let b = 20;
  const c = 30;
  console.log(a, b, c);
}
console.log(a);
// console.log(b); // ReferenceError
// console.log(c); // ReferenceError`, '10 20 30\n10'),
  section('Same var binding versus separate lexical bindings',
    `<p>An inner block’s <code>var</code> can redeclare the same enclosing variable, so its assignment changes the outer value too. By contrast, an inner <code>let</code> introduces a different binding that shadows the outer one only inside the block. The same principle applies to <code>const</code> shadowing.</p>`,
    `var a = 100;
let b = 200;
const c = 300;
{
  var a = 10;
  let b = 20;
  const c = 30;
  console.log(a, b, c);
}
console.log(a, b, c);`, '10 20 30\n10 200 300'),
  section('Illegal shadowing: inspect the actual scope boundary',
    `<p>An inner-block <code>var</code> cannot cross out into an enclosing scope where it conflicts with a lexical declaration. However, a function creates a separate var scope, making the second example legal. “You can never shadow let with var” is too broad.</p>`,
    `// Invalid program — run separately:
// let a = 20;
// { var a = 30; } // SyntaxError

// Valid: var belongs to a different function scope.
let a = 20;
function demo() {
  var a = 30;
  console.log(a);
}
demo();
console.log(a);`, '30\n20'),
  section('Nested blocks still follow the lexical chain',
    `<p>Lookup chooses the nearest enclosing binding. A function or arrow defined inside a block can retain access to that block’s bindings through a closure. Leaving the block does not mean all its captured state must disappear.</p><p><b>Added trap:</b> the inner binding shadows from the start of its scope, including its TDZ. It does not become visible only after the declaration line.</p>`,
    `let amount = 100;
{
  // console.log(amount); // ReferenceError, not 100
  let amount = 20;
  {
    console.log(amount);
  }
}
console.log(amount);`, '20\n100')
], [
  ['Why does var a inside a block change the outer a?', 'Both declarations refer to the same enclosing var binding in this example.'],
  ['What makes shadowing with var legal inside a new function?', 'The function provides a separate var scope, preventing a conflicting declaration in the outer scope.'],
  ['Can a block-scoped binding outlive execution of the block?', 'Yes, when a reachable closure retains access to it.']
]);

lesson('ep10', 'qikxEIxsXco', [
  section('Begin with a nested function, then return it',
    `<p>A closure combines a function with access to its surrounding lexical environment. Start with <code>y</code> reading <code>x</code>’s local <code>a</code>. It works when called inside <code>x</code>. Now return <code>y</code> and call it after <code>x</code> finishes: the same outer binding is still accessible.</p><p>The crucial syntax is <code>return y</code>, which returns the function. <code>return y()</code> calls it immediately and returns whatever that call produces instead.</p>`,
    `function x() {
  var a = 7;
  function y() { console.log(a); }
  return y;
}
var z = x();
// x's call has finished. z now refers to y.
z();`, '7'),
  section('Keep the binding, not a frozen snapshot',
    `<p>Change the outer variable after creating the inner function. The inner function sees the updated value because it accesses a binding, not a photograph of the value at the moment the function was created. This is the reason the timer-loop puzzle in the next episode behaves as it does.</p>`,
    `function makeReader() {
  var a = 7;
  function read() { return a; }
  a = 100;
  return read;
}
console.log(makeReader()());`, '100'),
  section('Closures can span more than one outer scope',
    `<p>An inner function can access an outer function’s locals and another enclosing function’s locals. Returning it does not change its lexical parent to the location where you later call it. If the same name exists at multiple levels, the nearest binding wins.</p>`,
    `function outer() {
  var b = 900;
  function middle() {
    var a = 7;
    return function inner() { console.log(a, b); };
  }
  return middle();
}
const read = outer();
read();`, '7 900'),
  section('What survives, and what does not',
    `<p>The completed outer call is no longer an active frame on the call stack. The returned function remains reachable, and the state it needs remains accessible. Keeping lexical state alive is different from leaving the function running forever.</p><p>Closures are created when functions are created; an outer function does not have to return before a closure exists. Passing a callback to a timer or event listener is another way for it to outlive its surrounding call.</p>`),
  section('Uses, costs, and a debugger exercise',
    `<p>Uses include private state, function factories, currying, memoization, callbacks, and once-only behavior. These patterns share one mechanism: a function keeps access to some surrounding state. You do not need to memorize each pattern as a different kind of closure.</p><p>Set a breakpoint inside <code>read</code> and inspect the scope panel after <code>makeReader</code> has returned. Look for its retained <code>a</code>. Engines can optimize unused bindings; a debugger’s exact labels are not part of the language contract. Retained state becomes a memory problem when it stays reachable after your application no longer needs it.</p>`)
], [
  ['What changes if x returns y() instead of y?', 'y executes immediately. In the first example it logs 7 and returns undefined, so z would not be callable.'],
  ['Does a closure store the initial value or access a binding?', 'It accesses the binding, so later changes to that binding can be observed.'],
  ['Must the outer function return to create a closure?', 'No. The closure exists when the inner function is created.']
]);

lesson('ep11', 'eBTBG4nda2A', [
  section('One timer: why the greeting comes first',
    `<p><code>setTimeout</code> registers a callback and returns. JavaScript continues with the next statement. The callback closes over <code>i</code> and can read it later, after the function that registered it has finished. The delay is a scheduling threshold, not a pause inserted in the current function.</p>`,
    `function x() {
  var i = 1;
  setTimeout(function () { console.log(i); }, 3000);
  console.log('Namaste JavaScript');
}
x();`, 'Namaste JavaScript\n1 (later, after the timer becomes eligible)', 24),
  section('Five timers: two values are evaluated at different times',
    `<p>The task is to print <code>1</code> after about one second, <code>2</code> after about two, up to <code>5</code>. The loop below schedules five timers promptly. Each delay expression <code>i * 1000</code> is evaluated <b>during the loop</b>, producing 1000, 2000, 3000, 4000, and 5000.</p><p>But <code>console.log(i)</code> reads <code>i</code> <b>when the callback runs</b>. All callbacks refer to the same function-scoped binding. After the fifth iteration, the increment changes it to <code>6</code>; the next condition fails. Each callback therefore logs <code>6</code>.</p>`,
    `function x() {
  for (var i = 1; i <= 5; i++) {
    setTimeout(function () { console.log(i); }, i * 1000);
  }
  console.log('Namaste JavaScript');
}
x();`, 'Namaste JavaScript\n6\n6\n6\n6\n6', 282),
  section('Fix 1: give every iteration its own binding',
    `<p>A <code>for</code> loop with <code>let i</code> creates per-iteration bindings. Each callback retains the corresponding iteration’s binding. This is more precise than saying merely “let is block scoped”: a <code>let</code> declared outside the loop and then reused would still be shared.</p>`,
    `for (let i = 1; i <= 5; i++) {
  setTimeout(() => console.log(i), i * 1000);
}`, '1\n2\n3\n4\n5 (scheduled approximately one second apart)', 615),
  section('Fix 2: keep var, create a fresh parameter each call',
    `<p>If the interviewer prohibits <code>let</code>, make a helper. Each call gets its own parameter binding. Passing the current number into that parameter separates the callbacks’ state. Calling the helper without passing the loop value, while still closing over the shared outer <code>i</code>, would not fix the problem.</p>`,
    `function close(value) {
  setTimeout(function () { console.log(value); }, value * 1000);
}
for (var i = 1; i <= 5; i++) {
  close(i);
}`, '1\n2\n3\n4\n5', 765),
  section('Try changes that test your explanation',
    `<p>Change every delay to zero: callbacks still wait for the current synchronous run, so the shared-var version still prints five sixes. Replace the normal callback with an arrow: it still captures the same loop binding, so that alone changes nothing.</p><p>The code does not spend one second on each loop iteration. The five timers are registered in quick succession; their eventual execution can be delayed by other work.</p>`)
], [
  ['Why are the delays different when all outputs are 6?', 'The delay is evaluated at registration; the callback reads the shared i later.'],
  ['Does changing the callback to an arrow fix the loop?', 'No. The issue is the shared binding, not this or function syntax.'],
  ['Will let i declared before for fix it?', 'No. The per-iteration behavior comes from declaring let i in the for loop header.']
]);

lesson('ep12', 't1nFAMws5FI', [
  section('Answer the definition, then show the mechanism',
    `<p>An interview answer should connect the definition to observable behavior: an inner function retains access to its lexical bindings, even when invoked after its outer call returns. <code>outer()()</code> is two calls: the first returns a function, and the second calls that returned function.</p>`,
    `function outer() {
  let a = 10;
  return function inner() { console.log(a); };
}
outer()();
// Equivalent:
const inner = outer();
inner();`, '10\n10', 94),
  section('Declaration order, let, parameters, and nested scopes',
    `<p>Closures also work with <code>let</code>/<code>const</code> and parameters. The important question is whether a captured binding has been initialized when you read it. Defining the inner function before a later declaration is fine when the call occurs after initialization.</p><p>A global variable with the same name does not override the nearer captured variable. Removing the nearer declaration changes lookup; moving it below a call can instead produce a TDZ error.</p>`,
    `const a = 999;
function outest() {
  const c = 20;
  function outer(b) {
    function inner() { console.log(a, b, c); }
    let a = 10;
    return inner;
  }
  return outer;
}
outest()('hello')();`, '10 hello 20', 325),
  section('Private counter: separate calls create separate state',
    `<p>A global counter can be changed by unrelated code. Put it inside a factory and expose an operation instead. The returned function controls access to the local count. Calling the factory twice produces two independent environments, while calling one returned function repeatedly updates its same retained count.</p>`,
    `function counter() {
  let count = 0;
  return function increment() { return ++count; };
}
const first = counter();
const second = counter();
console.log(first(), first(), second());`, '1 2 1', 899),
  section('Constructor version: two methods share one count',
    `<p>A constructor can attach increment and decrement functions to the newly created object. Both close over the same local <code>count</code>. Another constructor call produces another count. Assigning <code>instance.count</code> creates a separate property; it does not modify the closed-over local variable.</p>`,
    `function Counter() {
  let count = 0;
  this.increment = function () { return ++count; };
  this.decrement = function () { return --count; };
}
const instance = new Counter();
console.log(instance.increment());
console.log(instance.increment());
console.log(instance.decrement());
instance.count = 500;
console.log(instance.increment());`, '1\n2\n1\n2', 1270),
  section('Garbage collection and retained state',
    `<p>Garbage collection reclaims unreachable data. A reachable closure can keep required data reachable after the outer call ends. That is necessary for correct behavior; it is not automatically a leak. A leak is unwanted retention, such as keeping an obsolete listener or cache reachable indefinitely.</p><p>The lesson’s “smart garbage collection” discussion concerns engine optimization of unused state. Do not promise that every outer variable is always retained, or that a particular collection occurs at a predictable time. Remove references and clean up resources when their useful lifetime ends; collection itself is managed by the engine.</p>`, '', '', 1502)
], [
  ['Why do two counter() calls not share a count?', 'Each factory invocation creates its own environment.'],
  ['Do increment and decrement on one instance share state?', 'Yes. Both close over that constructor invocation’s count.'],
  ['Does instance.count = 500 change the private count?', 'No. The public property and the closed-over local binding are different.'],
  ['Are closures inherently memory leaks?', 'No. They retain necessary state; unwanted long-lived references can cause leaks.']
]);

lesson('ep13', 'SHINoHxvTso', [
  section('Learn the terms by contrasting syntax',
    `<p>A <b>function declaration</b>, also called a function statement in the lesson, introduces a function with its declared name. A <b>function expression</b> creates a function value within an expression, such as the right-hand side of an assignment. Hoisting is the behavioral contrast emphasized here: a declaration is callable early, while a <code>var</code>-assigned expression is initially <code>undefined</code>.</p>`,
    `a(); // works
function a() { console.log('a called'); }

// b(); // TypeError if called before assignment
var b = function () { console.log('b called'); };
b();`, 'a called\nb called', 122),
  section('Anonymous does not mean unusable',
    `<p>An anonymous function expression has no explicit function name in its syntax. It can be assigned, passed as an argument, or returned. Writing <code>function () {}</code> as a standalone declaration is a syntax error because that declaration form needs a name.</p><p>Functions assigned to variables may acquire an inferred <code>name</code> property. The lesson’s anonymous-versus-named terminology is about source syntax, not a guarantee that DevTools always displays an empty name.</p>`,
    `const speak = function () { return 'hello'; };
function use(fn) { console.log(fn()); }
use(speak);
use(function () { return 'another value'; });`, 'hello\nanother value', 378),
  section('Named function expression: the inner name stays inside',
    `<p>In <code>var b = function xyz() { ... }</code>, <code>b</code> is the outside binding. <code>xyz</code> lets the function refer to itself inside its body, useful for recursion. The expression does not declare <code>xyz</code> in the surrounding scope.</p>`,
    `var b = function xyz() {
  console.log(typeof xyz);
};
b();
// xyz(); // ReferenceError outside the expression's scope`, 'function', 548),
  section('Parameters, arguments, and first-class values',
    `<p><b>Parameters</b> are the names in a function definition; <b>arguments</b> are the values supplied at a call. Parameters are local bindings. A function can itself be an argument, and another function can return it. Those abilities, together with assignment to variables, are what “first-class functions” or “first-class citizens” means. It is a capability, not a special keyword or function syntax.</p>`,
    `function identity(value) { return value; } // value: parameter
const fn = function () { return 42; };
const returned = identity(fn);              // fn: argument
console.log(returned === fn);
console.log(returned());`, 'true\n42', 724),
  section('let, const, and arrows do not remove these distinctions',
    `<p>With <code>let</code>/<code>const</code>, a function-valued variable follows the same TDZ rules as any other lexical binding. Arrows are function expressions, not hoisted function declarations. They also differ in <code>this</code> and constructor behavior, which is separate from first-class status.</p><p>When passing a callback, <code>use(fn)</code> passes the function. <code>use(fn())</code> calls it now and passes its return value. This small syntax difference is a frequent source of mistakes.</p>`, '', '', 1148)
], [
  ['Is every function expression anonymous?', 'No. A function expression can have an explicit internal name.'],
  ['What makes functions first-class?', 'They can be treated as values: assigned, passed to other functions, and returned.'],
  ['What is the difference between a parameter and an argument?', 'A parameter is the receiving name in the definition; an argument is the supplied value at a call.']
]);

lesson('ep14', 'btj35dh3_U8', [
  section('A callback is a role, not a scheduling guarantee',
    `<p>A callback is a function supplied to other code for that code to invoke. The receiving code decides when to call it. A callback may run synchronously, as in this example, or be scheduled later by a host API such as a timer.</p>`,
    `function x(callback) {
  console.log('x');
  callback();
}
x(function y() { console.log('y'); });
console.log('after');`, 'x\ny\nafter', 55),
  section('Timer callbacks and the main thread',
    `<p>Registering a timer does not wait for its callback. The current script continues. The callback eventually runs on the JavaScript thread and can itself block the page if it performs long synchronous work. Asynchronous scheduling does not make the callback’s body free or parallel.</p><p>In DevTools, pause inside the timer callback. Its call runs later, after the original top-level synchronous work has finished. The next episode explains the queues that connect the host to the call stack.</p>`,
    `setTimeout(function timer() { console.log('timer'); }, 0);
console.log('main script');`, 'main script\ntimer', 381),
  section('Build a button counter with a closure',
    `<p>Create the button before running this script. The setup function finishes after registering the handler, but the handler can still update <code>count</code> on each click. Moving the count inside the setup function keeps it out of global scope.</p><p>Calling setup twice registers two distinct handlers with independent counts. One click would then trigger both; registering repeatedly is not the same as continuing one counter.</p>`,
    `// HTML: <button id="clickMe">Click me</button>
const button = document.getElementById('clickMe');
function attachCounter() {
  let count = 0;
  function onClick() { console.log(++count); }
  button.addEventListener('click', onClick);
  return function cleanup() {
    button.removeEventListener('click', onClick);
  };
}
const cleanup = attachCounter();
// After your experiment: cleanup();`, 'First click: 1\nSecond click: 2\nAfter cleanup: this handler no longer logs', 618),
  section('Cleanup: use the same function reference',
    `<p>The cleanup function above is an added practical implementation of the lesson’s removal discussion. <code>removeEventListener</code> needs the original callback reference, matching event type, and matching capture setting. A new anonymous function with identical source is still a different function.</p><p>A reachable target can retain a listener and its captured state. Remove listeners when their lifetime ends, especially on long-lived targets. Unreachable targets and listeners can be collected; not every listener is automatically a leak.</p>`, '', '', 1165)
], [
  ['Do callbacks always run later?', 'No. x(callback) above invokes its callback synchronously.'],
  ['Why is count not reset on every click?', 'The same registered handler closes over the same setup invocation’s count.'],
  ['Why does removing a freshly written anonymous function not work?', 'It is a different function object from the one originally registered.']
]);

lesson('ep15', '8zKuNo4ay8E', [
  section('Separate the engine from the browser host',
    `<p>The call stack tracks JavaScript execution. The browser supplies capabilities such as timers, the DOM, network requests, and event handling. Registering work with these APIs does not require leaving a JavaScript stack frame running until a response arrives.</p><p>The engine also has parsing, compilation, and memory-management machinery; it is not literally “just a call stack.” The distinction here is between running JavaScript and the host facilities that make asynchronous applications possible.</p>`, '', '', 231),
  section('Follow a timer through the system',
    `<ol><li>The top-level script logs Start.</li><li><code>setTimeout</code> registers a callback and a delay with the host, then returns.</li><li>The script logs End and finishes its synchronous work.</li><li>After the timer’s waiting conditions are met, its task becomes eligible.</li><li>The event loop selects eligible work when the current JavaScript run is finished; invoking the callback creates its execution context.</li></ol><p>A task does not interrupt a currently running loop halfway through. This run-to-completion behavior is why a zero-delay timer cannot overtake the synchronous End log.</p>`,
    `console.log('Start');
setTimeout(() => console.log('timer callback'), 0);
console.log('End');`, 'Start\nEnd\ntimer callback', 723),
  section('Event registration is different from event delivery',
    `<p><code>addEventListener</code> stores a handler; it does not immediately invoke it. A user click can lead to a task that dispatches the event and invokes registered listeners. Repeated user clicks can cause repeated dispatches. The handler remains registered until removed or otherwise made irrelevant.</p><p><b>Useful precision:</b> an explicit <code>dispatchEvent()</code> call invokes listeners synchronously as part of that call. “Every DOM listener always runs in a later task” is therefore too broad.</p>`, '', '', 1139),
  section('Promises use microtasks for reactions',
    `<p><code>fetch</code> returns a promise while the network operation proceeds. When that promise settles, attached reactions can be queued as microtasks. Attaching <code>.then</code> does not run that handler immediately on the current stack.</p><p>At a microtask checkpoint, pending microtasks drain before the next task is selected. This does not mean a future network response outranks a timer that is already ready: the promise reaction must first be queued. Real fetch-versus-timer ordering depends on completion timing.</p>`,
    `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`, 'A\nD\nC\nB', 1649),
  section('New microtasks join the same drain',
    `<p>Promise reactions, <code>queueMicrotask</code> callbacks, and mutation-observer delivery use microtasks. If a microtask queues another microtask, the queue continues draining. A never-ending supply can starve timers and rendering. The finite example below illustrates this safely.</p>`,
    `setTimeout(() => console.log('task'), 0);
queueMicrotask(() => {
  console.log('microtask 1');
  queueMicrotask(() => console.log('microtask 2'));
});
console.log('sync');`, 'sync\nmicrotask 1\nmicrotask 2\ntask', 1826),
  section('A repeatable method for output questions',
    `<p>Use three columns: current synchronous work, queued microtasks, eligible tasks. Finish the current synchronous run first. Then drain microtasks, including newly queued ones. Only then consider the next task. Repeat after that task. Record when something is registered separately from when it becomes ready.</p><p>Do not memorize “promises always run first.” The promise executor runs synchronously, reactions run asynchronously, and a still-pending promise has no settled reaction ready to execute.</p>`)
], [
  ['Can a microtask interrupt a currently running synchronous function?', 'No. It waits for a microtask checkpoint.'],
  ['Does fetch().then(...) necessarily log before setTimeout(..., 0)?', 'No. A network-dependent reaction may not be queued when the timer task becomes ready.'],
  ['Why can recursively queued microtasks starve timers?', 'The microtask queue keeps refilling before the event loop can proceed to the next task.']
]);

lesson('ep16', '2WJL19wDH68', [
  section('Runtime, engine, and language are different layers',
    `<p>ECMAScript defines the language’s observable behavior. An engine implements it. A runtime combines an engine with host capabilities and scheduling. A browser runtime provides the DOM and browser APIs; Node.js provides a different set of host facilities. Both can use V8 without becoming the same runtime.</p><p>Examples of engines include V8, SpiderMonkey, and JavaScriptCore. An engine is software, not a physical chip reserved for JavaScript. Avoid treating implementation details of one engine as language rules.</p>`, '', '', 23),
  section('Parsing: source text becomes structure',
    `<p>Source characters are analyzed into tokens and syntactic structure. An abstract syntax tree represents relationships such as a declaration’s name and its initializer expression. It is not the same thing as the runtime object containing that variable’s eventual value.</p><p>For <code>let total = price * 2</code>, a simplified tree has a declaration for <code>total</code>, with a multiplication expression using the identifier <code>price</code> and numeric literal <code>2</code>. Parsing determines structure; execution evaluates the expression using actual values.</p>`, '', '', 534),
  section('Interpretation, compilation, and JIT',
    `<p>An interpreter can begin executing an intermediate representation quickly. A compiler generates machine code. A just-in-time system can use runtime information to compile and optimize frequently executed code, balancing startup time with later throughput.</p><p>“Is JavaScript interpreted or compiled?” is best answered with a distinction: engines may combine techniques; JavaScript’s required behavior does not mandate a single execution strategy. Compilation does not mean your source must become a standalone executable before a browser can run it.</p>`, '', '', 698),
  section('Understand the V8 names without freezing the diagram in time',
    `<p>The lesson introduces <b>Ignition</b>, V8’s bytecode interpreter, and <b>TurboFan</b>, an optimizing compiler. Modern V8 also includes tiers such as <b>Sparkplug</b> and <b>Maglev</b>. Treat the simple interpreter-to-optimizer picture as an introduction, not an exhaustive current architecture.</p><p>Optimized code may rely on observed behavior. If those assumptions fail, the engine can deoptimize and continue correctly. A change of value type must preserve program semantics even if it affects optimization. There is no useful universal promise that one engine is “the fastest” for every workload.</p>`, '', '', 1365),
  section('Heap, reachability, and garbage collection',
    `<p>The call stack models active calls; the heap contains allocated objects and other managed data. A tracing collector starts with reachable roots, follows references, and identifies unreachable allocations for reclamation. The mark-and-sweep explanation is a foundation, not a complete description of every collector phase.</p><p>V8’s Orinoco work includes parallel, concurrent, and incremental garbage-collection techniques. Oilpan is associated with management of C++ objects in the browser engine and should not simply be listed as another name for the JavaScript heap collector. Allocation lifetime, optimization, and collection timing are implementation concerns; closures must still retain the state required for correct behavior.</p>`, '', '', 1127)
], [
  ['Can two runtimes use the same engine and expose different APIs?', 'Yes. The host supplies capabilities beyond the language engine.'],
  ['Is an AST the same as the values produced by running code?', 'No. It represents syntax structure.'],
  ['Why can optimized code be deoptimized?', 'Runtime assumptions can stop holding; the engine must continue with correct behavior.'],
  ['What makes an object eligible for collection?', 'It is no longer reachable, subject to the collector’s implementation and timing.']
]);

lesson('ep17', 'nqsPmuicJJc', [
  section('The timer delay is not an appointment',
    `<p>A timer with delay 5000 does not reserve the JavaScript thread exactly five seconds later. Its callback can become eligible after the host’s waiting conditions are met, then still wait for executing work and scheduling. A long synchronous loop can therefore postpone a timer far beyond its requested delay.</p><p>In the lesson’s five-second timer / ten-second blocking scenario, the timer can become ready while the loop is still running. It cannot interrupt that loop. Once the loop ends, the callback can run when the event loop reaches it.</p>`, '', '', 38),
  section('A short local experiment with the same mechanism',
    `<p>This scaled-down version blocks for roughly 100 ms, not ten seconds. It deliberately demonstrates behavior you should avoid in production. The final measured duration varies; what matters is that the timer runs after the blocking work finishes.</p>`,
    `const start = performance.now();
console.log('Start');
setTimeout(() => {
  console.log('Callback after', Math.round(performance.now() - start), 'ms');
}, 50);
console.log('End');
while (performance.now() - start < 100) {
  // Deliberately busy: demonstration only.
}
console.log('Loop finished');`, 'Start\nEnd\nLoop finished\nCallback after approximately 100 ms or later', 412),
  section('Zero delay is still deferred',
    `<p><code>setTimeout(fn, 0)</code> requests scheduling as soon as the host permits; it does not call <code>fn</code> inline. The rest of the current synchronous work runs first. Browsers may also clamp nested timers or throttle background pages.</p>`,
    `console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');`, 'A\nC\nB', 935),
  section('Build the practice setup from the lesson',
    `<ol><li>Create a small HTML file and a neighboring <code>index.js</code>.</li><li>Load the script with <code>&lt;script src="index.js"&gt;&lt;/script&gt;</code> near the end of the body.</li><li>Open the page in a browser and open DevTools → Console and Sources.</li><li>Edit one case at a time, reload, predict the result, and inspect breakpoints.</li></ol><p>A local static server or an editor’s live-preview feature makes repeated reloads convenient. Use a fresh page for experiments to avoid accidentally reusing declarations from earlier console entries. Do not paste all error-producing snippets into one program.</p>`, '', '', 1227)
], [
  ['Why can a 5-second timer run after 10 seconds?', 'Its task is ready but cannot execute while synchronous work occupies the thread.'],
  ['Does delay 0 mean call now?', 'No. The callback is scheduled for later.'],
  ['Is measuring timer output a test of exact millisecond timing?', 'No. Compare ordering and the effect of blocked work, not an exact timestamp.']
]);

lesson('ep18', 'HkWxvB1RJq0', [
  section('Higher-order function versus callback',
    `<p>A higher-order function takes a function as an argument, returns a function, or both. The supplied function plays the callback role. Functions being first-class makes this possible. In <code>calculate(radii, area)</code>, <code>calculate</code> is the higher-order function and <code>area</code> supplies the transformation.</p>`, '', '', 34),
  section('Start with the repeated work',
    `<p>For a list of radii, you could write three loops: one for areas, another for circumferences, and another for diameters. Each allocates an output array, iterates over the same input shape, computes one value, and appends it. Only the formula changes.</p><p>The improvement is to separate traversal from the formula. This reduces repetition and makes each small function easier to understand and reuse. It does not change a linear algorithm into a fundamentally faster complexity class.</p>`, '', '', 108),
  section('Extract the changing logic into functions',
    `<p>The traversal receives the logic as a parameter and calls it for each radius. Pass <code>area</code>, not <code>area()</code>: the latter would invoke it before <code>calculate</code> receives it. The same traversal now handles all three tasks.</p>`,
    `const radii = [3, 1, 2, 4];
const area = r => Math.PI * r * r;
const circumference = r => 2 * Math.PI * r;
const diameter = r => 2 * r;
function calculate(values, logic) {
  const output = [];
  for (let i = 0; i < values.length; i++) {
    output.push(logic(values[i]));
  }
  return output;
}
console.log(calculate(radii, diameter));
console.log(radii.map(diameter));`, '[6, 2, 4, 8]\n[6, 2, 4, 8]', 476),
  section('From calculate to a map-like method',
    `<p>The lesson connects the custom traversal to <code>map</code> and demonstrates a method on <code>Array.prototype</code>. With method-call syntax, <code>this</code> identifies the array being processed. Below, a local function invoked with <code>call</code> demonstrates that mechanism without changing the built-in prototype.</p><p>This is an educational dense-array implementation. It is not a complete standards-compatible polyfill: native <code>map</code> has defined behavior for sparse slots, callback arguments, a supplied <code>thisArg</code>, length handling, and other cases.</p>`,
    `function calculateLikeMap(logic) {
  const output = [];
  for (let i = 0; i < this.length; i++) {
    output.push(logic(this[i]));
  }
  return output;
}
console.log(calculateLikeMap.call([3, 1, 2, 4], r => 2 * r));`, '[6, 2, 4, 8]', 984),
  section('Explain the design in an interview',
    `<p>Say what repeats, what changes, and how you separated them. Small named formulas are easy to test independently; the traversal does not need to know whether it is calculating an area or a diameter. Higher-order functions do not automatically guarantee purity: the supplied callback could still mutate inputs or outside state.</p>`)
], [
  ['Which function is higher-order in calculate(radii, area)?', 'calculate; area is the supplied callback.'],
  ['What does this refer to in the call-based example?', 'The radii array explicitly passed as the call receiver.'],
  ['Is this homemade traversal a complete map polyfill?', 'No. It illustrates abstraction for dense arrays, not every native edge case.']
]);

lesson('ep19', 'zdp0zrpKzIE', [
  section('map: preserve positions, transform values',
    `<p>The lesson starts with <code>[5, 1, 3, 2, 6]</code>. Double, triple, and binary-string conversion are different transformations of the same data. A named function, an inline function expression, and an arrow can all express the callback. Braces in an arrow body require an explicit return when you want to return a value.</p>`,
    `const arr = [5, 1, 3, 2, 6];
function double(x) { return x * 2; }
console.log(arr.map(double));
console.log(arr.map(x => x * 3));
console.log(arr.map(x => x.toString(2)));
console.log(arr.map(x => { x * 2; }));`, '[10, 2, 6, 4, 12]\n[15, 3, 9, 6, 18]\n["101", "1", "11", "10", "110"]\n[undefined, undefined, undefined, undefined, undefined]', 37),
  section('filter: the predicate chooses original elements',
    `<p><code>filter</code> retains an element when the callback result is truthy. For the positive integers here, <code>x % 2</code> produces 1 for odd numbers and 0 for even numbers, so it works as a predicate. The callback does not need to literally return the boolean <code>true</code>.</p><p>Unlike map, filter does not place the callback result into the returned array. It selects the original values, preserving their relative order.</p>`,
    `const arr = [5, 1, 3, 2, 6];
console.log(arr.filter(x => x % 2));
console.log(arr.filter(x => x % 2 === 0));
console.log(arr.filter(x => x > 4));
console.log(arr.filter(x => x < 3));`, '[5, 1, 3]\n[2, 6]\n[5, 6]\n[1, 2]', 398),
  section('reduce: translate the familiar sum loop',
    `<p>First think of a loop with a running sum initialized to zero. In reduce, that running result is the <b>accumulator</b>; the current element is the second callback parameter. The callback’s return value becomes the next accumulator. The second argument to <code>reduce</code> supplies its initial value.</p><p>For this input, accumulator values after each step are <code>5 → 6 → 9 → 11 → 17</code>. There is no special requirement to call the parameter <code>acc</code>; a meaningful name such as <code>sum</code> is fine.</p>`,
    `const arr = [5, 1, 3, 2, 6];
let sum = 0;
for (const value of arr) sum += value;
const reduced = arr.reduce((sum, current) => sum + current, 0);
console.log(sum, reduced);`, '17 17', 691),
  section('Maximum and the importance of the initial value',
    `<p>The video initializes maximum to zero for its stated assumption of positive numbers. That assumption matters. For an all-negative array, zero would incorrectly win despite not appearing in the input. A useful general numeric seed is <code>-Infinity</code>, or start from an existing first element when the input is known to be nonempty.</p>`,
    `console.log([5, 1, 3, 2, 6].reduce((max, n) => n > max ? n : max, 0));
console.log([-5, -2].reduce((max, n) => Math.max(max, n), -Infinity));
console.log([].reduce((sum, n) => sum + n, 0));
// [].reduce((sum, n) => sum + n); // TypeError: no initial value`, '6\n-2\n0', 1122),
  section('Objects: full names and a frequency table',
    `<p>The lesson moves from numbers to user objects. Mapping to full names is still a one-element-to-one-result transformation. Counting people by age instead produces one object, so the accumulator starts as <code>{}</code>. A new age gets count 1; an age already present gets incremented. Always return the accumulator.</p><p>The sample below keeps the lesson’s age pattern with fresh names. The counts evolve from <code>{26: 1}</code>, to adding 75, to adding 50, to incrementing 26 to 2.</p>`,
    `const users = [
  { firstName: 'Asha', lastName: 'Rao', age: 26 },
  { firstName: 'Dev', lastName: 'Shah', age: 75 },
  { firstName: 'Mira', lastName: 'Sen', age: 50 },
  { firstName: 'Ravi', lastName: 'Das', age: 26 }
];
console.log(users.map(u => u.firstName + ' ' + u.lastName));
const counts = users.reduce((acc, user) => {
  acc[user.age] = (acc[user.age] || 0) + 1;
  return acc;
}, {});
console.log(counts);`, '["Asha Rao", "Dev Shah", "Mira Sen", "Ravi Das"]\n{26: 2, 50: 1, 75: 1}', 1387),
  section('Chaining: keep the intermediate result in your head',
    `<p>The task asks for <b>first names</b> of people younger than 30. Filter alone returns user objects, not names. Map must run on the filtered output. Mapping to names first would lose the age field needed by the predicate.</p><p>The episode’s homework asks for the same result using reduce. Try it before revealing the answer below. A single reduce can avoid the intermediate filtered array; use whichever form communicates the intent more clearly for your application.</p>`,
    `// Continue with users from the previous example.
const names = users
  .filter(user => user.age < 30)
  .map(user => user.firstName);
console.log(names);`, '["Asha", "Ravi"]', 1930),
  section('Added edge cases for reliable use',
    `<p>A new result array does not imply deep copies of objects: filter retains object references, and map can also return existing objects. These methods do not inherently mutate the source, but your callback can. Native map/filter skip empty slots, whereas an explicit <code>undefined</code> element is still visited.</p><p>Reduce without an initial value uses the first present element as the initial accumulator and starts callbacks at the next present element. With an initial value, it starts callbacks at the first present element. An empty input with a seed returns the seed; without a seed it throws.</p>`)
], [
  ['Homework: get names under 30 using reduce.', 'users.reduce((names, user) => { if (user.age < 30) names.push(user.firstName); return names; }, [])'],
  ['Why does filter(x => x % 2) keep odd numbers?', 'The remainder is truthy for odd integers and zero, which is falsy, for even integers.'],
  ['Why is zero an unsafe universal maximum seed?', 'For an all-negative input it can return zero even though zero is not in the array.'],
  ['Can the single value returned by reduce be an object or array?', 'Yes. “Single” describes one accumulated result, not only a primitive number.']
]);
