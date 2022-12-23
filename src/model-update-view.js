import React, { useReducer, useEffect, useContext, useCallback } from "react";
import ReactDOM from "react-dom/client";

const MsgContext = React.createContext(null);

function useMsg() {
  return useContext(MsgContext);
}

const createApp = ({ init, update, view }) => {
  function App() {
    const [state, dispatch] = useReducer(update, init);
    const msg = useCallback((name, payload) =>
      dispatch({ type: name, payload })
    );
    const jsx = view(state, msg);
    return <MsgContext.Provider value={msg}>{jsx}</MsgContext.Provider>;
  }

  let root;
  return {
    run(node) {
      root = ReactDOM.createRoot(node);
      root.render(<App />);
    },
    kill() {
      if (root) {
        root.unmount();
      }
    },
  };
};

export { createApp, useMsg };
