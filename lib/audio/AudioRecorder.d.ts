export default class AudioRecorder {
    static audioContext: AudioContext;
    static audioData: Float32Array;
    static captureAudioData: boolean;
    static captureMicAudio(): void;
    static concatFloat32Arrays(a: Float32Array, b: Float32Array): Float32Array;
    static bufferToWave(abuffer: AudioBuffer, len: number): ArrayBuffer;
}
