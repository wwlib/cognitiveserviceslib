export declare class RegExpEOS {
    /**
     * Builds RegExp for detecting terms that should trigger EOS
     * @returns `null` if phrases list is empty or invalid
     */
    static buildRegex(regexpEOSPhrases: string[]): RegExp | null;
}
