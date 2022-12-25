import React from "react";
import ReactDOM from "react-dom/client";
import { createApp, useMsg } from "../../src/model-update-view";

function documentClickSubscription(model, msg) {
  const listener = () => msg("documentClick");
  document.addEventListener("click", listener);
  return () => {
    // return unsubscribe function
    document.removeEventListener("click", listener);
  };
}

function logEffect(text) {
  return (msg) => console.log(text);
}

const App = createApp({
  init: 0,
  update(model, action) {
    switch (action.type) {
      case "plus":
        return [model + 1, [logEffect("plus")]];
      case "minus":
        return [model - 1, [logEffect("minus")]];
      case "reset":
        return [0, []];
      case "documentClick":
        return [model + 5, []];
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
    return false && model < 30 ? [documentClickSubscription] : [];
  },
});

function ResetButton() {
  const msg = useMsg();
  return <button onClick={() => msg("reset")}> Reset </button>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
