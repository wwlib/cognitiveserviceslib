"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AudioSource_1 = require("./AudioSource");
const AudioUtils_1 = require("./AudioUtils");
const fs = require('fs');
const WaveFile = require('wavefile').WaveFile;
class WaveFileAudioSource extends AudioSource_1.default {
    constructor(options) {
        super();
        this._sampleRate = 16000;
        this._monitorAudio = false;
        this._captureAudio = false;
        this._filename = '';
        this._audioData = new Int16Array(0);
        if (!options || !options.filename) {
            throw new Error('valid filename must be specified in the options');
        }
        this._sampleRate = options.sampleRate || this._sampleRate;
        this._monitorAudio = options.monitorAudio || this._monitorAudio;
        this._captureAudio = options.captureAudio || this._captureAudio;
        this._filename = options.filename || '';
        const wavData = fs.readFileSync(this._filename);
        this._wav = new WaveFile(wavData);
        if (!(this._wav.fmt.sampleRate == 16000 && this._wav.fmt.bitsPerSample == 16)) {
            throw new Error(`Unsupported format.`);
        }
    }
    get wav() {
        return this._wav;
    }
    get samples() {
        let samples;
        if (this._wav && this._wav.data) {
            samples = this._wav.data.samples;
        }
        return samples;
    }
    start() {
        const packetDuration = 0.020;
        const packetMilliseconds = packetDuration * 1000;
        const samplesPerPacket = this._sampleRate * packetDuration;
        const bytesPerSample = 2;
        const bytesPerPacket = samplesPerPacket * bytesPerSample;
        const byteCount = this._wav.chunkSize; // 24675
        // const sampleCount = byteCount / bytesPerSample; // 49350
        const packetCount = byteCount / bytesPerPacket;
        let packetNum = 0;
        // console.log(`samplesPerPacket: ${samplesPerPacket}, bytesPerPacket: ${bytesPerPacket}, packetCount: ${packetCount}`);
        this._interval = setInterval(() => {
            const packetBytes = AudioUtils_1.getBytesFromAudio16Buffer(this._wav.data.samples, packetNum * samplesPerPacket, samplesPerPacket);
            packetNum++;
            if (packetNum < packetCount) {
                const int16Array = AudioUtils_1.bufferToInt16Array(packetBytes);
                const volume = AudioUtils_1.calculateVolumeWithInt16Array(int16Array);
                this.sendAudio(packetBytes, volume); // Uint8Array - Buffer
            }
            else {
                if (this._interval) {
                    clearInterval(this._interval);
                    this._interval = undefined;
                }
                this.emit('done');
            }
        }, packetMilliseconds);
    }
    get audioData() {
        this._captureAudio = false;
        this._monitorAudio = false;
        return this._audioData;
    }
    dispose() {
        super.dispose();
        this._wav = undefined;
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = undefined;
        }
    }
}
exports.default = WaveFileAudioSource;
//# sourceMappingURL=WaveFileAudioSource.js.map