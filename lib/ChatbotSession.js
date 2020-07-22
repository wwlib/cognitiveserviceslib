"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotSession = exports.ChatbotStatus = void 0;
const events_1 = require("events");
var ChatbotStatus;
(function (ChatbotStatus) {
    ChatbotStatus[ChatbotStatus["INVALID"] = 0] = "INVALID";
    ChatbotStatus[ChatbotStatus["IDLE"] = 1] = "IDLE";
    ChatbotStatus[ChatbotStatus["REQUESTING_NEXT_PROMPT"] = 2] = "REQUESTING_NEXT_PROMPT";
    ChatbotStatus[ChatbotStatus["RECEIVED_PROMPT"] = 3] = "RECEIVED_PROMPT";
    ChatbotStatus[ChatbotStatus["ERROR"] = 4] = "ERROR";
    ChatbotStatus[ChatbotStatus["SUCCEEDED"] = 5] = "SUCCEEDED";
    ChatbotStatus[ChatbotStatus["COMPLETED"] = 6] = "COMPLETED";
})(ChatbotStatus = exports.ChatbotStatus || (exports.ChatbotStatus = {}));
class ChatbotSession extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.debug = false;
        this.status = ChatbotStatus.INVALID;
        this.currentPrompt = '';
    }
}
exports.ChatbotSession = ChatbotSession;
//# sourceMappingURL=ChatbotSession.js.map