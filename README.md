# React Model-Update-View

A React microframework for pure state management and managed side effects. Inspired by the [Elm architecture](https://guide.elm-lang.org/architecture/), no Redux needed. No dependencies other than React itself.

This is currently a work in progress!

## Why?

React is univeral but leaves a lot of open questions regarding how to manage application state and side-effects.
For this reason a multitude of libraries like `redux`, `redux-thunk`, `redux-saga` etc have emerged, which all come with a dependency footprint, boiler plate code, and up front planning on which libraries to select.
Wouldn't it be nice to have a simple setup that works for (almost) all cases with a single dependency and minimal boiler plate?

## What is Model-Update-View?

This pattern (also known as the Elm architecture) breaks down an app into 4 main functions.

- **init**: An initial value for your state
- **update**: A function that gets messages, the current state and computes and returns a new state (reducer). Runs whenever events happen.
- **view**: A function that gets the model and a message dispatching function and returns some JSX.
- **subscriptions**: A function that sets up event listeners to events external to the application like timers, sockets, or clicks on the document and dispatches new messages. Runs whenever the state changes.

## Example usage

See the `examples/` folder.

```js
import React from "react";
import ReactDOM from "react-dom/client";
// eslint-disable import/no-unresolved
import { createApp, useSendMsg } from "../../src/model-update-view";

function documentClickSubscription(sendMsg) {
  const listener = () => sendMsg({ type: "documentClick"});
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
  init: 0,
  update(model, msg) {
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

## API

- `createApp({ init, update, view, subscriptions })`: Create an app. This function returns a React component you can use in your JSX as a top level element or child.
- `useSendMsg()`: A hook to get the `sendMsg()` function, to trigger `update()`. Think of `sendMsg()` like `dispatch()`.

