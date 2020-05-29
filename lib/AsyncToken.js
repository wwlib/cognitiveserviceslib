"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class AsyncToken extends events_1.EventEmitter {
    constructor() {
        super();
    }
    dispose() {
        this.complete = undefined;
        this.resolve = undefined;
        this.reject = undefined;
        this.removeAllListeners();
    }
}
exports.default = AsyncToken;
//# sourceMappingURL=AsyncToken.js.map