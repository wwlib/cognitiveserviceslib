import { EventEmitter } from "events";
import { ASRFactory } from "./ASRFactory"
import { ASRStreamingSession, ASRStreamingSessionConfig, ASRStreamingSessionEvent } from "./ASRStreamingSession"
import { Logger } from "../Logger";

export class ASRStreamingSessionWrapper extends EventEmitter {

    static MAX_SESSION_TIMEOUT_DURATION: number = 20000 // max session timeout is 20 seconds
    static MAX_EOS_TIMEOUT_DURATION: number = 10000 // max eos timeout is 10 seconds
    static DEFAULT_EOS_TIMEOUT_DURATION: number = 3000

    private _asrSession: ASRStreamingSession
    private _eosTimeoutHandle: any
    private _maxSessionTimeoutHandle: any
    // private _logger: Logger

    constructor(asrConfig: ASRStreamingSessionConfig, logger: Logger) {
        super()
        this._asrSession = ASRFactory.startSession(asrConfig, logger)
        // this._logger = logger

        this._asrSession.onStartOfSpeech(() => {
            // logger.debug('SOS')
            this.emit(ASRStreamingSessionEvent.SOS)
        })

        this._asrSession.onEndOfSpeech(() => {
            this.clearEOSTimeout()
            // logger.debug('EOS')
            this.emit(ASRStreamingSessionEvent.EOS)
        })

        this._asrSession.onResult((lastResult) => {
            // logger.debug('onResult', lastResult)
            this.emit(ASRStreamingSessionEvent.RESULT, lastResult)
            this.startEOSTimeout(asrConfig.eosTimeout || ASRStreamingSessionWrapper.DEFAULT_EOS_TIMEOUT_DURATION)
        })

        this.startMaxSessionTimeout()
    }

    get asrSession() {
        return this._asrSession
    }

    provideAudio(data: Buffer) {
        this._asrSession.provideAudio(data)
    }

    start() {
        this.startEOSTimeout(ASRStreamingSessionWrapper.DEFAULT_EOS_TIMEOUT_DURATION)
        this._asrSession.start()
        .then((data) => {
            // this._logger.debug('session ended', data)
            this.emit(ASRStreamingSessionEvent.SESSION_ENDED, data)
            this.dispose()
        })
        .catch((error) => {
            // this._logger.error('session error', error)
            this.emit(ASRStreamingSessionEvent.ERROR, error)
            this.dispose()
        })
    }

    startEOSTimeout = (timeMs: number): Promise<void> => {
        timeMs = Math.min(timeMs, ASRStreamingSessionWrapper.MAX_EOS_TIMEOUT_DURATION)
        this.clearEOSTimeout()
        return new Promise((resolve)  => {
            this._eosTimeoutHandle = setTimeout(() => {
                // this._logger.debug("EoS timeout reached")
                this.clearEOSTimeout()
                const lastResult = this._asrSession.getLastIncremental()
                this.emit(ASRStreamingSessionEvent.EOS_TIMEOUT, lastResult)
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

    startMaxSessionTimeout = (): Promise<void> => {
        this.clearMaxSessionTimeout()
        return new Promise((resolve)  => {
            this._maxSessionTimeoutHandle = setTimeout(() => {
                this.clearEOSTimeout()
                this.clearMaxSessionTimeout()
                const lastResult = this._asrSession.getLastIncremental()
                this.emit(ASRStreamingSessionEvent.SESSION_TIMEOUT, lastResult)
                this._asrSession.stop()
                resolve()
            }, ASRStreamingSessionWrapper.MAX_SESSION_TIMEOUT_DURATION)
        });
    }

    clearMaxSessionTimeout = () => {
        if (this._maxSessionTimeoutHandle) {
            clearTimeout(this._maxSessionTimeoutHandle)
            this._maxSessionTimeoutHandle = undefined
        }
    }

    dispose() {
        this.removeAllListeners()
        this.clearEOSTimeout()
        this.clearMaxSessionTimeout()
        this._asrSession.dispose()
    }
}
