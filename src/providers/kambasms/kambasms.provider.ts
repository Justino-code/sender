import { Provider } from "../../core/provider.js";
import type {
  SendMessageDto,
  SendMessageResponse,
  SendBatchMessageDto,
  SendBatchMessageResponse,
  ProviderConfig,
} from "../../shared/types/index.js";
import { ValidationError } from "../../shared/errors/index.js";

export class KambaSmsProvider extends Provider {
  protected readonly providerName = "kambasms";

  constructor(config: ProviderConfig) {
    super(config);
  }

  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError(
        "Formato de número angolano inválido. Use 9 dígitos (ex: 923000000)"
      );
    }

    this.validateMessageLength(data.message);
    this.validateNoUrls(data.message);

    // Se tem schedule, usa endpoint de agendamento
    if (data.schedule) {
      return this.sendScheduled(data);
    }

    // Envio simples: sender_id NÃO é obrigatório (API usa da chave)
    const body: Record<string, string> = {
      to: this.normalizePhone(data.to, true),
      text: data.message,
    };

    // Opcional: se o usuário configurou from, pode enviar
    if (this.from) {
      body.sender_id = this.from;
    }

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

  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    const { valid, invalid } = this.validatedBatchPhoneNumbers(data.to);

    this.validateBatchSize(valid.length);
    this.validateMessageLength(data.message);
    this.validateNoUrls(data.message);

    // Se tem schedule, usa agendamento em lote
    if (data.schedule) {
      return this.sendBatchScheduled(data, valid, invalid);
    }

    // Batch: sender_id é obrigatório
    if (!this.from) {
      throw new ValidationError(
        "sender_id é obrigatório para envio em lote. Configure 'from' na criação do provider."
      );
    }

    if (!data.campaignName) {
      throw new ValidationError(
        "campaignName é obrigatório para envio em lote. Forneça um nome para a campanha."
      );
    }

      const body: Record<string, any> = {
        name: data.campaignName,
        text: data.message,
        recipients: this.normalizePhones(valid, true),
        sender_id: this.from,
      };

      const response = await this.request("/messages/bulk", body);
      const result = await response.json();

      if (!response.ok) {
        this.handleErrorResponse(response.status, result);
      }

      const successful = valid;
      const failed = invalid;
      const details = [
        ...successful.map(phone => ({ to: phone, messageId: result.job_id })),
        ...invalid.map(phone => ({ to: phone, error: "Número inválido" })),
      ];

      return {
        success: result.success ?? true,
        provider: this.providerName,
        successful,
        failed,
        details,
        raw: result,
      };
    }

  /**
   * Envio agendado (privado, chamado automaticamente via data.schedule)
   */
  private async sendScheduled(data: SendMessageDto): Promise<SendMessageResponse> {
    // Agendamento: sender_id é obrigatório
    if (!this.from) {
      throw new ValidationError(
        "sender_id é obrigatório para envio agendado. Configure 'from' na criação do provider."
      );
    }

    const body: Record<string, string> = {
      to: this.normalizePhone(data.to, true),
      text: data.message,
      sender_id: this.from,
      scheduled_at: data.schedule!,
    };

    const response = await this.request("/messages/schedule", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result);
    }

    return {
      success: result.success ?? true,
      provider: this.providerName,
      messageId: result.scheduled?.id || result.id,
      raw: result,
    };
  }

  /**
   * Envio agendado em lote (privado)
   */
  private async sendBatchScheduled(
    data: SendBatchMessageDto,
    valid: string[],
    invalid: string[]
  ): Promise<SendBatchMessageResponse> {
    // Agendamento em lote: sender_id é obrigatório
    if (!this.from) {
      throw new ValidationError(
        "sender_id é obrigatório para envio agendado. Configure 'from' na criação do provider."
      );
    }

    // Faz chamadas individuais agendadas para cada número
    const results = await Promise.allSettled(
      valid.map(phone =>
        this.sendScheduled({
          to: phone,
          message: data.message,
          schedule: data.schedule,
        })
      )
    );

    const successful: string[] = [];
    const failed: string[] = [...invalid];
    const details: Array<{ to: string; messageId?: string; error?: string }> = [
      ...invalid.map(phone => ({ to: phone, error: "Número inválido" })),
    ];

    results.forEach((result, index) => {
      const phone = valid[index];
      if (result.status === "fulfilled") {
        successful.push(phone);
        details.push({ to: phone, messageId: result.value.messageId });
      } else {
        failed.push(phone);
        details.push({ to: phone, error: result.reason?.message });
      }
    });

    return {
      success: successful.length > 0,
      provider: this.providerName,
      successful,
      failed,
      details,
    };
  }
}