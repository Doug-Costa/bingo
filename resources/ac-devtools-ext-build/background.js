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

/***/ "./src/extension/background/background.ts":
/*!************************************************!*\
  !*** ./src/extension/background/background.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Relay_1 = __importDefault(__webpack_require__(/*! ../../Relay */ "./src/Relay.ts"));
const constants_1 = __webpack_require__(/*! ../constants */ "./src/extension/constants.ts");
// This sends the tab id to the inspected tab.
chrome.runtime.onMessage.addListener(({ message }, sender, sendResponse) => {
    var _a;
    if (message === constants_1.REQUEST_TAB_ID) {
        sendResponse((_a = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _a === void 0 ? void 0 : _a.id);
    }
});
const background = new Relay_1.default();
chrome.runtime.onConnect.addListener(port => {
    background.addConnection(port.name, message => {
        port.postMessage(message);
    });
    port.onMessage.addListener(message => {
        background.broadcast(message);
    });
    port.onDisconnect.addListener(port => {
        background.removeConnection(port.name);
    });
});


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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension/background/background.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNoQywyQkFBbUIsR0FBRyxxQkFBcUIsQ0FBQzs7Ozs7OztVQ2R6RDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy8uL3NyYy9SZWxheS50cyIsIndlYnBhY2s6Ly9hcG9sbG8tY2xpZW50LWRldnRvb2xzLy4vc3JjL2V4dGVuc2lvbi9FdmVudFRhcmdldC50cyIsIndlYnBhY2s6Ly9hcG9sbG8tY2xpZW50LWRldnRvb2xzLy4vc3JjL2V4dGVuc2lvbi9iYWNrZ3JvdW5kL2JhY2tncm91bmQudHMiLCJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy8uL3NyYy9leHRlbnNpb24vY29uc3RhbnRzLnRzIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIFxuICBUaGUgbmF0aXZlIEV2ZW50VGFyZ2V0IGludGVyZmFjZSBpcyBub3QgdXNlYWJsZSBpbiBjb250ZW50IHNjcmlwdHMgaW4gRmlyZWZveC4gXG4gIFdlIGltcG9ydCBhbmQgZXh0ZW5kIGZyb20gdGhpcyBzaW1wbGlmaWVkIGNsYXNzIHRvIHVzZSB0aGUgRXZlbnRUYXJnZXQgZnVuY3Rpb25hbGl0eSB3ZSBuZWVkLlxuKi9cbmltcG9ydCBFdmVudFRhcmdldCBmcm9tIFwiLi9leHRlbnNpb24vRXZlbnRUYXJnZXRcIjtcbmltcG9ydCB7IEN1c3RvbUV2ZW50TGlzdGVuZXIsIE1lc3NhZ2VPYmogfSBmcm9tIFwiLi90eXBlc1wiO1xuY2xhc3MgUmVsYXkgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIHByaXZhdGUgY29ubmVjdGlvbnMgPSBuZXcgTWFwPFxuICAgIHN0cmluZyxcbiAgICAoZXZlbnQ6IEN1c3RvbUV2ZW50PE1lc3NhZ2VPYmo+KSA9PiBSZXR1cm5UeXBlPEN1c3RvbUV2ZW50TGlzdGVuZXI+XG4gID4oKTtcblxuICBwdWJsaWMgYWRkQ29ubmVjdGlvbiA9IChuYW1lOiBzdHJpbmcsIGZuOiAobWVzc2FnZTogTWVzc2FnZU9iaikgPT4gdm9pZCkgPT4ge1xuICAgIGZ1bmN0aW9uIHdyYXBwZWRGbihldmVudDogQ3VzdG9tRXZlbnQ8TWVzc2FnZU9iaj4pIHtcbiAgICAgIHJldHVybiBmbihldmVudC5kZXRhaWwpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwcGVkRm4pO1xuICAgIHRoaXMuY29ubmVjdGlvbnMuc2V0KG5hbWUsIHdyYXBwZWRGbik7XG5cbiAgICByZXR1cm4gKCkgPT4gdGhpcy5yZW1vdmVDb25uZWN0aW9uKG5hbWUpO1xuICB9O1xuXG4gIHB1YmxpYyByZW1vdmVDb25uZWN0aW9uID0gKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5jb25uZWN0aW9ucy5nZXQobmFtZSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuICAgICAgdGhpcy5jb25uZWN0aW9ucy5kZWxldGUobmFtZSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgY3JlYXRlRXZlbnQgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudChtZXNzYWdlLCB7IGRldGFpbDoge30gfSk7XG4gIH07XG5cbiAgcHVibGljIGJyb2FkY2FzdCA9IChtZXNzYWdlOiBNZXNzYWdlT2JqKSA9PiB7XG4gICAgbGV0IGV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudChtZXNzYWdlLm1lc3NhZ2UpO1xuXG4gICAgaWYgKG1lc3NhZ2U/LnRvKSB7XG4gICAgICBsZXQgZGVzdGluYXRpb24gPSBtZXNzYWdlLnRvO1xuICAgICAgZXZlbnQuZGV0YWlsW1widG9cIl0gPSBkZXN0aW5hdGlvbjtcbiAgICAgIGxldCBuZXh0RGVzdGluYXRpb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCByZW1haW5pbmc6IHN0cmluZ1tdO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgaW50ZXJtZWRpYXRlIGRlc3RpbmF0aW9uc1xuICAgICAgLy8gRXhhbXBsZTogJ2JhY2tncm91bmQ6dGFiOndpbmRvdydcbiAgICAgIGlmIChkZXN0aW5hdGlvbi5pbmNsdWRlcyhcIjpcIikpIHtcbiAgICAgICAgW2Rlc3RpbmF0aW9uLCAuLi5yZW1haW5pbmddID0gbWVzc2FnZS50by5zcGxpdChcIjpcIik7XG4gICAgICAgIG5leHREZXN0aW5hdGlvbiA9IHJlbWFpbmluZy5qb2luKFwiOlwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbnMuaGFzKGRlc3RpbmF0aW9uKSkge1xuICAgICAgICBldmVudCA9IHRoaXMuY3JlYXRlRXZlbnQoZGVzdGluYXRpb24pO1xuICAgICAgICBldmVudC5kZXRhaWxbXCJ0b1wiXSA9IG5leHREZXN0aW5hdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudC5kZXRhaWxbXCJtZXNzYWdlXCJdID0gbWVzc2FnZS5tZXNzYWdlO1xuICAgIGV2ZW50LmRldGFpbFtcInBheWxvYWRcIl0gPSBtZXNzYWdlLnBheWxvYWQ7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfTtcblxuICBwdWJsaWMgbGlzdGVuID0gPFQgPSBhbnk+KG5hbWU6IHN0cmluZywgZm46IEN1c3RvbUV2ZW50TGlzdGVuZXI8VD4pID0+IHtcbiAgICBmdW5jdGlvbiB3cmFwcGVkRm4oZXZlbnQ6IEN1c3RvbUV2ZW50PE1lc3NhZ2VPYmo8VD4+KSB7XG4gICAgICByZXR1cm4gZm4oZXZlbnQuZGV0YWlsKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgd3JhcHBlZEZuKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBwZWRGbik7XG4gICAgfTtcbiAgfTtcblxuICBwdWJsaWMgc2VuZCA9IChtZXNzYWdlT2JqOiBNZXNzYWdlT2JqKSA9PiB7XG4gICAgdGhpcy5icm9hZGNhc3QobWVzc2FnZU9iaik7XG4gIH07XG5cbiAgcHVibGljIGZvcndhcmQgPSAobWVzc2FnZTogc3RyaW5nLCBuZXdSZWNpcGllbnQ6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmxpc3RlbihtZXNzYWdlLCAobWVzc2FnZU9iaikgPT4ge1xuICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAuLi5tZXNzYWdlT2JqLFxuICAgICAgICB0bzogbmV3UmVjaXBpZW50LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF5O1xuIiwiaW1wb3J0IHsgTWVzc2FnZU9iaiB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgRXZlbnRMaXN0ZW5lcjxUID0gYW55PiA9IChldmVudDogQ3VzdG9tRXZlbnQ8TWVzc2FnZU9iajxUPj4pID0+IHZvaWQ7XG5cbmNsYXNzIEV2ZW50VGFyZ2V0IHtcbiAgbGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIFNldDxFdmVudExpc3RlbmVyPj4oKTtcblxuICBhZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBjYWxsYmFjazogRXZlbnRMaXN0ZW5lcikge1xuICAgIGNvbnN0IGlzUmVnaXN0ZXJlZCA9IHRoaXMubGlzdGVuZXJzLmhhcyhldmVudFR5cGUpO1xuICAgIFxuICAgIGlmICghaXNSZWdpc3RlcmVkKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycy5zZXQoZXZlbnRUeXBlLCBuZXcgU2V0PEV2ZW50TGlzdGVuZXI+KCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmdldChldmVudFR5cGUpO1xuICAgIGxpc3RlbmVycyEuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaXNSZWdpc3RlcmVkID0gdGhpcy5saXN0ZW5lcnMuaGFzKGV2ZW50VHlwZSk7XG5cbiAgICBpZiAoaXNSZWdpc3RlcmVkKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQoZXZlbnRUeXBlKTtcbiAgICAgIGxpc3RlbmVycyEuZGVsZXRlKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBDdXN0b21FdmVudCkge1xuICAgIGNvbnN0IGlzUmVnaXN0ZXJlZCA9IHRoaXMubGlzdGVuZXJzLmhhcyhldmVudD8udHlwZSk7XG5cbiAgICBpZiAoaXNSZWdpc3RlcmVkKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XG4gICAgICBsaXN0ZW5lcnMhLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoZXZlbnQpKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRUYXJnZXQ7XG5cblxuIiwiaW1wb3J0IFJlbGF5IGZyb20gJy4uLy4uL1JlbGF5JztcbmltcG9ydCB7IFxuICBSRVFVRVNUX1RBQl9JRCwgXG59IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbi8vIFRoaXMgc2VuZHMgdGhlIHRhYiBpZCB0byB0aGUgaW5zcGVjdGVkIHRhYi5cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigoeyBtZXNzYWdlIH0sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChtZXNzYWdlID09PSBSRVFVRVNUX1RBQl9JRCkge1xuICAgIHNlbmRSZXNwb25zZShzZW5kZXI/LnRhYj8uaWQpO1xuICB9XG59KTtcblxuY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWxheSgpO1xuXG5jaHJvbWUucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIocG9ydCA9PiB7XG4gIGJhY2tncm91bmQuYWRkQ29ubmVjdGlvbihwb3J0Lm5hbWUsIG1lc3NhZ2UgPT4ge1xuICAgIHBvcnQucG9zdE1lc3NhZ2UobWVzc2FnZSk7XG4gIH0pO1xuICBcbiAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIobWVzc2FnZSA9PiB7XG4gICAgYmFja2dyb3VuZC5icm9hZGNhc3QobWVzc2FnZSk7XG4gIH0pO1xuXG4gIHBvcnQub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKHBvcnQgPT4ge1xuICAgIGJhY2tncm91bmQucmVtb3ZlQ29ubmVjdGlvbihwb3J0Lm5hbWUpO1xuICB9KTtcbn0pO1xuIiwiZXhwb3J0IGNvbnN0IENMSUVOVF9GT1VORCA9IFwiY2xpZW50LWZvdW5kXCI7XG5leHBvcnQgY29uc3QgUkVRVUVTVF9UQUJfSUQgPSBcInJlcXVlc3QtdGFiLWlkXCI7XG5leHBvcnQgY29uc3QgREVWVE9PTFNfSU5JVElBTElaRUQgPSBcImRldnRvb2xzLWluaXRpYWxpemVkXCI7XG5leHBvcnQgY29uc3QgRklORF9BUE9MTE9fQ0xJRU5UID0gXCJmaW5kLWFwb2xsby1jbGllbnRcIjtcbmV4cG9ydCBjb25zdCBBUE9MTE9fQ0xJRU5UX0ZPVU5EID0gXCJhcG9sbG8tY2xpZW50LWZvdW5kXCI7XG5leHBvcnQgY29uc3QgQ1JFQVRFX0RFVlRPT0xTX1BBTkVMID0gXCJjcmVhdGUtZGV2dG9vbHMtcGFuZWxcIjtcbmV4cG9ydCBjb25zdCBBQ1RJT05fSE9PS19GSVJFRCA9IFwiYWN0aW9uLWhvb2stZmlyZWRcIjtcbmV4cG9ydCBjb25zdCBSRVFVRVNUX0RBVEEgPSBcInJlcXVlc3QtZGF0YVwiO1xuZXhwb3J0IGNvbnN0IFVQREFURSA9IFwidXBkYXRlXCI7XG5leHBvcnQgY29uc3QgUEFORUxfT1BFTiA9IFwicGFuZWwtb3BlblwiO1xuZXhwb3J0IGNvbnN0IFBBTkVMX0NMT1NFRCA9IFwicGFuZWwtY2xvc2VkXCI7XG5leHBvcnQgY29uc3QgRVhQTE9SRVJfUkVRVUVTVCA9IFwiZXhwbG9yZXItcmVxdWVzdFwiO1xuZXhwb3J0IGNvbnN0IEVYUExPUkVSX1JFU1BPTlNFID0gXCJleHBsb3Jlci1yZXNwb25zZVwiO1xuZXhwb3J0IGNvbnN0IFJFTE9BRElOR19UQUIgPSBcInJlbG9hZGluZy10YWJcIjtcbmV4cG9ydCBjb25zdCBSRUxPQURfVEFCX0NPTVBMRVRFID0gXCJyZWxvYWQtdGFiLWNvbXBsZXRlXCI7XG5cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9leHRlbnNpb24vYmFja2dyb3VuZC9iYWNrZ3JvdW5kLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9