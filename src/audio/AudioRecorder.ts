/*
 * This is and old, unused reference class
 */

import Resampler from './Resampler';

export default class AudioRecorder {

  static audioContext: AudioContext = new AudioContext();
  // static sink: AudioSink = new AudioSink();
  static audioData: Float32Array = new Float32Array(0);
  static captureAudioData: boolean = false;

  static captureMicAudio() {
    AudioRecorder.audioData = new Float32Array(0);

    function onmicaudio(samples: any) {

      if (AudioRecorder.captureAudioData) {
        AudioRecorder.audioData = AudioRecorder.concatFloat32Arrays(AudioRecorder.audioData, samples)
      }
      // AudioRecorder.sink.writeAudio(samples);
    }

    function callback(_fn: any) {
      // var fn = _fn;
      return function (stream: any) {
        // var audioContext = new AudioContext();
        var resampler = new Resampler(AudioRecorder.audioContext.sampleRate, 16000, 1, 1024);
        // Create an AudioNode from the stream.
        var mic = AudioRecorder.audioContext.createMediaStreamSource(stream);
        var processor = AudioRecorder.audioContext.createScriptProcessor(1024, 1, 1);
        // var refillBuffer = new Int16Array(190);

        processor.onaudioprocess = function (event) {
          // console.log(`onaudioprocess:`, event);
          // var inputBuffer = event.inputBuffer.getChannelData(0);
          // var outputBuffer = event.outputBuffer;
          // var samples = resampler.resampler(inputBuffer);

          // for (var i = 0; i < samples.length; ++i) {
          //   refillBuffer[i] = Math.ceil(samples[i] * 32767);
          // }

          // // fn(refillBuffer);

          var inputData = event.inputBuffer.getChannelData(0);
          var outputData = event.outputBuffer.getChannelData(0);
          if (AudioRecorder.captureAudioData) {
            var samples = resampler.resampler(inputData);
            // console.log(AudioRecorder.audioData);
            // console.log(samples);
            // console.log(samples.length);
            AudioRecorder.audioData = AudioRecorder.concatFloat32Arrays(AudioRecorder.audioData, samples)
            // console.log(AudioRecorder.audioData.length);
          }
      
          // Loop through the 1024 samples
          for (var sample = 0; sample < event.inputBuffer.length; sample++) {
            // make output equal to the same as the input
            outputData[sample] = inputData[sample];
      
            // add noise to each output sample
            // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;         
          }
        }
        // console.log(`captureMicAudio: callback: connect mic->processor->destination`);
        // mic.connect(AudioRecorder.audioContext.destination);
        mic.connect(processor);
        processor.connect(AudioRecorder.audioContext.destination);
      }
    }
    navigator.getUserMedia.call(navigator, { audio: true }, callback(onmicaudio), function () { });
  }

  static concatFloat32Arrays(a: Float32Array, b: Float32Array): Float32Array {
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

  static bufferToWave(abuffer: AudioBuffer, len: number) {
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
}