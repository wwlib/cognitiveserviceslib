"use strict";
/*
 * Based on: https://www.npmjs.com/package/bingspeech-api-client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureSpeechClient = void 0;
const needle = require("needle");
const stream = require("stream");
const querystring = require("querystring");
const ASIAN_LOCALES = ['zh-cn', 'zh-hk', 'zh-tw', 'ja-jp'];
const VOICES = {
    'ar-EG female': 'Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)',
    'ar-SA male': 'Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)',
    'de-DE female': 'Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)',
    'de-DE male': 'Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)',
    'en-AU female': 'Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)',
    'en-CA female': 'Microsoft Server Speech Text to Speech Voice (en-CA, Linda)',
    'en-GB female': 'Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)',
    'en-GB male': 'Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)',
    'en-IN male': 'Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)',
    'en-US female': 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)',
    'en-US male': 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)',
    'es-ES female': 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
    'es-ES male': 'Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)',
    'es-MX male': 'Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)',
    'fr-CA female': 'Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)',
    'fr-FR female': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)',
    'fr-FR male': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)',
    'it-IT male': 'Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)',
    'ja-JP female': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)',
    'ja-JP male': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)',
    'pt-BR female': 'Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)',
    'pt-BR male': 'Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)',
    'ru-RU female': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)',
    'ru-RU male': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)',
    // XXX this key is duplicated
    // 'zh-cn female': 'Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)',
    'zh-CN female': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Apollo)',
    'zh-CN male': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)',
    'zh-HK female': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)',
    'zh-HK male': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)',
    'zh-TW female': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)',
    'zh-TW male': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)',
    'nl-NL female': 'Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)'
};
class AzureSpeechClient {
    /**
      * @constructor
      * @param {string} subscriptionKey Your AZURE Speech subscription key.
     */
    constructor(config) {
        this.AZURE_SPEECH_TOKEN_ENDPOINT = 'https://azurespeechserviceeast.cognitiveservices.azure.com/sts/v1.0/issuetoken';
        this.AZURE_SPEECH_ENDPOINT_STT = 'https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1';
        this.AZURE_SPEECH_ENDPOINT_TTS = 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1';
        this.subscriptionKey = '';
        this.token = '';
        this.tokenExpirationDate = 0;
        /**
         * Supported: raw-8khz-8bit-mono-mulaw, raw-16khz-16bit-mono-pcm, riff-8khz-8bit-mono-mulaw, riff-16khz-16bit-mono-pcm
         */
        this.AUDIO_OUTPUT_FORMAT = 'riff-16khz-16bit-mono-pcm';
        if (config && config.Microsoft && config.Microsoft.AzureSpeechSubscriptionKey) {
            this.subscriptionKey = config.Microsoft.AzureSpeechSubscriptionKey;
            if (config.Microsoft.AzureSpeechTokenEndpoint)
                this.AZURE_SPEECH_TOKEN_ENDPOINT = config.Microsoft.AzureSpeechTokenEndpoint;
            if (config.Microsoft.AzureSpeechEndpointStt || config.Microsoft.AzureSpeechEndpointAsr)
                this.AZURE_SPEECH_ENDPOINT_STT = config.Microsoft.AzureSpeechEndpointStt || config.Microsoft.AzureSpeechEndpointAsr;
            if (config.Microsoft.AzureSpeechEndpointTts)
                this.AZURE_SPEECH_ENDPOINT_TTS = config.Microsoft.AzureSpeechEndpointTts;
        }
        else {
            console.log(`AzureSpeechClient: config: error: incomplete config:`, config);
        }
    }
    /**
     * @deprecated Use the recognizeStream function instead. Will be removed in 2.x
     */
    recognize(wave, options) {
        var bufferStream = new stream.PassThrough();
        bufferStream.end(wave);
        return this.recognizeStream(bufferStream, options);
    }
    recognizeStream(input, options) {
        let locale = 'en-US';
        if (options && options.locale) {
            locale = options.locale;
        }
        // TODO make locale and content-type configurable
        return this.issueToken()
            .then((token) => {
            // Access token expires every 10 minutes. Renew it every 9 minutes only.
            this.token = token;
            this.tokenExpirationDate = Date.now() + 9 * 60 * 1000;
            let params = {
                language: locale,
                format: "detailed"
            };
            let requestOptions = {
                headers: {
                    'Accept': 'application/json;text/xml',
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'audio/wav; codec="audio/pcm"; samplerate=16000',
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    'Transfer-Encoding': "chunked",
                    'Expect': '100-continue'
                },
                open_timeout: 5000,
                read_timeout: 5000
            };
            return new Promise((resolve, reject) => {
                let endpoint = this.AZURE_SPEECH_ENDPOINT_STT + '?' + querystring.stringify(params);
                needle.post(endpoint, input, requestOptions, (err, res, body) => {
                    if (err) {
                        return reject(err);
                    }
                    if (res.statusCode !== 200) {
                        return reject(new Error(`Wrong status code ${res.statusCode} in Azure Speech API / synthesize`));
                    }
                    resolve(body);
                });
            });
        })
            .catch((err) => {
            throw new Error(`cognitiveserviceslib: recognizeStream: error: ${err.message}`);
        });
    }
    synthesizeStream(text, options) {
        let format = this.AUDIO_OUTPUT_FORMAT;
        let locale = 'en-US';
        let gender = 'female';
        if (options && options.format) {
            format = options.format;
        }
        if (options && options.locale) {
            locale = options.locale;
        }
        if (options && options.gender) {
            gender = options.gender;
        }
        return this.issueToken()
            .then((token) => {
            // Access token expires every 10 minutes. Renew it every 9 minutes only.
            this.token = token;
            this.tokenExpirationDate = Date.now() + 9 * 60 * 1000;
            // If locale is Chinese or Japanese, convert to proper Unicode format
            if (ASIAN_LOCALES.indexOf(locale.toLowerCase()) > -1) {
                text = this.convertToUnicode(text);
            }
            let font = voiceFont(locale, gender);
            if (!font) {
                throw new Error(`No voice font for lang ${locale} and gender ${gender}`);
            }
            let ssml = `<speak version='1.0' xml:lang='${locale}'>
                            <voice name='${font}' xml:lang='${locale}' xml:gender='${gender}'>${text}</voice>
                            </speak>`;
            let requestOptions = {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/ssml+xml',
                    'Content-Length': ssml.length,
                    'X-Microsoft-OutputFormat': format,
                    'X-Search-AppId': '00000000000000000000000000000000',
                    'X-Search-ClientID': '00000000000000000000000000000000',
                    'User-Agent': 'cognitiveserviceslib'
                },
                open_timeout: 5000,
                read_timeout: 5000
            };
            return needle.post(this.AZURE_SPEECH_ENDPOINT_TTS, ssml, requestOptions);
        })
            .catch((err) => {
            throw new Error(`cognitiveserviceslib: synthesizeStream: error: ${err.message}`);
        });
    }
    issueToken() {
        if (this.token && this.tokenExpirationDate > Date.now()) {
            // console.log('reusing existing token');
            return Promise.resolve(this.token);
        }
        // console.log('issue new token for subscription key %s', this.subscriptionKey);
        let requestOptions = {
            headers: {
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                'Content-Length': 0
            },
            open_timeout: 3000,
            read_timeout: 3000
        };
        return new Promise((resolve, reject) => {
            needle.post(this.AZURE_SPEECH_TOKEN_ENDPOINT, null, requestOptions, (err, res, body) => {
                if (err) {
                    return reject(err);
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`Wrong status code ${res.statusCode} in Azure Speech API / token`));
                }
                resolve(body);
            });
        });
    }
    convertToUnicode(message) {
        return message.split('')
            .map((c) => '&#' + c.charCodeAt(0) + ';')
            .join('');
    }
}
exports.AzureSpeechClient = AzureSpeechClient;
/**
 * Get the appropriate voice font
 */
function voiceFont(locale, gender) {
    let voiceKey = (locale + ' ' + gender); //.toLowerCase();
    return VOICES[voiceKey];
}
//# sourceMappingURL=client.js.map