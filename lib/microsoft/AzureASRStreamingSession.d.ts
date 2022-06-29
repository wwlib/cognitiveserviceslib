/// <reference types="node" />
import * as ASRTypes from '../asr/ASRTypes';
import { ASRStreamingSession, ASRStreamingSessionConfig, Callback } from "../asr/ASRStreamingSession";
import { Logger } from "../Logger";
export declare class AzureASRStreamingSession implements ASRStreamingSession {
    private stopped;
    private sosHandler;
    private eosHandler;
    private resultHandler;
    private lastASRResult;
    private regexpEOSRegex;
    private log;
    private audioStream;
    private recognizer;
    private resolveStart;
    constructor(config: ASRStreamingSessionConfig, log: Logger);
    provideAudio(b: Buffer): void;
    /**
     * Stop the current session
     */
    stop(): void;
    /**
     * Handle Start of Speech
     */
    onStartOfSpeech(handler: Callback<void>): void;
    /**
     * Handle End of Speech
     */
    onEndOfSpeech(handler: Callback<void>): void;
    /**
     * Handle ASR Result
     */
    onResult(handler: Callback<ASRTypes.ASRResult>): void;
    /**
     * Retrieve the last valid incremental result
     */
    getLastIncremental(): ASRTypes.ASRResult;
    /**
     * Start the current session
     */
    start(): Promise<ASRTypes.ASRResult>;
    dispose(): void;
}
