
import { AzureSpeechClient, VoiceRecognitionResponse } from './AzureSpeechClient';
import ASRController, { ASRResponse } from '../ASRController';
import AsyncToken from '../AsyncToken';
// const fs = require('fs');
const record = require('node-record-lpcm16');

export default class AzureSpeechApiController extends ASRController {

    public client: AzureSpeechClient;

    constructor(config: any) {
        super();
        this.client = new AzureSpeechClient(config);
    }

    // set config(config: any) {
    // }

    RecognizeWaveBuffer(wave: Buffer): AsyncToken<ASRResponse> {
        let token = new AsyncToken<ASRResponse>();
        token.complete = new Promise<ASRResponse>((resolve: any, reject: any) => {
            this.client.recognize(wave).then((response: VoiceRecognitionResponse) => {
                //console.log(response);
                token.emit('RecognitionEndedEvent');
                let utterance: string = '';
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

    RecognizerStart(options: any): AsyncToken<ASRResponse> {
        let recordDuration = 6000;
        if (options && options.recordDuration) {
            recordDuration = options.recordDuration;
        }
        //console.log(`AzureSpeechApiController: RecognizerStart:`);
        let token = new AsyncToken<ASRResponse>();
        token.complete = new Promise<ASRResponse>((resolve: any, reject: any) => {
            process.nextTick(() => { token.emit('Listening'); });
            try {
                let liveStream = record
                    .start({
                        sampleRateHertz: 16000,
                        verbose: true,
                        recordProgram: 'rec'
                    })
                    .on('error', (error: any) => {
                        // console.log(error);
                        reject(error);
                    });

                setTimeout(() => {
                    //console.log(`stopping`);
                    record.stop();
                    token.emit('Recording_Stopped');
                }, recordDuration);

                this.client.recognizeStream(liveStream).then((response: VoiceRecognitionResponse) => {
                    token.emit('RecognitionEndedEvent');
                    let utterance: string = '';
                    if (response && response.NBest && response.NBest[0] && response.NBest[0].Lexical) {
                        utterance = response.NBest[0].Lexical;
                    }
                    resolve({ utterance: utterance, response: response });
                })
                    .catch((error) => {
                        reject(error);
                    });
            } catch (error) {
                // console.log(error);
                reject(error);
            }
        });
        return token;
    }
}
