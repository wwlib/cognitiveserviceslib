"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAudioData16ToFile = exports.audioBufferToWave = exports.calculateVolumeWithFloat32Array = exports.calculateVolumeWithInt16Array = exports.bufferToInt16Array = exports.getBytesFromAudio16Buffer = exports.concatInt16Arrays = exports.concatFloat32Arrays = void 0;
const WaveFile = require('wavefile').WaveFile;
const fs = require('fs');
const concatFloat32Arrays = (a, b) => {
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
};
exports.concatFloat32Arrays = concatFloat32Arrays;
const concatInt16Arrays = (a, b) => {
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
};
exports.concatInt16Arrays = concatInt16Arrays;
const getBytesFromAudio16Buffer = (buffer, start, length) => {
    let startBytes = start * 2;
    let lengthBytes = length * 2;
    return buffer.slice(startBytes, startBytes + lengthBytes);
};
exports.getBytesFromAudio16Buffer = getBytesFromAudio16Buffer;
const bufferToInt16Array = (b) => {
    const result = new Int16Array(b.buffer, b.byteOffset, b.byteLength / Int16Array.BYTES_PER_ELEMENT);
    return result;
};
exports.bufferToInt16Array = bufferToInt16Array;
const calculateVolumeWithInt16Array = (audio) => {
    const bufLength = audio.length;
    let sum = 0;
    const convert = (n) => {
        const v = n < 0 ? n / 32768 : n / 32767; // convert in range [-32768, 32767]
        return Math.max(-1.0, Math.min(1.0, v)); // clamp
    };
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
};
exports.calculateVolumeWithInt16Array = calculateVolumeWithInt16Array;
const calculateVolumeWithFloat32Array = (audio) => {
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
};
exports.calculateVolumeWithFloat32Array = calculateVolumeWithFloat32Array;
const audioBufferToWave = (abuffer, len) => {
    var numOfChan = abuffer.numberOfChannels, length = len * numOfChan * 2 + 44, buffer = new ArrayBuffer(length), view = new DataView(buffer), channels = [], i, sample, offset = 0, pos = 0;
    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));
    while (pos < length) {
        for (i = 0; i < numOfChan; i++) { // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++; // next source sample
    }
    // create Blob
    // return new Blob([buffer], {type: "audio/wav"});
    return buffer;
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
};
exports.audioBufferToWave = audioBufferToWave;
const writeAudioData16ToFile = (audioData, filename) => {
    const filenameRaw = `${filename}.raw`;
    fs.writeFileSync(filenameRaw, Buffer.from(audioData.buffer));
    const wav = new WaveFile();
    wav.fromScratch(1, 16000, '16', audioData);
    const filenameWav = `${filename}.wav`;
    fs.writeFileSync(filenameWav, wav.toBuffer());
};
exports.writeAudioData16ToFile = writeAudioData16ToFile;
//# sourceMappingURL=AudioUtils.js.map