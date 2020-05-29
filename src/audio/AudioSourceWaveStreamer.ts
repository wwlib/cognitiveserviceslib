import WaveHeader from './WaveHeader';
import AudioSource from './AudioSource';

const { Readable } = require('stream');

export default class AudioSourceWaveStreamer {

    private _audioSource: AudioSource;
    private _onAudioHandler: any = this.onAudio.bind(this);
    private _onDoneHandler: any = this.onDone.bind(this);
    private _readStream: any;
    private _wavHeader: any;

    constructor(audioSource: AudioSource) {
        this._audioSource = audioSource;
        this._audioSource.on('audio', this._onAudioHandler);
        this._audioSource.on('done', this._onDoneHandler);

        this._readStream = new Readable(
            {
                read() {}
            }
        );

        this._wavHeader = WaveHeader.generateHeader(0, {
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

    onAudio(audio: Buffer | Uint8Array | Float32Array) {
        // console.log(`AudioSourceWaveStreamer: onAudio: audio`, audio);
        let buffer: any
        if (Buffer.isBuffer(audio)) {
            buffer = audio;
        } else {
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
            this._readStream.push(null);
        this._readStream = undefined;
        }
    }

}

