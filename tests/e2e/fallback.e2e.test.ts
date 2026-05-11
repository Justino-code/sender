import { describe, it, expect } from 'vitest';
import { createSender } from '../../src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carregar .env.test da pasta tests
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const hasOmbala = !!process.env.OMBALA_TOKEN && !!process.env.OMBALA_BASE_URL;
const hasKamba = !!process.env.KAMBASMS_TOKEN && !!process.env.KAMBASMS_BASE_URL;
const testPhone = process.env.TEST_PHONE_NUMBER || '923000000';

describe.skipIf(!hasOmbala || !hasKamba)('E2E - Fallback Automático', () => {
  it('deve tentar Ombala primeiro, depois KambaSMS', async () => {
    const sms = await createSender('ombala', {
      token: 'token-invalido-que-vai-falhar',
      baseUrl: process.env.OMBALA_BASE_URL!,
      from: 'TESTE',
    });

    const result = await sms.send({
      to: testPhone,
      message: `[TESTE] Fallback: ${new Date().toISOString()}`,
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBeDefined();
  });
});