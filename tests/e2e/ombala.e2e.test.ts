import { describe, it, expect } from 'vitest';
import { createSender, ValidationError, AuthenticationError, ProviderError } from '../../src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carregar .env.test da pasta tests
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const hasCredentials = !!process.env.OMBALA_TOKEN && !!process.env.OMBALA_BASE_URL;
const testPhone = process.env.TEST_PHONE_NUMBER || '931459010';

describe.skipIf(!hasCredentials)('E2E - Ombala Provider', () => {
  it('deve enviar SMS com sucesso', async () => {
    const sms = await createSender('ombala', {
      token: process.env.OMBALA_TOKEN!,
      baseUrl: process.env.OMBALA_BASE_URL!,
      from: '943811042',
      timeout: 15000,
    });    

    try {
      const result = await sms.send({
        to: testPhone,
        message: `[TESTE] Ombala: ${new Date().toISOString()}`,
      });

      console.log('✅ Resposta de sucesso:', JSON.stringify(result, null, 2));

      expect(result.success).toBe(true);
      expect(result.provider).toBe('ombala');
      expect(result.messageId).toBeDefined();
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('❌ Erro de validação da API:');
        console.error('   Mensagem:', error.message);
        console.error('   Status:', error.status);
        console.error('   Resposta completa:', JSON.stringify(error.response, null, 2));
      } else if (error instanceof AuthenticationError) {
        console.error('❌ Erro de autenticação:');
        console.error('   Mensagem:', error.message);
        console.error('   Status:', error.status);
        console.error('   Resposta completa:', JSON.stringify(error.response, null, 2));
      } else if (error instanceof ProviderError) {
        console.error('❌ Erro do provider:');
        console.error('   Mensagem:', error.message);
        console.error('   Status:', error.status);
        console.error('   Resposta completa:', JSON.stringify(error.response, null, 2));
      } else {
        console.error('❌ Erro inesperado:', error);
      }
      throw error; // Re-lança para o teste falhar
    }
  });

  it('deve lançar ValidationError para número inválido (validação local)', async () => {
    const sms = await createSender('ombala', {
      token: process.env.OMBALA_TOKEN!,
      baseUrl: process.env.OMBALA_BASE_URL!,
      from: process.env.OMBALA_FROM || 'TESTE',
    });

    await expect(
      sms.send({
        to: '123',
        message: 'Teste',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('deve lançar AuthenticationError para token inválido', async () => {
    const sms = await createSender('ombala', {
      token: 'token-invalido',
      baseUrl: process.env.OMBALA_BASE_URL!,
      from: 'TESTE',
    });

    await expect(
      sms.send({
        to: testPhone,
        message: 'Teste',
      })
    ).rejects.toThrow(AuthenticationError);
  });
});