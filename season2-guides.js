/* Season 2 lesson companions. Load after study-guides.js.
   Examples are displayed as escaped text; the site never executes them. */
lesson('s2ep1', 'yEKtJGha3yM', [
  section('Why callbacks make delayed work possible',
    `<p>A callback is a function supplied to other code. That code decides when to invoke it. The episode starts with three logs, then moves the middle log into a timer callback. Registering the timer does not pause the surrounding script: the last synchronous log runs before the callback.</p><p>The delay below is shortened for practice. It is a minimum waiting period, not a promise of an exact execution time. A callback is not automatically asynchronous: array methods such as <code>map</code> invoke their callbacks synchronously.</p>`,
    `console.log('Namaste');
setTimeout(() => console.log('JavaScript'), 50);
console.log('Season 2');`, 'Namaste\nSeason 2\nJavaScript', 58),
  section('The shopping-cart dependency',
    `<p>The lesson uses a cart containing shoes, pants, and a kurta. Creating an order must finish before payment can begin because payment needs its order ID. Calling two asynchronous functions on consecutive lines does not establish that dependency. The second call may run before the first operation finishes.</p><p>These local mock functions make the dependency runnable without a server. <code>createOrder</code> returns before its timer fires; the order ID reaches the consumer through its callback, not through the function’s immediate return value.</p>`,
    `const cart = ['shoes', 'pants', 'kurta'];
function createOrder(items, onCreated) {
  setTimeout(() => onCreated('ORDER-101'), 30);
}
function proceedToPayment(orderId) {
  console.log('Pay for', orderId);
}
createOrder(cart, orderId => proceedToPayment(orderId));
console.log('Order requested');`, 'Order requested\nPay for ORDER-101', 193),
  section('From two steps to callback hell',
    `<p>The video extends the dependency to <b>create order → payment → order summary → wallet update</b>. Each later operation belongs inside the previous operation’s completion callback. The nesting describes a real dependency, but a large workflow also needs validation, error branches, retries, and cleanup. Following all of those paths becomes difficult.</p><p>Read this example from the outside inward. Each mock asynchronous step passes its result to the next callback. The “pyramid of doom” describes the growing structure and maintenance problem; it does not mean a particular indentation depth is a language error.</p>`,
    `const later = (value, callback) => setTimeout(() => callback(value), 10);
const api = {
  createOrder: (cart, cb) => later('ORDER-101', cb),
  proceedToPayment: (id, cb) => later({ orderId: id, paid: true }, cb),
  showOrderSummary: (payment, cb) => later(payment.orderId, cb),
  updateWallet: (id, cb) => later('Wallet updated for ' + id, cb)
};
api.createOrder(['shoes'], orderId => {
  api.proceedToPayment(orderId, payment => {
    api.showOrderSummary(payment, summaryId => {
      api.updateWallet(summaryId, message => {
        console.log(message);
      });
    });
  });
});`, 'Wallet updated for ORDER-101', 368),
  section('Inversion of control is a separate problem',
    `<p>When you give <code>createOrder</code> your payment callback, that function controls whether and when it runs. What if it invokes the callback twice? What if it never invokes it? What if it invokes it before the order is actually ready? These are questions about the API’s contract, even with only one level of nesting.</p><p>The intentionally faulty mock below calls its callback twice. Renaming the callback or moving it into another file would improve organization without fixing this behavior. Promises provide standard settlement and reaction rules, which the next lesson develops. They still cannot force a broken producer to finish.</p>`,
    `function buggyCreateOrder(callback) {
  callback('ORDER-101');
  callback('ORDER-101');
}
buggyCreateOrder(id => console.log('Payment requested for', id));`, 'Payment requested for ORDER-101\nPayment requested for ORDER-101', 579),
  section('Explain both problems without condemning every callback',
    `<p><b>Callback hell:</b> nested dependent work becomes hard to follow and maintain. <b>Inversion of control:</b> another piece of code owns invocation of your continuation. These are related but distinct concerns.</p><p>Callbacks remain useful for events, synchronous transformations, and API integration. A click listener may intentionally run many times, whereas a promise represents one eventual outcome. The episode’s homework is to explain both problems in your own words; use the cart example rather than memorizing the two names.</p>`, '', '', 754)
], [
  ['Why does putting createOrder(); and proceedToPayment(); on consecutive lines not guarantee correct ordering?', 'The first call can return while its asynchronous operation is still pending. Payment needs the completed order’s ID, so it must be connected to that completion.'],
  ['Can a single callback have an inversion-of-control problem without callback hell?', 'Yes. Even one callback can be invoked too early, more than once, or never by its receiving API.'],
  ['Does every callback run asynchronously?', 'No. The receiving API decides; map invokes callbacks synchronously while a timer invokes them later.'],
  ['Homework: explain callback hell and inversion of control using the cart flow.', 'Callback hell is the growing nesting needed to express order, payment, summary, and wallet dependencies. Inversion of control is trusting each API to invoke the continuation correctly.']
]);

