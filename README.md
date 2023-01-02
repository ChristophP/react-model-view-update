# React Model-Update-View

A React microframework for pure state management and managed side effects. Inspired by the [Elm architecture](https://guide.elm-lang.org/architecture/), no Redux needed. No dependencies other than React itself.

**This is currently in the beta phase! After gathering some feedback it will be bumped to stable soon.**

- ✅ **all-in-one:** State management and effect handling out of the box.
- ✅ **no redux libraries needed:** No redux, react-redux, redux-thunk, redux-sage, redux-loop etc needed.
- ✅ **zero dependencies:** Has no dependencies other than React itself.
- ✅ **lightweight:** The implementation is in a single file of ~1KB minified and a bit over ~100 lines of code including comments. (Check on [bundlephobia](https://bundlephobia.com/package/react-model-update-view))
- ✅ **typed:** This library ships with TypeScript Types.

## Why?

React is universally used, but leaves a lot of open questions regarding how to manage application state and side-effects.
For this reason a multitude of libraries like `redux`, `redux-thunk`, `redux-saga` etc have emerged, which all come with a dependency footprint, boiler plate code, and up front planning on which libraries to select.
Wouldn't it be nice to have a simple setup that works for (almost) all cases with a single dependency and minimal boiler plate?

So this library is for you if
- you like to have your application state and side-effects managed in a clean way
- you're tired of wiring together multiple (redux-)libraries
- wanna keep dependencies to a minimum
- keep your app simple as it grows

## What is Model-Update-View?

This pattern (also known as the Elm architecture) breaks down an app into 4 main functions.

function | description
---      |  ----    
**init** | A function which returns the initial value for your model and a list of effects. Runs once after your app renders for the first time.
**update** | A function that gets messages, the current model and computes and returns a new model (reducer) and a list of effects. Runs whenever events happen.
**view** |A function that gets the model and a message dispatching function and returns some JSX.
**subscriptions** | A function that sets up event listeners to events external to the application like timers, sockets, or clicks on the document and dispatches new messages. Runs whenever the model changes.

## Installing

```sh
npm i -D react-model-update-view
```

## Example usage

See the `examples/` folder.

```js
import React from "react";
import ReactDOM from "react-dom/client";
// eslint-disable import/no-unresolved
import { createApp, useSendMsg } from "react-model-update-view";

function documentClickSubscription(sendMsg) {
  const listener = () => sendMsg({ type: "documentClick" });
  document.addEventListener("click", listener);
  return () => {
    // return unsubscribe function
    document.removeEventListener("click", listener);
  };
}

function logEffect(text) {
  return (sendMsg) => console.log(text);
}

const App = createApp({
  init() {
    return [0, []];
  },
  update(msg, model) {
    console.log({ msg });
    switch (msg.type) {
      case "plus":
        return [model + 1, [logEffect("plus")]];
      case "minus":
        return [model - 1, [logEffect("minus")]];
      case "reset":
        return [0, []];
      case "documentClick":
        return [model + 5, []];
      default:
        throw new Error(`Unknown msg "${msg.type}"`);
    }
  },
  view(model, sendMsg) {
    return (
      <div>
        <h2> {model}</h2>
        <button type="button" onClick={() => sendMsg({ type: "plus" })}>
          +
        </button>
        <button type="button" onClick={() => sendMsg({ type: "minus" })}>
          -
        </button>
        <ResetButton />
      </div>
    );
  },
  subscriptions(model) {
    // listen to document clicks, unsubscribe if model is >= 30
    return model < 30 ? [documentClickSubscription] : [];
  },
});

function ResetButton() {
  const sendMsg = useSendMsg();
  return (
    <button type="button" onClick={() => sendMsg({ type: "reset" })}>
      Reset
    </button>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```
## FAQs

### What is `model`, `sendMsg` and `msg`?

If you're familiar with redux or React's `useReducer` hook, those are different names for things you already know.
- `model` -> `state`
- `msg` -> `action`
- `sendMsg()` -> `dispatch()`

They are conceptually the same thing. Feel free to use the names you are comfortable with in your app.

**Extra hint 💡**: `update()` would be similar to your `reducer()`. 😉

### Can I provide my own types for model and message?

Yes, `createApp` has a generic type signature. So you can use it like this in Typescript.

```js
const App = createApp<Model, Msg>({ init, update, view, subscriptions });
```

### Should't I keep my `update()` function free some side-effects?

Yes, absolutely. Returning the effects from `update()` doesn't violate this though, because `update()` simply returns them.
The effects a are executed by the framework NOT in the `update()` function itself. This makes it safe to run the `update()`
function and easy to test.

### Where can I see examples of effects and subscriptions?

Here are some effect examples and subscriptions examples.

### Can I still use local state?

Yes, everything in the `view()` function is still plain react, so [hooks](https://reactjs.org/docs/hooks-intro.html) etc are available.
We recommend to put all application state into the model and have it managed by `update()` as single source of truth.

However, there may be component state, that is UI based and not as important to your app as a whole, such as whether something is focused, 
or has been clicked before. Those are things where it's up to you to manage it as a local component state, but the general recommendation
is to keep that to a minimum.

### How can I avoid prop drilling?

Having to pass down values through a deep component hierarchy can be annoying and bloat your code.
You'll likely need to be able to trigger messages from many places in your app. To avoid having to pass around `sendMsg()` everywhere,
the `useSendMsg` hook will give you easy access to the message triggering function from anywhere (not needed in directly in `view()` though because
`view()` receives `sendMsg()` as the second argument)

There is no such hook for accessing the model, because usually with good model design, data is passed down to components quite naturally.
If you find yourself struggling with that, please open an issue.

### What about testing?

The functions are best tested in isolation.

#### `init() / update()`

It's best to run the init function and assert the expected model.
The effects

```js
// init
const [model, effects] = init();
expect(model).toEqual(expectedModel);

// update
const [newModel, effects] = update({ type: "someMsg" }, someModel);
expect(newModel).toEqual(expectedModel);
```

Effects are a bit harder to test, since they are not just plain input/output. For many testing the model is enough for others this propably requires mocking.

#### `view()`

To test the output of the view function you probably wanna use something like the [React Testing library](https://testing-library.com/docs/react-testing-library/intro/).

#### `subscriptions()`

Also a bit harder to test because this requires side-effects. This probably also requires mocking. If you keep the subscriptions simple you can probably get by without tests.

## API

For the complete docs check the API docs.

- `createApp({ init, update, view, subscriptions })`: Create an app. This function returns a React component you can use in your JSX as a top level element or child.
- `useSendMsg()`: A hook to get the `sendMsg()` function, to trigger `update()`. It's mainly for convenience, so you don't have to pass down `sendMsg()` in deep component hierarchies. Think of `sendMsg()` like `dispatch()`.

## Prior Art

Many languages, libraries and framworks have influenced this library. Here is a quick overview over the most relevant ones. Thanks to all ❤️ 
- The [Elm](https://elm-lang.org) programming language and its [Elm architecture](https://guide.elm-lang.org/architecture/)
- [Redux](https://redux.js.org/) as a state management solution
- [Redux loop](https://github.com/redux-loop/redux-loop): A redux middleware aiming to port Model-Update-View pattern to redux
- [React Tea Cup](https://github.com/vankeisb/react-tea-cup): A fantastic port of The Elm Architecture to React. It resembles Elm closely, comes with a full system of effects and subscriptions and has great docs. `react-model-update-view` tries to be minimal and focuses on the basics.
- [Hyperapp](https://github.com/jorgebucaran/hyperapp) is a tiny microframework that follows similar pattern
