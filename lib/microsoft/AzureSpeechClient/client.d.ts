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
     * Supported: raw-8khz-8bit-mono-mulaw, raw-16khz-16bit-mono-pcm, riff-8khz-8bit-mono-mulaw, riff-16khz-16bit-mono-pcm
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
