import React from "react";
import { createApp, useMsg } from "./model-update-view";

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
  subscriptions(model, msg) {
    return null;
  },
});

function ResetButton() {
  const msg = useMsg();
  return <button onClick={() => msg("reset")}> Reset </button>;
}

app.run(document.getElementById("root"));
