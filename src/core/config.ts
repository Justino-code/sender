// src/core/config.ts
import fs from "fs";
import path from "path";
import type { ProviderConfig, SenderConfigFile } from "../shared/index.js";

let cachedConfig: SenderConfigFile | null = null;

export function defineConfig(config: SenderConfigFile): SenderConfigFile {
  return config;
}

export async function loadConfig(): Promise<SenderConfigFile | null> {
  if (cachedConfig) return cachedConfig;

  const configPath = path.join(process.cwd(), "sender.config.ts");
  const configJsPath = path.join(process.cwd(), "sender.config.js");
  
  let configFile = null;
  
  if (fs.existsSync(configPath)) configFile = configPath;
  else if (fs.existsSync(configJsPath)) configFile = configJsPath;
  else return null;
  
  try {
    const config = await import(`file://${configFile}`);
    cachedConfig = config.default;
    return cachedConfig;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar configuração: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

export async function getProviderConfig(providerName: string): Promise<Partial<ProviderConfig> | null> {
  const config = await loadConfig();
  return config?.providers[providerName] || null;
}

export async function getDefaultProvider(): Promise<string | null> {
  const config = await loadConfig();
  return config?.defaultProvider || null;
}

export async function getFallbackProviders(): Promise<string[]> {
  const config = await loadConfig();
  return config?.fallbackProviders || [];
}

export function clearConfigCache(): void {
  cachedConfig = null;
}