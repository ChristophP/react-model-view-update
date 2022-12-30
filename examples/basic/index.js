import React from "react";
import ReactDOM from "react-dom/client";
// eslint-disable import/no-unresolved
import { createApp, useSendMsg } from "../../src/model-update-view";

function documentClickSubscription(sendMsg) {
  const listener = () => sendMsg({ type: "documentClick" });
  document.addEventListener("click", listener);
  return () => {
    // return unsubscribe function
    document.removeEventListener("click", listener);
  };
}

function logEffect(text) {
  // eslint-disable-next-line no-console, no-unused-vars
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
