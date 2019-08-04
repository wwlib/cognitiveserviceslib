export interface VoiceRecognitionResponse {
    RecognitionStatus: string;
    Offset: number;
    Duration: number;
    NBest: VoiceRecognitionUtterance[]
}

export interface VoiceRecognitionUtterance {
    Confidence: number;
    Lexical: string;
    ITN: string;
    MaskedITN: string;
    Display: string;
}

/**
 * @deprecated Use streaming mode instead. Will be removed in 2.x
 */
export interface VoiceSynthesisResponse {
    wave: Buffer;
}
