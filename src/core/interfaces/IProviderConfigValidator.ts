import { ProviderConfig, RateLimit } from "../../shared/types/index.js";

export interface IProviderConfigValidator {
    validateAndNormalize(
        strict: boolean,
        maxRateLimits: RateLimit,
    ): ProviderConfig;
}