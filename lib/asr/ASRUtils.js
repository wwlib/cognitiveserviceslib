"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASRUtils = void 0;
/**
 * Provides general purpose ASR utility functionality
 */
class ASRUtils {
    /**
     * Swaps in values for known ASR templates (e.g. $YESNO) and removes unknown ASR templates from
     * the provided ASR Hints and/or Early EOS words lists. Optionally appends global hints, if requested.
     * @param toClean - Strings to be cleaned.
     * @param [addGlobal=false] - `true` if the global hints should appended to the cleaned output.
     */
    static cleanHintsEOS(toClean, addGlobal = false, logger) {
        const cleaned = toClean.reduce((final, item) => {
            if (item.startsWith("$")) {
                const expansionList = ASRUtils.ASR_TEMPLATES[item];
                if (expansionList) {
                    final.push(...expansionList);
                }
                else if (logger) {
                    logger.warn(`Detected unknown ASR Template '${item}' in ASR Hints/Early EOS; removing`);
                }
            }
            else {
                final.push(item);
            }
            return final;
        }, []);
        if (addGlobal) {
            cleaned.push(...ASRUtils.GLOBAL_HINTS);
        }
        return Array.from(new Set(cleaned));
    }
}
exports.ASRUtils = ASRUtils;
/** A dictionary of ASR template strings that expand into lists of words */
ASRUtils.ASR_TEMPLATES = {
    $YESNO: ["yes", "yeap", "yeah", "no", "nah", "nope", "sure"],
};
/** Global ASR hints to be added to every ASR request */
ASRUtils.GLOBAL_HINTS = ["robo"];
//# sourceMappingURL=ASRUtils.js.map