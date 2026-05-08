import type { CreateSenderConfig, SmsProvider } from "../shared/index.js";
import { registry } from "./registry.js";

export function createSender(config: CreateSenderConfig): SmsProvider {
  const { providerName, providerConfig } = config;
  
  const ProviderClass = registry.get(providerName);
  
  if (!ProviderClass) {
    const availableProviders = registry.list();
    throw new Error(
      `Provider "${providerName}" não encontrado. ` +
      `Providers disponíveis: ${availableProviders.join(", ") || "nenhum"}`
    );
  }
  
  return new ProviderClass(providerConfig);
}