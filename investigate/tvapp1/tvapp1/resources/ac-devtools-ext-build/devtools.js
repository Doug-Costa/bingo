/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Relay.ts":
/*!**********************!*\
  !*** ./src/Relay.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*
  The native EventTarget interface is not useable in content scripts in Firefox.
  We import and extend from this simplified class to use the EventTarget functionality we need.
*/
const EventTarget_1 = __importDefault(__webpack_require__(/*! ./extension/EventTarget */ "./src/extension/EventTarget.ts"));
class Relay extends EventTarget_1.default {
    constructor() {
        super(...arguments);
        this.connections = new Map();
        this.addConnection = (name, fn) => {
            function wrappedFn(event) {
                return fn(event.detail);
            }
            this.addEventListener(name, wrappedFn);
            this.connections.set(name, wrappedFn);
            return () => this.removeConnection(name);
        };
        this.removeConnection = (name) => {
            const fn = this.connections.get(name);
            if (fn) {
                this.removeEventListener(name, fn);
                this.connections.delete(name);
            }
        };
        this.createEvent = (message) => {
            return new CustomEvent(message, { detail: {} });
        };
        this.broadcast = (message) => {
            let event = this.createEvent(message.message);
            if (message === null || message === void 0 ? void 0 : message.to) {
                let destination = message.to;
                event.detail["to"] = destination;
                let nextDestination;
                let remaining;
                // If there are intermediate destinations
                // Example: 'background:tab:window'
                if (destination.includes(":")) {
                    [destination, ...remaining] = message.to.split(":");
                    nextDestination = remaining.join(":");
                }
                if (this.connections.has(destination)) {
                    event = this.createEvent(destination);
                    event.detail["to"] = nextDestination;
                }
            }
            event.detail["message"] = message.message;
            event.detail["payload"] = message.payload;
            this.dispatchEvent(event);
        };
        this.listen = (name, fn) => {
            function wrappedFn(event) {
                return fn(event.detail);
            }
            this.addEventListener(name, wrappedFn);
            return () => {
                this.removeEventListener(name, wrappedFn);
            };
        };
        this.send = (messageObj) => {
            this.broadcast(messageObj);
        };
        this.forward = (message, newRecipient) => {
            return this.listen(message, (messageObj) => {
                this.broadcast(Object.assign(Object.assign({}, messageObj), { to: newRecipient }));
            });
        };
    }
}
exports["default"] = Relay;


/***/ }),

/***/ "./src/application/components/Explorer/postMessageHelpers.ts":
/*!*******************************************************************!*\
  !*** ./src/application/components/Explorer/postMessageHelpers.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.postMessageToEmbed = exports.EXPLORER_SUBSCRIPTION_TERMINATION = exports.EMBEDDABLE_EXPLORER_URL = exports.DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF = exports.SCHEMA_RESPONSE = exports.SCHEMA_ERROR = exports.SET_OPERATION = exports.EXPLORER_SUBSCRIPTION_RESPONSE = exports.EXPLORER_SUBSCRIPTION_REQUEST = exports.EXPLORER_RESPONSE = exports.EXPLORER_REQUEST = exports.EXPLORER_LISTENING_FOR_STATE = exports.EXPLORER_LISTENING_FOR_SCHEMA = void 0;
exports.EXPLORER_LISTENING_FOR_SCHEMA = "ExplorerListeningForSchema";
exports.EXPLORER_LISTENING_FOR_STATE = "ExplorerListeningForState";
exports.EXPLORER_REQUEST = "ExplorerRequest";
exports.EXPLORER_RESPONSE = "ExplorerResponse";
exports.EXPLORER_SUBSCRIPTION_REQUEST = "ExplorerSubscriptionRequest";
exports.EXPLORER_SUBSCRIPTION_RESPONSE = "ExplorerSubscriptionResponse";
exports.SET_OPERATION = "SetOperation";
exports.SCHEMA_ERROR = "SchemaError";
exports.SCHEMA_RESPONSE = "SchemaResponse";
exports.DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF = "DevTools_AuthenticateWithGraphRef";
exports.EMBEDDABLE_EXPLORER_URL = "https://explorer.embed.apollographql.com";
exports.EXPLORER_SUBSCRIPTION_TERMINATION = "ExplorerSubscriptionTermination";
const postMessageToEmbed = ({ embeddedExplorerIFrame, message, }) => {
    var _a;
    (_a = embeddedExplorerIFrame.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage(message, exports.EMBEDDABLE_EXPLORER_URL);
};
exports.postMessageToEmbed = postMessageToEmbed;


/***/ }),

/***/ "./src/extension/EventTarget.ts":
/*!**************************************!*\
  !*** ./src/extension/EventTarget.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class EventTarget {
    constructor() {
        this.listeners = new Map();
    }
    addEventListener(eventType, callback) {
        const isRegistered = this.listeners.has(eventType);
        if (!isRegistered) {
            this.listeners.set(eventType, new Set());
        }
        const listeners = this.listeners.get(eventType);
        listeners.add(callback);
    }
    removeEventListener(eventType, callback) {
        const isRegistered = this.listeners.has(eventType);
        if (isRegistered) {
            const listeners = this.listeners.get(eventType);
            listeners.delete(callback);
        }
    }
    dispatchEvent(event) {
        const isRegistered = this.listeners.has(event === null || event === void 0 ? void 0 : event.type);
        if (isRegistered) {
            const listeners = this.listeners.get(event.type);
            listeners.forEach(listener => listener(event));
        }
    }
}
exports["default"] = EventTarget;


/***/ }),

