/// <reference types="node" />
import AudioSink from './AudioSink';
export interface AudioContextAudioSinkOptions {
    sampleRate: number;
    analyzerSamples?: number;
}
export default class AudioContextAudioSink extends AudioSink {
    private _audioContext;
    private _processor;
    private _audioQueue;
    private _sampleRate;
    private _source;
    private _int16Data;
    private _float32Data;
    constructor(options: AudioContextAudioSinkOptions);
    writeAudio(audio: Buffer): void;
    get int16Data(): Int16Array | undefined;
    get float32Data(): Float32Array | undefined;
    play(): void;
    dispose(): void;
}
