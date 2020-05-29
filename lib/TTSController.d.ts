/// <reference types="node" />
import AsyncToken from './AsyncToken';
export declare type TTSResponse = {
    text: string;
    buffer: Buffer | undefined;
};
export declare type TTSOptions = {
    autoPlay?: boolean;
};
export default abstract class TTSController {
    abstract SynthesizerStart(text: string, options?: TTSOptions): AsyncToken<TTSResponse>;
}
