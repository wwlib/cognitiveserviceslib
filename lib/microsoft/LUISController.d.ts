import NLUController, { NLUIntentAndEntities, NLURequestOptions } from '../NLUController';
import AsyncToken from '../AsyncToken';
export declare type LUISIntent = {
    intent: string;
    score: number;
};
export declare type LUISEntity = {
    entity: string;
    type: string;
    startIndex: number;
    endIndex: number;
    resolution: {
        values: string[];
    };
};
export declare type LUISResponse = {
    query: string;
    prediction: any;
    intents: any;
    entities: any;
};
export default class LUISController extends NLUController {
    endpoint: string;
    luisAppId: string;
    subscriptionKey: string;
    private _config;
    private _debug;
    private _apiVersion;
    private _showAllIntents;
    constructor(config: any, options?: any);
    set config(config: any);
    call(query: string): Promise<any>;
    getEntitiesWithResponse(response: LUISResponse): any;
    getIntentAndEntities(utterance: string, options?: NLURequestOptions): AsyncToken<NLUIntentAndEntities>;
}
