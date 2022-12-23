import React, { useReducer } from "react";
import ReactDOM from "react-dom/client";

const createApp = ({ init, update, view }) => {
  function App() {
    const [state, dispatch] = useReducer(update, init);
    const msg = (name, payload) => dispatch({ type: name, payload });
    const jsx = view(state, msg);
    return jsx;
  }

  let root;
  return {
    run(node) {
      root = ReactDOM.createRoot(node);
      root.render(<App />);
    },
  };
};

export { createApp };
