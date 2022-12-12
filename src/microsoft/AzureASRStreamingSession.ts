import * as ASRTypes from '../asr/ASRTypes';
import {
  AudioConfig,
  AudioInputStream,
  OutputFormat,
  PushAudioInputStream,
  Recognizer,
  SpeechConfig,
  SpeechRecognitionEventArgs,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import {
  AutoDetectSourceLanguageConfig,
  SpeechRecognitionResult,
} from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Exports";
import { RegExpEOS } from "../asr/RegExpEOS";
import { ASRStreamingSession, ASRStreamingSessionConfig, Callback } from "../asr/ASRStreamingSession";
import { Logger } from "../Logger";

export class AzureASRStreamingSession implements ASRStreamingSession {
  private stopped = false;
  private sosHandler: Callback<void> = () => { };
  private eosHandler: Callback<void> = () => { };
  private resultHandler: Callback<ASRTypes.ASRResult> = () => { };
  private lastASRResult: ASRTypes.ASRResult | undefined;

  private regexpEOSRegex: RegExp | null = null;

  private log: Logger;
  private audioStream: PushAudioInputStream;
  private recognizer: SpeechRecognizer;

  private resolveStart: Callback<ASRTypes.ASRResult> = () => { };

  constructor(config: ASRStreamingSessionConfig, log: Logger) {
    if (config.regexpEOS && config.regexpEOS.length > 0) {
      this.regexpEOSRegex = RegExpEOS.buildRegex(config.regexpEOS);
    }

    this.log = log.child("ASR");

    this.log.debug("Creating ASR session"); // , config);

    const subscriptionKey = config.providerConfig?.AzureSpeechSubscriptionKey || '';
    const region = config.providerConfig?.AzureSpeechRegion || 'eastus';

    // this.log.debug("subscriptionKey, region", subscriptionKey, region);

    if (config.encoding && config.encoding !== "LINEAR16") {
      throw new Error("Only LINEAR16 encoding is supported");
    }

    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechRecognitionLanguage = config.lang;
    speechConfig.outputFormat = OutputFormat.Detailed; // need this to get confidence when complete

    log.debug('speechConfig', speechConfig)
    this.audioStream = AudioInputStream.createPushStream();

    if (config.detectLangs) {
      const autoDetectLangConfig = AutoDetectSourceLanguageConfig.fromLanguages(config.detectLangs);
      this.recognizer = SpeechRecognizer.FromConfig(
        speechConfig,
        autoDetectLangConfig,
        AudioConfig.fromStreamInput(this.audioStream),
      );
    } else {
      this.recognizer = new SpeechRecognizer(speechConfig, AudioConfig.fromStreamInput(this.audioStream));
    }

    this.recognizer.speechStartDetected = () => {
      if (!this.stopped) {
        this.sosHandler();
      }
    };

    this.recognizer.speechEndDetected = () => {
      if (!this.stopped) {
        this.eosHandler();
      }
    };

    this.recognizer.recognizing = (_: Recognizer, eventArgs: SpeechRecognitionEventArgs) => {
      const INCREMENTAL_CONFIDENCE = 0.5;

      this.lastASRResult = {
        text: eventArgs.result.text,
        confidence: INCREMENTAL_CONFIDENCE, // MS doesn't send confidence for incremental results
        lang: eventArgs.result.language,
        langConfidence: parseLanguageDetectionConfidence(eventArgs.result.languageDetectionConfidence),
      };

      if (!this.stopped) {
        if (this.regexpEOSRegex && this.regexpEOSRegex.test(eventArgs.result.text)) {
          this.log.debug(
            `Incremental transcription contains a RegExpEOS trigger word/phrase. Stopping ASR and returning.`,
          );
          this.lastASRResult.annotation = ASRTypes.ASRAnnotation.REGEXP_EOS;

          this.eosHandler();
          this.stop();

          this.resolveStart(this.lastASRResult);
        }

        this.resultHandler(this.lastASRResult);
      }
    };
  }

  provideAudio(b: Buffer): void {
    if (!this.stopped) {
      this.audioStream.write(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as any);
    }
  }

  /**
   * Stop the current session
   */
  stop(): void {
    if (!this.stopped) {
      this.stopped = true;

      this.recognizer.stopContinuousRecognitionAsync(
        () => {
          this.log.debug("ASR recogniser stopped");
        },
        (error) => {
          this.log.debug("Failed to stop ASR recogniser", error);
        },
      );
    }
  }

  /**
   * Handle Start of Speech
   */
  onStartOfSpeech(handler: Callback<void>) {
    this.sosHandler = handler;
  }

  /**
   * Handle End of Speech
   */
  onEndOfSpeech(handler: Callback<void>) {
    this.eosHandler = handler;
  }

  /**
   * Handle ASR Result
   */
  onResult(handler: Callback<ASRTypes.ASRResult>) {
    this.resultHandler = handler;
  }

  /**
   * Retrieve the last valid incremental result
   */
  getLastIncremental(): ASRTypes.ASRResult {
    return (
      this.lastASRResult || {
        text: "",
        confidence: 0,
      }
    );
  }

  /**
   * Start the current session
   */
  async start(): Promise<ASRTypes.ASRResult> {
    this.log.debug("Starting recognition");

    return new Promise<ASRTypes.ASRResult>((resolve, reject) => {
      this.resolveStart = resolve;

      this.recognizer.recognizeOnceAsync(
        (result: SpeechRecognitionResult) => {
          if (!result.json) {
            reject(new Error(result.errorDetails));
            return;
          }

          const resultDetails = JSON.parse(result.json);

          this.stopped = true;

          this.recognizer.close();
          this.audioStream.close();

          if (resultDetails.NBest) {
            this.lastASRResult = {
              text: result.text,
              confidence: resultDetails.NBest[0].Confidence,
              lang: result.language,
              langConfidence: parseLanguageDetectionConfidence(result.languageDetectionConfidence),
              json: result.json,
            };
          } else {
            this.lastASRResult = {
              text: "",
              confidence: 0,
              langConfidence: "Low",
              annotation: ASRTypes.ASRAnnotation.GARBAGE,
            };
          }

          resolve(this.lastASRResult);
        },
        (error) => {
          this.log.error("Failed to recognize", error);
          this.recognizer.close();
          reject(error);
        },
      );
    });
  }

  dispose() {
    this.stopped = false;
    this.sosHandler = () => { };
    this.eosHandler = () => { };
    this.resultHandler = () => { };
    this.lastASRResult = undefined;
    this.regexpEOSRegex = null;
    this.audioStream.close;
    this.recognizer.close;
  }
}

/** To encapsulate type cast from Azure string to enum */
function parseLanguageDetectionConfidence(azureConfidency: string): any {
  return azureConfidency;
}
