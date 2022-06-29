/// <reference types="node" />
import { EventEmitter } from "events";
import { ASRStreamingSession, ASRStreamingSessionConfig } from "./ASRStreamingSession";
import { Logger } from "../Logger";
export declare class ASRStreamingSessionWrapper extends EventEmitter {
    private _asrSession;
    private _eosTimeoutHandle;
    constructor(asrConfig: ASRStreamingSessionConfig, logger: Logger);
    get asrSession(): ASRStreamingSession;
    provideAudio(data: Buffer): void;
    start(): void;
    startEOSTimeout: (timeMs: number) => Promise<void>;
    clearEOSTimeout: () => void;
    dispose(): void;
}
