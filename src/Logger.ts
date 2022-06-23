export class Logger {
  constructor(private context = {}, private section: string = "cognitiveserviceslib") {}

  write(level: string, action: string, ...details: any[]) {
    console.log(`${level}: [${this.section}] ${action}`, details)
  }

  child(section: string, childContext = {}) {
    return new Logger(
      {
        ...this.context,
        ...childContext,
      },
      this.section + "." + section,
    );
  }

  createChild(section: string, childContext = {}) {
    return this.child(section, childContext);
  }

  debug = (action: string, ...details: any) => this.write("debug", action, ...details);
  info = (action: string, ...details: any) => this.write("info", action, ...details);
  error = (action: string, ...details: any) => this.write("error", action, ...details);
  warn = (action: string, ...details: any) => this.write("warn", action, ...details);
}

export const log = new Logger();
