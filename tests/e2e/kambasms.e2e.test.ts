import { describe, it, expect } from 'vitest';
import { createSender } from '../../src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carregar .env.test da pasta tests
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const hasCredentials = !!process.env.KAMBASMS_TOKEN && !!process.env.KAMBASMS_BASE_URL;
const testPhone = process.env.TEST_PHONE_NUMBER || '923000000';

describe.skipIf(!hasCredentials)('E2E - KambaSMS Provider', () => {
  it('deve enviar SMS com sucesso', async () => {
    const sms = await createSender('kambasms', {
      token: process.env.KAMBASMS_TOKEN!,
      baseUrl: process.env.KAMBASMS_BASE_URL!,
      timeout: 15000,
    });

    const result = await sms.send({
      to: testPhone,
      message: `[TESTE] KambaSMS: ${new Date().toISOString()}`,
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('kambasms');
    expect(result.messageId).toBeDefined();
  });

  it('deve lançar erro para número inválido', async () => {
    const sms = await createSender('kambasms', {
      token: process.env.KAMBASMS_TOKEN!,
      baseUrl: process.env.KAMBASMS_BASE_URL!,
    });

    await expect(
      sms.send({
        to: '123',
        message: 'Teste',
      })
    ).rejects.toThrow();
  });

  it('deve lançar erro para token inválido', async () => {
    const sms = await createSender('kambasms', {
      token: 'token-invalido',
      baseUrl: process.env.KAMBASMS_BASE_URL!,
    });

    await expect(
      sms.send({
        to: testPhone,
        message: 'Teste',
      })
    ).rejects.toThrow();
  });
});