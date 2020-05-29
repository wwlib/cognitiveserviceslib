import AudioSink from './AudioSink';
import { calculateVolumeWithFloat32Array } from './AudioUtils';


export interface AudioContextAudioSinkOptions {
  sampleRate: number;
  analyzerSamples?: number;
}

export default class AudioContextAudioSink extends AudioSink {

  private _audioContext: AudioContext;
  private _processor: ScriptProcessorNode | undefined;
  private _audioQueue: any[];
  private _sampleRate: number;
  private _source: AudioBufferSourceNode | undefined;
  private _int16Data: Int16Array | undefined;
  private _float32Data: Float32Array | undefined;

  constructor(options: AudioContextAudioSinkOptions) {
    super();
    this._audioContext = new AudioContext();
    this._audioQueue = [];
    this._sampleRate = options.sampleRate || 16000;
    this._analyzerSamples = options.analyzerSamples || 32;
    if (this._analyzerSamples < 32) {
      this._analyzerSamples = 32
    }
  }

  writeAudio(audio: Buffer) {
    // console.log(`AudioContextAudioSink: writeAudio:`, audio);
    super.writeAudio(audio);
    this._audioQueue.push(audio);
  }

  get int16Data(): Int16Array | undefined {
    return this._int16Data;
  }

  get float32Data(): Float32Array | undefined {
    return this._float32Data;
  }

  play() {
    // console.log(`AudioContextAudioSink: play:`, this._audioQueue.length);
    const b: Buffer = Buffer.concat(this._audioQueue);
    const WAV_HEADER_OFFSET: number = 44;
    this._int16Data = new Int16Array(b.buffer, WAV_HEADER_OFFSET, b.byteLength / Int16Array.BYTES_PER_ELEMENT - WAV_HEADER_OFFSET);
    this._float32Data = new Float32Array(this._int16Data.length);
    this._int16Data.forEach((int: number, i: number) => {
      const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
      if (this._float32Data) this._float32Data[i] = float;
    });

    this._analyzer = this._audioContext.createAnalyser();
    this._analyzer.fftSize = this._analyzerSamples;

    this._processor = this._audioContext.createScriptProcessor(1024, 1, 1);
    this._processor.onaudioprocess = (event) => {
      const inputData: Float32Array = event.inputBuffer.getChannelData(0);
      const outputData: Float32Array = event.outputBuffer.getChannelData(0);

      this.updateVolume(calculateVolumeWithFloat32Array(inputData));

      for (let sample = 0; sample < event.inputBuffer.length; sample++) {
        outputData[sample] = inputData[sample];
      }
    }

    this._source = this._audioContext.createBufferSource();
    let audioBuffer: AudioBuffer = this._audioContext.createBuffer(1, this._float32Data.length, this._sampleRate);
    audioBuffer.getChannelData(0).set(this._float32Data);
    this._source.buffer = audioBuffer;
    this._source.connect(this._processor);
    this._processor.connect(this._analyzer);
    this._analyzer.connect(this._audioContext.destination);

    this._source.onended = (event) => {
      this.emit('ended');
    }
    this._source.start();
  }

  dispose() {
    if (this._processor && this._analyzer) this._processor.disconnect(this._analyzer);
    if (this._analyzer) this._analyzer.disconnect(this._audioContext.destination);
    this._audioContext.close();
    this._audioQueue = [];
    this._source = undefined;
  }

}
