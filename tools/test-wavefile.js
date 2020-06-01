const WaveFile = require('wavefile').WaveFile;
const { AudioUtils } = require('../lib');

let wav = new WaveFile();
wav.fromScratch(1, 16000, '16', [0, 0, 0, 0]);
 
// Check some of the file properties
console.log(wav.container);
console.log(wav.chunkSize);
console.log(wav.fmt.chunkId);

AudioUtils.writeAudioData16ToFile(wav.toBuffer(), 'wavefile-audiofile');