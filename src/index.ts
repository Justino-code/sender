// Importa e registra providers built-in automaticamente
import "./providers/index.js";

// Core - Factory
export { 
  // Provider
  Provider,

  // Sender
  createSender,

  // Registry
  registry,
  registerProvider,
  registerProviders,
  getProvider,
  hasProvider,
  listProviders,

  // Config
  defineConfig, 
  loadConfig, 
  getProviderConfig, 
  getDefaultProvider,
} from "./core/index.js";

export {
  
  // Types

  SendMessageDto,
  SendBatchMessageDto,
  SendMessageResponse,
  SendBatchMessageResponse,
  CreateSenderConfig,
  ProviderConfig,

// Errors

  SenderError,
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError,

// Utils

  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
  normalizePhoneNumbers,
} from "./shared/index.js";