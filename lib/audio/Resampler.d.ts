export default class Resampler {
    resampler: any;
    private fromSampleRate;
    private toSampleRate;
    private channels;
    private outputBufferSize;
    private noReturn;
    private interpolate;
    private outputBuffer;
    ratioWeight: number;
    tailExists: boolean;
    lastWeight: number;
    lastOutput: Float32Array;
    constructor(fromSampleRate: number, toSampleRate: number, channels: number, outputBufferSize: number, noReturn?: boolean);
    initialize: () => void;
    compileInterpolationFunction: () => void;
    bypassResampler: (buffer: any) => any;
    bufferSlice: (sliceAmount: number) => any;
    initializeBuffers: () => void;
}
