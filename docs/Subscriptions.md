# Subscriptions

Sometimes your app might need to react to things happening in the environment.
Subscriptions help you set up and remove Event Listeners in a clean way.
Return the subscriptions in the `subscriptions()` function, passed to `createApp()`.

Here are some examples of commonly needed subscriptions:

*They are kept short for brevity so often the message is hardcoded. In order to make the subscription more
reusable you may want to pass in the message or message-creating-function as a parameter*

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
