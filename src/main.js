var $b1ajd$reactjsxruntime = require("react/jsx-runtime");
var $b1ajd$react = require("react");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useSendMsg", () => $aa12603f4a190dbe$export$228d5f259cdfda48);
$parcel$export(module.exports, "createApp", () => $aa12603f4a190dbe$export$4e373c34abfa8c68);


// msg triggering
const $aa12603f4a190dbe$var$MsgContext = /*#__PURE__*/ (0, ($parcel$interopDefault($b1ajd$react))).createContext(null);
function $aa12603f4a190dbe$export$228d5f259cdfda48() {
    return (0, $b1ajd$react.useContext)($aa12603f4a190dbe$var$MsgContext);
}
// state/effect update function
function $aa12603f4a190dbe$var$useUpdate(reducer, initState) {
    const [state, setState] = (0, $b1ajd$react.useState)(initState);
    const sendMsg = (0, $b1ajd$react.useCallback)((msg)=>{
        // we need to use the callback version of setState, because otherwise two calls in the
        // same tick might lead to unexpected updates (i.e. incrementing problem pointing to old state)
        setState((prevState)=>{
            const [nextState, effects] = reducer(msg, prevState);
            effects.forEach((fx)=>{
                if (typeof fx === "function") fx(sendMsg);
            });
            return nextState;
        });
    }, [
        reducer
    ]);
    return [
        state,
        sendMsg
    ];
}
function $aa12603f4a190dbe$var$useSubscriptions(manageSubscriptions, state, sendMsg) {
    (0, $b1ajd$react.useEffect)(()=>{
        manageSubscriptions(state, sendMsg);
    }, [
        manageSubscriptions,
        state,
        sendMsg
    ]);
    // unbind subscriptions on unmount
    (0, $b1ajd$react.useEffect)(()=>()=>{
            manageSubscriptions(null, sendMsg);
        }, [
        manageSubscriptions,
        sendMsg
    ]);
}
// subscriptions management
function $aa12603f4a190dbe$var$createSubscriptionsManager(mapStateToSubs) {
    const lastSubs = new Map();
    return (state, sendMsg)=>{
        const subs = state !== null ? mapStateToSubs(state) : [];
        // if new value is there, subscribe and store unsubscribe function
        subs.forEach((func)=>{
            if (!lastSubs.has(func) && typeof func === "function") lastSubs.set(func, func(sendMsg));
        });
        // if value is removed, unsubscribe
        lastSubs.forEach((unsubscribe, func)=>{
            if (!subs.includes(func) && typeof unsubscribe === "function") {
                unsubscribe();
                lastSubs.delete(func);
            }
        });
    };
}
// app factory
function $aa12603f4a190dbe$export$4e373c34abfa8c68({ init: init , update: update , view: view , subscriptions: subscriptions  }) {
    const manageSubscriptions = $aa12603f4a190dbe$var$createSubscriptionsManager(subscriptions);
    const initialState = init();
    function App() {
        const [state, sendMsg] = $aa12603f4a190dbe$var$useUpdate(update, initialState);
        $aa12603f4a190dbe$var$useSubscriptions(manageSubscriptions, state, sendMsg);
        const jsx = view(state, sendMsg);
        return /*#__PURE__*/ (0, $b1ajd$reactjsxruntime.jsx)($aa12603f4a190dbe$var$MsgContext.Provider, {
            value: sendMsg,
            children: jsx
        });
    }
    return App;
}


//# sourceMappingURL=main.js.map
