import { ASRStreamingSession, ASRStreamingSessionConfig, ASRStreamingSessionProvider } from "./ASRStreamingSession";
import { AzureASRStreamingSession } from "../microsoft/AzureASRStreamingSession";
import { Logger } from "../logger";

/**
 * Create the correct ASR session given a language code
 */
export class ASRFactory {
  private static DEFAULT_ASR_PROVIDER: ASRStreamingSessionProvider = (config, log) => new AzureASRStreamingSession(config, log);
  private static currentASRProvider: ASRStreamingSessionProvider = ASRFactory.DEFAULT_ASR_PROVIDER;

  /**
   * Sets the current ASR provider
   * @param asrProvider If `null` then set the default provider
   */
  static setASRProvider(asrProvider?: ASRStreamingSessionProvider): void {
    if (asrProvider) {
      ASRFactory.currentASRProvider = asrProvider;
    } else {
      ASRFactory.currentASRProvider = ASRFactory.DEFAULT_ASR_PROVIDER;
    }
  }

  static startSession(config: ASRStreamingSessionConfig, log: Logger): ASRStreamingSession {
    return ASRFactory.currentASRProvider(config, log);
  }
}
