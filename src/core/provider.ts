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
    normalizePhoneNumbers,
    normalizePhoneNumber,
    ValidatedPhone,
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
    protected abstract readonly providerName: string;
    protected readonly from?: string;
    protected readonly customData?: Record<string, unknown>;

    protected readonly maxRetries: number = 0;
    protected readonly retryDelay: number = 1000;

    // Constantes de limite (podem ser sobrescritas por providers)
    protected readonly maxBatchSize: number = 1000;
    protected readonly maxMessageLength: number = 160;
    protected readonly rateLimitPerHour?: number;

    public constructor(config: ProviderConfig) {
        if (!config.token) {
            throw new ConfigurationError("Token é obrigatório. Forneça sua API key ou token de acesso.");
        }

        if (!config.baseUrl) {
            throw new ConfigurationError("BaseUrl é obrigatória. Forneça a URL base da API do provider.");
        }

        if (config.data?.maxBatchSize) {
            this.maxBatchSize = config.data.maxBatchSize as number;
        }
        if (config.data?.maxMessageLength) {
            this.maxMessageLength = config.data.maxMessageLength as number;
        }

        if (config.data?.maxRetries) {
            this.maxRetries = config.data?.maxRetries;
        }
        if (config.data?.retryDelay) {
            this.retryDelay = config.data?.retryDelay;
        }

        this.token = config.token;
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout ?? 10000;
        this.customData = config.data;
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
     */
    protected normalizePhone(phone: string, internacional: boolean = false): string {
        return normalizePhoneNumber(phone, internacional);
    }

    /**
     * Normaliza múltiplos números de telefone
     */
    protected normalizePhones(phones: string[], internacional: boolean = false): string[] {
        return normalizePhoneNumbers(phones, internacional);
    }

    /**
     * Valida um número de telefone (retorna boolean)
     */
    protected validatePhone(phone: string): boolean {
        return validatePhoneNumber(phone);
    }

    /**
     * Valida um número de telefone e lança exceção se inválido
     * @throws ValidationError
     */
    protected validatePhoneOrThrow(phone: string): void {
        if (!this.validatePhone(phone)) {
            throw new ValidationError(
                "Formato de número angolano inválido. Use 9 dígitos (ex: 923000000)"
            );
        }
    }

    /**
     * Valida múltiplos números e separa válidos de inválidos
     */
    protected validatePhones(phones: string[]): ValidatedPhone {
        return validatePhoneNumbers(phones);
    }

    /**
     * Valida se from está configurado (para providers que exigem)
     * @throws ConfigurationError
     */
    protected validateFromRequired(): void {
        if (!this.from) {
            throw new ConfigurationError(
                `${this.providerName}: 'from' é obrigatório. Configure na criação do provider.`
            );
        }
    }

    /**
     * Valida o tamanho da mensagem
     * @throws ValidationError
     */
    protected validateMessageLength(message: string): void {
        if (message.length > this.maxMessageLength) {
            throw new ValidationError(
                `Mensagem muito longa: ${message.length} caracteres. Máximo ${this.maxMessageLength} caracteres.`
            );
        }
    }

    /**
     * Valida se a mensagem contém URLs (não permitido)
     * @throws ValidationError
     */
    protected validateNoUrls(message: string): void {
        const urlPattern = /https?:\/\/|www\.|\.(com|ao|net|org)\b/i;
        if (urlPattern.test(message)) {
            throw new ValidationError(
                "Mensagens com links ou URLs não são permitidas."
            );
        }
    }

    /**
     * Valida o tamanho do lote
     * @throws ValidationError
     */
    protected validateBatchSize(validCount: number): void {
        if (validCount > this.maxBatchSize) {
            throw new ValidationError(
                `Muitos destinatários: ${validCount}. Máximo ${this.maxBatchSize} por campanha.`
            );
        }
    }

    /**
     * Valida se campaignName foi fornecido (para providers que exigem)
     * @throws ValidationError
     */
    protected validateCampaignName(campaignName?: string): void {
        if (!campaignName) {
            throw new ValidationError(
                "campaignName é obrigatório para envio em lote neste provider."
            );
        }
    }

    /**
     * Valida números de telefone em lote e retorna os válidos
     * @throws ValidationError se não houver números válidos
     */
    protected validatedBatchPhoneNumbers(phoneNumbers: string[]): ValidatedPhone {
        const numbers = this.validatePhones(phoneNumbers);

        if (numbers.valid.length === 0) {
            throw new ValidationError("Nenhum número válido para envio");
        }

        return numbers;
    }

    /**
     * Método base para fazer requisições HTTP
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
     */
    protected handleErrorResponse(status: number, response: any): never {
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

    /**
     * Extrai o messageId da resposta
     */
    protected extractMessageId(result: any): string | undefined {
        return result?.id || result?.messageId || result?.smsId || result?.message_id;
    }

    /**
     * Envio em lote - implementação base
     */
    async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
        return this.withRetry(async () => {
            const { valid, invalid } = this.validatePhones(data.to);

            if (valid.length === 0) {
                throw new ValidationError("Nenhum número válido para envio");
            }

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
        });
    }

    /**
     * Executa uma função com retry automático
     * @param fn - Função a ser executada
     * @param retries - Número de tentativas (sobrescreve o padrão)
     * @returns Resultado da função
     */

    protected async withRetry<T>(
        fn: () => Promise<T>,
        retries: number = this.maxRetries
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
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        throw lastError;
    }

    abstract send(data: SendMessageDto): Promise<SendMessageResponse>;
}