// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   ../events

declare module 'cognitiveserviceslib' {
    import LUISController, { LUISResponse, LUISEntity, LUISIntent } from 'cognitiveserviceslib/microsoft/LUISController';
    import { AzureSpeechClient, VoiceRecognitionResponse, VoiceSynthesisResponse } from 'cognitiveserviceslib/microsoft/AzureSpeechClient';
    import AzureSpeechApiController from 'cognitiveserviceslib/microsoft/AzureSpeechApiController';
    import AzureTTSController from 'cognitiveserviceslib/microsoft/AzureTTSController';
    import ASRController, { ASRResponse } from 'cognitiveserviceslib/ASRController';
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    import HotwordController, { HotwordResult } from 'cognitiveserviceslib/HotwordController';
    import NLUController, { NLUIntentAndEntities, NLURequestOptions, NLULanguageCode } from 'cognitiveserviceslib/NLUController';
    import TTSController, { TTSResponse } from 'cognitiveserviceslib/TTSController';
    export { LUISController, LUISResponse, LUISEntity, LUISIntent, AzureSpeechClient, VoiceRecognitionResponse, VoiceSynthesisResponse, AzureSpeechApiController, AzureTTSController, ASRController, ASRResponse, AsyncToken, HotwordController, HotwordResult, NLUController, NLUIntentAndEntities, NLURequestOptions, NLULanguageCode, TTSController, TTSResponse };
}

declare module 'cognitiveserviceslib/microsoft/LUISController' {
    import NLUController, { NLUIntentAndEntities, NLURequestOptions } from 'cognitiveserviceslib/NLUController';
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export type LUISIntent = {
        intent: string;
        score: number;
    };
    export type LUISEntity = {
        entity: string;
        type: string;
        startIndex: number;
        endIndex: number;
        resolution: {
            values: string[];
        };
    };
    export type LUISResponse = {
        query: string;
        topScoringIntent: LUISIntent;
        intents: LUISIntent[];
        entities: LUISEntity[];
    };
    export default class LUISController extends NLUController {
        endpoint: string;
        luisAppId: string;
        subscriptionKey: string;
        /**
          * @constructor
          */
        constructor(config: any);
        config: any;
        call(query: string): Promise<any>;
        getEntitiesWithResponse(response: LUISResponse): any;
        getIntentAndEntities(utterance: string, options?: NLURequestOptions): AsyncToken<NLUIntentAndEntities>;
    }
}

declare module 'cognitiveserviceslib/microsoft/AzureSpeechClient' {
    export { AzureSpeechClient } from 'cognitiveserviceslib/microsoft/AzureSpeechClient/client';
    export { VoiceRecognitionResponse, VoiceSynthesisResponse } from 'cognitiveserviceslib/microsoft/AzureSpeechClient/models';
}

declare module 'cognitiveserviceslib/microsoft/AzureSpeechApiController' {
    import { AzureSpeechClient } from 'cognitiveserviceslib/microsoft/AzureSpeechClient';
    import ASRController, { ASRResponse } from 'cognitiveserviceslib/ASRController';
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export default class AzureSpeechApiController extends ASRController {
        client: AzureSpeechClient;
        constructor(config: any);
        config: any;
        RecognizeWaveBuffer(wave: Buffer): AsyncToken<ASRResponse>;
        RecognizerStart(options: any): AsyncToken<ASRResponse>;
    }
}

declare module 'cognitiveserviceslib/microsoft/AzureTTSController' {
    import { AzureSpeechClient } from 'cognitiveserviceslib/microsoft/AzureSpeechClient';
    import TTSController, { TTSOptions, TTSResponse } from 'cognitiveserviceslib/TTSController';
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export default class AzureTTSController extends TTSController {
        audioContext: AudioContext;
        masterVolumeGainNode: GainNode | undefined;
        client: AzureSpeechClient;
        constructor(config: any, audioContext: AudioContext);
        config: any;
        SynthesizerStart(text: string, options?: TTSOptions): AsyncToken<TTSResponse>;
    }
}

declare module 'cognitiveserviceslib/ASRController' {
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export type ASRResponse = {
        utterance: string;
        response: any;
    };
    export default abstract class ASRController {
        abstract RecognizerStart(options?: any): AsyncToken<ASRResponse>;
    }
}

declare module 'cognitiveserviceslib/AsyncToken' {
    import { EventEmitter } from 'events';
    export default class AsyncToken<T> extends EventEmitter {
        complete: Promise<T> | undefined;
        constructor();
    }
}

declare module 'cognitiveserviceslib/HotwordController' {
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export type HotwordResult = {
        hotword: string;
        index?: number;
        buffer?: any;
    };
    export default abstract class HotwordController {
        abstract RecognizerStart(options?: any): AsyncToken<HotwordResult>;
    }
}

declare module 'cognitiveserviceslib/NLUController' {
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export type NLUIntentAndEntities = {
        intent: string;
        entities: any;
        response: any;
    };
    export type NLURequestOptions = {
        languageCode?: string;
        contexts?: string[];
        sessionId?: string;
    };
    export enum NLULanguageCode {
        en_US = "en-US"
    }
    export default abstract class NLUController {
        constructor();
        abstract config: any;
        abstract call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any>;
        abstract getEntitiesWithResponse(response: any): any | undefined;
        abstract getIntentAndEntities(utterance: string, options?: NLURequestOptions): AsyncToken<NLUIntentAndEntities>;
    }
}

declare module 'cognitiveserviceslib/TTSController' {
    import AsyncToken from 'cognitiveserviceslib/AsyncToken';
    export type TTSResponse = {
        text: string;
        buffer: Buffer | undefined;
    };
    export type TTSOptions = {
        autoPlay?: boolean;
    };
    export default abstract class TTSController {
        abstract SynthesizerStart(text: string, options?: TTSOptions): AsyncToken<TTSResponse>;
    }
}

declare module 'cognitiveserviceslib/microsoft/AzureSpeechClient/client' {
    import { VoiceRecognitionResponse } from 'cognitiveserviceslib/microsoft/AzureSpeechClient/models';
    export class AzureSpeechClient {
            /**
                 * @constructor
                 * @param {string} subscriptionKey Your AZURE Speech subscription key.
                */
            constructor(config: any);
            /**
                * @deprecated Use the recognizeStream function instead. Will be removed in 2.x
                */
            recognize(wave: Buffer, locale?: string): Promise<VoiceRecognitionResponse>;
            recognizeStream(input: NodeJS.ReadWriteStream, locale?: string): Promise<VoiceRecognitionResponse>;
            synthesizeStream(text: string, locale?: string, gender?: string): Promise<NodeJS.ReadableStream>;
            issueToken(): Promise<string>;
    }
}

declare module 'cognitiveserviceslib/microsoft/AzureSpeechClient/models' {
    export interface VoiceRecognitionResponse {
        RecognitionStatus: string;
        Offset: number;
        Duration: number;
        NBest: VoiceRecognitionUtterance[];
    }
    export interface VoiceRecognitionUtterance {
        Confidence: number;
        Lexical: string;
        ITN: string;
        MaskedITN: string;
        Display: string;
    }
    /**
      * @deprecated Use streaming mode instead. Will be removed in 2.x
      */
    export interface VoiceSynthesisResponse {
        wave: Buffer;
    }
}

