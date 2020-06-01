const WaveFile = require('wavefile').WaveFile;

const fs = require('fs');

const concatFloat32Arrays = (a: Float32Array, b: Float32Array): Float32Array => {
  const bytesPerIndex = 4;
  if (!a) {
    a = new Float32Array(0);
  }
  if (!b) {
    b = new Float32Array(0);
  }
  const concatenatedByteLength = a.byteLength + b.byteLength;
  const concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);
  concatenatedArray.set(a, 0);
  concatenatedArray.set(b, a.byteLength / bytesPerIndex);

  return concatenatedArray;
}

const concatInt16Arrays = (a: Int16Array, b: Int16Array): Int16Array => {
  const bytesPerIndex = 2;
  if (!a) {
    a = new Int16Array(0);
  }
  if (!b) {
    b = new Int16Array(0);
  }
  const concatenatedByteLength = a.byteLength + b.byteLength;
  const concatenatedArray = new Int16Array(concatenatedByteLength / bytesPerIndex);
  concatenatedArray.set(a, 0);
  concatenatedArray.set(b, a.byteLength / bytesPerIndex);

  return concatenatedArray;
}

const getBytesFromAudio16Buffer = (buffer: Buffer, start: number, length: number) => {
  let startBytes = start * 2;
  let lengthBytes = length * 2;
  return buffer.slice(startBytes, startBytes + lengthBytes);
}

const bufferToInt16Array = (b: Buffer): Int16Array => {
  const result: Int16Array = new Int16Array(b.buffer, b.byteOffset, b.byteLength / Int16Array.BYTES_PER_ELEMENT);
  return result;
}

const calculateVolumeWithInt16Array = (audio: Int16Array) => {
  const bufLength = audio.length;
  let sum = 0;
  const convert = (n: number) => {
    const v = n < 0 ? n / 32768 : n / 32767;       // convert in range [-32768, 32767]
    return Math.max(-1.0, Math.min(1.0, v)); // clamp
  }
  for (let i = 0; i < bufLength; i++) {
    const float = convert(audio[i]);
    sum += float * float;
  }
  const rms = Math.sqrt(sum / bufLength);
  let volume = rms;
  if (volume > 1.0) {
    volume = 1.0;
  }
  return volume * 100;
}

const calculateVolumeWithFloat32Array = (audio: Float32Array) => {
  let bufLength = audio.length;
  let sum = 0;
  for (let i = 0; i < bufLength; i++) {
    sum += audio[i] * audio[i];
  }
  let rms = Math.sqrt(sum / bufLength);
  let volume = rms;
  if (volume > 1.0) {
    volume = 1.0;
  }
  return volume * 100;
}

const audioBufferToWave = (abuffer: AudioBuffer, len: number) => {
  var numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [], i, sample,
    offset = 0,
    pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++                                     // next source sample
  }

  // create Blob
  // return new Blob([buffer], {type: "audio/wav"});
  return buffer;

  function setUint16(data: any) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: any) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

const writeAudioData16ToFile = (audioData: Int16Array, filename: string) => {
  const filenameRaw = `${filename}.raw`;
  fs.writeFileSync(filenameRaw, Buffer.from(audioData.buffer));
  const wav: any = new WaveFile();
  wav.fromScratch(1, 16000, '16', audioData);
  const filenameWav = `${filename}.wav`;
  fs.writeFileSync(filenameWav, wav.toBuffer());
}

export {
  concatFloat32Arrays,
  concatInt16Arrays,
  getBytesFromAudio16Buffer,
  bufferToInt16Array,
  calculateVolumeWithInt16Array,
  calculateVolumeWithFloat32Array,
  audioBufferToWave,
  writeAudioData16ToFile
}