import { describe, it, expect } from 'vitest';
import { createSender, createSenders } from '../../../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('sender.ts - Testes de integração', () => {
  it('createSender sem parâmetros deve usar defaultProvider do config', async () => {
    const originalCwd = process.cwd();
    process.chdir(path.resolve(__dirname, '../../fixtures'));

    try {
      const sms = await createSender();
      expect(sms).toBeDefined();
      expect(typeof sms.send).toBe('function');
      expect(typeof sms.sendBatch).toBe('function');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('createSenders deve criar todos providers do config', async () => {
    const originalCwd = process.cwd();
    process.chdir(path.resolve(__dirname, '../../fixtures'));

    try {
      const providers = await createSenders();
      expect(Object.keys(providers)).toContain('ombala');
      expect(Object.keys(providers)).toContain('telcosms');
      expect(Object.keys(providers)).toContain('kambasms');
      
      // Verifica que as instâncias são dos providers corretos
      expect(providers.ombala.constructor.name).toBe('OmbalaProvider');
      expect(providers.telcosms.constructor.name).toBe('TelcoSmsProvider');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('createSender com fallback deve funcionar', async () => {
    const originalCwd = process.cwd();
    process.chdir(path.resolve(__dirname, '../../fixtures'));

    try {
      // Mock do fetch para testar fallback
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Ombala falhou'))
        .mockResolvedValueOnce({ 
          ok: true, 
          json: async () => ({ success: true, message_id: 'msg_123' }) 
        });
      global.fetch = mockFetch;

      const sms = await createSender();
      const result = await sms.send({ to: '923000000', message: 'test' });
      
      expect(result.success).toBe(true);
    } finally {
      process.chdir(originalCwd);
      vi.restoreAllMocks();
    }
  });
});