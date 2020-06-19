import AsyncToken from './AsyncToken';

export type ASRResponse = {
    utterance: string;
    response: any;
}

export type ASROptions = {
    recordDuration?: number;
    locale?: string;
}

export default abstract class ASRController {

    abstract RecognizerStart(options?: any): AsyncToken<ASRResponse>;

}
