/// <reference types="node" />
import { EventEmitter } from 'events';
export default abstract class AudioSink extends EventEmitter {
    protected _analyzer: AnalyserNode | undefined;
    protected _analyzerSamples: number;
    constructor();
    get analyzer(): AnalyserNode | undefined;
    get analyzerSamples(): number;
    writeAudio(audio: Buffer | Int16Array | Float32Array): void;
    updateVolume(volume: number): void;
    abstract dispose(): void;
}
