import AsyncToken from './AsyncToken';
export declare type NLUIntentAndEntities = {
    intent: string;
    entities: any;
    response: any;
};
export declare type NLURequestOptions = {
    languageCode?: string;
    contexts?: string[];
    sessionId?: string;
};
export declare enum NLULanguageCode {
    en_US = "en-US"
}
export default abstract class NLUController {
    constructor();
    abstract set config(config: any);
    abstract call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any>;
    abstract getEntitiesWithResponse(response: any): any | undefined;
    abstract getIntentAndEntities(utterance: string, options?: NLURequestOptions): AsyncToken<NLUIntentAndEntities>;
}
