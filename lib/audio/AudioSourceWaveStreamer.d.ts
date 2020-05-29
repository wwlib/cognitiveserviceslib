/// <reference types="node" />
import AudioSource from './AudioSource';
export default class AudioSourceWaveStreamer {
    private _audioSource;
    private _onAudioHandler;
    private _onDoneHandler;
    private _readStream;
    private _wavHeader;
    constructor(audioSource: AudioSource);
    get readStream(): any;
    onAudio(audio: Buffer | Uint8Array | Float32Array): void;
    onDone(): void;
    dispose(): void;
}
