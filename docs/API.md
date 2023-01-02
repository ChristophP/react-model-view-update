# API Documentation

## Types

```typescript
// the type of the argument passed to createApp()
type Implementation<Model, Msg> = {
  init: () => [Model, Effect<Msg>[]];
  update: (msg: Msg, model: Model) => [Model, Effect<Msg>[]];
  view: (model: Model, sendMsg: SendMsgFn<Msg>) => JSX.Element;
  subscriptions: (model: Model) => Sub<Msg>[];
};

// the function which takes a message and triggers updates
type SendMsgFn<Msg> = (msg: Msg) => void;

// effects are functions, which accept sendMsg as their only argument
type Effect<Msg> = (sendMsg: SendMsgFn<Msg>) => void;

// subscriptions are functions, which accept sendMsg and set up an event listener.
// They return a function that - when called - will unsubscribe the listener
type Sub<Msg> = (sendMsg: SendMsgFn<Msg>) => () => void;
```

## `createApp<Model, Msg>(Implementation<Model, Msg>): () => JSX.Element` 

CreatApp takes an implemtation type (see above), which defines all functions for the app.
It returns a React component, which can then be rendered by React.

Here's how all the functions in `Implementation` work.

### `init() => [Model, Effect<Msg>[]]`

Initialize your app by returning a tuple of your initial model and any effects you want to run. Runs only once when `createApp()` is called.

### `update(msg: Msg, model: Model) => [Model, Effect<Msg>[]]`

A function that gets messages, the current model and computes and returns a new model (reducer) and a list of effects. Runs whenever messages are send (via `sendMsg`).

### `view(model: Model, sendMsg: SendMsgFn<Msg>) => JSX.Element`

A function that gets the model and a message dispatching function and returns some JSX. Called whenever `update()` has run.

### `subscriptions(model: Model) => Sub<Msg>[]`

A function that sets up and removes event listeners to things like timers, web sockets, or clicks on the document.
The result of `subscriptions()` is cached internally. 
If a subscription is new in the returned array the listener will be setup up. If a subscribed subscription is no longer present in the returned array
the unsubscribe callback will be called.
It runs whenever then model changes. Messages send by a subscription will trigger `update()`.

## `useSendMsg<Msg>(): SendMsgFn<Msg>` 

A hook that mainly exist for conveniance to access `sendMsg()` deeper in the component hierarchy (to avoid prop drilling).
You won't need this on the top level of `view()` since it receives `sendMsg()` as an argument.
