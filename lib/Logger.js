"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Logger = void 0;
class Logger {
    constructor(section = "cognitiveserviceslib") {
        this.debug = (action, ...details) => this.write("debug", action, ...details);
        this.info = (action, ...details) => this.write("info", action, ...details);
        this.error = (action, ...details) => this.write("error", action, ...details);
        this.warn = (action, ...details) => this.write("warn", action, ...details);
        this._section = section;
    }
    write(level, action, ...details) {
        console.log(`${level}: [${this._section}] ${action}`, details);
    }
    child(section) {
        return new Logger(this._section + "." + section);
    }
    createChild(section) {
        return this.child(section);
    }
}
exports.Logger = Logger;
exports.log = new Logger();
//# sourceMappingURL=Logger.js.map