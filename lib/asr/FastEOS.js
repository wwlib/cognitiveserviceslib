"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastEOS = void 0;
class FastEOS {
    /**
     * Builds RegExp for checking for fast EOS
     * @returns `null` if phrases list is empty or invalid
     */
    static buildRegex(fastEOSPhrases) {
        if (Array.isArray(fastEOSPhrases)) {
            const validPhrases = fastEOSPhrases.map((phrase) => phrase.trim()).filter((phrase) => phrase.length > 0);
            if (validPhrases.length > 0) {
                const regexString = "\\b(" + validPhrases.join("|") + ")\\b";
                return new RegExp(regexString, "i");
            }
        }
        return null;
    }
}
exports.FastEOS = FastEOS;
//# sourceMappingURL=FastEOS.js.map