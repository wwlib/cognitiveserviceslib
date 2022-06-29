export declare class Logger {
    private _section;
    constructor(section?: string);
    write(level: string, action: string, ...details: any[]): void;
    child(section: string): Logger;
    createChild(section: string): Logger;
    debug: (action: string, ...details: any) => void;
    info: (action: string, ...details: any) => void;
    error: (action: string, ...details: any) => void;
    warn: (action: string, ...details: any) => void;
}
export declare const log: Logger;
