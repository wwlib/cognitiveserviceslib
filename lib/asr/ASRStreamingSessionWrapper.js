"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASRStreamingSessionWrapper = void 0;
const events_1 = require("events");
const ASRFactory_1 = require("./ASRFactory");
class ASRStreamingSessionWrapper extends events_1.EventEmitter {
    // private _logger: Logger
    constructor(asrConfig, logger) {
        super();
        this.startEOSTimeout = (timeMs) => {
            this.clearEOSTimeout();
            return new Promise((resolve) => {
                this._eosTimeoutHandle = setTimeout(() => {
                    // this._logger.debug("EoS timeout reached")
                    this.clearEOSTimeout();
                    const lastResult = this._asrSession.getLastIncremental();
                    this.emit('EOS_TIMEOUT', lastResult);
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
        this._asrSession = ASRFactory_1.ASRFactory.startSession(asrConfig, logger);
        // this._logger = logger
        this._asrSession.onStartOfSpeech(() => {
            // logger.debug('SOS')
            this.emit('SOS');
        });
        this._asrSession.onEndOfSpeech(() => {
            this.clearEOSTimeout();
            // logger.debug('EOS')
            this.emit('EOS');
        });
        this._asrSession.onResult((lastResult) => {
            // logger.debug('onResult', lastResult)
            this.emit('RESULT', lastResult);
            this.startEOSTimeout(asrConfig.eosTimeout || 3000);
        });
    }
    get asrSession() {
        return this._asrSession;
    }
    provideAudio(data) {
        this._asrSession.provideAudio(data);
    }
    start() {
        this._asrSession.start()
            .then((data) => {
            // this._logger.debug('session ended', data)
            this.emit('SESSION_ENDED', data);
            this.dispose();
        })
            .catch((error) => {
            // this._logger.error('session error', error)
            this.emit('ERROR', error);
            this.dispose();
        });
    }
    dispose() {
        this.removeAllListeners();
        this.clearEOSTimeout();
        this._asrSession.dispose();
    }
}
exports.ASRStreamingSessionWrapper = ASRStreamingSessionWrapper;
//# sourceMappingURL=ASRStreamingSessionWrapper.js.map