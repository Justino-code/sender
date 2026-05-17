import { describe, it, expect } from 'vitest';
import { createSender, ValidationError, AuthenticationError } from '../../src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const hasCredentials = !!process.env.TELCOSMS_API_KEY;
const testPhone = process.env.TEST_PHONE_NUMBER || '923000000';

describe.skipIf(!hasCredentials)('E2E - TelcoSMS Provider', () => {
  it('deve enviar SMS com sucesso', async () => {
    console.log('\n📤 Enviando SMS via TelcoSMS...');

    const sms = await createSender('telcosms', {
      token: process.env.TELCOSMS_API_KEY!,
      baseUrl: 'https://www.telcosms.co.ao',
      timeout: 15000,
    });

    const result = await sms.send({
      to: testPhone,
      message: `[TESTE] TelcoSMS: ${new Date().toISOString()}`,
    });

    console.log('✅ Resposta:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.provider).toBe('telcosms');
  });

  it('deve lançar ValidationError para número inválido', async () => {
    const sms = await createSender('telcosms', {
      token: process.env.TELCOSMS_API_KEY!,
      baseUrl: 'https://www.telcosms.co.ao',
    });

    await expect(
      sms.send({
        to: '123',
        message: 'Teste',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('deve lançar AuthenticationError para token inválido', async () => {
    const sms = await createSender('telcosms', {
      token: 'token-invalido',
      baseUrl: 'https://www.telcosms.co.ao',
    });

    await expect(
      sms.send({
        to: testPhone,
        message: 'Teste',
      })
    ).rejects.toThrow(AuthenticationError);
  });
});