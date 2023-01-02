# Effects

Effects help your app to interact the outside world through Browser APIs.
If you're familiar with redux, they are conceptually somewhat similar to a [`thunk`](https://redux.js.org/usage/writing-logic-thunks#what-is-a-thunk).
Returns the effects from the `init()` and `update()` functions passed to `createApp()`.
Here are some examples of commonly needed effects:

## HTTP requests

```js
function httpRequest(url, data): Effect<Msg> => {
  return async (sendMsg) = {
    const res = await fetch(url, data);
    const json = await res.json();
    sendMsg({ 
      type: "receivedApiResponse", 
      payload: { status: res.status, data: json };
    });
  }
};
```

## Random numbers

```js
// random numbers between 0 and maxNumber
function generateRandomNumber(maxNumber): Effect<Msg> => {
  return (sendMsg) = {
    const num = Math.round(Math.random() * 5);
    sendMsg({ type: "randomNumGenerated", payload: num });
  }
};
```

## Setting the document title

```js
function setDocumentTitle(title): Effect<Msg> => {
  return () = {
    document.title = title;
  }
};
```

## Wait for a period of time

```js
function wait(milliSeconds): Effect<Msg> => {
  return (sendMsg) = {
    setTimeout(() => { 
      sendMsg({ type: "waitingDone" })
    }, milliSeconds);
  }
};
```
