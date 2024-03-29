"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const defaultMicrosoftOptions = {
    AzureSpeechSubscriptionKey: '',
    AzureSpeechTokenEndpoint: '',
    AzureSpeechEndpointAsr: '',
    AzureSpeechEndpointTts: '',
    LuisEndpoint: '',
    LuisAppId: '',
    LuisSubscriptionKey: '',
};
class CognitiveServicesConfig extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.Microsoft = defaultMicrosoftOptions;
        this._timestamp = 0;
        this.init(options);
    }
    init(options) {
        // console.log(`CognitiveServicesConfig: init`, options);
        if (options) {
            this.initWithData(options);
        }
        else if (this.loadFromLocalStorage()) {
            console.log(`loaded settings from local storage.`);
        }
        else {
            this.initWithData();
        }
    }
    initWithData(options = {}) {
        console.log(`CognitiveServicesConfig: initWithData`, options);
        if (options.Microsoft) {
            this.Microsoft = options.Microsoft;
        }
        else {
            this.Microsoft = defaultMicrosoftOptions;
        }
        this._timestamp = options.timestamp || 0;
    }
    saveToLocalStorage() {
        const localStorage = window.localStorage;
        try {
            const dataText = JSON.stringify(this.json);
            localStorage.setItem(CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME, dataText);
            return true;
        }
        catch (error) {
            console.log(`saveToLocalStorage:`, error);
            return false;
        }
    }
    loadFromLocalStorage() {
        let result = false;
        const localStorage = window ? window.localStorage : undefined;
        if (localStorage) {
            const settingsText = localStorage.getItem(CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME);
            // console.log(`loadFromLocalStorage: `, settingsText);
            if (settingsText) {
                try {
                    const settings = JSON.parse(settingsText);
                    this.initWithData(settings);
                    result = true;
                }
                catch (error) {
                    console.log(`loadFromLocalStorage`, error);
                }
            }
        }
        return result;
    }
    get json() {
        let json = {
            Microsoft: this.Microsoft,
        };
        return json;
    }
    get timestamp() {
        return this._timestamp;
    }
}
exports.default = CognitiveServicesConfig;
CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME = 'cognitive-services-config';
//# sourceMappingURL=CognitiveServicesConfig.js.map