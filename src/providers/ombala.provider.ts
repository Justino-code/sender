import type { 
  SmsProvider, 
  SendMessageDto, 
  SendBatchMessageDto,
  SendMessageResponse, 
  SendBatchMessageResponse,
  ProviderConfig,
} from "../shared/index.js";
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
} from "../shared/index.js";

export class OmbalaProvider implements SmsProvider {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly token: string;

  constructor(private readonly config: ProviderConfig) {
    // Validação das configurações obrigatórias
    if (!config.token) {
      throw new ConfigurationError("OmbalaProvider: token é obrigatório (API key ou token de acesso)");
    }
    
    if (!config.baseUrl) {
      throw new ConfigurationError("OmbalaProvider: baseUrl é obrigatória");
    }
    
    this.token = config.token;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 10000;
  }

  private buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
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
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          from: data.from,
          to: normalizePhoneNumber(data.to),
          text: data.message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(result.message || "Token inválido ou sem permissão");
        }
        if (response.status === 429) {
          throw new RateLimitError(result.message || "Limite de requisições excedido");
        }
        if (response.status === 400) {
          throw new ValidationError(result.message || "Dados inválidos");
        }
        throw new ProviderError(result.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        provider: "ombala",
        messageId: result.id || result.messageId,
        raw: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(this.timeout);
        }
        if (error instanceof AuthenticationError || 
            error instanceof RateLimitError || 
            error instanceof ValidationError || 
            error instanceof ProviderError) {
          throw error;
        }
      }
      
      throw new ProviderError(error instanceof Error ? error.message : "Erro desconhecido");
    }
  }

  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    const { valid, invalid } = validatePhoneNumbers(data.to);
    
    if (valid.length === 0) {
      throw new ValidationError("Nenhum número válido para envio");
    }

    // Ombala não suporta batch nativamente, então fazemos chamadas individuais
    const results = await Promise.allSettled(
      valid.map(phone =>
        this.send({
          from: data.from,
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

    // Adicionar números inválidos automaticamente aos falhados
    failed.push(...invalid);
    invalid.forEach(phone => {
      details.push({
        to: phone,
        error: "Número inválido",
      });
    });

    return {
      success: successful.length > 0,
      provider: "ombala",
      successful,
      failed,
      details,
    };
  }
}