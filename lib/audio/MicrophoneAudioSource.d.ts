import AudioSource from './AudioSource';
export interface MicrophoneAudioSourceOptions {
    targetSampleRate?: number;
    monitorAudio?: boolean;
    captureAudio?: boolean;
    analyzerSamples?: number;
}
export default class MicrophoneAudioSource extends AudioSource {
    private _audioContext;
    private _targetSampleRate;
    private _monitorAudio;
    private _captureAudio;
    private _audioData;
    private _mic;
    private _processor;
    constructor(options?: MicrophoneAudioSourceOptions);
    get audioData(): Int16Array | undefined;
    dispose(): void;
}
