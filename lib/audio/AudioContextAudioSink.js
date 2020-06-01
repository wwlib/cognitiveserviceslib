"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AudioSink_1 = require("./AudioSink");
const AudioUtils_1 = require("./AudioUtils");
class AudioContextAudioSink extends AudioSink_1.default {
    constructor(options) {
        super();
        this._audioContext = new AudioContext();
        this._audioQueue = [];
        this._sampleRate = options.sampleRate || 16000;
        this._analyzerSamples = options.analyzerSamples || 32;
        if (this._analyzerSamples < 32) {
            this._analyzerSamples = 32;
        }
    }
    writeAudio(audio) {
        // console.log(`AudioContextAudioSink: writeAudio:`, audio);
        super.writeAudio(audio);
        this._audioQueue.push(audio);
    }
    get int16Data() {
        return this._int16Data;
    }
    get float32Data() {
        return this._float32Data;
    }
    play() {
        // console.log(`AudioContextAudioSink: play:`, this._audioQueue.length);
        const b = Buffer.concat(this._audioQueue);
        const WAV_HEADER_OFFSET = 44;
        this._int16Data = new Int16Array(b.buffer, WAV_HEADER_OFFSET, b.byteLength / Int16Array.BYTES_PER_ELEMENT - WAV_HEADER_OFFSET);
        this._float32Data = new Float32Array(this._int16Data.length);
        this._int16Data.forEach((int, i) => {
            const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
            if (this._float32Data)
                this._float32Data[i] = float;
        });
        this._analyzer = this._audioContext.createAnalyser();
        this._analyzer.fftSize = this._analyzerSamples;
        this._processor = this._audioContext.createScriptProcessor(1024, 1, 1);
        this._processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);
            const outputData = event.outputBuffer.getChannelData(0);
            this.updateVolume(AudioUtils_1.calculateVolumeWithFloat32Array(inputData));
            for (let sample = 0; sample < event.inputBuffer.length; sample++) {
                outputData[sample] = inputData[sample];
            }
        };
        this._source = this._audioContext.createBufferSource();
        let audioBuffer = this._audioContext.createBuffer(1, this._float32Data.length, this._sampleRate);
        audioBuffer.getChannelData(0).set(this._float32Data);
        this._source.buffer = audioBuffer;
        this._source.connect(this._processor);
        this._processor.connect(this._analyzer);
        this._analyzer.connect(this._audioContext.destination);
        this._source.onended = (event) => {
            this.emit('ended');
        };
        this._source.start();
    }
    dispose() {
        if (this._processor && this._analyzer)
            this._processor.disconnect(this._analyzer);
        if (this._analyzer)
            this._analyzer.disconnect(this._audioContext.destination);
        this._audioContext.close();
        this._audioQueue = [];
        this._source = undefined;
    }
}
exports.default = AudioContextAudioSink;
//# sourceMappingURL=AudioContextAudioSink.js.map