export class Logger {
    private static log(level: string, message: string, ...args: unknown[]): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`, ...args);
    }

    static info(message: string, ...args: unknown[]): void {
        this.log('INFO', message, ...args);
    }

    static warn(message: string, ...args: unknown[]): void {
        this.log('WARN', message, ...args);
    }

    static error(message: string, ...args: unknown[]): void {
        this.log('ERROR', message, ...args);
    }

    static success(message: string, ...args: unknown[]): void {
        this.log('SUCCESS', message, ...args);
    }
}