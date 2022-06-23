"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Logger = void 0;
class Logger {
    constructor(context = {}, section = "cognitiveserviceslib") {
        this.context = context;
        this.section = section;
        this.debug = (action, ...details) => this.write("debug", action, ...details);
        this.info = (action, ...details) => this.write("info", action, ...details);
        this.error = (action, ...details) => this.write("error", action, ...details);
        this.warn = (action, ...details) => this.write("warn", action, ...details);
    }
    write(level, action, ...details) {
        console.log(`${level}: [${this.section}] ${action}`, details);
    }
    child(section, childContext = {}) {
        return new Logger(Object.assign(Object.assign({}, this.context), childContext), this.section + "." + section);
    }
    createChild(section, childContext = {}) {
        return this.child(section, childContext);
    }
}
exports.Logger = Logger;
exports.log = new Logger();
//# sourceMappingURL=Logger.js.map