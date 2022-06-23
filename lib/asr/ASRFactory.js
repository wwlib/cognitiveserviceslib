"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASRFactory = void 0;
const AzureASRStreamingSession_1 = require("../microsoft/AzureASRStreamingSession");
/**
 * Create the correct ASR session given a language code
 */
class ASRFactory {
    /**
     * Sets the current ASR provider
     * @param asrProvider If `null` then set the default provider
     */
    static setASRProvider(asrProvider) {
        if (asrProvider) {
            ASRFactory.currentASRProvider = asrProvider;
        }
        else {
            ASRFactory.currentASRProvider = ASRFactory.DEFAULT_ASR_PROVIDER;
        }
    }
    static startSession(config, log) {
        return ASRFactory.currentASRProvider(config, log);
    }
}
exports.ASRFactory = ASRFactory;
ASRFactory.DEFAULT_ASR_PROVIDER = (config, log) => new AzureASRStreamingSession_1.AzureASRStreamingSession(config, log);
ASRFactory.currentASRProvider = ASRFactory.DEFAULT_ASR_PROVIDER;
//# sourceMappingURL=ASRFactory.js.map