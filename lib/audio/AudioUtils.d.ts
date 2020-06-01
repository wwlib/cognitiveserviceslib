/// <reference types="node" />
declare const concatFloat32Arrays: (a: Float32Array, b: Float32Array) => Float32Array;
declare const concatInt16Arrays: (a: Int16Array, b: Int16Array) => Int16Array;
declare const getBytesFromAudio16Buffer: (buffer: Buffer, start: number, length: number) => Buffer;
declare const bufferToInt16Array: (b: Buffer) => Int16Array;
declare const calculateVolumeWithInt16Array: (audio: Int16Array) => number;
declare const calculateVolumeWithFloat32Array: (audio: Float32Array) => number;
declare const audioBufferToWave: (abuffer: AudioBuffer, len: number) => ArrayBuffer;
declare const writeAudioData16ToFile: (audioData: Int16Array, filename: string) => void;
export { concatFloat32Arrays, concatInt16Arrays, getBytesFromAudio16Buffer, bufferToInt16Array, calculateVolumeWithInt16Array, calculateVolumeWithFloat32Array, audioBufferToWave, writeAudioData16ToFile };
