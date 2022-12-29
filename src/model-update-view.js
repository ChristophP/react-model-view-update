import React, { useState, useEffect, useContext, useCallback } from "react";

// msg triggering
const MsgContext = React.createContext(null);

function useMsg() {
  return useContext(MsgContext);
}

// state/effect update function
function useUpdate(reducer, initState) {
  const [state, setState] = useState(initState);

  const msg = useCallback(
    (name, payload) => {
      // we need to use the callback version of setState, because otherwise two calls in the
      // same tick might lead to unexpected updates (i.e. incrementing problem pointing to old state)
      setState((prevState) => {
        const [nextState, effects] = reducer(prevState, {
          type: name,
          payload,
        });
        effects.forEach((fx) => {
          if (typeof fx === "function") {
            fx(msg);
          }
        });
        return nextState;
      });
    },
    [reducer, setState]
  );

  return [state, msg];
}

// subscriptions management
function createSubscriptionsManager() {
  const lastSubs = new Map();

  return (mapStateToSubs, state, msg) => {
    const subs = mapStateToSubs(state);
    // if new value is there, subscribe and store unsubscribe function
    subs.forEach((func) => {
      if (!lastSubs.has(func) && typeof func === "function") {
        lastSubs.set(func, func(state, msg));
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

// app factory
const createApp = ({ init, update, view, subscriptions }) => {
  const manageSubscriptions = createSubscriptionsManager();

  function App() {
    const [state, msg] = useUpdate(update, init);

    useEffect(() => {
      manageSubscriptions(subscriptions, state, msg);
    }, [state, msg]);

    // unbind subscriptions on unmount
    useEffect(
      () => () => {
        manageSubscriptions(
          () => [],
          init,
          () => {}
        );
      },
      []
    );

    const jsx = view(state, msg);
    return <MsgContext.Provider value={msg}>{jsx}</MsgContext.Provider>;
  }

  return App;
};

export { createApp, useMsg };
