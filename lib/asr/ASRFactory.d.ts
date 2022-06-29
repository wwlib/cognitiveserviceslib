import { ASRStreamingSession, ASRStreamingSessionConfig, ASRStreamingSessionProvider } from "./ASRStreamingSession";
import { Logger } from "../logger";
/**
 * Create the correct ASR session given a language code
 */
export declare class ASRFactory {
    private static DEFAULT_ASR_PROVIDER;
    private static currentASRProvider;
    /**
     * Sets the current ASR provider
     * @param asrProvider If `null` then set the default provider
     */
    static setASRProvider(asrProvider?: ASRStreamingSessionProvider): void;
    static startSession(config: ASRStreamingSessionConfig, log: Logger): ASRStreamingSession;
}
