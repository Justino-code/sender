// src/core/sender.ts
import type { IProvider, ProviderConfig, SendMessageDto, SendBatchMessageDto, SendMessageResponse, SendBatchMessageResponse } from "../shared/index.js";
import { registry } from "./registry.js";
import { loadConfig, getProviderConfig, getDefaultProvider, getFallbackProviders } from "./config.js";

/**
 * Resolve a configuração para um provider
 */
async function resolveConfig(
  providerName: string,
  override?: Partial<ProviderConfig>
): Promise<{ providerName: string; providerConfig: ProviderConfig }> {
  const providerFileConfig = await getProviderConfig(providerName);
  
  const finalConfig: ProviderConfig = {
    token: override?.token || providerFileConfig?.token || "",
    baseUrl: override?.baseUrl || providerFileConfig?.baseUrl || "",
    timeout: override?.timeout || providerFileConfig?.timeout || 10000,
    from: override?.from || providerFileConfig?.from,
    data: { ...providerFileConfig?.data, ...override?.data },
  };
  
  if (!finalConfig.token || !finalConfig.baseUrl) {
    throw new Error(
      `Configuração incompleta para provider "${providerName}". Verifique suas credenciais.`
    );
  }
  
  return {
    providerName,
    providerConfig: finalConfig,
  };
}

/**
 * Cria uma instância normal de um provider (sem fallback)
 */
async function createSenderNormal(
  providerName: string,
  override?: Partial<ProviderConfig>
): Promise<IProvider> {
  const resolved = await resolveConfig(providerName, override);
  
  const ProviderClass = registry.get(resolved.providerName);
  
  if (!ProviderClass) {
    const availableProviders = registry.list();
    throw new Error(
      `Provider "${resolved.providerName}" não encontrado. ` +
      `Providers disponíveis: ${availableProviders.join(", ") || "nenhum"}`
    );
  }
  
  return new ProviderClass(resolved.providerConfig);
}

/**
 * Cria um sender com fallback automático
 */
function createSenderWithFallback(providerNames: string[]): IProvider {
  let currentIndex = 0;
  const instances: Map<string, IProvider> = new Map();
  
  const getInstance = async (name: string): Promise<IProvider> => {
    if (instances.has(name)) return instances.get(name)!;
    const instance = await createSenderNormal(name);
    instances.set(name, instance);
    return instance;
  };
  
  const sendWithFallback = async <T>(
    sendFn: (provider: IProvider) => Promise<T>
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let i = currentIndex; i < providerNames.length; i++) {
      const providerName = providerNames[i];
      
      try {
        const instance = await getInstance(providerName);
        const result = await sendFn(instance);
        currentIndex = i;
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Provider "${providerName}" falhou:`, error instanceof Error ? error.message : error);
      }
    }
    
    throw new Error(`Todos os providers falharam. Último erro: ${lastError?.message}`);
  };
  
  return {
    async send(data: SendMessageDto): Promise<SendMessageResponse> {
      return sendWithFallback(provider => provider.send(data));
    },
    
    async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
      return sendWithFallback(provider => provider.sendBatch(data));
    },
  };
}

/**
 * Cria uma instância de um provider
 * @param providerName - Nome do provider (opcional, usa default se omitido)
 * @param override - Configurações para sobrescrever (opcional)
 */
export async function createSender(
  providerName?: string,
  override?: Partial<ProviderConfig>
): Promise<IProvider> {
  // Caso 1: Configuração explícita (objeto)
  if (typeof providerName === "object" && providerName !== null) {
    const config = providerName as any;
    const ProviderClass = registry.get(config.providerName);
    if (!ProviderClass) {
      throw new Error(`Provider "${config.providerName}" não encontrado`);
    }
    return new ProviderClass(config.providerConfig);
  }
  
  // Caso 2: Provider específico (sem fallback)
  if (providerName) {
    return createSenderNormal(providerName, override);
  }
  
  // Caso 3: Sem providerName - usa config com fallback
  const defaultProvider = await getDefaultProvider();
  const fallbackProviders = await getFallbackProviders();
  
  if (!defaultProvider) {
    throw new Error(
      "Provider não especificado. Passe providerName ou configure defaultProvider no sender.config.ts"
    );
  }
  
  // Se tem fallback, cria sender com fallback
  if (fallbackProviders.length > 0) {
    const allProviders = [defaultProvider, ...fallbackProviders];
    return createSenderWithFallback(allProviders);
  }
  
  // Sem fallback, cria sender normal com defaultProvider
  return createSenderNormal(defaultProvider, override);
}

/**
 * Cria instâncias de todos os providers configurados
 */
export async function createSenders(): Promise<Record<string, IProvider>> {
  const config = await loadConfig();
  
  if (!config?.providers) {
    throw new Error(
      "Nenhuma configuração encontrada. Crie um sender.config.ts ou use createSender diretamente."
    );
  }
  
  const providers: Record<string, IProvider> = {};
  
  for (const [name, providerConfig] of Object.entries(config.providers)) {
    if (!providerConfig.token || !providerConfig.baseUrl) {
      console.warn(`⚠️ Provider "${name}" ignorado: configuração incompleta`);
      continue;
    }
    
    try {
      const ProviderClass = registry.get(name);
      if (!ProviderClass) {
        console.warn(`⚠️ Provider "${name}" ignorado: classe não registrada`);
        continue;
      }
      
      providers[name] = new ProviderClass(providerConfig as ProviderConfig);
    } catch (error) {
      console.warn(`⚠️ Provider "${name}" ignorado: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  if (Object.keys(providers).length === 0) {
    throw new Error("Nenhum provider válido encontrado na configuração");
  }
  
  return providers;
}

// Versão síncrona para compatibilidade
export function createSenderSync(config: { providerName: string; providerConfig: ProviderConfig }): IProvider {
  const ProviderClass = registry.get(config.providerName);
  
  if (!ProviderClass) {
    const availableProviders = registry.list();
    throw new Error(
      `Provider "${config.providerName}" não encontrado. ` +
      `Providers disponíveis: ${availableProviders.join(", ") || "nenhum"}`
    );
  }
  
  return new ProviderClass(config.providerConfig);
}