
import { AzureSpeechClient } from './AzureSpeechClient';
import TTSController, { TTSOptions, TTSResponse } from '../TTSController';
import AsyncToken from '../AsyncToken';
const fs = require('fs');

export default class AzureTTSController extends TTSController {

    public audioContext: AudioContext;
    public masterVolumeGainNode: GainNode | undefined;
    public client: AzureSpeechClient;

    constructor(config: any, audioContext: AudioContext) {
        super();
        this.audioContext = audioContext;
        if (this.audioContext) {
            this.masterVolumeGainNode = this.audioContext.createGain();
            this.masterVolumeGainNode.gain.value = 1.0;
            this.masterVolumeGainNode.connect(this.audioContext.destination);
        }
        this.client = new AzureSpeechClient(config);
    }

    // set config(config: any) {
    // }

    SynthesizerStart(text: string, options?: TTSOptions): AsyncToken<TTSResponse> {
        let token = new AsyncToken<TTSResponse>();
        token.complete = new Promise<TTSResponse>((resolve: any, reject: any) => {
            process.nextTick(() => { token.emit('Synthesizing'); });

            let file = fs.createWriteStream('tts-out.wav');
            this.client.synthesizeStream(text, options).then((audioStream: NodeJS.ReadableStream) => {
                token.emit('SynthesisStreamStartedEvent');
                audioStream.pipe(file);

                let buffers: any[] = [];
                audioStream.on('data', (chunk: any) => {
                    buffers.push(chunk);
                });
                audioStream.on('end', () => {
                    token.emit('SynthesisStreamEndedEvent');
                    let audioStreamBuffer: Buffer | undefined = undefined;
                    if (buffers && buffers.length > 0) {
                        audioStreamBuffer = Buffer.concat(buffers);
                        let audioData = new Uint8Array(audioStreamBuffer).buffer;
                        if (options && options.autoPlay && this.audioContext) {
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
                    resolve({text: text, buffer: audioStreamBuffer});
                });
            })
            .catch((error) => {
                reject(error);
            });
        });
        return token;
    }
}
