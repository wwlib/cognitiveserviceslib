/// <reference types="node" />
import { VoiceRecognitionResponse } from './models';
export declare type AsrOptions = {
    recordDuration?: number;
    locale?: string;
};
export declare type TtsOptions = {
    autoPlay?: boolean;
    format?: string;
    locale?: string;
    gender?: string;
    voiceName?: string;
};
export declare class AzureSpeechClient {
    private AZURE_SPEECH_TOKEN_ENDPOINT;
    private AZURE_SPEECH_ENDPOINT_STT;
    private AZURE_SPEECH_ENDPOINT_TTS;
    private subscriptionKey;
    private token;
    private tokenExpirationDate;
    /**
     * Supported:
     * https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech
     * raw-16khz-16bit-mono-pcm            riff-16khz-16bit-mono-pcm
     * raw-24khz-16bit-mono-pcm            riff-24khz-16bit-mono-pcm
     * raw-48khz-16bit-mono-pcm            riff-48khz-16bit-mono-pcm
     * raw-8khz-8bit-mono-mulaw            riff-8khz-8bit-mono-mulaw
     * raw-8khz-8bit-mono-alaw             riff-8khz-8bit-mono-alaw
     * audio-16khz-32kbitrate-mono-mp3     audio-16khz-64kbitrate-mono-mp3
     * audio-16khz-128kbitrate-mono-mp3    audio-24khz-48kbitrate-mono-mp3
     * audio-24khz-96kbitrate-mono-mp3     audio-24khz-160kbitrate-mono-mp3
     * audio-48khz-96kbitrate-mono-mp3     audio-48khz-192kbitrate-mono-mp3
     * raw-16khz-16bit-mono-truesilk       raw-24khz-16bit-mono-truesilk
     * webm-16khz-16bit-mono-opus          webm-24khz-16bit-mono-opus
     * ogg-16khz-16bit-mono-opus           ogg-24khz-16bit-mono-opus
    */
    private AUDIO_OUTPUT_FORMAT;
    /**
      * @constructor
      * @param {string} subscriptionKey Your AZURE Speech subscription key.
     */
    constructor(config: any);
    /**
     * @deprecated Use the recognizeStream function instead. Will be removed in 2.x
     */
    recognize(wave: Buffer, options?: AsrOptions): Promise<VoiceRecognitionResponse>;
    recognizeStream(input: NodeJS.ReadWriteStream, options?: AsrOptions): Promise<VoiceRecognitionResponse>;
    synthesizeStream(text: string, options?: TtsOptions): Promise<NodeJS.ReadableStream>;
    issueToken(): Promise<string>;
    private convertToUnicode;
}
