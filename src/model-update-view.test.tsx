import { render, fireEvent, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createApp, useSendMsg, Implementation, Sub, Effect, SendMsgFn } from "./model-update-view";

function ResetButton() {
  const sendMsg = useSendMsg();
  return (
    <button type="button" onClick={() => sendMsg({ type: "reset" })}>
      Reset
    </button>
  );
}

type Model = number;
type Msg = { type: string }; // TODO improve Msg type

const impl : Implementation<Model, Msg>  = {
  init() {
    return 0;
  },
  update(msg, model) {
    switch (msg.type) {
      case "plus":
        return [model + 1, []];
      case "minus":
        return [model - 1, []];
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
        <h2>{model}</h2>
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
  subscriptions() {
    return [];
  },
};

describe("init", () => {
  test("starts up and displays initial model", () => {
    const App = createApp<Model, Msg>(impl);
    render(<App />);

    expect(screen.getByRole("heading")).toHaveTextContent(
      impl.init().toString()
    );
  });
});

describe("update", () => {
  test("updates the state correctly, when interactions happen", () => {
    const App = createApp(impl);
    render(<App />);

    fireEvent.click(screen.getByText("+"));
    expect(screen.getByRole("heading")).toHaveTextContent("1");
  });

  test("updates the state correctly, when multiple interactions happen", () => {
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
  test("runs an effect returned from the update function", () => {
    const effectFn = jest.fn() as Effect<Msg>;
    const App = createApp({
      ...impl,
      update(msg, model) {
        return [model, [effectFn]];
      },
    });
    render(<App />);

    fireEvent.click(screen.getByText("+"));
    fireEvent.click(screen.getByText("+"));
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  test("runs multiple effects returned from the update function", () => {
    const effectFn1 = jest.fn();
    const effectFn2 = jest.fn();
    const App = createApp({
      ...impl,
      update(msg, model) {
        return [model, [effectFn1, effectFn2]];
      },
    });
    render(<App />);

    fireEvent.click(screen.getByText("+"));
    expect(effectFn1).toHaveBeenCalledTimes(1);
    expect(effectFn2).toHaveBeenCalledTimes(1);
  });
});

// describe("subscriptions", () => {
//   function documentClickSubscription(sendMsg : SendMsgFn) : Sub<Msg> {
//     const listener = () => sendMsg({ type: "documentClick" });
//     document.addEventListener("click", listener);
//     return () => {
//       // return unsubscribe function
//       document.removeEventListener("click", listener);
//     };
//   }
//
//   const eventTarget = new EventTarget();
//   function manualTriggerSubscription(sendMsg) {
//     const listener = (event) => {
//       sendMsg(event.detail);
//     };
//     eventTarget.addEventListener("trigger", listener);
//     return () => {
//       eventTarget.removeEventListener("trigger", listener);
//     };
//   }
//
//   test("binds and unbinds subscriptions correctly", () => {
//     const App = createApp({
//       ...impl,
//       subscriptions(model) {
//         return model < 5 ? [documentClickSubscription] : [];
//       },
//     });
//     render(<App />);
//
//     fireEvent.click(screen.getByText("+"));
//     fireEvent.click(screen.getByText("+"));
//     expect(screen.getByRole("heading")).toHaveTextContent("7");
//   });
//
//   test("unbinds all subscriptions when component unmounts", () => {
//     const update = jest.fn((model) => [model + 1, []]);
//     const App = createApp({
//       ...impl,
//       update,
//       subscriptions() {
//         return [documentClickSubscription];
//       },
//     });
//     const { unmount } = render(<App />);
//     expect(update).toHaveBeenCalledTimes(0);
//
//     fireEvent.click(document.body);
//     expect(update).toHaveBeenCalledTimes(1);
//
//     unmount();
//     fireEvent.click(document.body);
//     expect(update).toHaveBeenCalledTimes(1);
//   });
//
//   test("allows creating a manual trigger for subscriptions", () => {
//     const update = jest.fn((msg, model) => [model, []]);
//     const App = createApp({
//       ...impl,
//       update,
//       subscriptions() {
//         return [manualTriggerSubscription];
//       },
//     });
//     render(<App />);
//
//     const customTrigger = () =>
//       eventTarget.dispatchEvent(
//         new CustomEvent("trigger", { detail: { type: "trigger" } })
//       );
//
//     act(customTrigger);
//     act(customTrigger);
//     act(customTrigger);
//
//     expect(update).toHaveBeenCalledTimes(3);
//   });
//
//   test("non-function subscriptions will be treated as non-existing and unmounted", () => {
//     const update = jest.fn((msg, model) => [model + 1, []]);
//     const App = createApp({
//       ...impl,
//       update,
//       subscriptions(model) {
//         return [model === 0 ? manualTriggerSubscription : null];
//       },
//     });
//     render(<App />);
//
//     const customTrigger = () =>
//       eventTarget.dispatchEvent(
//         new CustomEvent("trigger", { detail: { type: "trigger" } })
//       );
//     act(customTrigger);
//     expect(update).toHaveBeenCalledTimes(1);
//     act(customTrigger);
//     expect(update).toHaveBeenCalledTimes(1);
//   });
// });
//
describe("useSendMsg", () => {
  function SubComponent({ originalSendMsg } : { originalSendMsg : SendMsgFn<Msg>}) {
    const sendMsg = useSendMsg();
    return originalSendMsg === sendMsg ? <h2>Same</h2> : null;
  }
  test("useSendMsg gives same sendMsg() function as passed to view()", () => {
    const App = createApp({
      ...impl,
      view(model, sendMsg) {
        return <SubComponent originalSendMsg={sendMsg} />;
      },
    });
    render(<App />);

    expect(screen.getByRole("heading")).toHaveTextContent("Same");
  });
});
