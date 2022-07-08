/// <reference types="node" />
import * as ASRTypes from './ASRTypes';
import { LanguageCode } from './Language';
import { Logger } from "../logger";
export declare type Callback<T> = (data: T) => void;
export declare enum ASRStreamingSessionEvent {
    SOS = "SOS",
    EOS = "EOS",
    RESULT = "RESULT",
    SESSION_ENDED = "SESSION_ENDED",
    ERROR = "ERROR",
    EOS_TIMEOUT = "EOS_TIMEOUT",
    SESSION_TIMEOUT = "SESSION_TIMEOUT"
}
export interface ASRStreamingSessionConfig extends ASRTypes.ASRConfig {
    lang: LanguageCode;
    hints?: string[];
    regexpEOS?: string[];
    eosTimeout?: number;
    providerConfig?: any;
}
/**
 * Base interface to be implemented by all ASRStreamingSession providers
 */
export interface ASRStreamingSession {
    provideAudio(audioBuffer: Buffer): void;
    start(): Promise<ASRTypes.ASRResult>;
    stop(): void;
    onStartOfSpeech(handler: Callback<void>): void;
    onEndOfSpeech(handler: Callback<void>): void;
    onResult(handler: Callback<ASRTypes.ASRResult>): void;
    getLastIncremental(): ASRTypes.ASRResult;
    dispose(): void;
}
export declare type ASRStreamingSessionProvider = (config: ASRStreamingSessionConfig, log: Logger) => ASRStreamingSession;
