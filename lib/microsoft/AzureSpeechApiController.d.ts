/// <reference types="node" />
import { AzureSpeechClient } from './AzureSpeechClient';
import ASRController, { ASRResponse } from '../ASRController';
import AsyncToken from '../AsyncToken';
export default class AzureSpeechApiController extends ASRController {
    client: AzureSpeechClient;
    constructor(config: any);
    RecognizeWaveBuffer(wave: Buffer): AsyncToken<ASRResponse>;
    RecognizerStart(options: any): AsyncToken<ASRResponse>;
}
