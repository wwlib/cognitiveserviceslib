/// <reference types="node" />
import { EventEmitter } from 'events';
export default abstract class AudioSource extends EventEmitter {
    protected _analyzer: AnalyserNode | any;
    protected _analyzerSamples: number;
    constructor();
    get analyzer(): AnalyserNode | any;
    get analyzerSamples(): number;
    sendAudio(audio: Buffer | Int16Array | Float32Array, volume?: number): void;
    dispose(): void;
}
