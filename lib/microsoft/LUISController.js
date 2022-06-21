"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("../NLUController");
const AsyncToken_1 = require("../AsyncToken");
const axios = require('axios');
const querystring = require('querystring');
class LUISController extends NLUController_1.default {
    constructor(config, options) {
        super();
        this.endpoint = '';
        this.luisAppId = '';
        this.subscriptionKey = '';
        this._config = {};
        this._debug = false;
        this._showAllIntents = false;
        this.config = config;
        this._debug = options ? options.debug : false;
        this._apiVersion = options && options.apiVersion ? options.apiVersion : '3.0';
        this._showAllIntents = options && options.showAllIntents ? options.showAllIntents : false;
    }
    set config(config) {
        if (config && config.Microsoft && (config.Microsoft.nluLUIS_endpoint || config.Microsoft.LuisEndpoint) && (config.Microsoft.nluLUIS_appId || config.Microsoft.LuisAppId) && (config.Microsoft.nluLUIS_subscriptionKey || config.Microsoft.LuisSubscriptionKey)) {
            this._config = config;
            this.endpoint = this._config.Microsoft.nluLUIS_endpoint || config.Microsoft.LuisEndpoint;
            this.luisAppId = this._config.Microsoft.nluLUIS_appId || config.Microsoft.LuisAppId;
            this.subscriptionKey = this._config.Microsoft.nluLUIS_subscriptionKey || config.Microsoft.LuisSubscriptionKey;
        }
        else {
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
    call(query) {
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "show-all-intents": this._showAllIntents,
            "query": query
        };
        // legacy
        // let luisRequest = endpoint + '' + luisAppId + '?' + querystring.stringify(queryParams);
        // apiVersion 3.0
        let luisRequest = `${endpoint}luis/prediction/v3.0/apps/${luisAppId}/slots/production/predict?` + querystring.stringify(queryParams);
        if (this._apiVersion === '2.0') {
            luisRequest = `${endpoint}luis/v2.0/apps/${luisAppId}?` + querystring.stringify(queryParams);
        }
        if (this._debug) {
            console.log(luisRequest);
        }
        return new Promise((resolve, reject) => {
            axios.get(luisRequest)
                .then(function (response) {
                // handle success
                console.log(response.data);
                resolve(response.data);
            })
                .catch((error) => {
                // handle error
                // console.log(error);
                if (this._debug) {
                    console.log(`LUISController: call: error:`, error);
                }
                reject(error);
            })
                .then(function () {
                // always executed
            });
        });
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
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
    getIntentAndEntities(utterance, options) {
        options = options || {};
        let defaultOptions = {
            languageCode: NLUController_1.NLULanguageCode.en_US,
            contexts: undefined,
            sessionId: undefined
        };
        options = Object.assign(defaultOptions, options);
        let token = new AsyncToken_1.default();
        token.complete = new Promise((resolve, reject) => {
            this.call(utterance)
                .then((response) => {
                console.log(`getIntentAndEntities: response:`, response);
                let intentAndEntities = {
                    intent: '',
                    intents: response.prediction ? response.prediction.intents : [],
                    entities: response.prediction ? response.prediction.entities : [],
                    response: response
                };
                if (response && response.prediction && response.prediction.topIntent) {
                    intentAndEntities.intent = response.prediction.topIntent;
                    // intentAndEntities = {
                    //     intent: response.prediction.topIntent,
                    //     intents: response.prediction.intents
                    //     entities: response.prediction.entities,
                    //     response: response
                    // }
                }
                else {
                    if (this._debug) {
                        console.log(`LUISController: getIntentAndEntities: unknown response format:`);
                        console.log(response);
                    }
                }
                resolve(intentAndEntities);
            })
                .catch((err) => {
                reject(err);
            });
        });
        return token;
    }
}
exports.default = LUISController;
//# sourceMappingURL=LUISController.js.map