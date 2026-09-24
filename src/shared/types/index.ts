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
  providers: Record<string, ProviderConfig>;
  retry: boolean;      // Activa ou desativa o retry automatico
  defaultInitRetryDelay: number;     // Delay inicial em ms (default)
  rateLimit: RateLimit;
  strict: boolean;
  logger: boolean;
  defaultProvider?: string;
  fallbackProviders?: string[];
}

export type ProviderConfig = {
  token: string;
  baseUrl: string;
  timeout?: number;
  from?: string;
  maxRetries?: number;      // Número de tentativas (0 = sem retry)
  initRetryDelay?: number;
  maxBatchSize?: number;
  maxMessageLength?: number;
  rateLimit?: RateLimit;

  data?: {
    senderId?: string;
    [key: string]: unknown;
  };
}

export type SenderConfigFile = {
  defaultProvider?: string;
  fallbackProviders?: string[];
  providers: Record<string, ProviderConfig>;
}

export type ValidatedPhone = {
  valid: string[];
  invalid: string[];
}

export type HttpMethod = 'GET' | 'POST';

export type TimeUnit =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days';

export type RateLimit = {
  limit: number;
  unit: TimeUnit;
};

export const MAX_RETRIES = 10;
export const MAX_RETRY_DELAY_MS = 100000;
export const MIN_RETRY_DELAY_MS = 1000;
export const MAX_TIMEOUT_MS = 300000;