export interface SendMessageDto {
  from: string;
  to: string;
  message: string;
}

export interface SendBatchMessageDto {
  from: string;
  to: string[];
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  provider: string;
  messageId?: string;
  raw?: unknown;
}

export interface SendBatchMessageResponse {
  success: boolean;
  provider: string;
  successful: string[];    // Números que foram enviados com sucesso
  failed: string[];        // Números que falharam
  details?: Array<{
    to: string;
    messageId?: string;
    error?: string;
  }>;
  raw?: unknown;
}

export interface SmsProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}

export interface CreateSenderConfig {
  providerName: string;
  providerConfig: ProviderConfig;
}

export interface ProviderConfig {
  token: string;
  baseUrl: string;
  timeout: number;

  data?: Record<string, unknown>;
}

