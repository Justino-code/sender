export type SendMessageDto = {
  from: string;
  to: string;
  message: string;
}

export type SendBatchMessageDto = {
  from: string;
  to: string[];
  message: string;
}

export type SendMessageResponse = {
  success: boolean;
  provider: string;
  messageId?: string;
  raw?: unknown;
}

export type SendBatchMessageResponse = {
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

export type CreateSenderConfig = {
  providerName: string;
  providerConfig: ProviderConfig;
}

export type ProviderConfig = {
  token: string;
  baseUrl: string;
  timeout: number;

  data?: Record<string, unknown>;
}

