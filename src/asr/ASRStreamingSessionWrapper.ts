import { EventEmitter } from "events";
import { ASRFactory } from "./ASRFactory"
import { ASRStreamingSession, ASRStreamingSessionConfig } from "./ASRStreamingSession"
import { Logger } from "../Logger";

export class ASRStreamingSessionWrapper extends EventEmitter {

    private _asrSession: ASRStreamingSession
    private _eosTimeoutHandle: any
    // private _logger: Logger

    constructor(asrConfig: ASRStreamingSessionConfig, logger: Logger) {
        super()
        this._asrSession = ASRFactory.startSession(asrConfig, logger)
        // this._logger = logger

        this._asrSession.onStartOfSpeech(() => {
            // logger.debug('SOS')
            this.emit('SOS')
        })

        this._asrSession.onEndOfSpeech(() => {
            this.clearEOSTimeout()
            // logger.debug('EOS')
            this.emit('EOS')
        })

        this._asrSession.onResult((lastResult) => {
            // logger.debug('onResult', lastResult)
            this.emit('RESULT', lastResult)
            this.startEOSTimeout(asrConfig.eosTimeout || 3000)
        })
    }

    get asrSession() {
        return this._asrSession
    }

    provideAudio(data: Buffer) {
        this._asrSession.provideAudio(data)
    }

    start() {
        this._asrSession.start()
        .then((data) => {
            // this._logger.debug('session ended', data)
            this.emit('SESSION_ENDED', data)
            this.dispose()
        })
        .catch((error) => {
            // this._logger.error('session error', error)
            this.emit('ERROR', error)
            this.dispose()
        })
    }

    startEOSTimeout = (timeMs: number): Promise<void> => {
        this.clearEOSTimeout()
        return new Promise((resolve)  => {
            this._eosTimeoutHandle = setTimeout(() => {
                // this._logger.debug("EoS timeout reached")
                this.clearEOSTimeout()
                const lastResult = this._asrSession.getLastIncremental()
                this.emit('EOS_TIMEOUT', lastResult)
                this._asrSession.stop()
                resolve()
            }, timeMs)
        });
    }

    clearEOSTimeout = () => {
        if (this._eosTimeoutHandle) {
            clearTimeout(this._eosTimeoutHandle)
            this._eosTimeoutHandle = undefined
        }
    }

    dispose() {
        this.removeAllListeners()
        this.clearEOSTimeout()
        this._asrSession.dispose()
    }
}
