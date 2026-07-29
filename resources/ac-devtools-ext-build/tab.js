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

/***/ "./src/extension/tab/tabRelay.ts":
/*!***************************************!*\
  !*** ./src/extension/tab/tabRelay.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Relay_1 = __importDefault(__webpack_require__(/*! ../../Relay */ "./src/Relay.ts"));
const constants_1 = __webpack_require__(/*! ../constants */ "./src/extension/constants.ts");
// Inspected tabs are unable to retrieve their own ids.
// This requests the tab's id from the background script.
// Once it resolves, we can create the tab's Relay.
function requestId() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ message: constants_1.REQUEST_TAB_ID }, function (id) {
            resolve(id);
        });
    });
}
exports["default"] = new Promise(($export) => __awaiter(void 0, void 0, void 0, function* () {
    const id = yield requestId();
    const tab = new Relay_1.default();
    const port = chrome.runtime.connect({
        name: `tab-${id}`,
    });
    tab.addConnection("background", (message) => {
        port.postMessage(message);
    });
    port.onMessage.addListener(tab.broadcast);
    window.addEventListener("message", (event) => {
        tab.broadcast(event === null || event === void 0 ? void 0 : event.data);
    });
    tab.addConnection("client", (message) => {
        window.postMessage(message, "*");
    });
    const devtools = `background:devtools-${id}`;
    tab.forward(constants_1.CLIENT_FOUND, devtools);
    tab.forward(constants_1.CREATE_DEVTOOLS_PANEL, devtools);
    tab.forward(constants_1.ACTION_HOOK_FIRED, devtools);
    tab.forward(constants_1.UPDATE, devtools);
    tab.forward(constants_1.RELOADING_TAB, devtools);
    tab.forward(constants_1.RELOAD_TAB_COMPLETE, devtools);
    tab.forward(constants_1.EXPLORER_RESPONSE, `${devtools}:explorer`);
    const module = yield Promise.resolve({ tab, id });
    $export(module);
}));


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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************************!*\
  !*** ./src/extension/tab/tab.ts ***!
  \**********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
