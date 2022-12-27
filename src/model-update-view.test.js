import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createApp, useMsg } from "./model-update-view";

function ResetButton() {
  const msg = useMsg();
  return (
    <button type="button" onClick={() => msg("reset")}>
      Reset
    </button>
  );
}

const impl = {
  init: 0,
  update(model, action) {
    switch (action.type) {
      case "plus":
        return [model + 1, []];
      case "minus":
        return [model - 1, []];
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
        <h2>{model}</h2>
        <button type="button" onClick={() => msg("plus")}>
          +
        </button>
        <button type="button" onClick={() => msg("minus")}>
          -
        </button>
        <ResetButton />
      </div>
    );
  },
  subscriptions() {
    return [];
  },
};

test("starts up and displays initial model", async () => {
  const App = createApp(impl);
  render(<App />);

  expect(screen.getByRole("heading")).toHaveTextContent("0");
});

test("updates the state correctly, when interactions happen", async () => {
  const App = createApp(impl);
  render(<App />);

  fireEvent.click(screen.getByText("+"));
  expect(screen.getByRole("heading")).toHaveTextContent("1");
});

test("updates the state correctly, when multiple interactions happen", async () => {
  const App = createApp(impl);
  render(<App />);

  fireEvent.click(screen.getByText("+"));
  fireEvent.click(screen.getByText("Reset"));
  fireEvent.click(screen.getByText("+"));
  fireEvent.click(screen.getByText("+"));
  fireEvent.click(screen.getByText("+"));
  fireEvent.click(screen.getByText("-"));
  expect(screen.getByRole("heading")).toHaveTextContent("2");
});
