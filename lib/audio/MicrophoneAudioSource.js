"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AudioSource_1 = require("./AudioSource");
const AudioUtils = require("./AudioUtils");
const Resampler_1 = require("./Resampler");
const WaveFile = require('wavefile').WaveFile;
class MicrophoneAudioSource extends AudioSource_1.default {
    constructor(options) {
        super();
        this._audioContext = new AudioContext();
        this._targetSampleRate = this._audioContext.sampleRate;
        this._monitorAudio = false;
        this._captureAudio = false;
        this._audioData = new Int16Array(0);
        if (options) {
            this._targetSampleRate = options.targetSampleRate || this._targetSampleRate;
            this._monitorAudio = options.monitorAudio || this._monitorAudio;
            this._captureAudio = options.captureAudio || this._captureAudio;
            this._analyzerSamples = options.analyzerSamples || 32;
            if (this._analyzerSamples < 32) {
                this._analyzerSamples = 32;
            }
        }
        const callback = (stream) => {
            const resampler = new Resampler_1.default(this._audioContext.sampleRate, this._targetSampleRate, 1, 2048);
            this._mic = this._audioContext.createMediaStreamSource(stream);
            this._analyzer = this._audioContext.createAnalyser();
            this._analyzer.fftSize = this._analyzerSamples;
            this._processor = this._audioContext.createScriptProcessor(2048, 1, 1);
            this._processor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);
                const outputData = event.outputBuffer.getChannelData(0);
                const samples = resampler.resampler(inputData);
                const sampleCount = samples.length;
                const wav = new WaveFile();
                wav.fromScratch(1, 16000, '32f', samples);
                wav.toBitDepth('16');
                const int16Samples = new Int16Array(sampleCount);
                const convert = (n) => {
                    let v = n < 0 ? n * 32768 : n * 32767; // convert in range [-32768, 32767]
                    return Math.max(-32768, Math.min(32768, v)); // clamp
                };
                let i = 0;
                while (i < sampleCount)
                    int16Samples[i] = convert(samples[i++]);
                this.sendAudio(wav.data.samples, AudioUtils.calculateVolumeWithFloat32Array(inputData));
                if (this._captureAudio) {
                    this._audioData = AudioUtils.concatInt16Arrays(this._audioData, int16Samples); //new Int16Array(wav.data.samples));
                }
                if (this._monitorAudio) {
                    for (let sample = 0; sample < event.inputBuffer.length; sample++) {
                        outputData[sample] = inputData[sample];
                    }
                }
            };
            this._mic.connect(this._analyzer);
            this._analyzer.connect(this._processor);
            this._processor.connect(this._audioContext.destination);
        };
        navigator.getUserMedia.call(navigator, { audio: true }, callback, (error) => { console.log(error); });
    }
    get audioData() {
        this._captureAudio = false;
        this._monitorAudio = false;
        return this._audioData;
    }
    dispose() {
        super.dispose();
        if (this._mic)
            this._mic.disconnect();
        if (this._analyzer && this._processor)
            this._analyzer.disconnect(this._processor);
        if (this._processor)
            this._processor.disconnect(this._audioContext.destination);
        this._audioContext.close();
    }
}
exports.default = MicrophoneAudioSource;
//# sourceMappingURL=MicrophoneAudioSource.js.map