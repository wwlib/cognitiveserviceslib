/// <reference types="node" />
import { AzureSpeechClient } from './AzureSpeechClient';
import ASRController, { ASRResponse, ASROptions } from '../ASRController';
import AsyncToken from '../AsyncToken';
export default class AzureSpeechApiController extends ASRController {
    client: AzureSpeechClient;
    constructor(config: any);
    RecognizeWaveBuffer(wave: Buffer, options?: ASROptions): AsyncToken<ASRResponse>;
    RecognizerStart(options: ASROptions): AsyncToken<ASRResponse>;
}
