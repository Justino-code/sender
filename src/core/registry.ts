import type { SmsProvider, ProviderConfig } from "../shared/index.js";

type ProviderConstructor = new (config: ProviderConfig) => SmsProvider;

class ProviderRegistry {
  private providers: Map<string, ProviderConstructor> = new Map();

  /**
   * Registra um novo provider
   * @param name - Nome do provider (ex: "ombala", "kambasms")
   * @param providerClass - Classe do provider que implementa SmsProvider
   * @param override - Se deve sobrescrever caso já exista (padrão: false)
   */
  register(name: string, providerClass: ProviderConstructor, override: boolean = false): void {
    if (this.providers.has(name) && !override) {
      throw new Error(`Provider "${name}" já está registrado. Use override true para sobrescrever.`);
    }
    
    this.providers.set(name, providerClass);
  }

  /**
   * Registra múltiplos providers de uma vez
   */
  registerAll(providers: Record<string, ProviderConstructor>, override: boolean = false): void {
    for (const [name, providerClass] of Object.entries(providers)) {
      this.register(name, providerClass, override);
    }
  }

  /**
   * Obtém um provider pelo nome
   */
  get(name: string): ProviderConstructor | undefined {
    return this.providers.get(name);
  }

  /**
   * Verifica se um provider está registrado
   */
  has(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Remove um provider do registro
   */
  unregister(name: string): boolean {
    return this.providers.delete(name);
  }

  /**
   * Lista todos os providers registrados
   */
  list(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Limpa todos os providers
   */
  clear(): void {
    this.providers.clear();
  }
}

// Singleton global
export const registry = new ProviderRegistry();

// Funções de conveniência
export const registerProvider = (name: string, providerClass: ProviderConstructor, override?: boolean) => 
  registry.register(name, providerClass, override);

export const registerProviders = (providers: Record<string, ProviderConstructor>, override?: boolean) =>
  registry.registerAll(providers, override);

export const getProvider = (name: string) => registry.get(name);
export const hasProvider = (name: string) => registry.has(name);
export const listProviders = () => registry.list();