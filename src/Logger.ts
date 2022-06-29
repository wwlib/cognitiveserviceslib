export class Logger {

  private _section: string

  constructor(section: string = "cognitiveserviceslib") {
    this._section = section
  }

  write(level: string, action: string, ...details: any[]) {
    console.log(`${level}: [${this._section}] ${action}`, details)
  }

  child(section: string) {
    return new Logger(
      this._section + "." + section,
    );
  }

  createChild(section: string) {
    return this.child(section);
  }

  debug = (action: string, ...details: any) => this.write("debug", action, ...details);
  info = (action: string, ...details: any) => this.write("info", action, ...details);
  error = (action: string, ...details: any) => this.write("error", action, ...details);
  warn = (action: string, ...details: any) => this.write("warn", action, ...details);
}

export const log = new Logger();
