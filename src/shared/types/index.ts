// ============ Bases ============
type BaseMessageDto = {
  message: string;
  schedule?: string;
}

type BaseResponse = {
  success: boolean;
  provider: string;
  raw?: unknown;
}

// ============ DTOs ============
export type SendMessageDto = BaseMessageDto & {
  to: string;
}

export type SendBatchMessageDto = BaseMessageDto & {
  to: string[];
  campaignName?: string;
}

// ============ Responses ============
export type SendMessageResponse = BaseResponse & {
  messageId?: string;
}

export type SendBatchMessageResponse = BaseResponse & {
  successful: string[];
  failed: string[];
  details?: Array<{
    to: string;
    messageId?: string;
    error?: string;
  }>;
}

// ============ Configurações ============
export type CreateSenderConfig = {
  providerName: string;
  providerConfig: ProviderConfig;
}

export type ProviderConfig = {
  token: string;
  baseUrl: string;
  timeout?: number;
  from?: string;
  data?: {
    senderId?: string;
    maxBatchSize?: number;
    maxMessageLength?: number;
    rateLimitPerHour?: number;
    [key: string]: unknown;
  };
}

export type SenderConfigFile = {
  defaultProvider?: string;
  fallbackProviders?: string[];
  providers: Record<string, Partial<ProviderConfig>>;
}

export type ValidatedPhone = { 
  valid: string[]; 
  invalid: string[];
}