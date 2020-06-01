const { promises, createReadStream, createWriteStream } = require('fs');
const { WaveHeader } = require('../lib');

const HEADER_OFFSET = 44;

promises
    // Read only the head chunk from the audio file (better performance and reliability)
    .readFile('tts-out.wav', { start: 0, end: HEADER_OFFSET })
    .then(bufferChunk => {
        const header = WaveHeader.readHeader(bufferChunk);
        console.log(header);
        /**
         { 
            riffHead: 'RIFF',
            fileSize: 17089,
            waveHead: 'WAVE',
            fmtHead: 'fmt ',
            formatLength: 16,
            audioFormat: 7,
            channels: 1,
            sampleRate: 8000,
            byteRate: 8000,
            blockAlign: 1,
            bitDepth: 8,
            data: 'data',
            dataLength: 17041
        }
        */
    });

