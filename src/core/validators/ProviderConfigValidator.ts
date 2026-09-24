import {
    MAX_RETRIES,
    MAX_RETRY_DELAY_MS,
    MIN_RETRY_DELAY_MS,
    ProviderConfig,
    RateLimit,
} from "../../shared/types/index.js";
import { warn } from "../../shared/utils/logger.js";
import { ConfigurationError } from "../errors/Error.js";
import { IProviderConfigValidator } from "../interfaces/index.js";

export class ProviderConfigValidator implements IProviderConfigValidator {
    public constructor(
        private readonly providerConfig: ProviderConfig,
    ) { }

    public validateAndNormalize(strict: boolean, maxRateLimits: RateLimit): ProviderConfig {
        this.validate(strict, maxRateLimits);

        return this.normalize();
    }

    private validate(strict: boolean, maxRateLimits: RateLimit): void {
        this.validateBaseUrl();

        this.validateRateLimit(maxRateLimits, strict);

        this.validateMaxRetries(
            this.providerConfig.maxRetries,
            strict,
        );

        this.validateRetryDelay(
            this.providerConfig.initRetryDelay,
            strict,
        );
    }

    private normalize(): ProviderConfig {
        return {
            ...this.providerConfig,
            maxRetries: this.normalizeMaxRetries(
                this.providerConfig.maxRetries,
            ),
            initRetryDelay: this.normalizeRetryDelay(
                this.providerConfig.initRetryDelay,
            ),
        };
    }

    private validateBaseUrl(): void {
        if (!this.providerConfig.baseUrl) {
            throw new ConfigurationError(
                "Base URL is required. Please provide the provider API base URL.",
            );
        }
    }

    private validateRateLimit(maxRateLimits: RateLimit, strict: boolean): void {
        const rateLimit = this.providerConfig.rateLimit;

        if (!rateLimit) {
            return;
        }

        if (strict) {
            this.validateRateLimiteWithThrow(maxRateLimits, rateLimit);
        } else {
            this.validateRateLimiteNoThrow(maxRateLimits, rateLimit);
        }
    }

    private validateRateLimiteWithThrow(maxRateLimits: RateLimit, rateLimit: RateLimit): void {
        if (rateLimit.unit !== maxRateLimits.unit) {
            throw new ConfigurationError(
                `Rate limit unit is not accepted. Use "${maxRateLimits.unit}".`,
            );
        }

        if (rateLimit.limit > maxRateLimits.limit) {
            throw new ConfigurationError(
                `Rate limit is too high. The maximum allowed limit is ${maxRateLimits.limit}.`,
            );
        }
    }

    private validateRateLimiteNoThrow(maxRateLimits: RateLimit, rateLimit: RateLimit): void {
        if (rateLimit.unit !== maxRateLimits.unit) {
            rateLimit.unit = maxRateLimits.unit;

            warn(`Rate limit unit is not accepted. Use "${maxRateLimits.unit}".`,
            );
        }

        if (rateLimit.limit > maxRateLimits.limit) {
            rateLimit.limit = maxRateLimits.limit;

            warn(`Rate limit is too high. The maximum allowed limit is ${maxRateLimits.limit}.`);
        }
    }

    private validateMaxRetries(maxRetries: number | undefined, strict: boolean): void {
        const value = maxRetries ?? 0;

        if (value <= MAX_RETRIES && value >= 0) {
            return;
        }

        if (strict) {
            throw new ConfigurationError(
                `Maximum retries is too high. The maximum allowed value is ${MAX_RETRIES}.`,
            );
        }
    }

    private validateRetryDelay(retryDelay: number | undefined,strict: boolean): void {
        const value = retryDelay ?? 1000;

        if (
            value > MAX_RETRY_DELAY_MS &&
            strict
        ) {
            throw new ConfigurationError(
                `Retry delay is too high. The maximum allowed value is ${MAX_RETRY_DELAY_MS} ms.`,
            );
        }

        if (
            value < MIN_RETRY_DELAY_MS &&
            strict
        ) {
            throw new ConfigurationError(
                `Retry delay is too low. The minimum allowed value is ${MIN_RETRY_DELAY_MS} ms.`,
            );
        }
    }

    private normalizeMaxRetries(maxRetries: number | undefined): number {
        const value = maxRetries ?? 0;

        if (value > MAX_RETRIES) {
            warn(
                `Maximum retries is too high. Value was limited to ${MAX_RETRIES}.`,
            );

            return MAX_RETRIES;
        }

        return value;
    }

    private normalizeRetryDelay(retryDelay: number | undefined): number {
        const value = retryDelay ?? 1000;

        if (value > MAX_RETRY_DELAY_MS) {
            warn(
                `Retry delay is too high. Value was limited to ${MAX_RETRY_DELAY_MS} ms.`,
            );

            return MAX_RETRY_DELAY_MS;
        }

        if (value < MIN_RETRY_DELAY_MS) {
            warn(
                `Retry delay is too low. Value was raised to ${MIN_RETRY_DELAY_MS} ms.`,
            );

            return MIN_RETRY_DELAY_MS;
        }

        return value;
    }
}
