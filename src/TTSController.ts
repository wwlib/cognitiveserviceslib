import AsyncToken from './AsyncToken';

export type TTSResponse = {
    text: string,
    buffer: Buffer | undefined;
}

export type TTSOptions = {
    autoPlay?: boolean;
    format?: string;
    locale?: string;
    gender?: string;
}


export default abstract class TTSController {

    abstract SynthesizerStart(text: string, options?: TTSOptions): AsyncToken<TTSResponse>;

}
