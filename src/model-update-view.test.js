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

describe("basic update", () => {
  test("starts up and displays initial model", async () => {
    const App = createApp(impl);
    render(<App />);

    expect(screen.getByRole("heading")).toHaveTextContent(impl.init.toString());
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
});

describe("effects", () => {
  test("runs an effect returned from the update function", async () => {
    const effectFn = jest.fn();
    const App = createApp({
      ...impl,
      update(model) {
        return [model, [effectFn]];
      },
    });
    render(<App />);

    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("+"));
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  test("runs multiple effects returned from the update function", async () => {
    const effectFn1 = jest.fn();
    const effectFn2 = jest.fn();
    const App = createApp({
      ...impl,
      update(model) {
        return [model, [effectFn1, effectFn2]];
      },
    });
    render(<App />);

    fireEvent.click(screen.getByText("+"));
    expect(effectFn1).toHaveBeenCalledTimes(1);
    expect(effectFn2).toHaveBeenCalledTimes(1);
  });
});

describe("subscriptions", () => {
  function documentClickSubscription(model, msg) {
    const listener = () => msg("documentClick");
    document.addEventListener("click", listener);
    return () => {
      // return unsubscribe function
      document.removeEventListener("click", listener);
    };
  }

  test("binds and unbinds subscriptions correctly", async () => {
    const App = createApp({
      ...impl,
      subscriptions(model) {
        return model < 5 ? [documentClickSubscription] : [];
      },
    });
    render(<App />);

    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("+"));
    expect(screen.getByRole("heading")).toHaveTextContent("7");
  });

  test("unbinds all subscriptions when component unmounts", () => {
    const update = jest.fn((model) => [model, []]);
    const App = createApp({
      ...impl,
      update,
      subscriptions() {
        return [documentClickSubscription];
      },
    });
    const { unmount } = render(<App />);
    expect(update).toHaveBeenCalledTimes(0);

    fireEvent.click(document.body);
    expect(update).toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.click(document.body);
    expect(update).toHaveBeenCalledTimes(1);
  });
});
