import { Provider } from "../../core/index.js";
import {
  SendMessageDto,
  SendMessageResponse,
  ValidationError,
  normalizePhoneNumber
} from "../../shared/index.js";

export class KambaSmsProvider extends Provider {
  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError("Formato de número angolano inválido");
    }

    const body = {
      to: normalizePhoneNumber(data.to),
      text: data.message,
    };

    const response = await this.request("/messages/send", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result?.message);
    }

    return {
      success: result.success ?? true,
      provider: this.providerName,
      messageId: result.message_id,
      raw: result,
    };
  }

  // sendBatch herda da classe Provider (implementação base)
}