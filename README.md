# Namaste JavaScript study notes

A static study companion for Akshay Saini’s Namaste JavaScript [Season 1](https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP) and [Season 2](https://www.youtube.com/playlist?list=PLlasXeu85E9eWOpw9jxHOQyGMRiBZ60aX) playlists.

## Study material

- **Season 1:** 19 detailed lesson guides with explanations, execution traces, worked examples, expected results, variations, video chapter links, and recall questions.
- **Season 2:** six detailed lessons on callbacks, promises, async/await, promise combinators, and `this`, plus the playlist’s nine-topic JavaScript-before-React guide. Includes checkout exercises, catch placement, timer timelines, success/failure cases, and receiver variations. The core lessons follow episode-number order (async/await before Promise APIs); the overview also links to the trailer.
- **Practice:** 75 interview questions across five topics, plus lesson-specific recall exercises.
- **Interview definitions:** 54 terms across all 26 lessons. Each one gives the sentence to say first, a plain-language expansion, an optional intuition, a small runnable example with its real output, and the follow-up questions an interviewer usually asks next. They appear at the top of every lesson and are searchable together in the **Glossary** (§ in the sidebar).

The guides are original explanations organized around the lessons, with additional practice and language/runtime precision. Examples explicitly say when they continue a preceding block. Run browser examples in a fresh classic script unless the example specifies another environment; intentionally invalid examples demonstrate errors.

## Files and preview

`index.html` contains the interface, lesson navigation, and interview bank. `study-guides.js` contains the Season 1 guides and shared guide helpers; `season2-guides.js` contains the Season 2 guides. `definitions.js` and `definitions.css` contain the interview definitions and the glossary; `lesson-visuals.js` and `lesson-visuals.css` contain the interactive concept models. Keep all of these files together when deploying, including to GitHub Pages. No build step or dependencies are required.

Open `index.html` directly, or run `python3 -m http.server 8765` and visit http://localhost:8765. Review progress and theme currently last for the open page session.

## Reference reading

Each core lesson links to its original video and relevant chapters. Language and runtime details also draw on primary documentation:

- [MDN: closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures), [let and the temporal dead zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide), [timers](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout), [listener cleanup](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)
- [MDN: map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [MDN: async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this), [memory management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management)
- [V8: Ignition](https://v8.dev/docs/ignition), [Maglev](https://v8.dev/blog/maglev), [Orinoco garbage collection](https://v8.dev/blog/trash-talk)

- [MDN: using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises), [Promise constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise), [finally](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally)
- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), [allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled), [race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), [any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [MDN: using fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

## Example checks

Run `node --test tests/season2-examples.test.cjs` with Node.js 22 or later. The checks execute displayed examples in isolated classic-script contexts, comparing their actual output with the notes. Fetch cases use controlled success, HTTP-error, network-error, and invalid-JSON responses. The DOM-listener example is browser-only.

`node --test tests/definitions.test.cjs` executes every non-browser definition example and compares its console output with the result shown on the page, and checks that each lesson with a guide has at least one definition.

### Interactive concept visuals

Seven lessons now include an “Explore the interactive visual” link:

- S1 episode 2: execution contexts, local bindings, and the call stack.
- S1 episode 7: lexical lookup versus caller relationships.
- S1 episode 10: retained closure state after an outer call returns.
- S1 episode 11: shared `var` versus per-iteration `let` bindings.
- S1 episode 15: synchronous work, promise microtasks, and timer callbacks.
- S2 episode 4: async-function suspension and resumption at `await`.
- S2 episode 5: a shared promise timeline comparing all four combinators, with selectable failures.

These are step-through teaching models with explicit states, highlighted code, keyboard-accessible controls, and live explanations. Promise time is simulated, not a wall-clock guarantee. They use no external libraries or background animation. The model follows [MDN's execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model), [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures), and [Promise reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Run all example, definition, and visual-model checks with `node --test tests/*.test.cjs`. The visual tests compare all eight rejection combinations at every time step against native Promise APIs, and execute the scope, closure, loop, event-loop, and await examples to verify their displayed output.
