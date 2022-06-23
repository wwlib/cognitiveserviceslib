import { Logger } from "../Logger";

/**
 * Provides general purpose ASR utility functionality
 */
export class ASRUtils {
  /** A dictionary of ASR template strings that expand into lists of words */
  static ASR_TEMPLATES: any = {
    $YESNO: ["yes", "yeap", "yeah", "no", "nah", "nope", "sure"],
  };

  /** Global ASR hints to be added to every ASR request */
  static GLOBAL_HINTS = ["robo"];

  /**
   * Swaps in values for known ASR templates (e.g. $YESNO) and removes unknown ASR templates from
   * the provided ASR Hints and/or Early EOS words lists. Optionally appends global hints, if requested.
   * @param toClean - Strings to be cleaned.
   * @param [addGlobal=false] - `true` if the global hints should appended to the cleaned output.
   */
  static cleanHintsEOS(toClean: string[], addGlobal = false, logger: Logger): string[] {
    const cleaned = toClean.reduce((final: string[], item) => {
      if (item.startsWith("$")) {
        const expansionList: string[] = ASRUtils.ASR_TEMPLATES[item];
        if (expansionList) {
          final.push(...expansionList);
        } else if (logger) {
          logger.warn(`Detected unknown ASR Template '${item}' in ASR Hints/Early EOS; removing`);
        }
      } else {
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
