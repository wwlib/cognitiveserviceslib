
import { AzureSpeechClient } from './AzureSpeechClient';
import TTSController from '../TTSController';
import AsyncToken from '../AsyncToken';
// const findRoot = require('find-root');
const fs = require('fs');

// const root = findRoot(__dirname);
// const configFile = root + '/data/config.json';
// const config: any = require(configFile);

export default class BingTTSController extends TTSController {

    public audioContext: AudioContext;
    public masterVolumeGainNode: GainNode | undefined;
    public client: AzureSpeechClient;

    private _config: any = {};

    constructor(config: any, audioContext: AudioContext) {
        super();
        this._config = config;

        this.audioContext = audioContext;
        if (this.audioContext) {
            this.masterVolumeGainNode = this.audioContext.createGain();
            this.masterVolumeGainNode.gain.value = 1.0;
            this.masterVolumeGainNode.connect(this.audioContext.destination);
        }
        this.client = new AzureSpeechClient(this._config.Microsoft.AzureSpeechSubscriptionKey);
    }

    set config(config: any) {
        this._config = config;
    }

    SynthesizerStart(text: string, options?: any): AsyncToken<string> {
        //console.log(`BingTTSController: SynthesizerStart: ${text}`);
        let token = new AsyncToken<string>();
        token.complete = new Promise<string>((resolve: any, reject: any) => {
            process.nextTick(() => { token.emit('Synthesizing'); });

            let file = fs.createWriteStream('tts-out.wav');
            this.client.synthesizeStream(text).then((audioStream: any) => {
                token.emit('SynthesisEndedEvent');
                audioStream.pipe(file);

                let buffers: any[] = [];
                audioStream.on('data', (chunk: any) => {
                    buffers.push(chunk);
                });
                audioStream.on('end', () => {
                    // console.log('audioStream end');
                    if (this.audioContext) {
                        if (buffers && buffers.length > 0) {
                            let audioStreamBuffer = Buffer.concat(buffers);
                            let audioData = new Uint8Array(audioStreamBuffer).buffer;
                            this.audioContext.decodeAudioData(audioData, (buffer: any) => {
                                let decodedBuffer = buffer;
                                let bufferSource = this.audioContext.createBufferSource();
                                bufferSource.buffer = decodedBuffer;
                                if (this.masterVolumeGainNode) {
                                    bufferSource.connect(this.masterVolumeGainNode);
                                    bufferSource.start(this.audioContext.currentTime);
                                }
                            });
                        }
                    }
                    resolve(text);
                });
            });
        });
        return token;
    }
}
