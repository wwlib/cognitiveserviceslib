import AudioSource from './AudioSource';
import { getBytesFromAudio16Buffer, bufferToInt16Array, calculateVolumeWithInt16Array } from './AudioUtils';

const fs = require('fs');
const WaveFile = require('wavefile').WaveFile;

export interface WaveFileAudioSourceOptions {
  filename: string;
  sampleRate?: number;
  monitorAudio?: boolean;
  captureAudio?: boolean;
}

export default class WaveFileAudioSource extends AudioSource {

  private _sampleRate = 16000;
  private _monitorAudio: boolean = false;
  private _captureAudio: boolean = false;
  private _filename: string = '';
  private _audioData: Int16Array = new Int16Array(0);
  private _wav: any | undefined;
  private _interval: any;

  constructor(options: WaveFileAudioSourceOptions) {
    super();

    if (!options || !options.filename) {
      throw new Error('valid filename must be specified in the options');
    }
    this._sampleRate = options.sampleRate || this._sampleRate;
    this._monitorAudio = options.monitorAudio || this._monitorAudio;
    this._captureAudio = options.captureAudio || this._captureAudio
    this._filename = options.filename || '';
    const wavData: any = fs.readFileSync(this._filename);
    this._wav = new WaveFile(wavData);
    if (!(this._wav.fmt.sampleRate == 16000 && this._wav.fmt.bitsPerSample == 16)) {
      throw new Error(`Unsupported format.`);
    }
  }

  get wav(): any {
    return this._wav;
  }

  get samples(): any {
    let samples: any;
    if (this._wav && this._wav.data) {
      samples = this._wav.data.samples;
    }
    return samples;
  }

  start() {
    const packetDuration = 0.020;
    const packetMilliseconds = packetDuration * 1000;
    const samplesPerPacket = this._sampleRate * packetDuration;
    const bytesPerSample = 2;
    const bytesPerPacket = samplesPerPacket * bytesPerSample;
    const byteCount = this._wav.chunkSize; // 24675
    // const sampleCount = byteCount / bytesPerSample; // 49350
    const packetCount = byteCount / bytesPerPacket;
    let packetNum = 0;

    // console.log(`samplesPerPacket: ${samplesPerPacket}, bytesPerPacket: ${bytesPerPacket}, packetCount: ${packetCount}`);
    this._interval = setInterval(() => {
      const packetBytes = getBytesFromAudio16Buffer(this._wav.data.samples, packetNum * samplesPerPacket, samplesPerPacket);
      packetNum++;
      if (packetNum < packetCount) {
        const int16Array: Int16Array = bufferToInt16Array(packetBytes);
        const volume: number = calculateVolumeWithInt16Array(int16Array);
        this.sendAudio(packetBytes, volume); // Uint8Array - Buffer
      } else {
        if (this._interval) {
          clearInterval(this._interval);
          this._interval = undefined;
        }
        this.emit('done');
      }
    }, packetMilliseconds);

  }

  get audioData(): Int16Array | undefined {
    this._captureAudio = false;
    this._monitorAudio = false;
    return this._audioData;
  }

  dispose() {
    super.dispose();
    this._wav = undefined;
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }
}