/// <reference types="node" />
import { EventEmitter } from "events";
export interface MicrosoftOptions {
    AzureSpeechSubscriptionKey: string;
    AzureSpeechTokenEndpoint: string;
    AzureSpeechEndpointAsr: string;
    AzureSpeechEndpointTts: string;
    LuisEndpoint: string;
    LuisAppId: string;
    LuisSubscriptionKey: string;
}
export interface CognitiveServicesConfigOptions {
    Microsoft: MicrosoftOptions;
}
export default class CognitiveServicesConfig extends EventEmitter {
    Microsoft: MicrosoftOptions;
    private _timestamp;
    constructor(options?: CognitiveServicesConfigOptions);
    init(options?: CognitiveServicesConfigOptions): void;
    initWithData(options?: CognitiveServicesConfigOptions | any): void;
    saveToLocalStorage(): boolean;
    loadFromLocalStorage(): boolean;
    get json(): any;
    get timestamp(): number;
}
