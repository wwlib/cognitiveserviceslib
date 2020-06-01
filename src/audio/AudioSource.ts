import { EventEmitter } from 'events';

export default abstract class AudioSource extends EventEmitter {
  
  protected _analyzer: AnalyserNode | any;
  protected _analyzerSamples: number = 64;

  constructor() {
    super();
  }

  get analyzer(): AnalyserNode | any {
    if (!this._analyzer) {
      this._analyzer = {
        getByteFrequencyData: (data: any) => { data = new Array(this._analyzerSamples)}
      }
    }
    return this._analyzer;
  }

  get analyzerSamples(): number {
    return this._analyzerSamples;
  }

  sendAudio(audio: Buffer | Int16Array | Float32Array, volume?: number) {
    this.emit('audio', audio);
    if (volume) {
      this.emit('volume', volume);
    }
  }

  dispose() {
    this.removeAllListeners();
  }

}