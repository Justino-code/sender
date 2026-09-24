import { 
    AuthenticationError, 
    ProviderError, 
    RateLimitError, 
    ValidationError 
} from "../errors/Error.js";

export class HttpValidator{
    /**
     * Trata a resposta da API e converte em erro apropriado
     */
    public handleErrorResponse(status: number, response: any): never {
        const message = response?.message || response?.error || JSON.stringify(response);

        if (status === 401 || status === 403) {
            throw new AuthenticationError(message, { status, response });
        }

        if (status === 429) {
            throw new RateLimitError(message, { status, response });
        }

        if (status === 400) {
            throw new ValidationError(message, { status, response });
        }

        throw new ProviderError(message, { status, response });
    }
}