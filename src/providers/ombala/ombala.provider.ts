import { Provider } from "../../core/index.js";
import {
  ConfigurationError,
  SendMessageDto,
  SendMessageResponse,
  ValidationError,
} from "../../shared/index.js";

export class OmbalaProvider extends Provider {
  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Authorization": `Token ${this.token}`,
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError("Formato de número angolano inválido");
    }

    if (!this.from) {
      throw new ConfigurationError(
        "OmbalaProvider: 'from' é obrigatório. Forneça no config."
      );
    }

    const body: Record<string, string> = {
      message: data.message,
      from: this.from,
      to: this.normalizePhone(data.to),
    };

    if (data.schedule) {
      body.schedule = data.schedule;
    }

    const response = await this.request("/messages", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result?.message);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: this.extractMessageId(result),
      raw: result,
    };
  }
}