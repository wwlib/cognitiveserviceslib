import { AzureSpeechClient } from './AzureSpeechClient';
import TTSController, { TTSOptions, TTSResponse } from '../TTSController';
import AsyncToken from '../AsyncToken';
export default class AzureTTSController extends TTSController {
    audioContext: AudioContext;
    masterVolumeGainNode: GainNode | undefined;
    client: AzureSpeechClient;
    constructor(config: any, audioContext: AudioContext);
    SynthesizerStart(text: string, options?: TTSOptions): AsyncToken<TTSResponse>;
}
