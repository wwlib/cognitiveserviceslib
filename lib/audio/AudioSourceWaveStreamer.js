"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WaveHeader_1 = require("./WaveHeader");
const { Readable } = require('stream');
class AudioSourceWaveStreamer {
    constructor(audioSource) {
        this._onAudioHandler = this.onAudio.bind(this);
        this._onDoneHandler = this.onDone.bind(this);
        this._audioSource = audioSource;
        this._audioSource.on('audio', this._onAudioHandler);
        this._audioSource.on('done', this._onDoneHandler);
        this._readStream = new Readable({
            read() { }
        });
        this._wavHeader = WaveHeader_1.default.generateHeader(0, {
            riffHead: 'RIFF',
            waveHead: 'WAVE',
            fmtHead: 'fmt ',
            formatLength: 16,
            audioFormat: 1,
            channels: 1,
            sampleRate: 16000,
            byteRate: 32000,
            blockAlign: 2,
            bitDepth: 16,
            data: 'data',
        });
        // console.log(`AudioSourceWaveStreamer: this._wavHeader`, this._wavHeader);
        this._readStream.push(this._wavHeader);
    }
    get readStream() {
        return this._readStream;
    }
    onAudio(audio) {
        // console.log(`AudioSourceWaveStreamer: onAudio: audio`, audio);
        let buffer;
        if (Buffer.isBuffer(audio)) {
            buffer = audio;
        }
        else {
            buffer = Buffer.from(audio.buffer);
        }
        // console.log(`AudioSourceWaveStreamer: onAudio: buffer`, buffer);
        this._readStream.push(buffer);
    }
    onDone() {
        // console.log(`AudioSourceWaveStreamer: onDone`);
        this.dispose();
    }
    dispose() {
        this._audioSource.removeListener('audio', this._onAudioHandler);
        if (this._readStream) {
            // console.log('AudioSourceWaveStreamer: dispose: destroying _readStream.')
            this._readStream.push(null);
            this._readStream.destroy();
            this._readStream = undefined;
        }
    }
}
exports.default = AudioSourceWaveStreamer;
//# sourceMappingURL=AudioSourceWaveStreamer.js.map