// This script is injected into each tab.
__webpack_require__(/*! ./tabRelay */ "./src/extension/tab/tabRelay.ts");
/*
  Content scripts are unable to modify the window object directly.
  A common workaround for this issue is to inject an inlined function
  into the inspected tab.
*/
// if (typeof document === "object" && document instanceof HTMLDocument) {
//     const script = document.createElement("script");
//     script.setAttribute("type", "module");
//     script.setAttribute("src", chrome.extension.getURL("hook.js"));
//     document.addEventListener("DOMContentLoaded", () => {
//         var _a;
//         const importMap = document.querySelector("script[type=\"importmap\"]");
//         if (importMap != null) {
//             (_a = importMap.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(script, importMap.nextSibling);
//         }
//         else {
//             const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
//             head.insertBefore(script, head.lastChild);
//         }
//     });
// }

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQ3RCQSx5Q0FBeUM7QUFDekMseUVBQW9CO0FBRXBCOzs7O0VBSUU7QUFDRixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxRQUFRLFlBQVksWUFBWSxFQUFFO0lBQ3BFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUMvRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFOztRQUNqRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDdkUsSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO1lBQ3JCLGVBQVMsQ0FBQyxVQUFVLDBDQUFFLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ25FO2FBQU07WUFDTCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDO1lBQ25HLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUMsQ0FBQyxDQUFDO0NBQ0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcG9sbG8tY2xpZW50LWRldnRvb2xzLy4vc3JjL1JlbGF5LnRzIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvLi9zcmMvZXh0ZW5zaW9uL0V2ZW50VGFyZ2V0LnRzIiwid2VicGFjazovL2Fwb2xsby1jbGllbnQtZGV2dG9vbHMvLi9zcmMvZXh0ZW5zaW9uL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9hcG9sbG8tY2xpZW50LWRldnRvb2xzLy4vc3JjL2V4dGVuc2lvbi90YWIvdGFiUmVsYXkudHMiLCJ3ZWJwYWNrOi8vYXBvbGxvLWNsaWVudC1kZXZ0b29scy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hcG9sbG8tY2xpZW50LWRldnRvb2xzLy4vc3JjL2V4dGVuc2lvbi90YWIvdGFiLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIFxuICBUaGUgbmF0aXZlIEV2ZW50VGFyZ2V0IGludGVyZmFjZSBpcyBub3QgdXNlYWJsZSBpbiBjb250ZW50IHNjcmlwdHMgaW4gRmlyZWZveC4gXG4gIFdlIGltcG9ydCBhbmQgZXh0ZW5kIGZyb20gdGhpcyBzaW1wbGlmaWVkIGNsYXNzIHRvIHVzZSB0aGUgRXZlbnRUYXJnZXQgZnVuY3Rpb25hbGl0eSB3ZSBuZWVkLlxuKi9cbmltcG9ydCBFdmVudFRhcmdldCBmcm9tIFwiLi9leHRlbnNpb24vRXZlbnRUYXJnZXRcIjtcbmltcG9ydCB7IEN1c3RvbUV2ZW50TGlzdGVuZXIsIE1lc3NhZ2VPYmogfSBmcm9tIFwiLi90eXBlc1wiO1xuY2xhc3MgUmVsYXkgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIHByaXZhdGUgY29ubmVjdGlvbnMgPSBuZXcgTWFwPFxuICAgIHN0cmluZyxcbiAgICAoZXZlbnQ6IEN1c3RvbUV2ZW50PE1lc3NhZ2VPYmo+KSA9PiBSZXR1cm5UeXBlPEN1c3RvbUV2ZW50TGlzdGVuZXI+XG4gID4oKTtcblxuICBwdWJsaWMgYWRkQ29ubmVjdGlvbiA9IChuYW1lOiBzdHJpbmcsIGZuOiAobWVzc2FnZTogTWVzc2FnZU9iaikgPT4gdm9pZCkgPT4ge1xuICAgIGZ1bmN0aW9uIHdyYXBwZWRGbihldmVudDogQ3VzdG9tRXZlbnQ8TWVzc2FnZU9iaj4pIHtcbiAgICAgIHJldHVybiBmbihldmVudC5kZXRhaWwpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwcGVkRm4pO1xuICAgIHRoaXMuY29ubmVjdGlvbnMuc2V0KG5hbWUsIHdyYXBwZWRGbik7XG5cbiAgICByZXR1cm4gKCkgPT4gdGhpcy5yZW1vdmVDb25uZWN0aW9uKG5hbWUpO1xuICB9O1xuXG4gIHB1YmxpYyByZW1vdmVDb25uZWN0aW9uID0gKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5jb25uZWN0aW9ucy5nZXQobmFtZSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuICAgICAgdGhpcy5jb25uZWN0aW9ucy5kZWxldGUobmFtZSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgY3JlYXRlRXZlbnQgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudChtZXNzYWdlLCB7IGRldGFpbDoge30gfSk7XG4gIH07XG5cbiAgcHVibGljIGJyb2FkY2FzdCA9IChtZXNzYWdlOiBNZXNzYWdlT2JqKSA9PiB7XG4gICAgbGV0IGV2ZW50ID0gdGhpcy5jcmVhdGVFdmVudChtZXNzYWdlLm1lc3NhZ2UpO1xuXG4gICAgaWYgKG1lc3NhZ2U/LnRvKSB7XG4gICAgICBsZXQgZGVzdGluYXRpb24gPSBtZXNzYWdlLnRvO1xuICAgICAgZXZlbnQuZGV0YWlsW1widG9cIl0gPSBkZXN0aW5hdGlvbjtcbiAgICAgIGxldCBuZXh0RGVzdGluYXRpb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCByZW1haW5pbmc6IHN0cmluZ1tdO1xuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgaW50ZXJtZWRpYXRlIGRlc3RpbmF0aW9uc1xuICAgICAgLy8gRXhhbXBsZTogJ2JhY2tncm91bmQ6dGFiOndpbmRvdydcbiAgICAgIGlmIChkZXN0aW5hdGlvbi5pbmNsdWRlcyhcIjpcIikpIHtcbiAgICAgICAgW2Rlc3RpbmF0aW9uLCAuLi5yZW1haW5pbmddID0gbWVzc2FnZS50by5zcGxpdChcIjpcIik7XG4gICAgICAgIG5leHREZXN0aW5hdGlvbiA9IHJlbWFpbmluZy5qb2luKFwiOlwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbnMuaGFzKGRlc3RpbmF0aW9uKSkge1xuICAgICAgICBldmVudCA9IHRoaXMuY3JlYXRlRXZlbnQoZGVzdGluYXRpb24pO1xuICAgICAgICBldmVudC5kZXRhaWxbXCJ0b1wiXSA9IG5leHREZXN0aW5hdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudC5kZXRhaWxbXCJtZXNzYWdlXCJdID0gbWVzc2FnZS5tZXNzYWdlO1xuICAgIGV2ZW50LmRldGFpbFtcInBheWxvYWRcIl0gPSBtZXNzYWdlLnBheWxvYWQ7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfTtcblxuICBwdWJsaWMgbGlzdGVuID0gPFQgPSBhbnk+KG5hbWU6IHN0cmluZywgZm46IEN1c3RvbUV2ZW50TGlzdGVuZXI8VD4pID0+IHtcbiAgICBmdW5jdGlvbiB3cmFwcGVkRm4oZXZlbnQ6IEN1c3RvbUV2ZW50PE1lc3NhZ2VPYmo8VD4+KSB7XG4gICAgICByZXR1cm4gZm4oZXZlbnQuZGV0YWlsKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgd3JhcHBlZEZuKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBwZWRGbik7XG4gICAgfTtcbiAgfTtcblxuICBwdWJsaWMgc2VuZCA9IChtZXNzYWdlT2JqOiBNZXNzYWdlT2JqKSA9PiB7XG4gICAgdGhpcy5icm9hZGNhc3QobWVzc2FnZU9iaik7XG4gIH07XG5cbiAgcHVibGljIGZvcndhcmQgPSAobWVzc2FnZTogc3RyaW5nLCBuZXdSZWNpcGllbnQ6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmxpc3RlbihtZXNzYWdlLCAobWVzc2FnZU9iaikgPT4ge1xuICAgICAgdGhpcy5icm9hZGNhc3Qoe1xuICAgICAgICAuLi5tZXNzYWdlT2JqLFxuICAgICAgICB0bzogbmV3UmVjaXBpZW50LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbGF5O1xuIiwiaW1wb3J0IHsgTWVzc2FnZU9iaiB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgRXZlbnRMaXN0ZW5lcjxUID0gYW55PiA9IChldmVudDogQ3VzdG9tRXZlbnQ8TWVzc2FnZU9iajxUPj4pID0+IHZvaWQ7XG5cbmNsYXNzIEV2ZW50VGFyZ2V0IHtcbiAgbGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIFNldDxFdmVudExpc3RlbmVyPj4oKTtcblxuICBhZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBjYWxsYmFjazogRXZlbnRMaXN0ZW5lcikge1xuICAgIGNvbnN0IGlzUmVnaXN0ZXJlZCA9IHRoaXMubGlzdGVuZXJzLmhhcyhldmVudFR5cGUpO1xuICAgIFxuICAgIGlmICghaXNSZWdpc3RlcmVkKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycy5zZXQoZXZlbnRUeXBlLCBuZXcgU2V0PEV2ZW50TGlzdGVuZXI+KCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmdldChldmVudFR5cGUpO1xuICAgIGxpc3RlbmVycyEuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaXNSZWdpc3RlcmVkID0gdGhpcy5saXN0ZW5lcnMuaGFzKGV2ZW50VHlwZSk7XG5cbiAgICBpZiAoaXNSZWdpc3RlcmVkKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQoZXZlbnRUeXBlKTtcbiAgICAgIGxpc3RlbmVycyEuZGVsZXRlKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBDdXN0b21FdmVudCkge1xuICAgIGNvbnN0IGlzUmVnaXN0ZXJlZCA9IHRoaXMubGlzdGVuZXJzLmhhcyhldmVudD8udHlwZSk7XG5cbiAgICBpZiAoaXNSZWdpc3RlcmVkKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQoZXZlbnQudHlwZSk7XG4gICAgICBsaXN0ZW5lcnMhLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoZXZlbnQpKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRUYXJnZXQ7XG5cblxuIiwiZXhwb3J0IGNvbnN0IENMSUVOVF9GT1VORCA9IFwiY2xpZW50LWZvdW5kXCI7XG5leHBvcnQgY29uc3QgUkVRVUVTVF9UQUJfSUQgPSBcInJlcXVlc3QtdGFiLWlkXCI7XG5leHBvcnQgY29uc3QgREVWVE9PTFNfSU5JVElBTElaRUQgPSBcImRldnRvb2xzLWluaXRpYWxpemVkXCI7XG5leHBvcnQgY29uc3QgRklORF9BUE9MTE9fQ0xJRU5UID0gXCJmaW5kLWFwb2xsby1jbGllbnRcIjtcbmV4cG9ydCBjb25zdCBBUE9MTE9fQ0xJRU5UX0ZPVU5EID0gXCJhcG9sbG8tY2xpZW50LWZvdW5kXCI7XG5leHBvcnQgY29uc3QgQ1JFQVRFX0RFVlRPT0xTX1BBTkVMID0gXCJjcmVhdGUtZGV2dG9vbHMtcGFuZWxcIjtcbmV4cG9ydCBjb25zdCBBQ1RJT05fSE9PS19GSVJFRCA9IFwiYWN0aW9uLWhvb2stZmlyZWRcIjtcbmV4cG9ydCBjb25zdCBSRVFVRVNUX0RBVEEgPSBcInJlcXVlc3QtZGF0YVwiO1xuZXhwb3J0IGNvbnN0IFVQREFURSA9IFwidXBkYXRlXCI7XG5leHBvcnQgY29uc3QgUEFORUxfT1BFTiA9IFwicGFuZWwtb3BlblwiO1xuZXhwb3J0IGNvbnN0IFBBTkVMX0NMT1NFRCA9IFwicGFuZWwtY2xvc2VkXCI7XG5leHBvcnQgY29uc3QgRVhQTE9SRVJfUkVRVUVTVCA9IFwiZXhwbG9yZXItcmVxdWVzdFwiO1xuZXhwb3J0IGNvbnN0IEVYUExPUkVSX1JFU1BPTlNFID0gXCJleHBsb3Jlci1yZXNwb25zZVwiO1xuZXhwb3J0IGNvbnN0IFJFTE9BRElOR19UQUIgPSBcInJlbG9hZGluZy10YWJcIjtcbmV4cG9ydCBjb25zdCBSRUxPQURfVEFCX0NPTVBMRVRFID0gXCJyZWxvYWQtdGFiLWNvbXBsZXRlXCI7XG5cbiIsImltcG9ydCBSZWxheSBmcm9tIFwiLi4vLi4vUmVsYXlcIjtcbmltcG9ydCB7XG4gIENMSUVOVF9GT1VORCxcbiAgUkVRVUVTVF9UQUJfSUQsXG4gIENSRUFURV9ERVZUT09MU19QQU5FTCxcbiAgQUNUSU9OX0hPT0tfRklSRUQsXG4gIEVYUExPUkVSX1JFU1BPTlNFLFxuICBVUERBVEUsXG4gIFJFTE9BRElOR19UQUIsXG4gIFJFTE9BRF9UQUJfQ09NUExFVEUsXG59IGZyb20gXCIuLi9jb25zdGFudHNcIjtcblxuLy8gSW5zcGVjdGVkIHRhYnMgYXJlIHVuYWJsZSB0byByZXRyaWV2ZSB0aGVpciBvd24gaWRzLlxuLy8gVGhpcyByZXF1ZXN0cyB0aGUgdGFiJ3MgaWQgZnJvbSB0aGUgYmFja2dyb3VuZCBzY3JpcHQuXG4vLyBPbmNlIGl0IHJlc29sdmVzLCB3ZSBjYW4gY3JlYXRlIHRoZSB0YWIncyBSZWxheS5cbmZ1bmN0aW9uIHJlcXVlc3RJZCgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBtZXNzYWdlOiBSRVFVRVNUX1RBQl9JRCB9LCBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJlc29sdmUoaWQpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFByb21pc2UoYXN5bmMgKCRleHBvcnQpID0+IHtcbiAgY29uc3QgaWQgPSBhd2FpdCByZXF1ZXN0SWQoKTtcbiAgY29uc3QgdGFiID0gbmV3IFJlbGF5KCk7XG4gIGNvbnN0IHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0KHtcbiAgICBuYW1lOiBgdGFiLSR7aWR9YCxcbiAgfSk7XG5cbiAgdGFiLmFkZENvbm5lY3Rpb24oXCJiYWNrZ3JvdW5kXCIsIChtZXNzYWdlKSA9PiB7XG4gICAgcG9ydC5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgfSk7XG5cbiAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIodGFiLmJyb2FkY2FzdCk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChldmVudCkgPT4ge1xuICAgIHRhYi5icm9hZGNhc3QoZXZlbnQ/LmRhdGEpO1xuICB9KTtcblxuICB0YWIuYWRkQ29ubmVjdGlvbihcImNsaWVudFwiLCAobWVzc2FnZSkgPT4ge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShtZXNzYWdlLCBcIipcIik7XG4gIH0pO1xuXG4gIGNvbnN0IGRldnRvb2xzID0gYGJhY2tncm91bmQ6ZGV2dG9vbHMtJHtpZH1gO1xuICB0YWIuZm9yd2FyZChDTElFTlRfRk9VTkQsIGRldnRvb2xzKTtcbiAgdGFiLmZvcndhcmQoQ1JFQVRFX0RFVlRPT0xTX1BBTkVMLCBkZXZ0b29scyk7XG4gIHRhYi5mb3J3YXJkKEFDVElPTl9IT09LX0ZJUkVELCBkZXZ0b29scyk7XG4gIHRhYi5mb3J3YXJkKFVQREFURSwgZGV2dG9vbHMpO1xuICB0YWIuZm9yd2FyZChSRUxPQURJTkdfVEFCLCBkZXZ0b29scyk7XG4gIHRhYi5mb3J3YXJkKFJFTE9BRF9UQUJfQ09NUExFVEUsIGRldnRvb2xzKTtcbiAgdGFiLmZvcndhcmQoRVhQTE9SRVJfUkVTUE9OU0UsIGAke2RldnRvb2xzfTpleHBsb3JlcmApO1xuXG4gIGNvbnN0IG1vZHVsZSA9IGF3YWl0IFByb21pc2UucmVzb2x2ZSh7IHRhYiwgaWQgfSk7XG4gICRleHBvcnQobW9kdWxlKTtcbn0pO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIFRoaXMgc2NyaXB0IGlzIGluamVjdGVkIGludG8gZWFjaCB0YWIuXG5pbXBvcnQgXCIuL3RhYlJlbGF5XCI7IFxuXG4vKiBcbiAgQ29udGVudCBzY3JpcHRzIGFyZSB1bmFibGUgdG8gbW9kaWZ5IHRoZSB3aW5kb3cgb2JqZWN0IGRpcmVjdGx5LiBcbiAgQSBjb21tb24gd29ya2Fyb3VuZCBmb3IgdGhpcyBpc3N1ZSBpcyB0byBpbmplY3QgYW4gaW5saW5lZCBmdW5jdGlvblxuICBpbnRvIHRoZSBpbnNwZWN0ZWQgdGFiLlxuKi8gXG5pZiAodHlwZW9mIGRvY3VtZW50ID09PSBcIm9iamVjdFwiICYmIGRvY3VtZW50IGluc3RhbmNlb2YgSFRNTERvY3VtZW50KSB7XG4gIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwibW9kdWxlXCIpO1xuICBzY3JpcHQuc2V0QXR0cmlidXRlKFwic3JjXCIsIGNocm9tZS5leHRlbnNpb24uZ2V0VVJMKFwiaG9vay5qc1wiKSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICBjb25zdCBpbXBvcnRNYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic2NyaXB0W3R5cGU9XFxcImltcG9ydG1hcFxcXCJdXCIpO1xuICAgIGlmIChpbXBvcnRNYXAgIT0gbnVsbCkge1xuICAgICAgaW1wb3J0TWFwLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShzY3JpcHQsIGltcG9ydE1hcC5uZXh0U2libGluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBoZWFkLmluc2VydEJlZm9yZShzY3JpcHQsIGhlYWQubGFzdENoaWxkKTtcbiAgICB9XG4gIH0pO1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9