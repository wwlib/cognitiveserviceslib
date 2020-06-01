"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class AudioSource extends events_1.EventEmitter {
    constructor() {
        super();
        this._analyzerSamples = 64;
    }
    get analyzer() {
        if (!this._analyzer) {
            this._analyzer = {
                getByteFrequencyData: (data) => { data = new Array(this._analyzerSamples); }
            };
        }
        return this._analyzer;
    }
    get analyzerSamples() {
        return this._analyzerSamples;
    }
    sendAudio(audio, volume) {
        this.emit('audio', audio);
        if (volume) {
            this.emit('volume', volume);
        }
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.default = AudioSource;
//# sourceMappingURL=AudioSource.js.map