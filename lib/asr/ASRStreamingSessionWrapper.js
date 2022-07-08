"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASRStreamingSessionWrapper = void 0;
const events_1 = require("events");
const ASRFactory_1 = require("./ASRFactory");
const ASRStreamingSession_1 = require("./ASRStreamingSession");
class ASRStreamingSessionWrapper extends events_1.EventEmitter {
    // private _logger: Logger
    constructor(asrConfig, logger) {
        super();
        this.startEOSTimeout = (timeMs) => {
            timeMs = Math.min(timeMs, ASRStreamingSessionWrapper.MAX_EOS_TIMEOUT_DURATION);
            this.clearEOSTimeout();
            return new Promise((resolve) => {
                this._eosTimeoutHandle = setTimeout(() => {
                    // this._logger.debug("EoS timeout reached")
                    this.clearEOSTimeout();
                    const lastResult = this._asrSession.getLastIncremental();
                    this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.EOS_TIMEOUT, lastResult);
                    this._asrSession.stop();
                    resolve();
                }, timeMs);
            });
        };
        this.clearEOSTimeout = () => {
            if (this._eosTimeoutHandle) {
                clearTimeout(this._eosTimeoutHandle);
                this._eosTimeoutHandle = undefined;
            }
        };
        this.startMaxSessionTimeout = () => {
            this.clearMaxSessionTimeout();
            return new Promise((resolve) => {
                this._maxSessionTimeoutHandle = setTimeout(() => {
                    this.clearEOSTimeout();
                    this.clearMaxSessionTimeout();
                    const lastResult = this._asrSession.getLastIncremental();
                    this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.SESSION_TIMEOUT, lastResult);
                    this._asrSession.stop();
                    resolve();
                }, ASRStreamingSessionWrapper.MAX_SESSION_TIMEOUT_DURATION);
            });
        };
        this.clearMaxSessionTimeout = () => {
            if (this._maxSessionTimeoutHandle) {
                clearTimeout(this._maxSessionTimeoutHandle);
                this._maxSessionTimeoutHandle = undefined;
            }
        };
        this._asrSession = ASRFactory_1.ASRFactory.startSession(asrConfig, logger);
        // this._logger = logger
        this._asrSession.onStartOfSpeech(() => {
            // logger.debug('SOS')
            this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.SOS);
        });
        this._asrSession.onEndOfSpeech(() => {
            this.clearEOSTimeout();
            // logger.debug('EOS')
            this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.EOS);
        });
        this._asrSession.onResult((lastResult) => {
            // logger.debug('onResult', lastResult)
            this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.RESULT, lastResult);
            this.startEOSTimeout(asrConfig.eosTimeout || ASRStreamingSessionWrapper.DEFAULT_EOS_TIMEOUT_DURATION);
        });
        this.startMaxSessionTimeout();
    }
    get asrSession() {
        return this._asrSession;
    }
    provideAudio(data) {
        this._asrSession.provideAudio(data);
    }
    start() {
        this.startEOSTimeout(ASRStreamingSessionWrapper.DEFAULT_EOS_TIMEOUT_DURATION);
        this._asrSession.start()
            .then((data) => {
            // this._logger.debug('session ended', data)
            this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.SESSION_ENDED, data);
            this.dispose();
        })
            .catch((error) => {
            // this._logger.error('session error', error)
            this.emit(ASRStreamingSession_1.ASRStreamingSessionEvent.ERROR, error);
            this.dispose();
        });
    }
    dispose() {
        this.removeAllListeners();
        this.clearEOSTimeout();
        this.clearMaxSessionTimeout();
        this._asrSession.dispose();
    }
}
exports.ASRStreamingSessionWrapper = ASRStreamingSessionWrapper;
ASRStreamingSessionWrapper.MAX_SESSION_TIMEOUT_DURATION = 20000; // max session timeout is 20 seconds
ASRStreamingSessionWrapper.MAX_EOS_TIMEOUT_DURATION = 10000; // max eos timeout is 10 seconds
ASRStreamingSessionWrapper.DEFAULT_EOS_TIMEOUT_DURATION = 3000;
//# sourceMappingURL=ASRStreamingSessionWrapper.js.map