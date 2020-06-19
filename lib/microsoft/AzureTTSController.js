"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AzureSpeechClient_1 = require("./AzureSpeechClient");
const TTSController_1 = require("../TTSController");
const AsyncToken_1 = require("../AsyncToken");
const fs = require('fs');
class AzureTTSController extends TTSController_1.default {
    constructor(config, audioContext) {
        super();
        this.audioContext = audioContext;
        if (this.audioContext) {
            this.masterVolumeGainNode = this.audioContext.createGain();
            this.masterVolumeGainNode.gain.value = 1.0;
            this.masterVolumeGainNode.connect(this.audioContext.destination);
        }
        this.client = new AzureSpeechClient_1.AzureSpeechClient(config);
    }
    // set config(config: any) {
    // }
    SynthesizerStart(text, options) {
        let token = new AsyncToken_1.default();
        token.complete = new Promise((resolve, reject) => {
            process.nextTick(() => { token.emit('Synthesizing'); });
            let file = fs.createWriteStream('tts-out.wav');
            this.client.synthesizeStream(text, options).then((audioStream) => {
                token.emit('SynthesisStreamStartedEvent');
                audioStream.pipe(file);
                let buffers = [];
                audioStream.on('data', (chunk) => {
                    buffers.push(chunk);
                });
                audioStream.on('end', () => {
                    token.emit('SynthesisStreamEndedEvent');
                    let audioStreamBuffer = undefined;
                    if (buffers && buffers.length > 0) {
                        audioStreamBuffer = Buffer.concat(buffers);
                        let audioData = new Uint8Array(audioStreamBuffer).buffer;
                        if (options && options.autoPlay && this.audioContext) {
                            this.audioContext.decodeAudioData(audioData, (buffer) => {
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
                    resolve({ text: text, buffer: audioStreamBuffer });
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
        return token;
    }
}
exports.default = AzureTTSController;
//# sourceMappingURL=AzureTTSController.js.map