lesson('s2ep2', 'ap-6PPAuK1Y', [
  section('A promise separates an operation from its consumers',
    `<p>Return a promise from <code>createOrder(cart)</code> instead of accepting a payment callback. The caller receives an object immediately and attaches the next step with <code>then</code>. The producer’s job is to report its outcome; the consumer decides what to do with it.</p><p>The lesson initially imagines a container that gets a value later. That is a helpful starting model, but a promise is not an ordinary object with a public <code>data</code> field. Use <code>then</code> or <code>await</code> to consume its result.</p>`,
    `function createOrder(cart) {
  return new Promise(resolve => {
    setTimeout(() => resolve('ORDER-101'), 30);
  });
}
const orderPromise = createOrder(['shoes']);
orderPromise.then(orderId => console.log('Order:', orderId));
console.log('Promise received');`, 'Promise received\nOrder: ORDER-101', 312),
  section('Pending, fulfilled, rejected — and settled',
    `<p>A promise is <b>pending</b> while its outcome is not available. It becomes <b>fulfilled</b> with a value or <b>rejected</b> with a reason. Either final state is called <b>settled</b>. A settled promise does not switch to another state, although a promise can remain pending indefinitely.</p><p>An interview answer should mention both success and failure: a promise is an object through which you observe an operation’s eventual successful value or failure reason. “A future value” alone leaves out rejection.</p>`,
    `Promise.resolve('ready').then(value => console.log(value));
Promise.reject(new Error('unavailable'))
  .catch(error => console.log(error.message));
console.log('handlers attached');`, 'handlers attached\nready\nunavailable', 1223),
  section('What guarantees improve on an arbitrary callback API?',
    `<p>A native promise accepts only its first resolving action. Once its outcome is determined, a matching reaction registered with <code>then</code> runs asynchronously at most once per registration. Attaching another handler later does not lose an already available result.</p><p>Multiple registrations are allowed; attaching the same callback twice still makes two registrations. Fulfillment handlers do not run for rejection, and a permanently pending promise does not run either outcome handler. Promises standardize observation; they do not guarantee that a server responds or that an operation succeeds.</p>`,
    `const p = new Promise((resolve, reject) => {
  resolve('first');
  resolve('second');
  reject(new Error('too late'));
});
p.then(value => console.log('A:', value));
p.then(value => console.log('B:', value));
console.log('sync');`, 'sync\nA: first\nB: first', 610),
  section('Inspecting a real fetch promise in DevTools',
    `<p>The episode calls the GitHub user API, pauses in the debugger, and inspects the returned promise. <code>fetch</code> returns a promise that fulfills with a <code>Response</code>, not immediately with the parsed user object. DevTools can show internal entries such as <code>[[PromiseState]]</code> and <code>[[PromiseResult]]</code>; these are not ordinary properties to read in application code.</p><p>A console preview captured while pending can appear fulfilled when expanded later because the inspector may display the object’s later state. To observe the completed value reliably, log inside a reaction. The live example below depends on network access and the API’s response.</p>`,
    `const userPromise = fetch('https://api.github.com/users/akshaymarch7');
console.log(userPromise); // Inspect the promise itself.
userPromise
  .then(response => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  })
  .then(user => console.log(user.login))
  .catch(error => console.log('Request failed:', error.message));`, 'A promise object, then the returned username on success; otherwise a handled request error.', 746),
  section('A fixed outcome does not freeze an object',
    `<p>The important immutability guarantee concerns the promise’s settled outcome. It does not deep-freeze an object supplied as the fulfillment value. Consumers can share a reference to that object and observe its mutations.</p><p>Do not use promises as a substitute for copying, freezing, or designing ownership of mutable data. Here the promise fulfills with the same object reference, whose count has changed by the time the reaction reads it.</p>`,
    `const result = { count: 1 };
const p = Promise.resolve(result);
result.count = 2;
p.then(value => console.log(value.count, value === result));`, '2 true', 1261),
  section('A chain connects the returned values',
    `<p>The lesson returns to the four-step shopping flow. Each <code>then</code> creates a new promise for that stage’s outcome. If the handler returns an ordinary value, the next stage receives it. If it returns a promise, the next stage waits for that promise’s eventual outcome.</p><p>These tiny mocks focus on data flow. The previous callback form grew inward; this chain keeps the dependent steps in reading order. Arrow expressions implicitly return their result. Adding braces means you must write <code>return</code> explicitly when passing a result onward.</p>`,
    `const createOrder = cart => Promise.resolve('ORDER-101');
const proceedToPayment = id => Promise.resolve({ orderId: id, paid: true });
const showOrderSummary = info => Promise.resolve('Summary: ' + info.orderId);
const updateWallet = summary => Promise.resolve(summary + ' / wallet updated');
createOrder(['shoes'])
  .then(orderId => proceedToPayment(orderId))
  .then(paymentInfo => showOrderSummary(paymentInfo))
  .then(summary => updateWallet(summary))
  .then(message => console.log(message))
  .catch(error => console.log(error.message));`, 'Summary: ORDER-101 / wallet updated', 1506),
  section('The missing-return bug',
    `<p>A handler can start work and then accidentally return nothing. The chain then receives <code>undefined</code>, and it no longer waits for that work or tracks its rejection. This is why the video repeatedly emphasizes returning from each stage.</p><p>In this example the inner promise fulfills harmlessly, but its value is lost. Fix the first handler with <code>return Promise.resolve('payment complete')</code>, or use the expression form <code>id =&gt; Promise.resolve('payment complete')</code>.</p>`,
    `Promise.resolve('ORDER-101')
  .then(id => {
    Promise.resolve('payment complete'); // Missing return.
  })
  .then(value => console.log(value));`, 'undefined', 1810)
], [
  ['What does fetch fulfill with before body parsing?', 'A Response object. Reading its JSON body is another asynchronous step, through response.json().'],
  ['Does settled mean successful?', 'No. Both fulfilled and rejected promises are settled.'],
  ['If you attach a handler after fulfillment, is the value lost?', 'No. The reaction is scheduled asynchronously with the existing fulfillment value.'],
  ['What does returning a promise from a then handler do?', 'The promise returned by that then adopts its outcome, so later handlers wait for it and receive its value or rejection.'],
  ['Homework: explain why promises are useful without saying callbacks disappear.', 'They provide a standard one-outcome contract and let consumers compose dependent steps and errors. The handlers passed to then and catch are still callbacks.']
]);

