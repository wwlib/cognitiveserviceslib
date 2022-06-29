const WavFileWriter = require('wav').FileWriter;
const { ASRStreamingSessionWrapper , ASRFactory, WaveFileAudioSource, AudioUtils } = require('../lib')
const { Logger } = require('../lib/Logger')

const logger = new Logger()
logger.debug('Hello, cognitiveserviceslib', 3, 2, 1)

const config = require('./config.json');
const asrConfig = {
    lang: 'en-US',
    hints: undefined,
    earlyEOS: undefined,
    maxSpeechTimeout: 60 * 1000,
    eosTimeout: 2000,
    providerConfig: config.Microsoft,
}

const asrStreamingSessionWrapper = new ASRStreamingSessionWrapper(asrConfig, logger)
asrStreamingSessionWrapper.on('SOS', () => logger.debug('wrapper', 'SOS'))
asrStreamingSessionWrapper.on('EOS', () => logger.debug('wrapper', 'EOS'))
asrStreamingSessionWrapper.on('EOS_TIMEOUT', (result) => logger.debug('wrapper', 'EOS_TIMEOUT', result))
asrStreamingSessionWrapper.on('RESULT', (result) => logger.debug('wrapper', 'RESULT', result))
asrStreamingSessionWrapper.on('SESSION_ENDED', (result) => logger.debug('wrapper', 'SESSION_ENDED', result))
asrStreamingSessionWrapper.on('ERROR', (error) => logger.debug('wrapper', 'ERROR', error))
asrStreamingSessionWrapper.start()

// const asrSession = ASRFactory.startSession(asrConfig, logger)
// asrSession.onStartOfSpeech(() => {
//     logger.debug('SOS')
// })
// asrSession.onEndOfSpeech(() => {
//     clearEOSTimeout()
//     logger.debug('EOS')
// })
// asrSession.onResult((lastResult) => {
//     logger.debug('onResult', lastResult)
//     startEOSTimeout(3000)
// })

// let eosTimeoutHandle
// const startEOSTimeout = (timeMs) => {
//     clearEOSTimeout()
//     return new Promise((resolve) => {
//         eosTimeoutHandle = setTimeout(() => {
//             logger.debug("EoS timeout reached")
//             // const lastResult = asrSession.getLastIncremental()
//             // logger.debug('on EoS timeout: lastResult', lastResult)
//             asrSession.stop()
//             resolve()
//         }, timeMs)
//     });
// }

// const clearEOSTimeout = () => {
//     if (eosTimeoutHandle) {
//         clearTimeout(eosTimeoutHandle)
//         eosTimeoutHandle = undefined
//     }
// }

// asrSession.start()
//     .then((data) => {
//         logger.debug('session ended', data)
//     })
//     .catch((error) => {
//         logger.error('session error', error)
//     })

const options = {
    filename: 'do-you-like-mac-n-cheese.wav', // 'please-tell-me-the-time.wav',
}

const waveFileAudioSource = new WaveFileAudioSource(options)

const outputFileStream = new WavFileWriter(`test-azure-asr-streaming-out.wav`, {
    sampleRate: 16000,
    bitDepth: 16,
    channels: 1
});

waveFileAudioSource.on('audio', data => {
    // console.log(`on audio`, data)
    // asrSession.provideAudio(data)
    asrStreamingSessionWrapper.provideAudio(data)
    outputFileStream.write(data)
})

waveFileAudioSource.on('volume', data => {
    // console.log(`on volume`, data)
})

waveFileAudioSource.on('done', () => {
    // logger.debug(`on done`)
    outputFileStream.end()
})

waveFileAudioSource.start()
