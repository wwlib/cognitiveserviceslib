import NLUController, { NLUIntentAndEntities, NLURequestOptions, NLULanguageCode } from '../NLUController';
import AsyncToken from '../AsyncToken';

const request = require('request');
const querystring = require('querystring');

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
    }
}

export type LUISResponse = {
    query: string;
    prediction: any;
    intents: any; //LUISIntent[];
    entities: any; //LUISEntity[];
}

export default class LUISController extends NLUController {

    public endpoint: string = '';
    public luisAppId: string = '';
    public subscriptionKey: string = '';

    private _config: any = {};
    private _debug: boolean = false;

    constructor(config: any, debug: boolean = false) {
        super();
        this.config = config;
        this._debug = debug;
    }

    set config(config: any) {
        if (config && config.Microsoft && (config.Microsoft.nluLUIS_endpoint || config.Microsoft.LuisEndpoint) && (config.Microsoft.nluLUIS_appId || config.Microsoft.LuisAppId) && (config.Microsoft.nluLUIS_subscriptionKey || config.Microsoft.LuisSubscriptionKey)) {
            this._config = config;
            this.endpoint = this._config.Microsoft.nluLUIS_endpoint || config.Microsoft.LuisEndpoint;
            this.luisAppId = this._config.Microsoft.nluLUIS_appId || config.Microsoft.LuisAppId;
            this.subscriptionKey = this._config.Microsoft.nluLUIS_subscriptionKey || config.Microsoft.LuisSubscriptionKey;
        } else {
            console.log(`LUISController: set config: error: incomplete config:`, config);
        }
    }

    /*
    https://westus.api.cognitive.microsoft.com/
    luis/prediction/v3.0/apps/a9cb499e-1a9d-4183-b98d-e76c3f2b4100/slots/production/predict
    ?subscription-key=9d2bf81c1a04451f8371f6c465ac9678
    &verbose=true&show-all-intents=true
    &log=true
    &query=YOUR_QUERY_HERE
    */
   
    call(query: string): Promise<any> {
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "query": query
        }

        // let luisRequest = endpoint + '' + luisAppId + '?' + querystring.stringify(queryParams);
        let luisRequest = `${endpoint}luis/prediction/v3.0/apps/${luisAppId}/slots/production/predict?` + querystring.stringify(queryParams);
        if (this._debug) {
            console.log(luisRequest);
        }
        return new Promise((resolve, reject) => {
            request(luisRequest,
                ((error: string, response: any, body: any) => {
                    if (error) {
                        if (this._debug) {
                            console.log(`LUISController: call: error:`, error, response);
                        }
                        reject(error);
                    } else {
                        let body_obj: any = JSON.parse(body);
                        resolve(body_obj);
                    }
                }));
        });
    }

    getEntitiesWithResponse(response: LUISResponse): any {
        let entitiesObject: any = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };

        // response.prediction.entities.forEach((entity: LUISEntity) => {
        //     entitiesObject[`${entity.type}Original`] = entity.entity;
        //     if (entity.resolution && entity.resolution.values) {
        //         entitiesObject[`${entity.type}`] = entity.resolution.values[0];
        //     }
        // });

        return entitiesObject;
    }

    getIntentAndEntities(utterance: string, options?: NLURequestOptions): AsyncToken<NLUIntentAndEntities> {
        options = options || {};
        let defaultOptions: NLURequestOptions = {
            languageCode: NLULanguageCode.en_US,
            contexts: undefined,
            sessionId: undefined
        }
        options = Object.assign(defaultOptions, options);

        let token = new AsyncToken<NLUIntentAndEntities>();
        token.complete = new Promise<NLUIntentAndEntities>((resolve, reject) => {
            this.call(utterance)
                .then((response: LUISResponse) => {
                    let intentAndEntities: NLUIntentAndEntities = {
                        intent: '',
                        intents: response.prediction ? response.prediction.intents : [],
                        entities: response.prediction? response.prediction.entities : [],
                        response: response
                    }
                    if (response && response.prediction && response.prediction.topIntent) {
                        intentAndEntities.intent = response.prediction.topIntent
                        // intentAndEntities = {
                        //     intent: response.prediction.topIntent,
                        //     intents: response.prediction.intents
                        //     entities: response.prediction.entities,
                        //     response: response
                        // }
                    } else {
                        if (this._debug) {
                            console.log(`LUISController: getIntentAndEntities: unknown response format:`);
                            console.log(response);
                        }
                    }
                    resolve(intentAndEntities);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
        return token;
    }
}
