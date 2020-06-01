"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AzureSpeechClient_1 = require("./AzureSpeechClient");
const ASRController_1 = require("../ASRController");
const AsyncToken_1 = require("../AsyncToken");
// const fs = require('fs');
const record = require('node-record-lpcm16');
class AzureSpeechApiController extends ASRController_1.default {
    constructor(config) {
        super();
        this.client = new AzureSpeechClient_1.AzureSpeechClient(config);
    }
    // set config(config: any) {
    // }
    RecognizeWaveBuffer(wave) {
        let token = new AsyncToken_1.default();
        token.complete = new Promise((resolve, reject) => {
            this.client.recognize(wave).then((response) => {
                //console.log(response);
                token.emit('RecognitionEndedEvent');
                let utterance = '';
                if (response && response.NBest && response.NBest[0] && response.NBest[0].Lexical) {
                    utterance = response.NBest[0].Lexical;
                }
                resolve({ utterance: utterance, response: response });
            })
                .catch((error) => {
                reject(error);
            });
        });
        return token;
    }
    RecognizerStart(options) {
        let recordDuration = 6000;
        if (options && options.recordDuration) {
            recordDuration = options.recordDuration;
        }
        //console.log(`AzureSpeechApiController: RecognizerStart:`);
        let token = new AsyncToken_1.default();
        token.complete = new Promise((resolve, reject) => {
            process.nextTick(() => { token.emit('Listening'); });
            try {
                let liveStream = record
                    .start({
                    sampleRateHertz: 16000,
                    verbose: true,
                    recordProgram: 'rec'
                })
                    .on('error', (error) => {
                    // console.log(error);
                    reject(error);
                });
                setTimeout(() => {
                    //console.log(`stopping`);
                    record.stop();
                    token.emit('Recording_Stopped');
                }, recordDuration);
                this.client.recognizeStream(liveStream).then((response) => {
                    token.emit('RecognitionEndedEvent');
                    let utterance = '';
                    if (response && response.NBest && response.NBest[0] && response.NBest[0].Lexical) {
                        utterance = response.NBest[0].Lexical;
                    }
                    resolve({ utterance: utterance, response: response });
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            catch (error) {
                // console.log(error);
                reject(error);
            }
        });
        return token;
    }
}
exports.default = AzureSpeechApiController;
//# sourceMappingURL=AzureSpeechApiController.js.map