lesson('s2ep3', 'U74BJcr8NeQ', [
  section('Producer versus consumer',
    `<p>The previous episode consumed a returned promise. Now implement the producer: <code>createOrder</code> constructs and returns one. The function passed to <code>new Promise</code> is called the executor. JavaScript supplies its <code>resolve</code> and <code>reject</code> functions; you do not implement those functions yourself.</p><p>The executor runs synchronously during construction. It may register delayed work that settles the promise later. Its own return value is ignored; call <code>resolve(value)</code> or <code>reject(reason)</code> to report an outcome.</p>`,
    `console.log('before');
const p = new Promise(resolve => {
  console.log('executor');
  resolve('result');
});
p.then(value => console.log(value));
console.log('after');`, 'before\nexecutor\nafter\nresult', 189),
  section('Build createOrder with validation and delayed success',
    `<p>The episode validates the cart, creates a dummy order ID, then adds a timer so the pending state is visible. The runnable version below rejects empty carts and fulfills valid ones after a short delay. Its consumer attaches success and failure handlers.</p><p>The <code>return</code> after <code>reject</code> matters: rejecting does not stop the executor. Without the return, subsequent validation-independent work would still run, although later resolving calls cannot change the locked-in outcome. This mock demonstrates control flow; it does not contact a shop or charge anything.</p>`,
    `function createOrder(cart) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(cart) || cart.length === 0) {
      reject(new Error('Cart is not valid'));
      return;
    }
    setTimeout(() => resolve('ORDER-101'), 30);
  });
}
createOrder(['shoes'])
  .then(id => console.log(id))
  .catch(error => console.log(error.message));
createOrder([])
  .then(id => console.log(id))
  .catch(error => console.log(error.message));`, 'Cart is not valid\nORDER-101', 317),
  section('Rejection handling and errors thrown by code',
    `<p>The video first lets invalid-cart rejection surface in the console, then adds <code>catch</code>. Catching allows you to choose the response: display feedback, supply a fallback, retry deliberately, or propagate the failure. Merely printing red text with <code>console.error</code> is not the same as leaving a rejection unhandled.</p><p>A synchronous throw inside a promise executor becomes a rejection. A throw inside a <code>then</code> handler rejects the promise returned by that <code>then</code>. By contrast, a throw from a later timer callback is outside the executor’s original call; catch it in that callback and call <code>reject</code> if it should reject the promise.</p>`,
    `new Promise(() => {
  throw new Error('Producer failed');
})
  .catch(error => {
    console.log(error.message);
    return 'fallback';
  })
  .then(value => console.log(value));`, 'Producer failed\nfallback', 923),
  section('Pass data through each stage',
    `<p>There are two returns to distinguish. <code>createOrder</code> returns a promise to its caller. A handler inside the consumer’s chain returns a value or promise to the next stage. Logging an order ID does not pass that ID onward; explicitly return it after logging.</p><p>The following chain prints the order ID, passes it to payment, then prints the payment message. If payment returned a pending promise, the last stage would wait for it. Repeatedly nesting <code>then</code> inside <code>then</code> can recreate the readability problem promises were meant to solve.</p>`,
    `const createOrder = () => Promise.resolve('ORDER-101');
const proceedToPayment = id => Promise.resolve('Paid ' + id);
createOrder()
  .then(id => {
    console.log(id);
    return id;
  })
  .then(id => {
    return proceedToPayment(id);
  })
  .then(info => console.log(info))
  .catch(error => console.log(error.message));`, 'ORDER-101\nPaid ORDER-101', 1101),
  section('Where catch sits determines what it can handle',
    `<p>A rejection moves forward through handlers that do not handle it. A <code>catch</code> can receive rejections from earlier stages of its connected chain. It cannot catch an error thrown by a later handler, or a promise you started but never returned.</p><p>Moving <code>catch</code> earlier changes the flow. If it returns normally, the next promise is fulfilled with the returned value, including <code>undefined</code> if nothing is returned. If it throws or returns a rejected promise, subsequent fulfillment handlers are skipped. Thus a <code>then</code> after a catch is not guaranteed to run in every situation.</p>`,
    `Promise.reject(new Error('Cart is not valid'))
  .then(() => console.log('payment')) // Skipped.
  .catch(error => {
    console.log(error.message);
    return 'recovered';
  })
  .then(value => {
    console.log(value);
    throw new Error('Later failure');
  })
  .catch(error => console.log(error.message));`, 'Cart is not valid\nrecovered\nLater failure', 1565),
  section('Recovery versus propagation',
    `<p>The video deliberately moves a catch before payment to demonstrate continuing after a failed cart. That illustrates recovery semantics, not a valid checkout rule. In an actual dependency, do not claim a usable order exists unless your recovery created one.</p><p>Rethrow when the later step still cannot proceed. Use <code>finally</code> for cleanup that should run after either outcome. A normally completing finally preserves the previous outcome; throwing from it or returning a rejected promise can replace that outcome.</p>`,
    `Promise.reject(new Error('Invalid order'))
  .catch(error => {
    console.log('Cannot recover');
    throw error;
  })
  .then(() => console.log('Payment started')) // Skipped.
  .finally(() => console.log('Cleanup'))
  .catch(error => console.log(error.message));`, 'Cannot recover\nCleanup\nInvalid order'),
  section('Resolved is not always fulfilled',
    `<p>Resolution can adopt another promise. After <code>resolve(inner)</code>, the outer promise is locked to the inner promise’s eventual outcome but can still be pending. It later fulfills or rejects according to the inner promise. “Settled” means fulfilled or rejected; “resolved” is a broader term.</p><p>Calling resolve is also not a return statement: synchronous code after it still executes. In this example “executor finished” logs immediately, and the late call to reject has no effect.</p>`,
    `const inner = new Promise(resolve => setTimeout(() => resolve('ready'), 20));
const outer = new Promise((resolve, reject) => {
  resolve(inner);
  reject(new Error('ignored'));
  console.log('executor finished');
});
outer.then(value => console.log(value));`, 'executor finished\nready'),
  section('Homework: implement the whole checkout chain',
    `<p>The assigned exercise is to build all four promise-returning operations and connect their results, including errors. This standalone solution uses simulated data and a wallet balance. Read which fields each step receives and which it returns. Try an empty cart, or reduce the balance below the total, and explain which stages are skipped.</p><p>For revision, hide the code first and implement the function contracts yourself. The mock follows the lesson’s order: payment → summary → wallet display update. Real payment processing has additional server-side responsibilities beyond this exercise.</p>`,
    `function createOrder(cart) {
  return new Promise((resolve, reject) => {
    if (!cart.length) return reject(new Error('Empty cart'));
    resolve({ id: 'ORDER-101', total: cart.reduce((sum, item) => sum + item.price, 0) });
  });
}
function proceedToPayment(order) {
  const balance = 100;
  if (order.total > balance) return Promise.reject(new Error('Insufficient balance'));
  return Promise.resolve({ order, remaining: balance - order.total });
}
function showOrderSummary(payment) {
  console.log('Summary:', payment.order.id, payment.order.total);
  return Promise.resolve(payment.remaining);
}
function updateWallet(balance) {
  console.log('Wallet:', balance);
  return Promise.resolve(balance);
}
createOrder([{ price: 30 }, { price: 20 }])
  .then(proceedToPayment)
  .then(showOrderSummary)
  .then(updateWallet)
  .catch(error => console.log(error.message));`, 'Summary: ORDER-101 50\nWallet: 50', 2174)
], [
  ['Who supplies resolve and reject, and when does the executor run?', 'The Promise constructor supplies them and invokes the executor synchronously.'],
  ['Does reject(error) exit the executor?', 'No. Use return or an appropriate branch to stop subsequent work.'],
  ['Why can a then handler receive undefined after a catch?', 'The catch handled the rejection and returned normally without a value, fulfilling the next promise with undefined.'],
  ['How do you preserve a failure instead of recovering?', 'Throw the error or return a rejected promise. A later catch can then handle it.'],
  ['Can a promise be resolved but still pending?', 'Yes. Resolving with a pending promise adopts its outcome without settling immediately.'],
  ['Homework variation: what logs when the cart is empty?', 'Only Empty cart. The payment, summary, and wallet fulfillment handlers are skipped.']
]);

