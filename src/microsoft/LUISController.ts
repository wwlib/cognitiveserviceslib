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
    topScoringIntent: LUISIntent;
    intents: LUISIntent[];
    entities: LUISEntity[];
}

export default class LUISController extends NLUController {

    public endpoint: string = '';
    public luisAppId: string = '';
    public subscriptionKey: string = '';

    private _config: any = {};

    constructor(config: any) {
        super();
        this.config = config;
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

    call(query: string): Promise<any> {
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "q": query
        }

        let luisRequest = endpoint + luisAppId + '?' + querystring.stringify(queryParams);

        return new Promise((resolve, reject) => {
            request(luisRequest,
                ((error: string, response: any, body: any) => {
                    if (error) {
                        // console.log(`LUISController: call: error:`, response, error);
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

        response.entities.forEach((entity: LUISEntity) => {
            entitiesObject[`${entity.type}Original`] = entity.entity;
            if (entity.resolution && entity.resolution.values) {
                entitiesObject[`${entity.type}`] = entity.resolution.values[0];
            }
        });

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
                        entities: undefined,
                        response: undefined
                    }
                    if (response && response.topScoringIntent) {
                        intentAndEntities = {
                            intent: response.topScoringIntent.intent,
                            entities: this.getEntitiesWithResponse(response),
                            response: response
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
