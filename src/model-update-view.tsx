import React, { useState, useEffect, useContext, useCallback } from "react";

// msg triggering
const MsgContext = React.createContext(null);

function useSendMsg() {
  return useContext(MsgContext);
}

// state/effect update function
function useUpdate(reducer, initState) {
  const [state, setState] = useState(initState);

  const sendMsg = useCallback(
    (msg) => {
      // we need to use the callback version of setState, because otherwise two calls in the
      // same tick might lead to unexpected updates (i.e. incrementing problem pointing to old state)
      setState((prevState) => {
        const [nextState, effects] = reducer(msg, prevState);
        effects.forEach((fx) => {
          if (typeof fx === "function") {
            fx(sendMsg);
          }
        });
        return nextState;
      });
    },
    [reducer]
  );

  return [state, sendMsg];
}

function useSubscriptions(manageSubscriptions, state, sendMsg) {
  useEffect(() => {
    manageSubscriptions(state, sendMsg);
  }, [manageSubscriptions, state, sendMsg]);

  // unbind subscriptions on unmount
  useEffect(
    () => () => {
      manageSubscriptions(null, sendMsg);
    },
    [manageSubscriptions, sendMsg]
  );
}

// subscriptions management
function createSubscriptionsManager(mapStateToSubs) {
  const lastSubs = new Map();

  return (state, sendMsg) => {
    const subs = state !== null ? mapStateToSubs(state) : [];
    // if new value is there, subscribe and store unsubscribe function
    subs.forEach((func) => {
      if (!lastSubs.has(func) && typeof func === "function") {
        lastSubs.set(func, func(sendMsg));
      }
    });

    // if value is removed, unsubscribe
    lastSubs.forEach((unsubscribe, func) => {
      if (!subs.includes(func) && typeof unsubscribe === "function") {
        unsubscribe();
        lastSubs.delete(func);
      }
    });
  };
}
type SendMsgFn = () => void;
type Effect = (sendMsg: SendMsgFn) => void;

type Implementation<Model, Msg> = {
  init: () => Model;
  update: (model: Model, msg: Msg) => [Model, Effect[]];
};

// app factory
function createApp({ init, update, view, subscriptions }) {
  const manageSubscriptions = createSubscriptionsManager(subscriptions);
  const initialState = init();

  function App() {
    const [state, sendMsg] = useUpdate(update, initialState);
    useSubscriptions(manageSubscriptions, state, sendMsg);

    const jsx = view(state, sendMsg);
    return <MsgContext.Provider value={sendMsg}>{jsx}</MsgContext.Provider>;
  }

  return App;
}

export { createApp, useSendMsg };
