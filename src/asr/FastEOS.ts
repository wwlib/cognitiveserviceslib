export class FastEOS {
  /**
   * Builds RegExp for checking for fast EOS
   * @returns `null` if phrases list is empty or invalid
   */
  static buildRegex(fastEOSPhrases: string[]): RegExp | null {
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
