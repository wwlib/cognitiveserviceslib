import { EventEmitter } from 'events';

export default abstract class AudioSink extends EventEmitter {

  protected _analyzer: AnalyserNode | undefined;
  protected _analyzerSamples: number = 64;

  constructor() {
    super();
  }

  get analyzer(): AnalyserNode | undefined {
    return this._analyzer;
  }

  get analyzerSamples(): number {
    return this._analyzerSamples;
  }

  writeAudio(audio: Buffer | Int16Array | Float32Array) {
    this.emit('audio', audio);
  }

  updateVolume(volume: number) {
    this.emit('volume', volume);
  }

  abstract dispose(): void;

}