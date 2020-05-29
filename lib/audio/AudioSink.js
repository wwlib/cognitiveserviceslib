"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class AudioSink extends events_1.EventEmitter {
    constructor() {
        super();
        this._analyzerSamples = 64;
    }
    get analyzer() {
        return this._analyzer;
    }
    get analyzerSamples() {
        return this._analyzerSamples;
    }
    writeAudio(audio) {
        this.emit('audio', audio);
    }
    updateVolume(volume) {
        this.emit('volume', volume);
    }
}
exports.default = AudioSink;
//# sourceMappingURL=AudioSink.js.map