/***/ "./src/extension/constants.ts":
/*!************************************!*\
  !*** ./src/extension/constants.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RELOAD_TAB_COMPLETE = exports.RELOADING_TAB = exports.EXPLORER_RESPONSE = exports.EXPLORER_REQUEST = exports.PANEL_CLOSED = exports.PANEL_OPEN = exports.UPDATE = exports.REQUEST_DATA = exports.ACTION_HOOK_FIRED = exports.CREATE_DEVTOOLS_PANEL = exports.APOLLO_CLIENT_FOUND = exports.FIND_APOLLO_CLIENT = exports.DEVTOOLS_INITIALIZED = exports.REQUEST_TAB_ID = exports.CLIENT_FOUND = void 0;
exports.CLIENT_FOUND = "ac-devtools:client-found";
exports.REQUEST_TAB_ID = "ac-devtools:request-tab-id";
exports.DEVTOOLS_INITIALIZED = "ac-devtools:devtools-initialized";
exports.FIND_APOLLO_CLIENT = "ac-devtools:find-apollo-client";
exports.APOLLO_CLIENT_FOUND = "ac-devtools:apollo-client-found";
exports.CREATE_DEVTOOLS_PANEL = "ac-devtools:create-devtools-panel";
exports.ACTION_HOOK_FIRED = "ac-devtools:action-hook-fired";
exports.REQUEST_DATA = "ac-devtools:request-data";
exports.UPDATE = "ac-devtools:update";
exports.PANEL_OPEN = "ac-devtools:panel-open";
exports.PANEL_CLOSED = "ac-devtools:panel-closed";
exports.EXPLORER_REQUEST = "ac-devtools:explorer-request";
exports.EXPLORER_RESPONSE = "ac-devtools:explorer-response";
exports.RELOADING_TAB = "ac-devtools:reloading-tab";
exports.RELOAD_TAB_COMPLETE = "ac-devtools:reload-tab-complete";

/***/ }),

/***/ "./src/extension/devtools/devtools.ts":
/*!********************************************!*\
  !*** ./src/extension/devtools/devtools.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const postMessageHelpers_1 = __webpack_require__(/*! ../../application/components/Explorer/postMessageHelpers */ "./src/application/components/Explorer/postMessageHelpers.ts");
