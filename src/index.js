import React from "react";
import { createApp } from "./model-update-view";

const app = createApp({
  init: 0,
  update: (model, action) => {
    switch (action.type) {
      case "plus":
        return model + 1;
      case "minus":
        return model - 1;
      default:
        return model;
    }
  },
  view(model, msg) {
    return (
      <div>
        <h2> {model}</h2>
        <button onClick={() => msg("plus")}> +</button>
        <button onClick={() => msg("minus")}> -</button>
      </div>
    );
  },
});

app.run(document.getElementById("root"));
