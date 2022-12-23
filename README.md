# React Model-Update-View

A React microframework for pure state management and managed side effects. Inspired by the [Elm architecture](https://guide.elm-lang.org/architecture/), no Redux needed. No dependencies other than React itself.

This is currently a work in progress!

## Why?

React is univeral but leaves a lot of open questions regarding how to manage application state and side-effects.
For this reason a multitude of libraries like `redux`, `redux-thunk`, `redux-saga` etc have emerged, which all come with a dependency footprint, boiler plate code, and up front planning on which libraries to select.
Wouldn't it be nice to have a simple setup that works for (almost) all cases with a single dependency and minimal boiler plate?

## What is Model-Update-View?

This pattern (also known as the Elm architecture) breaks down an app into 4 main functions.

- **init**: A function that return the initial state
- **update**: A function that gets messages, the current state and computes and returns a new state (reducer). Runs whenever events happen.
- **view**: A function model, the current state and computes and returns a new state (reducer). Runs whenever the state changes.
- **subscriptions**: A function that sets up event listeners to events external to the application like timers, sockets, or clicks on the document and dispatches new messages. Runs whenever the state changes.

## Example usage

```js
import React from "react";
import { createApp, useMsg } from "./model-update-view";

function documentClickSubscription(model, msg) {
  const listener = () => msg("documentClick");
  document.addEventListener("click", listener);
  return () => {
    // return unsubscribe function
    document.removeEventListener("click", listener);
  };
}

const app = createApp({
  init: 0,
  update: (model, action) => {
    switch (action.type) {
      case "plus":
        return model + 1;
      case "minus":
        return model - 1;
      case "reset":
        return 0;
      case "documentClick":
        return model + 5;
      default:
        throw new Error(`Unknown action "${action.type}"`);
    }
  },
  view(model, msg) {
    return (
      <div>
        <h2> {model}</h2>
        <button onClick={() => msg("plus")}> +</button>
        <button onClick={() => msg("minus")}> -</button>
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
  const msg = useMsg();
  return <button onClick={() => msg("reset")}> Reset </button>;
}

app.run(document.getElementById("root"));
```

## API

- `createApp({ init, update, view, subscriptions })`: Create an app.
- `app.run(domNode)`: Render app into the passed DOM node.
- `app.kill()`: Destroy the app and remove any rendered parts and leftover subscriptions.
- `useMsg()`: A hook to get the `msg()` function, to trigger `update()`. Think of `msg()` like `dispatch()` but with an easier signature: `msg("msgName", optionalPayload)` is equivalent to `dispatch({ type: "msgName", payload: optionalPayload })`

