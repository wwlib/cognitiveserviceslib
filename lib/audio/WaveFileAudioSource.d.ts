import AudioSource from './AudioSource';
export interface WaveFileAudioSourceOptions {
    filename: string;
    sampleRate?: number;
    monitorAudio?: boolean;
    captureAudio?: boolean;
}
export default class WaveFileAudioSource extends AudioSource {
    private _sampleRate;
    private _monitorAudio;
    private _captureAudio;
    private _filename;
    private _audioData;
    private _wav;
    private _interval;
    constructor(options: WaveFileAudioSourceOptions);
    start(): void;
    get audioData(): Int16Array | undefined;
    dispose(): void;
}
