import AsyncToken from './AsyncToken';
export declare type ASRResponse = {
    utterance: string;
    response: any;
};
export default abstract class ASRController {
    abstract RecognizerStart(options?: any): AsyncToken<ASRResponse>;
}
