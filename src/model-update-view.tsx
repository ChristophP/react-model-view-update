import React, { useState, useEffect, useContext, useCallback } from "react";

export type SendMsgFn<Msg> = (msg: Msg) => void;
export type Effect<Msg> = (sendMsg: SendMsgFn<Msg>) => void;
export type Subscription<Msg> = (sendMsg: SendMsgFn<Msg>) => () => void;
type SubManager<Model, Msg> = (
  model: Model | null,
  sendMsg: SendMsgFn<Msg>
) => void;

export type Implementation<Model, Msg> = {
  init: () => [Model, Effect<Msg>[]];
  update: (msg: Msg, model: Model) => [Model, Effect<Msg>[]];
  view: (model: Model, sendMsg: SendMsgFn<Msg>) => JSX.Element;
  subscriptions: (model: Model) => Subscription<Msg>[];
};

// msg triggering
const MsgContext = React.createContext<SendMsgFn<any>>(() => {
  console.error("send message not initialized yet");
});

function useSendMsg<Msg>(): SendMsgFn<Msg> {
  return useContext(MsgContext);
}

// initialEffects
function useInitialEffects<Msg>(
  effects: Effect<Msg>[],
  sendMsg: SendMsgFn<Msg>
) {
  useEffect(() => {
    effects.forEach((fx) => {
      fx(sendMsg);
    });
  }, [effects, sendMsg]);
}

// state/effect update function
function useUpdate<Model, Msg>(
  reducer: (msg: Msg, model: Model) => [Model, Effect<Msg>[]],
  initState: Model
): [Model, SendMsgFn<Msg>] {
  const [state, setState] = useState(initState);

  const sendMsg = useCallback(
    (msg: Msg) => {
      // we need to use the callback version of setState, because otherwise two calls in the
      // same tick might lead to unexpected updates (i.e. incrementing problem pointing to old state)
      setState((prevState) => {
        const [nextState, effects] = reducer(msg, prevState);
        effects.forEach((fx) => {
          fx(sendMsg);
        });
        return nextState;
      });
    },
    [reducer]
  );

  return [state, sendMsg];
}

function useSubscriptions<Model, Msg>(
  manageSubscriptions: SubManager<Model, Msg>,
  state: Model,
  sendMsg: SendMsgFn<Msg>
) {
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
function createSubscriptionsManager<Model, Msg>(
  mapStateToSubs: (model: Model) => Subscription<Msg>[]
): SubManager<Model, Msg> {
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

// app factory
function createApp<Model, Msg>({
  init,
  update,
  view,
  subscriptions,
}: Implementation<Model, Msg>): () => JSX.Element {
  const manageSubscriptions = createSubscriptionsManager(subscriptions);
  const [initialState, initialEffects] = init();

  function App() {
    const [state, sendMsg] = useUpdate(update, initialState);
    useInitialEffects(initialEffects, sendMsg);
    useSubscriptions(manageSubscriptions, state, sendMsg);

    const jsx = view(state, sendMsg);
    return <MsgContext.Provider value={sendMsg}>{jsx}</MsgContext.Provider>;
  }

  return App;
}

export { createApp, useSendMsg };
