import {
    IProvider,
    SendMessageDto,
    SendBatchMessageDto,
    SendMessageResponse,
    SendBatchMessageResponse,
    ProviderConfig,
    ConfigurationError,
    AuthenticationError,
    RateLimitError,
    ProviderError,
    ValidationError,
    TimeoutError,
    validatePhoneNumber,
    validatePhoneNumbers,
    normalizePhoneNumber,
    normalizePhoneNumbers,
} from "../shared/index.js";

/**
 * Classe abstrata base para todos os providers
 * 
 * Fornece implementações comuns e métodos auxiliares
 * Os providers podem sobrescrever qualquer método conforme necessário
 */
export abstract class Provider implements IProvider {
    protected readonly baseUrl: string;
    protected readonly timeout: number;
    protected readonly token: string;
    protected readonly providerName: string;
    protected readonly from?: string;
    protected readonly customData?: Record<string, unknown>;

    constructor(config: ProviderConfig, providerName: string) {
        // Validações obrigatórias
        if (!config.token) {
            throw new ConfigurationError("Token é obrigatório. Forneça sua API key ou token de acesso.");
        }

        if (!config.baseUrl) {
            throw new ConfigurationError("BaseUrl é obrigatória. Forneça a URL base da API do provider.");
        }

        this.token = config.token;
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout ?? 10000;
        this.customData = config.data;
        this.providerName = providerName;
        this.from = config.from;
    }

    /**
     * Constrói os headers da requisição
     * Pode ser sobrescrito por providers que usam autenticação diferente
     */
    protected buildHeaders(): HeadersInit {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`,
        };
    }

    /**
     * Normaliza um número de telefone
     * Pode ser sobrescrito por providers com formatos específicos
     */
    protected normalizePhone(phone: string): string {
        return normalizePhoneNumber(phone);
    }

    /**
     * Normaliza múltiplos números de telefone
     */
    protected normalizePhones(phones: string[]): string[] {
        return normalizePhoneNumbers(phones);
    }

    /**
     * Valida um número de telefone angolano
     */
    protected validatePhone(phone: string): boolean {
        return validatePhoneNumber(phone);
    }

    /**
     * Valida múltiplos números e separa válidos de inválidos
     */
    protected validatePhones(phones: string[]): { valid: string[]; invalid: string[] } {
        return validatePhoneNumbers(phones);
    }

    /**
     * Método base para fazer requisições HTTP
     * Inclui timeout, abort controller e tratamento básico de erros
     */
    protected async request(url: string, body: unknown): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}${url}`, {
                method: "POST",
                headers: this.buildHeaders(),
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === "AbortError") {
                throw new TimeoutError(this.timeout);
            }

            throw error;
        }
    }

    /**
     * Trata a resposta da API e converte em erro apropriado
     * Pode ser sobrescrito por providers com códigos de erro específicos
     */
    protected handleErrorResponse(status: number, message: string): never {
        if (status === 401 || status === 403) {
            throw new AuthenticationError(message || "Token inválido ou sem permissão");
        }

        if (status === 429) {
            throw new RateLimitError(message || "Limite de requisições excedido");
        }

        if (status === 400) {
            throw new ValidationError(message || "Dados inválidos");
        }

        throw new ProviderError(message || `Erro ${status}: falha na requisição`);
    }

    /**
     * Extrai o messageId da resposta
     * Pode ser sobrescrito por providers com campos diferentes
     */
    protected extractMessageId(result: any): string | undefined {
        return result?.id || result?.messageId || result?.smsId;
    }

    /**
     * Envio em lote - implementação base
     * Faz chamadas individuais para cada número
     * Providers com suporte nativo a batch devem sobrescrever
     */
    async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
        const { valid, invalid } = this.validatePhones(data.to);

        if (valid.length === 0) {
            throw new ValidationError("Nenhum número válido para envio");
        }

        // Enviar para cada número válido
        const results = await Promise.allSettled(
            valid.map(phone =>
                this.send({
                    to: phone,
                    message: data.message,
                })
            )
        );

        const successful: string[] = [];
        const failed: string[] = [];
        const details: Array<{ to: string; messageId?: string; error?: string }> = [];

        results.forEach((result, index) => {
            const phone = valid[index];

            if (result.status === "fulfilled") {
                successful.push(phone);
                details.push({
                    to: phone,
                    messageId: result.value.messageId,
                });
            } else {
                failed.push(phone);
                details.push({
                    to: phone,
                    error: result.reason?.message || "Erro desconhecido",
                });
            }
        });

        // Adicionar números inválidos aos falhados
        failed.push(...invalid);
        invalid.forEach(phone => {
            details.push({
                to: phone,
                error: "Número inválido",
            });
        });

        return {
            success: successful.length > 0,
            provider: this.providerName,
            successful,
            failed,
            details,
        };
    }

    /**
     * Método abstrato - cada provider deve implementar seu envio específico
     */
    abstract send(data: SendMessageDto): Promise<SendMessageResponse>;
}