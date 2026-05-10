import {
  SendMessageDto,
  SendBatchMessageDto,
  SendMessageResponse,
  SendBatchMessageResponse,
  ProviderConfig,
  IProvider,
} from "../../shared/index.js";

import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  ValidationError,
  TimeoutError,
  ConfigurationError,
  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
  normalizePhoneNumbers,
} from "../../shared/index.js";

export class KambaSmsProvider implements IProvider {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly token: string;
  private readonly defaultSenderId?: string;

  constructor(private readonly config: ProviderConfig) {
    // Validação das configurações obrigatórias
    if (!config.token) {
      throw new ConfigurationError(
        "KambaSmsProvider: token é obrigatório (API key ou token de acesso)"
      );
    }

    if (!config.baseUrl) {
      throw new ConfigurationError("KambaSmsProvider: baseUrl é obrigatória");
    }

    this.token = config.token;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 10000;
    
    // Pega senderId dos dados adicionais se existir
    this.defaultSenderId = config.data?.senderId as string;
  }

  private buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token, // KambaSMS usa X-API-Key ao invés de Bearer
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!validatePhoneNumber(data.to)) {
      throw new ValidationError(
        "Formato de número angolano inválido. Use 9 dígitos (ex: 923000000)"
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/sms/send`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          from: this.defaultSenderId || data.from,
          to: normalizePhoneNumber(data.to),
          message: data.message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(result.message || "Token inválido");
        }
        if (response.status === 429) {
          throw new RateLimitError(result.message || "Limite excedido");
        }
        if (response.status === 400) {
          throw new ValidationError(result.message || "Dados inválidos");
        }
        throw new ProviderError(
          result.message || `Erro ${response.status}: ${response.statusText}`
        );
      }

      return {
        success: true,
        provider: "kambasms",
        messageId: result.messageId || result.id || result.smsId,
        raw: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(this.timeout);
        }
        if (
          error instanceof AuthenticationError ||
          error instanceof RateLimitError ||
          error instanceof ValidationError ||
          error instanceof ProviderError
        ) {
          throw error;
        }
      }

      throw new ProviderError(
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    const { valid, invalid } = validatePhoneNumbers(data.to);

    if (valid.length === 0) {
      throw new ValidationError("Nenhum número válido para envio");
    }

    // KambaSMS suporta batch nativamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/sms/batch`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          from: this.defaultSenderId || data.from,
          to: normalizePhoneNumbers(valid),
          message: data.message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(result.message || "Token inválido");
        }
        if (response.status === 429) {
          throw new RateLimitError(result.message || "Limite excedido");
        }
        throw new ProviderError(
          result.message || `Erro ${response.status}: ${response.statusText}`
        );
      }

      // Processar resposta do batch
      const successful: string[] = [];
      const failed: string[] = [];
      const details: Array<{ to: string; messageId?: string; error?: string }> = [];

      // Assumindo que a resposta retorna algo como:
      // { results: [{ to: "...", messageId: "...", status: "success" }, ...] }
      const results = result.results || result.messages || [];
      
      results.forEach((item: any) => {
        if (item.status === "success" || item.messageId) {
          successful.push(item.to);
          details.push({
            to: item.to,
            messageId: item.messageId,
          });
        } else {
          failed.push(item.to);
          details.push({
            to: item.to,
            error: item.error || "Falha no envio",
          });
        }
      });

      // Adicionar números inválidos aos falhados
      failed.push(...invalid);
      invalid.forEach((phone) => {
        details.push({
          to: phone,
          error: "Número inválido",
        });
      });

      return {
        success: successful.length > 0,
        provider: "kambasms",
        successful,
        failed,
        details,
        raw: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(this.timeout);
        }
        if (
          error instanceof AuthenticationError ||
          error instanceof RateLimitError ||
          error instanceof ProviderError
        ) {
          throw error;
        }
      }

      throw new ProviderError(
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}