lesson('s2ep4', '6nv3qy3oNkc', [
  section('An async function always returns a promise',
    `<p>The first example adds <code>async</code> before a function that returns a string. Calling it gives you a promise, not that string directly. A returned ordinary value becomes its fulfillment value; no explicit return means fulfillment with <code>undefined</code>. A thrown error becomes rejection.</p><p>The body still begins executing synchronously. Async does not mean “run this whole function on another thread,” and it does not make a large CPU-bound loop nonblocking.</p>`,
    `async function getData() {
  return 'Namaste';
}
const result = getData();
console.log(result instanceof Promise);
result.then(value => console.log(value));
console.log('caller continues');`, 'true\ncaller continues\nNamaste', 68),
  section('Returning a promise adopts its result, not its identity',
    `<p>When an async function returns an existing promise, its caller observes that promise’s eventual outcome through the async function’s own returned promise. The value is not exposed as a nested promise that needs two ordinary awaits.</p><p>However, the promise objects are distinct. This is a useful precision when reading the lesson’s “return it as it is” explanation: the outcome is adopted, but reference equality is not preserved.</p>`,
    `const p = Promise.resolve('ready');
async function getData() { return p; }
const returned = getData();
console.log(returned === p);
returned.then(value => console.log(value));`, 'false\nready', 368),
  section('Then and await place the following statements differently',
    `<p>Calling <code>p.then(handler)</code> registers a handler and lets the surrounding function continue. <code>await p</code> suspends the current async function’s continuation. Its next statement runs only after that await completes successfully; rejection throws at the await expression.</p><p>Compare the two functions below. The “then path continues” log does not depend on the result. The “await path continues” log does. Both approaches can express the same dependency if the dependent code is placed inside the then handler.</p>`,
    `const p = new Promise(resolve => setTimeout(() => resolve('ready'), 30));
function withThen() {
  p.then(value => console.log('then:', value));
  console.log('then path continues');
}
async function withAwait() {
  const value = await p;
  console.log('await:', value);
  console.log('await path continues');
}
withThen();
withAwait();
console.log('outside both');`, 'then path continues\noutside both\nthen: ready\nawait: ready\nawait path continues', 928),
  section('Awaiting one promise twice does not repeat the operation',
    `<p>The video awaits the same delayed promise twice. A promise is a handle to one outcome, not an instruction to rerun the operation. Once the first await receives the result, the second await sees that same result; it does not start the original timer again.</p><p>Even an await of an already fulfilled promise yields before continuing. The two result logs below occur close together after the single timer, but in separate continuations.</p>`,
    `const p = new Promise(resolve => {
  console.log('operation started');
  setTimeout(() => resolve('done'), 30);
});
async function handle() {
  console.log('Hello');
  console.log(await p);
  console.log(await p);
}
handle();`, 'operation started\nHello\ndone\ndone', 1504),
  section('Two promises: the slower first await',
    `<p>This is the video’s crucial timing case. Both timers are registered before <code>handle</code> runs. P1 takes 10 seconds and P2 takes 5 seconds. The function first awaits P1, so P2 settling at 5 seconds does not move execution past that first await. At about 10 seconds P1 logs, then P2 is already fulfilled and logs in the next continuation.</p><p>It is not 10 + 5 seconds: P2’s operation was already underway. The short runnable version preserves the ratio with 100 ms and 50 ms. Timings are illustrative; the event loop may introduce additional delay.</p>`,
    `const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
const p1 = delay(100, 'P1');
const p2 = delay(50, 'P2');
async function handle() {
  console.log('Hello');
  console.log(await p1);
  console.log(await p2);
}
handle();`, 'Hello\nP1\nP2', 1630),
  section('Reverse the durations, then change when work starts',
    `<p>Now P1 takes 5 seconds and P2 takes 10, with both started at time zero. P1 logs around 5 seconds; P2 logs around 10 seconds from the original start, not 15. The function does not wait for every promise before its first log; it waits at each await in program order.</p><p>A different program creates the second promise only after the first await. That really is sequential work. The second function below runs after the first demonstration completes, so its two 30 ms waits add up to roughly 60 ms.</p>`,
    `const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
async function alreadyStarted() {
  const p1 = delay(50, 'P1');
  const p2 = delay(100, 'P2');
  console.log(await p1);
  console.log(await p2);
}
async function startSequentially() {
  console.log(await delay(30, 'first'));
  console.log(await delay(30, 'second'));
}
alreadyStarted().then(startSequentially);`, 'P1\nP2\nfirst\nsecond', 1787),
  section('What suspension means for the call stack',
    `<p>Before the first await, the function runs normally on the stack. At await, it suspends and retains the state needed to resume, while control returns to its caller. It is not sitting on the stack in a busy loop. When the awaited outcome is available, the continuation is scheduled as promise-related microtask work.</p><p>In the debugger, place breakpoints before the first await and after each await. Resume execution between them and inspect the call stack. Do not infer exact timer durations while paused; debugger pauses themselves affect timing. In the small example, awaiting a plain value also yields.</p>`,
    `async function example() {
  console.log('A');
  await 42;
  console.log('C');
}
example();
console.log('B');`, 'A\nB\nC', 1968),
  section('Fetch requires two separate asynchronous steps',
    `<p>The real-world demonstration fetches a GitHub user. First await the response, then await reading and parsing its body with <code>response.json()</code>. The first step yields a <code>Response</code>; the second yields a JavaScript value parsed from JSON. Omitting the second await leaves a promise where you expected user data.</p><p>Check <code>response.ok</code>: an HTTP error response such as 404 can still fulfill the fetch promise. Network failures can reject fetch, and malformed JSON can reject body parsing. The output here depends on the live service.</p>`,
    `async function loadUser() {
  const response = await fetch('https://api.github.com/users/akshaymarch7');
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const user = await response.json();
  return user.login;
}
loadUser()
  .then(login => console.log(login))
  .catch(error => console.log('Unable to load user:', error.message));`, 'The returned username on success, or a handled error message.', 2903),
  section('Handle errors inside the function or at its caller',
    `<p>Wrap an awaited operation in <code>try/catch</code> to handle its rejection locally. If you leave it unhandled inside the async function, that function’s returned promise rejects, and its caller can attach <code>catch</code>. These approaches use the same underlying promise outcomes.</p><p>A surrounding synchronous try/catch does not catch a later rejection from a promise you merely started. You must await it inside the try, or return it to a caller that handles it. Also distinguish <code>return promise</code> from <code>return await promise</code> inside a local try: the latter lets that local catch handle the rejection.</p>`,
    `async function localRecovery() {
  try {
    await Promise.reject(new Error('Offline'));
  } catch (error) {
    console.log(error.message);
    return 'cached result';
  }
}
async function callerHandles() {
  throw new Error('No fallback');
}
localRecovery()
  .then(value => console.log(value))
  .then(() => callerHandles())
  .catch(error => console.log(error.message));`, 'Offline\ncached result\nNo fallback', 3488),
  section('Independent work, top-level await, and the interview explanation',
    `<p>For independent operations, start them together and connect them with a combinator: <code>const [a, b] = await Promise.all([loadA(), loadB()])</code>. Awaiting two calls one after another can unnecessarily serialize them. Promise.all also attaches handlers to both promptly; separately awaiting a slow promise before a fast-rejecting one can leave the second rejection temporarily unhandled.</p><p>Await is valid inside async functions and at the top level of JavaScript modules; a normal nested function does not become async just because its parent is async. Async/await is syntax for working with promises, not a competing replacement for promises or an automatic performance optimization.</p><p>For an interview, explain the returned promise, the synchronous prefix, suspension, resumption, and rejection. Then trace both duration orders above. That demonstrates understanding more clearly than saying “JavaScript waits.”</p>`, '', '', 3760)
], [
  ['What does an async function with no return statement fulfill with?', 'undefined. It still returns a promise.'],
  ['P1 takes 10 seconds, P2 takes 5, both start now, and you await P1 then P2. When do their values log?', 'Both log around 10 seconds, in P1 then P2 order, with separate await continuations. P2 already finished while the function was awaiting P1.'],
  ['What changes when the second operation starts only after the first await?', 'The operations become sequential; their durations roughly add together.'],
  ['Does await of a fulfilled promise continue synchronously?', 'No. The continuation runs asynchronously as microtask work.'],
  ['Why does fetching JSON usually need two awaits?', 'One waits for the Response; the other waits for the body to be read and parsed.'],
  ['Will try { asyncFunction(); } catch (...) catch a rejection from that function?', 'No. Await the returned promise inside an async try block, or attach a rejection handler to it.']
]);

