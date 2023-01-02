# Subscriptions

Sometimes your app might need to react to things happening in the environment.
Subscriptions help you set up and remove Event Listeners in a clean way.
Use the subscriptions in the `subscriptions()` function, passed to `createApp()`.

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
