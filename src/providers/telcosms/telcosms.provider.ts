// src/providers/telcosms/telcosms.provider.ts
import { Provider } from "../../core/provider.js";
import {
  // Types
  SendMessageDto,
  SendMessageResponse,
  SendBatchMessageDto,
  SendBatchMessageResponse,
  ProviderConfig,

  // Errors
  TimeoutError,
} from "../../shared/index.js";

export class TelcoSmsProvider extends Provider {
  protected readonly providerName = "telcosms";

  constructor(config: ProviderConfig) {
    super(config);
    // Sem configurações extras - tudo abstraído internamente
  }

  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    return this.withRetry(async () => {
      this.validatePhoneOrThrow(data.to);
      this.validateMessageLength(data.message);

      // Tenta os métodos em ordem: v2 POST → v1 POST → v2 GET
      const methods = [
        () => this.sendV2Post(data),
        () => this.sendV1Post(data),
        () => this.sendV2Get(data),
      ];

      let lastError: Error | null = null;

      for (const method of methods) {
        try {
          return await method();
        } catch (error) {
          lastError = error as Error;
          continue;
        }
      }

      throw lastError || new Error("Todos os métodos de envio falharam");
    })
  }

  /**
   * v2 POST - método principal
   */
  private async sendV2Post(data: SendMessageDto): Promise<SendMessageResponse> {
    const body = {
      message: {
        api_key_app: this.token,
        phone_number: this.normalizePhone(data.to),
        message_body: data.message,
      },
    };

    const response = await this.request("/api/v2/send_message", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: undefined,
      raw: result,
    };
  }

  /**
   * v1 POST - fallback
   */
  private async sendV1Post(data: SendMessageDto): Promise<SendMessageResponse> {
    const body = {
      message: {
        api_key_app: this.token,
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
      messageId: undefined,
      raw: result,
    };
  }

  /**
   * v2 GET - último fallback
   */
  private async sendV2Get(data: SendMessageDto): Promise<SendMessageResponse> {
    const url = new URL(`${this.baseUrl}/api/v2/send_message`);
    url.searchParams.append("api_key_app", this.token);
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

      if (!response.ok) {
        this.handleErrorResponse(response.status, {});
      }

      return {
        success: true,
        provider: this.providerName,
        messageId: undefined,
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
   * TelcoSMS não suporta batch nativo (usa implementação base)
   */
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    return super.sendBatch(data);
  }
}