lesson('s2ep5', 'DlTVt1rZjIo', [
  section('The shared contract: combine outcomes',
    `<p>The episode considers several independent API calls and asks how to combine them. Each of the four combinators accepts an iterable, commonly an array, and returns a promise. You consume that returned promise with <code>then/catch</code> or await.</p><p>Creating the input promises or calling the APIs starts their work; a combinator observes the outcomes. Passing functions such as <code>[loadA, loadB]</code> does not invoke them. Use <code>[loadA(), loadB()]</code> when you want those operations started. Concurrent pending operations do not mean their JavaScript callbacks execute simultaneously on one thread.</p>`, '', '', 50),
  section('Promise.all: every value, in input order',
    `<p>The video’s initial example gives P1 a 3-second delay, P2 1 second, and P3 2 seconds. With all successful, the result becomes available after the slowest one, about 3 seconds, and contains <code>[P1 value, P2 value, P3 value]</code>. Completion order does not rearrange the result.</p><p>The scaled example below uses 30, 10, and 20 ms. It logs the array as JSON so the exact order is easy to compare.</p>`,
    `const later = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
const p1 = later(30, 'P1');
const p2 = later(10, 'P2');
const p3 = later(20, 'P3');
Promise.all([p1, p2, p3])
  .then(values => console.log(JSON.stringify(values)))
  .catch(error => console.log(error.message));`, '["P1","P2","P3"]', 2049),
  section('Promise.all failure: reject early, do not cancel the rest',
    `<p>If P2 rejects at 1 second, the combined promise rejects with that reason without waiting for P1 at 3 seconds. If P2 succeeds but P3 rejects at 2 seconds, rejection occurs then. “First rejection” means first observed in time, not lowest array index.</p><p>The other operations continue. The explicit “finished” log below demonstrates that fail-fast is not cancellation or rollback. A promise has no general cancel method; cancellation of underlying work requires an API that supports it, such as abortable fetch.</p>`,
    `const p1 = new Promise(resolve => setTimeout(() => {
  console.log('P1 finished');
  resolve('P1');
}, 30));
const p2 = new Promise((resolve, reject) => setTimeout(() => reject(new Error('P2 failed')), 10));
Promise.all([p1, p2])
  .then(values => console.log(values))
  .catch(error => console.log(error.message));`, 'P2 failed\nP1 finished', 372),
  section('Promise.allSettled: inspect every outcome',
    `<p>Use this when you need a report of all successes and failures. It waits for every input to settle, even when one fails early. Its fulfillment value is an array in input order, with a record per input: <code>{status: 'fulfilled', value}</code> or <code>{status: 'rejected', reason}</code>.</p><p>It returns records even when every input succeeds, unlike all’s array of raw values. For example, independent dashboard cards can show successful data alongside a failed card. No combinator is universally the safest choice; choose the result contract your application needs.</p>`,
    `const later = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
const fail = (ms, reason) => new Promise((resolve, reject) => setTimeout(() => reject(reason), ms));
Promise.allSettled([later(30, 'P1'), fail(10, 'P2 failed'), later(20, 'P3')])
  .then(results => console.log(JSON.stringify(results)));`, '[{"status":"fulfilled","value":"P1"},{"status":"rejected","reason":"P2 failed"},{"status":"fulfilled","value":"P3"}]', 723),
  section('Promise.race: the first settlement wins',
    `<p>Race adopts the first input outcome it observes, whether fulfillment or rejection. In the 3/1/2-second all-success case, P2 wins with one value, not an array. Change P2 to 5 seconds and let P3 reject at 2 seconds: the race rejects with P3’s reason.</p><p>A later success cannot replace the rejection. Think of “first settled,” not “first successful.” Each run below creates fresh promises so it is a new race.</p>`,
    `const later = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
const fail = (ms, reason) => new Promise((resolve, reject) => setTimeout(() => reject(reason), ms));
async function demo() {
  console.log(await Promise.race([later(30, 'P1'), later(10, 'P2'), later(20, 'P3')]));
  try {
    await Promise.race([later(30, 'P1'), later(50, 'P2'), fail(20, 'P3 failed')]);
  } catch (reason) {
    console.log(reason);
  }
}
demo();`, 'P2\nP3 failed', 1009),
  section('Promise.any: the first fulfillment wins',
    `<p>Any waits for a successful input. Earlier rejections do not make the combined promise reject while another input could still fulfill. With P3 failing at 2 seconds and P1 succeeding at 3, it fulfills with P1’s value. If P1 also fails, P2 can still win at 5 seconds.</p><p>That makes it useful for equivalent alternative sources, where one success is enough. It is not a tool for collecting every successful result; use allSettled and inspect its records for that.</p>`,
    `const later = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
const fail = (ms, reason) => new Promise((resolve, reject) => setTimeout(() => reject(reason), ms));
Promise.any([fail(30, 'P1 failed'), later(50, 'P2'), fail(20, 'P3 failed')])
  .then(value => console.log(value))
  .catch(error => console.log(error.errors));`, 'P2', 2988),
  section('When every candidate fails: AggregateError',
    `<p>If every input rejects, any rejects with an <code>AggregateError</code>. The error itself is not an array: its <code>errors</code> property contains the individual reasons in input order. The promise cannot conclude that every input failed until the last remaining one rejects.</p><p>For the lesson’s P3-at-2, P1-at-3, P2-at-5 example, failure is reported at about 5 seconds, but the reasons remain ordered P1, P2, P3. Browser wording for the error message can vary, so learn the error type and its <code>errors</code> property rather than a console’s exact message.</p>`,
    `const fail = (ms, reason) => new Promise((resolve, reject) => setTimeout(() => reject(reason), ms));
Promise.any([fail(30, 'P1 failed'), fail(50, 'P2 failed'), fail(20, 'P3 failed')])
  .catch(error => {
    console.log(error.name);
    console.log(JSON.stringify(error.errors));
  });`, 'AggregateError\n["P1 failed","P2 failed","P3 failed"]', 3136),
  section('Compare the four contracts',
    `<div class="table-scroll"><table class="study-table"><caption>Assume valid inputs; times are measured from operation start.</caption><thead><tr><th>API</th><th>Fulfillment</th><th>Rejection</th></tr></thead><tbody><tr><td>all</td><td>All fulfill; array of values in input order</td><td>First observed rejection reason</td></tr><tr><td>allSettled</td><td>All settle; array of outcome records in input order</td><td>Input rejections become records</td></tr><tr><td>race</td><td>First settlement is fulfillment; that value</td><td>First settlement is rejection; that reason</td></tr><tr><td>any</td><td>First fulfillment; that value</td><td>All reject; AggregateError with input-ordered reasons</td></tr></tbody></table></div><p><b>Settled</b> includes fulfillment and rejection. <b>Resolved</b> can also describe a promise locked to a still-pending promise’s outcome. For precise explanations, say “first fulfillment” for any and “first settlement” for race.</p>`, '', '', 2720),
  section('Added practice: empty, plain-value, and never-settling inputs',
    `<p>Empty input exposes the different contracts: all and allSettled fulfill with empty arrays; any rejects with an AggregateError whose errors array is empty; race stays pending. Handlers still run asynchronously even for an already-settled result. Plain values are accepted as fulfilled inputs; functions are values too, not automatically invoked.</p><p>If an input stays pending forever, allSettled waits forever; all also waits unless another input rejects. Race and any can still finish if another input supplies the required outcome. Invalid iterables can reject, so “allSettled never rejects” is too broad.</p>`,
    `async function emptyCases() {
  console.log(JSON.stringify(await Promise.all([])));
  console.log(JSON.stringify(await Promise.allSettled([])));
  try { await Promise.any([]); }
  catch (error) { console.log(error.name, error.errors.length); }
  const pending = Promise.race([]);
  const result = await Promise.race([
    pending,
    new Promise(resolve => setTimeout(() => resolve('still pending'), 10))
  ]);
  console.log(result);
  console.log(JSON.stringify(await Promise.all([7, Promise.resolve(8)])));
}
emptyCases();`, '[]\n[]\nAggregateError 0\nstill pending\n[7,8]'),
  section('Practice the failure matrix',
    `<p>Use fresh P1/P2/P3 promises for each experiment. Predict the result type, value or reason, and earliest completion time before running it. Start with all success at 3/1/2 seconds. Then reject P2; then make P2 succeed and reject P3; then reject all three. Compare all four combinators for every case.</p><p>Changing only the combinator while reusing promises that already settled is a different experiment. The original elapsed delays do not run again. A timeout made with race also only changes which outcome you observe; it does not by itself abort the losing operation.</p>`, '', '', 2484)
], [
  ['All succeed at 3, 1, and 2 seconds. What does all return, and when?', 'Its returned promise fulfills around 3 seconds with an array of values in P1, P2, P3 input order.'],
  ['P2 fails at 1 second. Do all and allSettled finish together?', 'No. all rejects around 1 second. allSettled waits until every input has settled and returns outcome records.'],
  ['The fastest input rejects. How do race and any differ?', 'race rejects with that reason. any keeps waiting for a fulfillment, rejecting only if every input rejects.'],
  ['Where are Promise.any’s individual rejection reasons?', 'On AggregateError.errors, in input order rather than rejection-time order.'],
  ['Does Promise.all([loadA, loadB]) call those functions?', 'No. It treats them as ordinary values. Call them explicitly to start work: Promise.all([loadA(), loadB()]).'],
  ['Which empty-input combinator remains pending?', 'Promise.race([]).'],
  ['Does a failed all or a completed race cancel the other operations?', 'No. Cancellation must be implemented through the underlying operation’s API if it supports it.']
]);

