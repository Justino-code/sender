// Importa e registra providers built-in automaticamente
import "./providers/index.js";

// Core - Factory
export { createSender } from "./core/sender.js";

// Core - Builder/Registry
export { 
  registry,
  registerProvider,
  registerProviders,
  getProvider,
  hasProvider,
  listProviders,
} from "./core/registry.js";

// Types
export type {
  SendMessageDto,
  SendBatchMessageDto,
  SendMessageResponse,
  SendBatchMessageResponse,
  SmsProvider,
  CreateSenderConfig,
  ProviderConfig,
} from "./shared/index.js";

// Errors
export {
  SenderError,
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError,
} from "./shared/index.js";

// Utils
export {
  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
  normalizePhoneNumbers,
} from "./shared/index.js";