const Relay_1 = __importDefault(__webpack_require__(/*! ../../Relay */ "./src/Relay.ts"));
const constants_1 = __webpack_require__(/*! ../constants */ "./src/extension/constants.ts");
const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
const devtools = new Relay_1.default();
const port = chrome.runtime.connect({
    name: `devtools-${inspectedTabId}`,
});
port.onMessage.addListener(devtools.broadcast);
devtools.addConnection("background", (message) => {
    try {
        port.postMessage(message);
    }
    catch (error) {
        devtools.removeConnection("background");
    }
});
function sendMessageToClient(message) {
    devtools.send({
        message,
        to: `background:tab-${inspectedTabId}:client`,
    });
}
function startRequestInterval(ms = 500) {
    sendMessageToClient(constants_1.REQUEST_DATA);
    const id = setInterval(sendMessageToClient, ms, constants_1.REQUEST_DATA);
    return () => clearInterval(id);
}
let isPanelCreated = false;
let isAppInitialized = false;
devtools.addConnection(postMessageHelpers_1.EXPLORER_SUBSCRIPTION_TERMINATION, () => {
    sendMessageToClient(postMessageHelpers_1.EXPLORER_SUBSCRIPTION_TERMINATION);
});
devtools.listen(constants_1.CREATE_DEVTOOLS_PANEL, ({ payload }) => {
    if (!isPanelCreated) {
        chrome.devtools.panels.create("Apollo", "logo_devtools.png", "panel.html", function (panel) {
            isPanelCreated = true;
            const { queries, mutations, cache } = JSON.parse(payload);
            let removeUpdateListener;
            let removeExplorerForward;
            let removeSubscriptionTerminationListener;
            let removeReloadListener;
            let clearRequestInterval;
            let removeExplorerListener;
            panel.onShown.addListener((window) => {
                sendMessageToClient(constants_1.PANEL_OPEN);
                const { __DEVTOOLS_APPLICATION__: { initialize, writeData, receiveExplorerRequests, receiveSubscriptionTerminationRequest, sendResponseToExplorer, handleReload, handleReloadComplete, }, } = window;
                if (!isAppInitialized) {
                    initialize();
                    writeData({ queries, mutations, cache: JSON.stringify(cache) });
                    isAppInitialized = true;
                }
                clearRequestInterval = startRequestInterval();
                removeUpdateListener = devtools.listen(constants_1.UPDATE, ({ payload }) => {
                    const { queries, mutations, cache } = JSON.parse(payload);
                    writeData({ queries, mutations, cache: JSON.stringify(cache) });
                });
                // Add connection so client can send to `background:devtools-${inspectedTabId}:explorer`
                devtools.addConnection("explorer", sendResponseToExplorer);
                removeExplorerListener = receiveExplorerRequests(({ detail }) => {
                    devtools.broadcast(detail);
                });
                removeSubscriptionTerminationListener =
                    receiveSubscriptionTerminationRequest(({ detail }) => {
                        devtools.broadcast(detail);
                    });
                // Forward all Explorer requests to the client
                removeExplorerForward = devtools.forward(constants_1.EXPLORER_REQUEST, `background:tab-${inspectedTabId}:client`);
                // Listen for tab reload from background
                removeReloadListener = devtools.listen(constants_1.RELOADING_TAB, () => {
                    handleReload();
                    clearRequestInterval();
                    const removeListener = devtools.listen(constants_1.RELOAD_TAB_COMPLETE, () => {
                        clearRequestInterval = startRequestInterval();
                        handleReloadComplete();
                        removeListener();
                    });
                });
            });
            panel.onHidden.addListener(() => {
                isPanelCreated = false;
                clearRequestInterval();
                removeExplorerForward();
                removeSubscriptionTerminationListener();
                removeUpdateListener();
                removeReloadListener();
                removeExplorerListener();
                devtools.removeConnection("explorer");
                sendMessageToClient(constants_1.PANEL_CLOSED);
            });
        });
    }
});
sendMessageToClient(constants_1.DEVTOOLS_INITIALIZED);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension/devtools/devtools.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxDQUFDO1lBRUgsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUM5QixjQUFjLEdBQUcsS0FBSyxDQUFDO2dCQUN2QixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixxQkFBcUIsRUFBRSxDQUFDO2dCQUN4QixxQ0FBcUMsRUFBRSxDQUFDO2dCQUN4QyxvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixzQkFBc0IsRUFBRSxDQUFDO2dCQUN6QixRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLG1CQUFtQixDQUFDLHdCQUFZLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FDRixDQUFDO0tBQ0g7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILG1CQUFtQixDQUFDLGdDQUFvQixDQUFDLENBQUM7Ozs7Ozs7VUM1STFDO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcG9sbG8tY2xpZW50LWRldnRvb2xzLy4vc3JjL1JlbGF5LnRzIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvLi9zcmMvYXBwbGljYXRpb24vY29tcG9uZW50cy9FeHBsb3Jlci9wb3N0TWVzc2FnZUhlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy8uL3NyYy9leHRlbnNpb24vRXZlbnRUYXJnZXQudHMiLCJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy8uL3NyYy9leHRlbnNpb24vY29uc3RhbnRzLnRzIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvLi9zcmMvZXh0ZW5zaW9uL2RldnRvb2xzL2RldnRvb2xzLnRzIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIFxuICBUaGUgbmF0aXZlIEV2ZW50VGFyZ2V0IGludGVyZmFjZSBpcyBub3QgdXNlYWJsZSBpbiBjb250ZW50IHNjcmlwdHMgaW4gRmlyZWZveC4gXG4gIFdlIGltcG9ydCBhbmQgZXh0ZW5kIGZyb20gdGhpcyBzaW1wbGlmaWVkIGNsYXNzIHRvIHVzZSB0aGUgRXZlbnRUYXJnZXQgZnVuY3Rpb25hbGl0eSB3ZSBuZWVkLlxuKi9cbmltcG9ydCBFdmVudFRhcmdldCBmcm9tIFwiLi9leHRlbnNpb24vRXZlbnRUYXJnZXRcIjtcbmltcG9ydCB7IEN1c3RvbUV2ZW50TGlzdGVuZXIsIE1lc3NhZ2VPYmogfSBmcm9tIFwiLi90eXBlc1wiO1xuY2xhc3MgUmVsYXkgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIHByaXZhdGUgY29ubmVjdGlvbnMgPSBuZXcgTWFwPFxuICAgIHN0cmluZyxcbiAgICAoZXZlbnQ6IEN1c3RvbUV2ZW50PE1lc3NhZ2VPYmo+KSA9PiBSZXR1cm5UeXBlPEN1c3RvbUV2ZW50TGlzdGVuZXI+XG4gID4oKTtcblxuICBwdWJsaWMgYWRkQ29ubmVjdGlvbiA9IChuYW1lOiBzdHJpbmcsIGZuOiAobWVzc2FnZTogTWVzc2FnZU9iaikgPT4gdm9pZCkgPT4ge1xuICAgIGZ1bmN0aW9uIHdyYXBwZWRGbihldmVudDogQ3VzdG9tRXZlbnQ8TWVzc2FnZU9iaj4pIHtcbiAgICAgIHJldHVybiBmbihldmVudC5kZXRhaWwpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwcGVkRm4pO1xuICAgIHRoaXMuY29ubmVjdGlvbnMuc2V0KG5hbWUsIHdyYXBwZWRGbik7XG5cbiAgICByZXR1cm4gKCkgPT4gdGhpcy5yZW1vdmVDb25uZWN0aW9uKG5hbWUpO1xuICB9O1xuXG4gIHB1YmxpYyByZW1vdmVDb25uZWN0aW9uID0gKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5jb25uZWN0aW9ucy5nZXQobmFtZSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuICAgICAgdGhpcy5jb25uZWN0aW9ucy5kZWxldGUobmFtZSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgY3JlYXRlRXZlbnQgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudChtZXNzYWdlLCB7IGRldGFpbDoge30gfSk7XG4gIH07XG5cbiAgcHVibGljIGJyb2FkY2FzdCA9IChtZXNzYWdlOiBNZXNzYWdlT2JqKSA9PiB7XG4gICAgbGV0IGV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudChtZXNzYWdlLm1lc3NhZ2UpO1xuXG4gICAgaWYgKG1lc3NhZ2U/LnRvKSB7XG4gICAgICBsZXQgZGVzdGluYXRpb24gPSBtZXNzYWdlLnRvO1xuICAgICAgZXZlbnQuZGV0YWlsW1widG9cIl0gPSBkZXN0aW5hdGlvbjtcbiAgICAgIGxldCBuZXh0RGVzdGluYXRpb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCByZW1haW5pbmc6IHN0cmluZ1tdO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgaW50ZXJtZWRpYXRlIGRlc3RpbmF0aW9uc1xuICAgICAgLy8gRXhhbXBsZTogJ2JhY2tncm91bmQ6dGFiOndpbmRvdydcbiAgICAgIGlmIChkZXN0aW5hdGlvbi5pbmNsdWRlcyhcIjpcIikpIHtcbiAgICAgICAgW2Rlc3RpbmF0aW9uLCAuLi5yZW1haW5pbmddID0gbWVzc2FnZS50by5zcGxpdChcIjpcIik7XG4gICAgICAgIG5leHREZXN0aW5hdGlvbiA9IHJlbWFpbmluZy5qb2luKFwiOlwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbnMuaGFzKGRlc3RpbmF0aW9uKSkge1xuICAgICAgICBldmVudCA9IHRoaXMuY3JlYXRlRXZlbnQoZGVzdGluYXRpb24pO1xuICAgICAgICBldmVudC5kZXRhaWxbXCJ0b1wiXSA9IG5leHREZXN0aW5hdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudC5kZXRhaWxbXCJtZXNzYWdlXCJdID0gbWVzc2FnZS5tZXNzYWdlO1xuICAgIGV2ZW50LmRldGFpbFtcInBheWxvYWRcIl0gPSBtZXNzYWdlLnBheWxvYWQ7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfTtcblxuICBwdWJsaWMgbGlzdGVuID0gPFQgPSBhbnk+KG5hbWU6IHN0cmluZywgZm46IEN1c3RvbUV2ZW50TGlzdGVuZXI8VD4pID0+IHtcbiAgICBmdW5jdGlvbiB3cmFwcGVkRm4oZXZlbnQ6IEN1c3RvbUV2ZW50PE1lc3NhZ2VPYmo8VD4+KSB7XG4gICAgICByZXR1cm4gZm4oZXZlbnQuZGV0YWlsKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgd3JhcHBlZEZuKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBwZWRGbik7XG4gICAgfTtcbiAgfTtcblxuICBwdWJsaWMgc2VuZCA9IChtZXNzYWdlT2JqOiBNZXNzYWdlT2JqKSA9PiB7XG4gICAgdGhpcy5icm9hZGNhc3QobWVzc2FnZU9iaik7XG4gIH07XG5cbiAgcHVibGljIGZvcndhcmQgPSAobWVzc2FnZTogc3RyaW5nLCBuZXdSZWNpcGllbnQ6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmxpc3RlbihtZXNzYWdlLCAobWVzc2FnZU9iaikgPT4ge1xuICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAuLi5tZXNzYWdlT2JqLFxuICAgICAgICB0bzogbmV3UmVjaXBpZW50LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF5O1xuIiwiaW1wb3J0IHR5cGUgeyBHcmFwaFFMRXJyb3IsIEludHJvc3BlY3Rpb25RdWVyeSB9IGZyb20gXCJncmFwaHFsXCI7XG5cbmV4cG9ydCB0eXBlIEpTT05QcmltaXRpdmUgPSBib29sZWFuIHwgbnVsbCB8IHN0cmluZyB8IG51bWJlcjtcbmV4cG9ydCB0eXBlIEpTT05PYmplY3QgPSB7IFtrZXkgaW4gc3RyaW5nXT86IEpTT05WYWx1ZSB9O1xuZXhwb3J0IHR5cGUgSlNPTlZhbHVlID0gSlNPTlByaW1pdGl2ZSB8IEpTT05WYWx1ZVtdIHwgSlNPTk9iamVjdDtcblxuZXhwb3J0IGNvbnN0IEVYUExPUkVSX0xJU1RFTklOR19GT1JfU0NIRU1BID0gXCJFeHBsb3Jlckxpc3RlbmluZ0ZvclNjaGVtYVwiO1xuZXhwb3J0IGNvbnN0IEVYUExPUkVSX0xJU1RFTklOR19GT1JfU1RBVEUgPSBcIkV4cGxvcmVyTGlzdGVuaW5nRm9yU3RhdGVcIjtcbmV4cG9ydCBjb25zdCBFWFBMT1JFUl9SRVFVRVNUID0gXCJFeHBsb3JlclJlcXVlc3RcIjtcbmV4cG9ydCBjb25zdCBFWFBMT1JFUl9SRVNQT05TRSA9IFwiRXhwbG9yZXJSZXNwb25zZVwiO1xuZXhwb3J0IGNvbnN0IEVYUExPUkVSX1NVQlNDUklQVElPTl9SRVFVRVNUID0gXCJFeHBsb3JlclN1YnNjcmlwdGlvblJlcXVlc3RcIjtcbmV4cG9ydCBjb25zdCBFWFBMT1JFUl9TVUJTQ1JJUFRJT05fUkVTUE9OU0UgPSBcIkV4cGxvcmVyU3Vic2NyaXB0aW9uUmVzcG9uc2VcIjtcbmV4cG9ydCBjb25zdCBTRVRfT1BFUkFUSU9OID0gXCJTZXRPcGVyYXRpb25cIjtcbmV4cG9ydCBjb25zdCBTQ0hFTUFfRVJST1IgPSBcIlNjaGVtYUVycm9yXCI7XG5leHBvcnQgY29uc3QgU0NIRU1BX1JFU1BPTlNFID0gXCJTY2hlbWFSZXNwb25zZVwiO1xuZXhwb3J0IGNvbnN0IERFVl9UT09MU19BVVRIRU5USUNBVEVfV0lUSF9HUkFQSFJFRiA9XG4gIFwiRGV2VG9vbHNfQXV0aGVudGljYXRlV2l0aEdyYXBoUmVmXCI7XG5cbmV4cG9ydCBjb25zdCBFTUJFRERBQkxFX0VYUExPUkVSX1VSTCA9XG4gIFwiaHR0cHM6Ly9leHBsb3Jlci5lbWJlZC5hcG9sbG9ncmFwaHFsLmNvbVwiO1xuZXhwb3J0IGNvbnN0IEVYUExPUkVSX1NVQlNDUklQVElPTl9URVJNSU5BVElPTiA9XG4gIFwiRXhwbG9yZXJTdWJzY3JpcHRpb25UZXJtaW5hdGlvblwiO1xuXG5leHBvcnQgdHlwZSBFeHBsb3JlclJlc3BvbnNlID0ge1xuICBkYXRhPzogSlNPTlZhbHVlIHwgdW5kZWZpbmVkO1xuICBlcnJvcnM/OiByZWFkb25seSBHcmFwaFFMRXJyb3JbXSB8IHVuZGVmaW5lZDtcbiAgZXJyb3I/OlxuICAgIHwge1xuICAgICAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgICAgIHN0YWNrPzogc3RyaW5nO1xuICAgICAgfVxuICAgIHwgdW5kZWZpbmVkO1xuICBzdGF0dXM/OiBudW1iZXI7XG4gIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufTtcblxuZXhwb3J0IHR5cGUgT3V0Z29pbmdNZXNzYWdlRXZlbnQgPVxuICB8IHtcbiAgICAgIG5hbWU6IFwiU2NoZW1hRXJyb3JcIjtcbiAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgICAgZXJyb3JzPzogcmVhZG9ubHkgR3JhcGhRTEVycm9yW10gfCB1bmRlZmluZWQ7XG4gICAgfVxuICB8IHtcbiAgICAgIG5hbWU6IFwiU2NoZW1hUmVzcG9uc2VcIjtcbiAgICAgIHNjaGVtYTogSW50cm9zcGVjdGlvblF1ZXJ5IHwgc3RyaW5nO1xuICAgIH1cbiAgfCB7XG4gICAgICBuYW1lOiBcIkhhbmRzaGFrZVJlc3BvbnNlXCI7XG4gICAgICBncmFwaFJlZj86IHN0cmluZztcbiAgICAgIGludml0ZVRva2VuPzogc3RyaW5nO1xuICAgICAgYWNjb3VudElkPzogc3RyaW5nO1xuICAgIH1cbiAgfCB7XG4gICAgICBuYW1lOiBcIkV4cGxvcmVyUmVzcG9uc2VcIjtcbiAgICAgIG9wZXJhdGlvbklkOiBzdHJpbmc7XG4gICAgICByZXNwb25zZTogRXhwbG9yZXJSZXNwb25zZTtcbiAgICB9XG4gIHwge1xuICAgICAgbmFtZTogXCJTZXRPcGVyYXRpb25cIjtcbiAgICAgIG9wZXJhdGlvbjogc3RyaW5nO1xuICAgICAgdmFyaWFibGVzOiBzdHJpbmc7XG4gICAgfVxuICB8IHtcbiAgICAgIG5hbWU6IFwiRXhwbG9yZXJTdWJzY3JpcHRpb25SZXNwb25zZVwiO1xuICAgICAgb3BlcmF0aW9uSWQ6IHN0cmluZztcbiAgICAgIHJlc3BvbnNlOiBFeHBsb3JlclJlc3BvbnNlO1xuICAgIH1cbiAgfCB7XG4gICAgICBuYW1lOiBcIlN0dWRpb1VzZXJUb2tlbkZvckVtYmVkXCI7XG4gICAgICBpZDogc3RyaW5nO1xuICAgICAgdG9rZW46IHN0cmluZztcbiAgICAgIGdyYXBoUmVmOiBzdHJpbmc7XG4gICAgfVxuICB8IHtcbiAgICAgIG5hbWU6IFwiUGFydGlhbEF1dGhlbnRpY2F0aW9uVG9rZW5SZXNwb25zZVwiO1xuICAgICAgcGFydGlhbFRva2VuOiBzdHJpbmc7XG4gICAgfVxuICB8IHtcbiAgICAgIG5hbWU6IFwiRGV2VG9vbHNfQXV0aGVudGljYXRlV2l0aEdyYXBoUmVmXCI7XG4gICAgICBncmFwaFJlZjogc3RyaW5nO1xuICAgIH07XG5cbmV4cG9ydCB0eXBlIEV4cGxvcmVyUmVxdWVzdCA9IE1lc3NhZ2VFdmVudDx7XG4gIG5hbWU6IFwiRXhwbG9yZXJSZXF1ZXN0XCI7XG4gIG9wZXJhdGlvbklkOiBzdHJpbmc7XG4gIG9wZXJhdGlvbjogc3RyaW5nO1xuICB2YXJpYWJsZXM6IEpTT05WYWx1ZTtcbiAgb3BlcmF0aW9uTmFtZT86IHN0cmluZztcbiAgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgc2FuZGJveEVuZHBvaW50VXJsPzogc3RyaW5nO1xufT47XG5cbmV4cG9ydCB0eXBlIEV4cGxvcmVyU3Vic2NyaXB0aW9uUmVxdWVzdCA9IE1lc3NhZ2VFdmVudDx7XG4gIG5hbWU6IFwiRXhwbG9yZXJTdWJzY3JpcHRpb25SZXF1ZXN0XCI7XG4gIG9wZXJhdGlvbklkOiBzdHJpbmc7XG4gIG9wZXJhdGlvbjogc3RyaW5nO1xuICB2YXJpYWJsZXM6IEpTT05WYWx1ZTtcbiAgb3BlcmF0aW9uTmFtZT86IHN0cmluZztcbiAgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn0+O1xuXG5leHBvcnQgdHlwZSBFeHBsb3JlclN1YnNjcmlwdGlvblRlcm1pbmF0aW9uID0gTWVzc2FnZUV2ZW50PHtcbiAgbmFtZTogXCJFeHBsb3JlclN1YnNjcmlwdGlvblRlcm1pbmF0aW9uXCI7XG4gIG9wZXJhdGlvbklkOiBzdHJpbmc7XG59PjtcblxuZXhwb3J0IHR5cGUgRXhwbG9yZXJMaXN0ZW5pbmcgPSBNZXNzYWdlRXZlbnQ8e1xuICBuYW1lOlxuICAgIHwgXCJFeHBsb3Jlckxpc3RlbmluZ0ZvclNjaGVtYVwiXG4gICAgfCBcIkV4cGxvcmVyTGlzdGVuaW5nRm9yU3RhdGVcIlxuICAgIHwgXCJFeHBsb3Jlckxpc3RlbmluZ0ZvckhhbmRzaGFrZVwiO1xufT47XG5cbnR5cGUgRXhwbG9yZXJMaXN0ZW5pbmdGb3JQYXJ0aWFsVG9rZW4gPSBNZXNzYWdlRXZlbnQ8e1xuICBuYW1lOiBcIkV4cGxvcmVyTGlzdGVuaW5nRm9yUGFydGlhbFRva2VuXCI7XG4gIGxvY2FsU3RvcmFnZUtleT86IHN0cmluZztcbn0+O1xuXG5leHBvcnQgdHlwZSBFeHBsb3JlckludHJvc3BlY3Rpb25RdWVyeVdpdGhIZWFkZXJzID0gTWVzc2FnZUV2ZW50PHtcbiAgbmFtZTogXCJJbnRyb3NwZWN0aW9uUXVlcnlXaXRoSGVhZGVyc1wiO1xuICBpbnRyb3NwZWN0aW9uUmVxdWVzdEJvZHk6IHN0cmluZztcbiAgaW50cm9zcGVjdGlvblJlcXVlc3RIZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBzYW5kYm94RW5kcG9pbnRVcmw/OiBzdHJpbmc7XG59PjtcblxudHlwZSBTZXRQYXJ0aWFsQXV0aGVudGljYXRpb25Ub2tlbkZvclBhcmVudCA9IE1lc3NhZ2VFdmVudDx7XG4gIG5hbWU6IFwiU2V0UGFydGlhbEF1dGhlbnRpY2F0aW9uVG9rZW5Gb3JQYXJlbnRcIjtcbiAgbG9jYWxTdG9yYWdlS2V5OiBzdHJpbmc7XG4gIHBhcnRpYWxUb2tlbjogc3RyaW5nO1xuICBncmFwaFJlZjogc3RyaW5nO1xufT47XG5cbmV4cG9ydCB0eXBlIEluY29taW5nTWVzc2FnZUV2ZW50ID1cbiAgfCBFeHBsb3JlclJlcXVlc3RcbiAgfCBFeHBsb3JlclN1YnNjcmlwdGlvblJlcXVlc3RcbiAgfCBFeHBsb3JlclN1YnNjcmlwdGlvblRlcm1pbmF0aW9uXG4gIHwgRXhwbG9yZXJMaXN0ZW5pbmdcbiAgfCBFeHBsb3Jlckxpc3RlbmluZ0ZvclBhcnRpYWxUb2tlblxuICB8IEV4cGxvcmVySW50cm9zcGVjdGlvblF1ZXJ5V2l0aEhlYWRlcnNcbiAgfCBTZXRQYXJ0aWFsQXV0aGVudGljYXRpb25Ub2tlbkZvclBhcmVudDtcblxuZXhwb3J0IGNvbnN0IHBvc3RNZXNzYWdlVG9FbWJlZCA9ICh7XG4gIGVtYmVkZGVkRXhwbG9yZXJJRnJhbWUsXG4gIG1lc3NhZ2UsXG59OiB7XG4gIGVtYmVkZGVkRXhwbG9yZXJJRnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50O1xuICBtZXNzYWdlOiBPdXRnb2luZ01lc3NhZ2VFdmVudDtcbn0pOiB2b2lkID0+IHtcbiAgZW1iZWRkZWRFeHBsb3JlcklGcmFtZS5jb250ZW50V2luZG93Py5wb3N0TWVzc2FnZShcbiAgICBtZXNzYWdlLFxuICAgIEVNQkVEREFCTEVfRVhQTE9SRVJfVVJMXG4gICk7XG59O1xuIiwiaW1wb3J0IHsgTWVzc2FnZU9iaiB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgRXZlbnRMaXN0ZW5lcjxUID0gYW55PiA9IChldmVudDogQ3VzdG9tRXZlbnQ8TWVzc2FnZU9iajxUPj4pID0+IHZvaWQ7XG5cbmNsYXNzIEV2ZW50VGFyZ2V0IHtcbiAgbGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIFNldDxFdmVudExpc3RlbmVyPj4oKTtcblxuICBhZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBjYWxsYmFjazogRXZlbnRMaXN0ZW5lcikge1xuICAgIGNvbnN0IGlzUmVnaXN0ZXJlZCA9IHRoaXMubGlzdGVuZXJzLmhhcyhldmVudFR5cGUpO1xuICAgIFxuICAgIGlmICghaXNSZWdpc3RlcmVkKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycy5zZXQoZXZlbnRUeXBlLCBuZXcgU2V0PEV2ZW50TGlzdGVuZXI+KCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmdldChldmVudFR5cGUpO1xuICAgIGxpc3RlbmVycyEuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaXNSZWdpc3RlcmVkID0gdGhpcy5saXN0ZW5lcnMuaGFzKGV2ZW50VHlwZSk7XG5cbiAgICBpZiAoaXNSZWdpc3RlcmVkKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQoZXZlbnRUeXBlKTtcbiAgICAgIGxpc3RlbmVycyEuZGVsZXRlKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBDdXN0b21FdmVudCkge1xuICAgIGNvbnN0IGlzUmVnaXN0ZXJlZCA9IHRoaXMubGlzdGVuZXJzLmhhcyhldmVudD8udHlwZSk7XG5cbiAgICBpZiAoaXNSZWdpc3RlcmVkKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XG4gICAgICBsaXN0ZW5lcnMhLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoZXZlbnQpKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRUYXJnZXQ7XG5cblxuIiwiZXhwb3J0IGNvbnN0IENMSUVOVF9GT1VORCA9IFwiY2xpZW50LWZvdW5kXCI7XG5leHBvcnQgY29uc3QgUkVRVUVTVF9UQUJfSUQgPSBcInJlcXVlc3QtdGFiLWlkXCI7XG5leHBvcnQgY29uc3QgREVWVE9PTFNfSU5JVElBTElaRUQgPSBcImRldnRvb2xzLWluaXRpYWxpemVkXCI7XG5leHBvcnQgY29uc3QgRklORF9BUE9MTE9fQ0xJRU5UID0gXCJmaW5kLWFwb2xsby1jbGllbnRcIjtcbmV4cG9ydCBjb25zdCBBUE9MTE9fQ0xJRU5UX0ZPVU5EID0gXCJhcG9sbG8tY2xpZW50LWZvdW5kXCI7XG5leHBvcnQgY29uc3QgQ1JFQVRFX0RFVlRPT0xTX1BBTkVMID0gXCJjcmVhdGUtZGV2dG9vbHMtcGFuZWxcIjtcbmV4cG9ydCBjb25zdCBBQ1RJT05fSE9PS19GSVJFRCA9IFwiYWN0aW9uLWhvb2stZmlyZWRcIjtcbmV4cG9ydCBjb25zdCBSRVFVRVNUX0RBVEEgPSBcInJlcXVlc3QtZGF0YVwiO1xuZXhwb3J0IGNvbnN0IFVQREFURSA9IFwidXBkYXRlXCI7XG5leHBvcnQgY29uc3QgUEFORUxfT1BFTiA9IFwicGFuZWwtb3BlblwiO1xuZXhwb3J0IGNvbnN0IFBBTkVMX0NMT1NFRCA9IFwicGFuZWwtY2xvc2VkXCI7XG5leHBvcnQgY29uc3QgRVhQTE9SRVJfUkVRVUVTVCA9IFwiZXhwbG9yZXItcmVxdWVzdFwiO1xuZXhwb3J0IGNvbnN0IEVYUExPUkVSX1JFU1BPTlNFID0gXCJleHBsb3Jlci1yZXNwb25zZVwiO1xuZXhwb3J0IGNvbnN0IFJFTE9BRElOR19UQUIgPSBcInJlbG9hZGluZy10YWJcIjtcbmV4cG9ydCBjb25zdCBSRUxPQURfVEFCX0NPTVBMRVRFID0gXCJyZWxvYWQtdGFiLWNvbXBsZXRlXCI7XG5cbiIsImltcG9ydCB7IEVYUExPUkVSX1NVQlNDUklQVElPTl9URVJNSU5BVElPTiB9IGZyb20gXCIuLi8uLi9hcHBsaWNhdGlvbi9jb21wb25lbnRzL0V4cGxvcmVyL3Bvc3RNZXNzYWdlSGVscGVyc1wiO1xuaW1wb3J0IFJlbGF5IGZyb20gXCIuLi8uLi9SZWxheVwiO1xuaW1wb3J0IHtcbiAgREVWVE9PTFNfSU5JVElBTElaRUQsXG4gIENSRUFURV9ERVZUT09MU19QQU5FTCxcbiAgUkVRVUVTVF9EQVRBLFxuICBVUERBVEUsXG4gIFBBTkVMX09QRU4sXG4gIFBBTkVMX0NMT1NFRCxcbiAgRVhQTE9SRVJfUkVRVUVTVCxcbiAgUkVMT0FESU5HX1RBQixcbiAgUkVMT0FEX1RBQl9DT01QTEVURSxcbn0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xuXG5jb25zdCBpbnNwZWN0ZWRUYWJJZCA9IGNocm9tZS5kZXZ0b29scy5pbnNwZWN0ZWRXaW5kb3cudGFiSWQ7XG5jb25zdCBkZXZ0b29scyA9IG5ldyBSZWxheSgpO1xuXG5jb25zdCBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7XG4gIG5hbWU6IGBkZXZ0b29scy0ke2luc3BlY3RlZFRhYklkfWAsXG59KTtcbnBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKGRldnRvb2xzLmJyb2FkY2FzdCk7XG5cbmRldnRvb2xzLmFkZENvbm5lY3Rpb24oXCJiYWNrZ3JvdW5kXCIsIChtZXNzYWdlKSA9PiB7XG4gIHRyeSB7XG4gICAgcG9ydC5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBkZXZ0b29scy5yZW1vdmVDb25uZWN0aW9uKFwiYmFja2dyb3VuZFwiKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHNlbmRNZXNzYWdlVG9DbGllbnQobWVzc2FnZTogYW55KSB7XG4gIGRldnRvb2xzLnNlbmQoe1xuICAgIG1lc3NhZ2UsXG4gICAgdG86IGBiYWNrZ3JvdW5kOnRhYi0ke2luc3BlY3RlZFRhYklkfTpjbGllbnRgLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gc3RhcnRSZXF1ZXN0SW50ZXJ2YWwobXMgPSA1MDApIHtcbiAgc2VuZE1lc3NhZ2VUb0NsaWVudChSRVFVRVNUX0RBVEEpO1xuICBjb25zdCBpZCA9IHNldEludGVydmFsKHNlbmRNZXNzYWdlVG9DbGllbnQsIG1zLCBSRVFVRVNUX0RBVEEpO1xuICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChpZCk7XG59XG5cbmxldCBpc1BhbmVsQ3JlYXRlZCA9IGZhbHNlO1xubGV0IGlzQXBwSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuZGV2dG9vbHMuYWRkQ29ubmVjdGlvbihFWFBMT1JFUl9TVUJTQ1JJUFRJT05fVEVSTUlOQVRJT04sICgpID0+IHtcbiAgc2VuZE1lc3NhZ2VUb0NsaWVudChFWFBMT1JFUl9TVUJTQ1JJUFRJT05fVEVSTUlOQVRJT04pO1xufSk7XG5cbmRldnRvb2xzLmxpc3RlbihDUkVBVEVfREVWVE9PTFNfUEFORUwsICh7IHBheWxvYWQgfSkgPT4ge1xuICBpZiAoIWlzUGFuZWxDcmVhdGVkKSB7XG4gICAgY2hyb21lLmRldnRvb2xzLnBhbmVscy5jcmVhdGUoXG4gICAgICBcIkFwb2xsb1wiLFxuICAgICAgXCJsb2dvX2RldnRvb2xzLnBuZ1wiLFxuICAgICAgXCJwYW5lbC5odG1sXCIsXG4gICAgICBmdW5jdGlvbiAocGFuZWwpIHtcbiAgICAgICAgaXNQYW5lbENyZWF0ZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCB7IHF1ZXJpZXMsIG11dGF0aW9ucywgY2FjaGUgfSA9IEpTT04ucGFyc2UocGF5bG9hZCk7XG4gICAgICAgIGxldCByZW1vdmVVcGRhdGVMaXN0ZW5lcjtcbiAgICAgICAgbGV0IHJlbW92ZUV4cGxvcmVyRm9yd2FyZDtcbiAgICAgICAgbGV0IHJlbW92ZVN1YnNjcmlwdGlvblRlcm1pbmF0aW9uTGlzdGVuZXI7XG4gICAgICAgIGxldCByZW1vdmVSZWxvYWRMaXN0ZW5lcjtcbiAgICAgICAgbGV0IGNsZWFyUmVxdWVzdEludGVydmFsO1xuICAgICAgICBsZXQgcmVtb3ZlRXhwbG9yZXJMaXN0ZW5lcjtcblxuICAgICAgICBwYW5lbC5vblNob3duLmFkZExpc3RlbmVyKCh3aW5kb3cpID0+IHtcbiAgICAgICAgICBzZW5kTWVzc2FnZVRvQ2xpZW50KFBBTkVMX09QRU4pO1xuXG4gICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgX19ERVZUT09MU19BUFBMSUNBVElPTl9fOiB7XG4gICAgICAgICAgICAgIGluaXRpYWxpemUsXG4gICAgICAgICAgICAgIHdyaXRlRGF0YSxcbiAgICAgICAgICAgICAgcmVjZWl2ZUV4cGxvcmVyUmVxdWVzdHMsXG4gICAgICAgICAgICAgIHJlY2VpdmVTdWJzY3JpcHRpb25UZXJtaW5hdGlvblJlcXVlc3QsXG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZVRvRXhwbG9yZXIsXG4gICAgICAgICAgICAgIGhhbmRsZVJlbG9hZCxcbiAgICAgICAgICAgICAgaGFuZGxlUmVsb2FkQ29tcGxldGUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0gPSB3aW5kb3cgYXMgYW55O1xuXG4gICAgICAgICAgaWYgKCFpc0FwcEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBpbml0aWFsaXplKCk7XG4gICAgICAgICAgICB3cml0ZURhdGEoeyBxdWVyaWVzLCBtdXRhdGlvbnMsIGNhY2hlOiBKU09OLnN0cmluZ2lmeShjYWNoZSkgfSk7XG4gICAgICAgICAgICBpc0FwcEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjbGVhclJlcXVlc3RJbnRlcnZhbCA9IHN0YXJ0UmVxdWVzdEludGVydmFsKCk7XG5cbiAgICAgICAgICByZW1vdmVVcGRhdGVMaXN0ZW5lciA9IGRldnRvb2xzLmxpc3RlbihVUERBVEUsICh7IHBheWxvYWQgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBxdWVyaWVzLCBtdXRhdGlvbnMsIGNhY2hlIH0gPSBKU09OLnBhcnNlKHBheWxvYWQpO1xuICAgICAgICAgICAgd3JpdGVEYXRhKHsgcXVlcmllcywgbXV0YXRpb25zLCBjYWNoZTogSlNPTi5zdHJpbmdpZnkoY2FjaGUpIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQWRkIGNvbm5lY3Rpb24gc28gY2xpZW50IGNhbiBzZW5kIHRvIGBiYWNrZ3JvdW5kOmRldnRvb2xzLSR7aW5zcGVjdGVkVGFiSWR9OmV4cGxvcmVyYFxuICAgICAgICAgIGRldnRvb2xzLmFkZENvbm5lY3Rpb24oXCJleHBsb3JlclwiLCBzZW5kUmVzcG9uc2VUb0V4cGxvcmVyKTtcbiAgICAgICAgICByZW1vdmVFeHBsb3Jlckxpc3RlbmVyID0gcmVjZWl2ZUV4cGxvcmVyUmVxdWVzdHMoKHsgZGV0YWlsIH0pID0+IHtcbiAgICAgICAgICAgIGRldnRvb2xzLmJyb2FkY2FzdChkZXRhaWwpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmVtb3ZlU3Vic2NyaXB0aW9uVGVybWluYXRpb25MaXN0ZW5lciA9XG4gICAgICAgICAgICByZWNlaXZlU3Vic2NyaXB0aW9uVGVybWluYXRpb25SZXF1ZXN0KCh7IGRldGFpbCB9KSA9PiB7XG4gICAgICAgICAgICAgIGRldnRvb2xzLmJyb2FkY2FzdChkZXRhaWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBGb3J3YXJkIGFsbCBFeHBsb3JlciByZXF1ZXN0cyB0byB0aGUgY2xpZW50XG4gICAgICAgICAgcmVtb3ZlRXhwbG9yZXJGb3J3YXJkID0gZGV2dG9vbHMuZm9yd2FyZChcbiAgICAgICAgICAgIEVYUExPUkVSX1JFUVVFU1QsXG4gICAgICAgICAgICBgYmFja2dyb3VuZDp0YWItJHtpbnNwZWN0ZWRUYWJJZH06Y2xpZW50YFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyBMaXN0ZW4gZm9yIHRhYiByZWxvYWQgZnJvbSBiYWNrZ3JvdW5kXG4gICAgICAgICAgcmVtb3ZlUmVsb2FkTGlzdGVuZXIgPSBkZXZ0b29scy5saXN0ZW4oUkVMT0FESU5HX1RBQiwgKCkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlUmVsb2FkKCk7XG4gICAgICAgICAgICBjbGVhclJlcXVlc3RJbnRlcnZhbCgpO1xuXG4gICAgICAgICAgICBjb25zdCByZW1vdmVMaXN0ZW5lciA9IGRldnRvb2xzLmxpc3RlbihSRUxPQURfVEFCX0NPTVBMRVRFLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNsZWFyUmVxdWVzdEludGVydmFsID0gc3RhcnRSZXF1ZXN0SW50ZXJ2YWwoKTtcbiAgICAgICAgICAgICAgaGFuZGxlUmVsb2FkQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBwYW5lbC5vbkhpZGRlbi5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gICAgICAgICAgaXNQYW5lbENyZWF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICBjbGVhclJlcXVlc3RJbnRlcnZhbCgpO1xuICAgICAgICAgIHJlbW92ZUV4cGxvcmVyRm9yd2FyZCgpO1xuICAgICAgICAgIHJlbW92ZVN1YnNjcmlwdGlvblRlcm1pbmF0aW9uTGlzdGVuZXIoKTtcbiAgICAgICAgICByZW1vdmVVcGRhdGVMaXN0ZW5lcigpO1xuICAgICAgICAgIHJlbW92ZVJlbG9hZExpc3RlbmVyKCk7XG4gICAgICAgICAgcmVtb3ZlRXhwbG9yZXJMaXN0ZW5lcigpO1xuICAgICAgICAgIGRldnRvb2xzLnJlbW92ZUNvbm5lY3Rpb24oXCJleHBsb3JlclwiKTtcbiAgICAgICAgICBzZW5kTWVzc2FnZVRvQ2xpZW50KFBBTkVMX0NMT1NFRCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cbn0pO1xuXG5zZW5kTWVzc2FnZVRvQ2xpZW50KERFVlRPT0xTX0lOSVRJQUxJWkVEKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvZXh0ZW5zaW9uL2RldnRvb2xzL2RldnRvb2xzLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9