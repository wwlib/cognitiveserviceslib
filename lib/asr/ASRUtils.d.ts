import { Logger } from "../Logger";
/**
 * Provides general purpose ASR utility functionality
 */
export declare class ASRUtils {
    /** A dictionary of ASR template strings that expand into lists of words */
    static ASR_TEMPLATES: any;
    /** Global ASR hints to be added to every ASR request */
    static GLOBAL_HINTS: string[];
    /**
     * Swaps in values for known ASR templates (e.g. $YESNO) and removes unknown ASR templates from
     * the provided ASR Hints and/or Early EOS words lists. Optionally appends global hints, if requested.
     * @param toClean - Strings to be cleaned.
     * @param [addGlobal=false] - `true` if the global hints should appended to the cleaned output.
     */
    static cleanHintsEOS(toClean: string[], addGlobal: boolean | undefined, logger: Logger): string[];
}
