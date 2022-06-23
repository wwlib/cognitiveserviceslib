"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureASRStreamingSession = void 0;
/* tslint:disable:no-empty */
const ASRTypes = require("../asr/ASRTypes");
const microsoft_cognitiveservices_speech_sdk_1 = require("microsoft-cognitiveservices-speech-sdk");
const Exports_1 = require("microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Exports");
const FastEOS_1 = require("../asr/FastEOS");
class AzureASRStreamingSession {
    constructor(config, log) {
        var _a, _b;
        this.stopped = false;
        this.sosHandler = () => { };
        this.eosHandler = () => { };
        this.resultHandler = () => { };
        this.fastEOSRegex = null;
        this.resolveStart = () => { };
        if (config.earlyEOS && config.earlyEOS.length > 0) {
            this.fastEOSRegex = FastEOS_1.FastEOS.buildRegex(config.earlyEOS);
        }
        this.log = log.child("ASR");
        this.log.debug("Creating ASR session", config);
        const subscriptionKey = ((_a = config.providerConfig) === null || _a === void 0 ? void 0 : _a.AzureSpeechSubscriptionKey) || '';
        const region = ((_b = config.providerConfig) === null || _b === void 0 ? void 0 : _b.AzureSpeechRegion) || 'eastus';
        this.log.debug("subscriptionKey, region", subscriptionKey, region);
        if (config.encoding && config.encoding !== "LINEAR16") {
            throw new Error("Only LINEAR16 encoding is supported");
        }
        const speechConfig = microsoft_cognitiveservices_speech_sdk_1.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechRecognitionLanguage = config.lang;
        speechConfig.outputFormat = microsoft_cognitiveservices_speech_sdk_1.OutputFormat.Detailed; // need this to get confidence when complete
        log.debug('speechConfig', speechConfig);
        this.audioStream = microsoft_cognitiveservices_speech_sdk_1.AudioInputStream.createPushStream();
        if (config.detectLangs) {
            const autoDetectLangConfig = Exports_1.AutoDetectSourceLanguageConfig.fromLanguages(config.detectLangs);
            this.recognizer = microsoft_cognitiveservices_speech_sdk_1.SpeechRecognizer.FromConfig(speechConfig, autoDetectLangConfig, microsoft_cognitiveservices_speech_sdk_1.AudioConfig.fromStreamInput(this.audioStream));
        }
        else {
            this.recognizer = new microsoft_cognitiveservices_speech_sdk_1.SpeechRecognizer(speechConfig, microsoft_cognitiveservices_speech_sdk_1.AudioConfig.fromStreamInput(this.audioStream));
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
        this.recognizer.recognizing = (_, eventArgs) => {
            const INTERMEDIATE_CONFIDENCE = 0.5;
            this.lastASRResult = {
                text: eventArgs.result.text,
                confidence: INTERMEDIATE_CONFIDENCE,
                lang: eventArgs.result.language,
                langConfidence: parseLanguageDetectionConfidence(eventArgs.result.languageDetectionConfidence),
            };
            if (!this.stopped) {
                if (this.fastEOSRegex && this.fastEOSRegex.test(eventArgs.result.text)) {
                    this.log.debug(`Incremental transcription contains a FastEOS trigger word/phrase. Stopping ASR and returning.`);
                    this.lastASRResult.annotation = ASRTypes.ASRAnnotation.FAST_EOS;
                    this.eosHandler();
                    this.stop();
                    this.resolveStart(this.lastASRResult);
                }
                this.resultHandler(this.lastASRResult);
            }
        };
    }
    provideAudio(b) {
        if (!this.stopped) {
            this.audioStream.write(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
        }
    }
    /**
     * Stop the current session
     */
    stop() {
        if (!this.stopped) {
            this.stopped = true;
            this.recognizer.stopContinuousRecognitionAsync(() => {
                this.log.debug("ASR recogniser stopped");
            }, (error) => {
                this.log.debug("Failed to stop ASR recogniser", error);
            });
        }
    }
    /**
     * Handle Start of Speech
     */
    onStartOfSpeech(handler) {
        this.sosHandler = handler;
    }
    /**
     * Handle End of Speech
     */
    onEndOfSpeech(handler) {
        this.eosHandler = handler;
    }
    /**
     * Handle ASR Result
     */
    onResult(handler) {
        this.resultHandler = handler;
    }
    /**
     * Retrieve the last valid incremental result
     */
    getLastIncremental() {
        return (this.lastASRResult || {
            text: "",
            confidence: 0,
        });
    }
    /**
     * Start the current session
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug("Starting recognition");
            return new Promise((resolve, reject) => {
                this.resolveStart = resolve;
                this.recognizer.recognizeOnceAsync((result) => {
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
                        };
                    }
                    else {
                        this.lastASRResult = {
                            text: "",
                            confidence: 0,
                            langConfidence: "Low",
                            annotation: ASRTypes.ASRAnnotation.GARBAGE,
                        };
                    }
                    resolve(this.lastASRResult);
                }, (error) => {
                    this.log.error("Failed to recognize", error);
                    this.recognizer.close();
                    reject(error);
                });
            });
        });
    }
    dispose() {
        this.stopped = false;
        this.sosHandler = () => { };
        this.eosHandler = () => { };
        this.resultHandler = () => { };
        this.lastASRResult = undefined;
        this.fastEOSRegex = null;
        this.audioStream.close;
        this.recognizer.close;
    }
}
exports.AzureASRStreamingSession = AzureASRStreamingSession;
/** To encapsulate type cast from Azure string to enum */
function parseLanguageDetectionConfidence(azureConfidency) {
    return azureConfidency;
}
//# sourceMappingURL=AzureASRStreamingSession.js.map