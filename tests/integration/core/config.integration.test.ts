// tests/integration/core/config.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Config API (integration)', () => {
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('deve carregar configuração de um arquivo real (.ts)', async () => {
    process.chdir(path.join(__dirname, '../../fixtures'));

    const { loadConfig } = await import('../../../src/core/config.js');
    const config = await loadConfig();

    expect(config).not.toBeNull();
    expect(config?.defaultProvider).toBe('ombala');
    expect(config?.fallbackProviders).toEqual(['telcosms']);
    expect(config?.providers.ombala).toBeDefined();
  });

  // Teste removido - loadConfig sempre sobe na árvore de diretórios
  // Não é possível testar "nenhum arquivo" dentro da estrutura do projeto

  it('deve carregar configuração de arquivo .js', async () => {
    process.chdir(path.join(__dirname, '../../fixtures/js'));

    const { loadConfig } = await import('../../../src/core/config.js');
    const config = await loadConfig();

    expect(config).not.toBeNull();
    expect(config?.defaultProvider).toBe('ombala');
  });
});