export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private static level: LogLevel =
    process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO

  static setLevel(level: LogLevel): void {
    this.level = level
  }

  static debug(module: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[${module}] ${message}`, ...args)
    }
  }

  static info(module: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[${module}] ${message}`, ...args)
    }
  }

  static warn(module: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[${module}] ${message}`, ...args)
    }
  }

  static error(module: string, message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[${module}] ${message}`, ...args)
    }
  }
}

export default Logger
