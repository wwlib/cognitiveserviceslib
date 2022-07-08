/// <reference types="node" />
import { EventEmitter } from "events";
import { ASRStreamingSession, ASRStreamingSessionConfig } from "./ASRStreamingSession";
import { Logger } from "../Logger";
export declare class ASRStreamingSessionWrapper extends EventEmitter {
    static MAX_SESSION_TIMEOUT_DURATION: number;
    static MAX_EOS_TIMEOUT_DURATION: number;
    static DEFAULT_EOS_TIMEOUT_DURATION: number;
    private _asrSession;
    private _eosTimeoutHandle;
    private _maxSessionTimeoutHandle;
    constructor(asrConfig: ASRStreamingSessionConfig, logger: Logger);
    get asrSession(): ASRStreamingSession;
    provideAudio(data: Buffer): void;
    start(): void;
    startEOSTimeout: (timeMs: number) => Promise<void>;
    clearEOSTimeout: () => void;
    startMaxSessionTimeout: () => Promise<void>;
    clearMaxSessionTimeout: () => void;
    dispose(): void;
}