lesson('s2ep6', '9T4z98JcHR0', [
  section('Start with the environment and the kind of function',
    `<p>The episode changes where <code>this</code> appears: top level, ordinary function, object method, arrow function, nested arrow, and DOM handler. Do not assign it one universal value. For an ordinary unbound function, inspect the call expression. For an arrow, find the surrounding <code>this</code> binding it inherits.</p><p>The browser examples in the lesson use a classic script. Top-level <code>this</code> there is <code>window</code>, including in a strict classic script. At the top level of an ES module it is <code>undefined</code>. A Node.js CommonJS file has a module wrapper, so its top-level this is not the Node global object. <code>globalThis</code> names the global object independently of these differences.</p>`,
    `// Run in a browser classic script, not an ES module.
console.log(this === window);
console.log(globalThis === window);`, 'true\ntrue', 166),
  section('A plain function call: strict and non-strict',
    `<p>For <code>fn()</code>, no object is supplied as the receiver. A strict ordinary function keeps <code>this</code> as undefined. A non-strict ordinary function substitutes its global object when the supplied receiver is null or undefined. This is the “this substitution” discussed in the video.</p><p>Strictness belongs to the function’s code, not simply to the line that calls it. Modules are strict. The example below must be run as a non-module script so that the first function is actually non-strict; the second explicitly opts into strict mode.</p>`,
    `// Classic script without a top-level 'use strict'.
function loose() { return this; }
function strict() { 'use strict'; return this; }
console.log(loose() === globalThis);
console.log(strict() === undefined);
console.log(loose.call(null) === globalThis);
console.log(strict.call(null) === null);`, 'true\ntrue\ntrue\ntrue', 398),
  section('The same function, a different call expression',
    `<p>The video compares <code>x()</code> with <code>window.x()</code>. The second has an explicit receiver: window. Strict mode does not erase an explicitly supplied receiver. In a classic script, a suitable top-level function declaration is available as a global-object property; that assumption does not hold for every declaration or module.</p><p>Using a small object makes the same distinction portable. The function below was declared separately from the object, yet <code>holder.x()</code> receives holder as this. Where the ordinary function was written does not permanently bind it to an object.</p>`,
    `function x() { 'use strict'; return this; }
const holder = { x };
console.log(x() === undefined);
console.log(holder.x() === holder);`, 'true\ntrue', 775),
  section('Methods and detached functions',
    `<p>A function stored on an object can be called as a method. In <code>obj.read()</code>, the receiver is obj, so <code>this.value</code> reads obj’s value. Assigning the function to another object does not copy the original receiver with it.</p><p>Extracting the method and calling it as <code>detached()</code> loses that method-call receiver. In the strict example it becomes undefined. This matters when passing object methods as callbacks: passing a function value does not necessarily preserve its original object.</p>`,
    `'use strict';
const obj = { value: 10, read() { return this; } };
const other = { value: 20, read: obj.read };
const detached = obj.read;
console.log(obj.read().value);
console.log(other.read().value);
console.log(detached() === undefined);`, '10\n20\ntrue', 1021),
  section('Borrow a method with call',
    `<p>The video gives one student a printName method and another student only a name. The second object cannot call a method it does not have. Instead, retrieve the method from the first object and invoke it with the second as its receiver using <code>call</code>.</p><p>This reuses behavior without adding a method to the second object. The arguments after the receiver become ordinary function arguments; <code>this</code> is a separate part of the call.</p>`,
    `const student = {
  name: 'Asha',
  printName(city) { console.log(this.name, city); }
};
const student2 = { name: 'Mira' };
student.printName('Delhi');
student.printName.call(student2, 'Pune');
console.log(Object.hasOwn(student2, 'printName'));`, 'Asha Delhi\nMira Pune\nfalse', 1222),
  section('Complete the call, apply, bind homework',
    `<p>The episode demonstrates call and asks you to study apply and bind. Call invokes immediately with separate arguments. Apply invokes immediately with an array-like argument list. Bind creates a new function for later invocation, remembering a receiver and optionally some initial arguments.</p><p>Binding does not mutate the original function. For an ordinary call of the bound function, a later call/apply cannot replace the bound receiver. Arrow functions have no own this to override. Constructor calls with <code>new</code> have separate rules; this episode’s main examples concern ordinary calls.</p>`,
    `function describe(city, role) {
  return this.name + ' / ' + city + ' / ' + role;
}
const person = { name: 'Asha' };
console.log(describe.call(person, 'Delhi', 'developer'));
console.log(describe.apply(person, ['Pune', 'mentor']));
const bound = describe.bind(person, 'Mumbai');
console.log(bound('student'));
console.log(bound.call({ name: 'Other' }, 'student'));`, 'Asha / Delhi / developer\nAsha / Pune / mentor\nAsha / Mumbai / student\nAsha / Mumbai / student'),
  section('An arrow property does not acquire the object as this',
    `<p>An arrow does not create its own this binding. An object literal does not create a this binding either. An arrow written as a property value therefore uses the surrounding context’s this, not the object that happens to contain the property.</p><p>Instead of depending on a browser’s global name property, the following example creates the object inside a function with an explicit receiver. The arrow retains that surrounding receiver; even call cannot change it. The regular method uses the receiver supplied by its own call.</p>`,
    `function makeObject() {
  return {
    name: 'object',
    arrow: () => this.name,
    regular() { return this.name; }
  };
}
const obj = makeObject.call({ name: 'enclosing' });
console.log(obj.arrow());
console.log(obj.arrow.call({ name: 'attempted override' }));
console.log(obj.regular());`, 'enclosing\nenclosing\nobject', 1669),
  section('A nested arrow captures the method invocation’s this',
    `<p>The video’s next example puts an arrow inside an ordinary method. This time the enclosing context is the method invocation. When invoked as <code>obj.method()</code>, the method receives obj and its nested arrow uses that same this.</p><p>The arrow can keep using it after the method returns. A regular nested function would have its own call-dependent this instead. The return below makes that contrast visible without relying on timer-specific receiver behavior.</p>`,
    `'use strict';
const obj = {
  value: 20,
  makeReaders() {
    return {
      arrow: () => this.value,
      regular: function () { return this; }
    };
  }
};
const readers = obj.makeReaders();
const arrow = readers.arrow;
const regular = readers.regular;
console.log(arrow());
console.log(regular() === undefined);
console.log(readers.regular() === readers);`, '20\ntrue\ntrue', 2011),
  section('DOM handlers: the element handling the event',
    `<p>The lesson uses an inline button handler: <code>&lt;button onclick="alert(this.tagName)"&gt;Click me&lt;/button&gt;</code>. There, this refers to the button, so the alert displays BUTTON. An ordinary function registered through addEventListener similarly receives the current listener target as this.</p><p>Do not confuse the listener target with <code>event.target</code>, which may be a clicked child. An arrow listener retains its surrounding this; read <code>event.currentTarget</code> when you want the element handling the event regardless of function kind. This runnable browser example creates a button and removes it after the demonstration.</p>`,
    `const button = document.createElement('button');
button.textContent = 'Click me';
document.body.append(button);
button.addEventListener('click', function (event) {
  console.log(this === button);
  console.log(this === event.currentTarget);
  console.log(this.tagName);
});
button.click();
button.remove();`, 'true\ntrue\nBUTTON', 2523),
  section('A decision process for output questions',
    `<p>First establish whether the code is a classic script, module, or another environment. Next identify the function: arrow, ordinary, or bound. For an arrow, find the enclosing this binding. For an ordinary unbound function, inspect the actual call: method, plain call, call/apply, or constructor invocation. Apply non-strict substitution only when it belongs.</p><p>The video leaves classes and constructors for a separate discussion. As an added boundary, <code>new</code> ordinarily supplies a newly created instance as this, and arrows cannot be constructors. Do not stretch the “object before the dot” shortcut into a universal rule that covers arrows, bound functions, and constructors.</p>`, '', '', 2705)
], [
  ['In strict mode, does every function invocation have undefined this?', 'No. A plain call does; method calls and call/apply can supply an explicit receiver.'],
  ['Why can obj.method() and const f = obj.method; f(); behave differently?', 'The second call no longer has obj as its receiver. Retrieving the function did not bind it.'],
  ['Does putting an arrow inside an object literal bind this to that object?', 'No. The arrow inherits the surrounding this binding; the object literal creates no such binding.'],
  ['Why does an arrow inside a regular method often see the method’s object?', 'It captures this from that particular method invocation. If the method is called with another receiver, the arrow captures that receiver instead.'],
  ['Which of call, apply, and bind waits until a later invocation to run the target function?', 'bind returns a new function without invoking the target immediately. call and apply invoke immediately.'],
  ['In an ordinary DOM listener, is this necessarily event.target?', 'No. It matches event.currentTarget, the listener target. event.target may be a descendant.']
]);

