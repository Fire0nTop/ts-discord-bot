import {logLevel} from "../types/logLevel";

export class Logger {
    private static log(level: logLevel, message: string, ...args: unknown[]): void {
        const timestamp = new Date().toISOString();
        switch (level) {
            case logLevel.Error:
                console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
                break;
            case logLevel.Warn:
                console.warn(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
                break;
            default:
                console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
                break;
        }
    }

    static info(message: string, ...args: unknown[]): void {
        this.log(logLevel.Info, message, ...args);
    }

    static warn(message: string, ...args: unknown[]): void {
        this.log(logLevel.Warn, message, ...args);
    }

    static error(message: string, ...args: unknown[]): void {
        this.log(logLevel.Error, message, ...args);
    }

    static success(message: string, ...args: unknown[]): void {
        this.log(logLevel.Success, message, ...args);
    }
}