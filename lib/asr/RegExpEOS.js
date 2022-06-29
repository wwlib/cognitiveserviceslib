"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegExpEOS = void 0;
class RegExpEOS {
    /**
     * Builds RegExp for detecting terms that should trigger EOS
     * @returns `null` if phrases list is empty or invalid
     */
    static buildRegex(regexpEOSPhrases) {
        if (Array.isArray(regexpEOSPhrases)) {
            const validPhrases = regexpEOSPhrases.map((phrase) => phrase.trim()).filter((phrase) => phrase.length > 0);
            if (validPhrases.length > 0) {
                const regexString = "\\b(" + validPhrases.join("|") + ")\\b";
                return new RegExp(regexString, "i");
            }
        }
        return null;
    }
}
exports.RegExpEOS = RegExpEOS;
//# sourceMappingURL=RegExpEOS.js.map