lesson('s2react', '--VcGI9iPvw', [
  section('1. Variables and scope',
    `<p>This playlist video is a nine-topic roadmap before React, rather than a React implementation lesson. HTML and CSS remain prerequisites too. For JavaScript, start with var, let, const, scope, initialization, and hoisting. Revisit Season 1’s scope and TDZ guides until you can predict their examples.</p><p>A const binding cannot be reassigned, but its object may still be mutated. The added example demonstrates that distinction; it is useful when later learning how to construct new state objects.</p>`,
    `const user = { name: 'Asha' };
user.name = 'Mira';
console.log(user.name);
// user = {}; // TypeError if executed.`, 'Mira', 85),
  section('2. Functions, arrows, and higher-order functions',
    `<p>Be comfortable declaring, passing, and returning functions. Know the difference between passing a function and invoking it now. Read both expression-bodied arrows and block-bodied arrows. Functions are central to React components and event handlers, but these rules come from JavaScript.</p><p>The added example returns another function. The inner arrow closes over the multiplier, and map supplies each array element as its argument.</p>`,
    `const multiplyBy = factor => value => value * factor;
const double = multiplyBy(2);
console.log(JSON.stringify([1, 2, 3].map(double)));
console.log((value => { value * 2; })(3));`, '[2,4,6]\nundefined', 113),
  section('3. Arrays, objects, destructuring, rest, and spread',
    `<p>Destructuring extracts fields or positions into bindings. Rest collects remaining entries; spread expands entries into another array or object. Practise both arrays and objects, because application data commonly contains nested combinations of them.</p><p>A spread copy is shallow. Here changing the copied top-level name does not affect the original name, but both objects still point at the same nested settings object. To change a nested branch independently, copy that branch as well.</p>`,
    `const original = { name: 'Asha', settings: { theme: 'light' } };
const { name, ...rest } = original;
const copy = { ...original, name: 'Mira' };
copy.settings.theme = 'dark';
const [first, ...others] = [10, 20, 30];
console.log(name, copy.name, original.settings.theme);
console.log(first, JSON.stringify(others));
console.log(rest.settings === original.settings);`, 'Asha Mira dark\n10 [20,30]\ntrue', 158),
  section('4. Conditions, ternaries, short-circuiting, and optional chaining',
    `<p>Know if/else, <code>condition ? a : b</code>, <code>&amp;&amp;</code>, <code>||</code>, and optional chaining. The logical operators return operands, not necessarily booleans. That matters when an expression is later used as a rendered value.</p><p>Optional chaining stops a property-access chain when the receiver is null or undefined. The added <code>??</code> example supplies a default only for null/undefined, whereas <code>||</code> also replaces zero, false, and an empty string.</p>`,
    `const count = 0;
const user = null;
console.log(count && 'Has items');
console.log(count || 10);
console.log(count ?? 10);
console.log(user?.profile?.name ?? 'Guest');
console.log(count > 0 ? 'Full' : 'Empty');`, '0\n10\n0\nGuest\nEmpty', 208),
  section('5. Map, filter, reduce, and sort',
    `<p>Map builds transformed elements, filter selects existing ones, and reduce builds an accumulated result. The roadmap also includes sort. Default array sorting compares string forms; provide a comparator for numeric order. Sort changes the original array, so copy first when you need to preserve it.</p><p>Before beginning React, practise composing transformations on object arrays rather than only numbers. The example below combines numeric sorting with selecting and totaling values.</p>`,
    `const values = [10, 2, 30];
const sorted = [...values].sort((a, b) => a - b);
const total = values.filter(n => n >= 10).reduce((sum, n) => sum + n, 0);
console.log(JSON.stringify(sorted));
console.log(JSON.stringify(values));
console.log(total);`, '[2,10,30]\n[10,2,30]\n40', 250),
  section('6. Events and timers',
    `<p>The video recommends understanding click, keyboard, and mouse events, plus capturing and bubbling. An event can travel through ancestors during capture and, for bubbling events, back through ancestors after reaching its target. The target and currentTarget need not be the same element.</p><p>Know how to register and remove listeners, and how setTimeout, setInterval, clearTimeout, and clearInterval relate. A timer callback runs later when eligible; it does not block the current script. This short example cancels an interval after three ticks so it does not continue indefinitely.</p>`,
    `let ticks = 0;
const timer = setInterval(() => {
  console.log(++ticks);
  if (ticks === 3) clearInterval(timer);
}, 20);`, '1\n2\n3', 290),
  section('7. Callbacks, promises, and fetch',
    `<p>Be able to explain callback hell, a promise’s outcomes, chaining, and combinators. Know that fetch’s fulfillment is a Response and that body parsing is another asynchronous operation. Practise success and failure paths, not only a happy-path API call.</p><p>Use the detailed Season 2 lessons to implement a dependent chain and to compare all, allSettled, race, and any. Promises are widely used for modern APIs, although not every possible network API uses promises.</p>`, '', '', 368),
  section('8. Async/await',
    `<p>Translate a simple promise chain into an async function, explain where execution suspends, and distinguish sequential work from already-started operations. Async/await handles promises; it does not remove them.</p><p>Try the two-promise timing cases in Episode 4 without running the code first. If you can explain why the same two durations sometimes add and sometimes overlap, you are ready to reason about ordinary data-loading code.</p>`, '', '', 435),
  section('9. Try/catch and meaningful error handling',
    `<p>The final topic is handling errors. Practise catching exceptions, handling rejected awaited operations, and choosing whether to recover or propagate. Know that catching and ignoring an error can make subsequent code appear successful with missing data.</p><p>The added exercise uses invalid JSON so it works without a network. The fallback is explicit. For a real application, choose a fallback only when it is valid for the caller; otherwise propagate the error and show an appropriate failure state.</p>`,
    `function readSettings(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log(error.name);
    return { theme: 'light' };
  }
}
console.log(readSettings('{broken').theme);`, 'SyntaxError\nlight', 471)
], [
  ['Can you name the nine preparation topics?', 'Variables; functions; arrays/objects; conditions; array methods; events/timers; callbacks/promises; async/await; try/catch.'],
  ['Does object spread create independent nested objects?', 'No. It copies the top level; nested references remain shared unless you copy those branches too.'],
  ['Why can count && something evaluate to 0?', 'Logical AND returns the first falsy operand. It does not necessarily return a boolean.'],
  ['How do you sort numbers without mutating the original array?', 'Copy first, for example [...values].sort((a, b) => a - b).'],
  ['What practical exercise connects the async topics?', 'Load data, check the HTTP status, parse the body, transform the result, and handle errors. Explain the promise returned by every asynchronous step.']
]);

// Primary references supplement the creator’s videos and the added practice.
const S2_REFERENCES = {
  s2ep1: [['MDN: using promises', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises']],
  s2ep2: [['MDN: Promise', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise']],
  s2ep3: [['MDN: Promise constructor', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise'], ['MDN: finally', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally']],
  s2ep4: [['MDN: async functions', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'], ['MDN: using fetch', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch']],
  s2ep5: ['all','allSettled','race','any'].map(name => ['MDN: Promise.' + name, 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/' + name]),
  s2ep6: [['MDN: this', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'], ['MDN: bind', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind'], ['Creator: call, apply and bind', 'https://www.youtube.com/watch?v=75W8UPQ5l7k']],
  s2react: [['MDN: JavaScript Guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide']]
};
for (const [id, references] of Object.entries(S2_REFERENCES)) STUDY_GUIDES[id].references = references;
