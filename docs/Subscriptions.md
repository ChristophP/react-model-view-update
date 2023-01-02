# Subscriptions

Effects help your app to interact the outside world through Browser APIs.
If you're familiar with redux, they are conceptually somewhat similar to a [`thunk`](https://redux.js.org/usage/writing-logic-thunks#what-is-a-thunk.
Here are some examples of commonly needed effects

## Subscriping to a Time Interval

```js
function interval(milliseconds): Sub<Msg> => {
  return (sendMsg) => {
    const id = setInterval(() => {
      sendMsg({ type: "interval" });
    }, milliSeconds);
    return () => {
      clearInterval(id);
    }
  }
};
```

## EventSource

```js
function serverSentEvents(url): Sub<Msg> => {
  const source = new EventSource(url);
  return (sendMsg) => {
    const listener = (event) => { sendMsg({ type: "receivedEvent", payload: event.data}); };
    const id = source.addEventListener("message", listener);
    return () => {
      source.removeEventListener("message", listener);
    }
  }
};
```

## Clicks anywhere on the document

```js
function documentClickSubscription() : Sub<Msg> {
  const listener = () => sendMsg({ type: "documentClick" });
  document.addEventListener("click", listener);
  return () => {
    // return unsubscribe function
    document.removeEventListener("click", listener);
  };
}
```
