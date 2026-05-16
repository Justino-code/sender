import { Provider } from "../../core/index.js";
import {
  ConfigurationError,
  ProviderConfig,
  SendBatchMessageDto,
  SendBatchMessageResponse,
  SendMessageDto,
  SendMessageResponse,
  ValidationError,
} from "../../shared/index.js";

export class OmbalaProvider extends Provider {
  protected readonly providerName = "ombala";

  constructor(config: ProviderConfig) {
    super(config);

    // Validação do from - OBRIGATÓRIO
    if (!config.from) {
      throw new ConfigurationError("OmbalaProvider: from é obrigatório");
    }
  }

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
      this.handleErrorResponse(response.status, result);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: this.extractMessageId(result),
      raw: result,
    };
  }

  /**
 * Envio em lote nativo da Ombala
 * Suporta múltiplos números separados por vírgula
 */
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    const { valid, invalid } = this.validatedBatchPhoneNumbers(data.to);

    // Ombala aceita múltiplos números separados por vírgula
    const toBatch = valid.map(phone => this.normalizePhone(phone)).join(',');
    
    if (!this.from) {
      throw new ConfigurationError(
        "OmbalaProvider: 'from' é obrigatório. Forneça no config."
      );
    }

    const body: Record<string, string> = {
      message: data.message,
      from: this.from,
      to: toBatch,
    };

    if (data.schedule) {
      body.schedule = data.schedule;
    }

    const response = await this.request("/messages", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result);
    }

    // Processar resposta do batch
    const successful: string[] = [];
    const failed: string[] = [];
    const details: Array<{ to: string; messageId?: string; error?: string }> = [];

    // A resposta tem recipients array
    const recipients = result.recipients || [];

    recipients.forEach((recipient: any) => {
      const phone = this.validatePhone(recipient.phone_number)
        ? recipient.phone_number
        : recipient.phone_number.replace('+244', '');

      if (recipient.message_status === 'PENDING' || recipient.message_id) {
        successful.push(phone);
        details.push({
          to: phone,
          messageId: recipient.message_id,
        });
      } else {
        failed.push(phone);
        details.push({
          to: phone,
          error: recipient.error || 'Falha no envio',
        });
      }
    });

    // Adicionar números inválidos
    failed.push(...invalid);
    invalid.forEach(phone => {
      details.push({
        to: phone,
        error: 'Número inválido',
      });
    });

    return {
      success: successful.length > 0,
      provider: this.providerName,
      successful,
      failed,
      details,
      raw: result,
    };
  }
}