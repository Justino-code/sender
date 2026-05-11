import { Provider } from "../../core/index.js";
import {
  SendMessageDto,
  SendMessageResponse,
  ValidationError,
} from "../../shared/index.js";

export class KambaSmsProvider extends Provider {
  protected readonly providerName = "kambasms";
  
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
      to: this.normalizePhone(data.to, 'i'),
      text: data.message,
    };

    const response = await this.request("/messages/send", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result);
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