import { AuthenticationError, ConfigurationError, ValidationError } from "./errors/old";
import { IRetry } from "./interfaces/index.js";

export class Retry implements IRetry {
    /**
     * Executa uma função com retry automático
     * @param fn - Função a ser executada
     * @param retries - Número de tentativas (sobrescreve o padrão)
     * @returns Resultado da função
     */

    public async withRetry<T>(
        fn: () => Promise<T>,
        retries: number,
        delay: number,
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                // Não retentar para certos erros
                if (error instanceof ValidationError ||
                    error instanceof AuthenticationError ||
                    error instanceof ConfigurationError) {
                    throw error;
                }

                if (attempt <= retries) {
                    const retryDelay = delay * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));

                }
            }
        }

        throw lastError;
    }
}