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

const defaultMicrosoftOptions: MicrosoftOptions = {
  AzureSpeechSubscriptionKey: '',
  AzureSpeechTokenEndpoint: '',
  AzureSpeechEndpointAsr: '',
  AzureSpeechEndpointTts: '',
  LuisEndpoint: '',
  LuisAppId: '',
  LuisSubscriptionKey: '',
}

export default class CognitiveServicesConfig extends EventEmitter {

  public Microsoft: MicrosoftOptions = defaultMicrosoftOptions;

  private _timestamp: number = 0;

  constructor(options?: CognitiveServicesConfigOptions) {
    super();
    this.init(options);
  }

  init(options?: CognitiveServicesConfigOptions): void {
    // console.log(`CognitiveServicesConfig: init`, options);
    if (options) {
      this.initWithData(options);
    } else if (this.loadFromLocalStorage()) {
      console.log(`loaded settings from local storage.`)
    } else {
      this.initWithData();
    }
  }

  initWithData(options: CognitiveServicesConfigOptions | any = {}): void {
    console.log(`CognitiveServicesConfig: initWithData`, options);
    if (options.Microsoft) {
      this.Microsoft = options.Microsoft;
    } else {
      this.Microsoft = defaultMicrosoftOptions;
    }
    this._timestamp = options.timestamp || 0;
  }

  saveToLocalStorage(): boolean {
    const localStorage = window.localStorage;
    try {
      const dataText = JSON.stringify(this.json);
      localStorage.setItem('settings', dataText);
      return true;
    } catch (error) {
      console.log(`saveToLocalStorage:`, error);
      return false;
    }
  }

  loadFromLocalStorage(): boolean {
    let result = false;
    const localStorage = window ? window.localStorage : undefined;

    if (localStorage) {
      const settingsText: string | null = localStorage.getItem('cognitive-services-config');
      // console.log(`loadFromLocalStorage: `, settingsText);
      if (settingsText) {
        try {
          const settings = JSON.parse(settingsText);
          this.initWithData(settings as CognitiveServicesConfigOptions);
          result = true
        } catch (error) {
          console.log(`loadFromLocalStorage`, error);
        }
      }
    }
    return result;
  }

  get json(): any {
    let json: any = {
      Microsoft: this.Microsoft,
    };
    return json;
  }

  get timestamp(): number {
    return this._timestamp;
  }
}