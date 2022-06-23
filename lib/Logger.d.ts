export declare class Logger {
    private context;
    private section;
    constructor(context?: {}, section?: string);
    write(level: string, action: string, ...details: any[]): void;
    child(section: string, childContext?: {}): Logger;
    createChild(section: string, childContext?: {}): Logger;
    debug: (action: string, ...details: any) => void;
    info: (action: string, ...details: any) => void;
    error: (action: string, ...details: any) => void;
    warn: (action: string, ...details: any) => void;
}
export declare const log: Logger;
