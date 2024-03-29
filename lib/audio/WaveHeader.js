"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WaveHeader {
}
exports.default = WaveHeader;
/**
 * Generates the Wave Header
 * Writes a pcm wave header to a buffer and returns it as a buffer
 *
 * Based on: https://github.com/Wpdas/wave-header
 * Reference: http://www.topherlee.com/software/pcm-tut-wavformat.html
 *
 * @param {number} length file size
 * @param {Object} options default -> {channels: 1, sampleRate: 44100, bitDepth: 16}
 */
WaveHeader.generateHeader = (length, options) => {
    options = options || {};
    const RIFF = Buffer.alloc(4, 'RIFF');
    const WAVE = Buffer.alloc(4, 'WAVE');
    const fmt = Buffer.alloc(4, 'fmt ');
    const data = Buffer.alloc(4, 'data');
    const MAX_WAV = 4294967295 - 100;
    const format = options.audioFormat || 1; // 1 = raw PCM
    const channels = options.channels || 1;
    const sampleRate = options.sampleRate || 44100;
    const bitDepth = options.bitDepth || 16;
    const headerLength = 44;
    const dataLength = length || MAX_WAV;
    const fileSize = dataLength + headerLength;
    const header = Buffer.alloc(headerLength);
    let offset = 0;
    RIFF.copy(header, offset);
    offset += RIFF.length;
    header.writeUInt32LE(fileSize - 8, offset);
    offset += 4;
    WAVE.copy(header, offset);
    offset += WAVE.length;
    fmt.copy(header, offset);
    offset += fmt.length;
    // Write the size of the "fmt " chunk.
    // Value of 16 is hard-coded for raw PCM format. other formats have different size.
    header.writeUInt32LE(16, offset);
    offset += 4;
    header.writeUInt16LE(format, offset);
    offset += 2;
    header.writeUInt16LE(channels, offset);
    offset += 2;
    header.writeUInt32LE(sampleRate, offset);
    offset += 4;
    const byteRate = (sampleRate * channels * bitDepth) / 8;
    header.writeUInt32LE(byteRate, offset);
    offset += 4;
    const blockAlign = (channels * bitDepth) / 8;
    header.writeUInt16LE(blockAlign, offset);
    offset += 2;
    header.writeUInt16LE(bitDepth, offset);
    offset += 2;
    data.copy(header, offset);
    offset += data.length;
    header.writeUInt32LE(dataLength, offset);
    offset += 4;
    return header;
};
/**
 * Reads a pcm wave header from a buffer and returns the information
 * @param {Buffer} buffer wave buffer chunk
 */
WaveHeader.readHeader = (buffer) => {
    let offset = 0;
    const riffHead = buffer.slice(offset, offset + 4).toString();
    offset += 4;
    const fileSize = buffer.readUInt32LE(offset);
    offset += 4;
    const waveHead = buffer.slice(offset, offset + 4).toString();
    offset += 4;
    const fmtHead = buffer.slice(offset, offset + 4).toString();
    offset += 4;
    const formatLength = buffer.readUInt32LE(offset);
    offset += 4;
    const audioFormat = buffer.readUInt16LE(offset);
    offset += 2;
    const channels = buffer.readUInt16LE(offset);
    offset += 2;
    const sampleRate = buffer.readUInt32LE(offset);
    offset += 4;
    const byteRate = buffer.readUInt32LE(offset);
    offset += 4;
    const blockAlign = buffer.readUInt16LE(offset);
    offset += 2;
    const bitDepth = buffer.readUInt16LE(offset);
    offset += 2;
    const data = buffer.slice(offset, offset + 4).toString();
    offset += 4;
    const dataLength = buffer.readUInt32LE(offset);
    offset += 4;
    return {
        riffHead,
        fileSize,
        waveHead,
        fmtHead,
        formatLength,
        audioFormat,
        channels,
        sampleRate,
        byteRate,
        blockAlign,
        bitDepth,
        data,
        dataLength
    };
};
/**
 * Clean up the old header. If a new header is added to the buffer, there're two headers wrote.
 * This method will clean up the second one that is in a position that should be used only for wave samples.
 * @param {Buffer} buffer
 * @returns {Buffer}  Returns buffer containing only the wave samples
 */
WaveHeader.cleanUpOldHeader = (buffer) => {
    const FINAL_HEADER_OFFSET = 44;
    const cleanedBuffer = Buffer.alloc(buffer.length - FINAL_HEADER_OFFSET, buffer);
    cleanedBuffer.copy(buffer.slice(FINAL_HEADER_OFFSET, buffer.length));
    return cleanedBuffer;
};
/**
 * Rewrites the header information in a chunk of buffer. Must be used the first chunk of buffer from a
 * .wav file.
 * @param {Buffer} waveHeaderBuffer buffer containing the wave header generated by generateHeader(...) method
 * @param {Buffer} buffer chunk of buffer received by "on data" event
 * @returns {Buffer}  Returns buffer containing the new header and wave samples from the original buffer
 */
WaveHeader.rewriteHeaderInBufferChunk = (waveHeaderBuffer, buffer) => {
    if (buffer.length >= waveHeaderBuffer.length) {
        return Buffer.concat([waveHeaderBuffer, WaveHeader.cleanUpOldHeader(buffer)]);
    }
    else {
        throw new Error('Audio header buffer chunk is empty.');
    }
};
//# sourceMappingURL=WaveHeader.js.map