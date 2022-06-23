export declare class FastEOS {
    /**
     * Builds RegExp for checking for fast EOS
     * @returns `null` if phrases list is empty or invalid
     */
    static buildRegex(fastEOSPhrases: string[]): RegExp | null;
}
