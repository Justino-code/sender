export interface ILogger {
    warn(message: string): void;
    error(message: string): void;
    info(message: string): void;
}