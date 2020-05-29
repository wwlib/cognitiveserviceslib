"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("../NLUController");
const AsyncToken_1 = require("../AsyncToken");
const request = require('request');
const querystring = require('querystring');
class LUISController extends NLUController_1.default {
    constructor(config) {
        super();
        this.endpoint = '';
        this.luisAppId = '';
        this.subscriptionKey = '';
        this._config = {};
        this.config = config;
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
    call(query) {
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "q": query
        };
        let luisRequest = endpoint + luisAppId + '?' + querystring.stringify(queryParams);
        return new Promise((resolve, reject) => {
            request(luisRequest, ((error, response, body) => {
                if (error) {
                    // console.log(`LUISController: call: error:`, response, error);
                    reject(error);
                }
                else {
                    let body_obj = JSON.parse(body);
                    resolve(body_obj);
                }
            }));
        });
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };
        response.entities.forEach((entity) => {
            entitiesObject[`${entity.type}Original`] = entity.entity;
            if (entity.resolution && entity.resolution.values) {
                entitiesObject[`${entity.type}`] = entity.resolution.values[0];
            }
        });
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
                let intentAndEntities = {
                    intent: '',
                    entities: undefined,
                    response: undefined
                };
                if (response && response.topScoringIntent) {
                    intentAndEntities = {
                        intent: response.topScoringIntent.intent,
                        entities: this.getEntitiesWithResponse(response),
                        response: response
                    };
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