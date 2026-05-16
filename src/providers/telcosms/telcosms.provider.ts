// src/providers/telcosms/telcosms.provider.ts
import { Provider } from "../../core/provider.js";
import {
  SendMessageDto,
  SendMessageResponse,
  ProviderConfig,
} from "../../shared/types/index.js";
import { ValidationError } from "../../shared/errors/index.js";

export class TelcoSmsProvider extends Provider {
  protected readonly providerName = "telcosms";
  protected readonly apiKey: string;
  protected readonly useV2: boolean;

  constructor(config: ProviderConfig) {
    super(config);
    // TelecoSMS usa api_key_app em vez de token
    this.apiKey = config.token;
    // Usar v2 por padrão (GET é mais simples)
    this.useV2 = config.data?.useV2 !== false;
  }

  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError(
        "Formato de número angolano inválido. Use 9 dígitos (ex: 923000000)"
      );
    }

    this.validateMessageLength(data.message);
    // TelcoSMS não menciona restrição de URLs

    if (this.useV2) {
      return this.sendV2(data);
    }
    return this.sendV1(data);
  }

  /**
   * Versão v2 (GET) - recomendada
   */
  private async sendV2(data: SendMessageDto): Promise<SendMessageResponse> {
    const url = new URL(`${this.baseUrl}/api/v2/send_message`);
    url.searchParams.append("api_key_app", this.apiKey);
    url.searchParams.append("phone_number", this.normalizePhone(data.to));
    url.searchParams.append("message_body", data.message);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.buildHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // TelcoSMS não retorna corpo, apenas status
      if (!response.ok) {
        this.handleErrorResponse(response.status, {});
      }

      return {
        success: true,
        provider: this.providerName,
        messageId: null,
        raw: { status: response.status },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(this.timeout);
      }
      throw error;
    }
  }

  /**
   * Versão v1 (POST)
   */
  private async sendV1(data: SendMessageDto): Promise<SendMessageResponse> {
    const body = {
      message: {
        api_key_app: this.apiKey,
        phone_number: this.normalizePhone(data.to),
        message_body: data.message,
      },
    };

    const response = await this.request("/send_message", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: null,
      raw: result,
    };
  }

  /**
   * TelcoSMS não suporta batch nativo (classe base)
   */
}