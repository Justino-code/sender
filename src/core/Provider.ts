import {
    ProviderConfig,
    RateLimit,
} from "../shared/types/index.js";
import { IHttpClient, IRetry } from "./interfaces/index.js";

/**
 * Classe abstrata base para todos os providers.
 *
 * Fornece implementações comuns e métodos auxiliares.
 * Os providers podem sobrescrever qualquer método conforme necessário.
 */
export abstract class Provider {
    protected abstract readonly providerName: string;

    /**
     * Limites de rate limit específicos do provider.
     *
     * Cada provider deve obrigatoriamente definir seus próprios limites.
     */
    protected static readonly maxRateLimits: RateLimit;

    public constructor(
        protected readonly config: ProviderConfig,
        protected readonly retry: IRetry,
        protected readonly retryStatus: boolean,
        protected readonly httpClient: IHttpClient
    ) { }

    protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
        const maxRetries = this.config.maxRetries ?? 0;

        if (!this.retryStatus || maxRetries === 0) {
            return fn();
        }

        return this.retry.withRetry(fn, maxRetries, this.config.initRetryDelay ?? 1000);
    }
}
