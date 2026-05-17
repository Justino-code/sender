import { describe, it, expect } from 'vitest';
import { createSender, ValidationError } from '../../src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const hasCredentials = !!process.env.TELCOSMS_API_KEY;
const testPhones = ['931459010', '926926937'];  // Números reais para teste

describe.skipIf(!hasCredentials)('E2E - TelcoSMS Batch', () => {
  it('deve enviar SMS em lote (múltiplas chamadas individuais)', async () => {
    console.log('\n📤 Enviando lote via TelcoSMS...');

    const sms = await createSender('telcosms', {
      token: process.env.TELCOSMS_API_KEY!,
      baseUrl: 'https://www.telcosms.co.ao',
      timeout: 30000,
    });

    const result = await sms.sendBatch({
      to: testPhones,
      message: `[TESTE BATCH] TelcoSMS: ${new Date().toISOString()}`,
    });

    console.log('✅ Resultado do lote:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.provider).toBe('telcosms');
    expect(result.successful.length).toBeGreaterThan(0);
    expect(result.details).toBeDefined();
  });

  it('deve lançar ValidationError quando não há números válidos', async () => {
    const sms = await createSender('telcosms', {
      token: process.env.TELCOSMS_API_KEY!,
      baseUrl: 'https://www.telcosms.co.ao',
    });

    await expect(
      sms.sendBatch({
        to: ['invalid1', 'invalid2'],
        message: 'Teste batch',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('deve enviar apenas números válidos em lote', async () => {
    console.log('\n📤 Testando lote com números mistos...');

    const sms = await createSender('telcosms', {
      token: process.env.TELCOSMS_API_KEY!,
      baseUrl: 'https://www.telcosms.co.ao',
      timeout: 30000,
    });

    const mixedNumbers = [...testPhones, 'invalid', '813000000'];

    const result = await sms.sendBatch({
      to: mixedNumbers,
      message: `[TESTE BATCH MISTO] TelcoSMS: ${new Date().toISOString()}`,
    });

    console.log('✅ Resultado do lote misto:', JSON.stringify(result, null, 2));

    expect(result.success).toBe(true);
    expect(result.successful.length).toBe(testPhones.length);
    expect(result.failed).toContain('invalid');
    expect(result.failed).toContain('813000000');
    expect(result.details).toHaveLength(mixedNumbers.length);
  });
});