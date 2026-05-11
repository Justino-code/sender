// tests/e2e/ombala.batch.e2e.test.ts
import { describe, it, expect } from 'vitest';
import { createSender, ValidationError, AuthenticationError, ProviderError } from '../../src/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const hasCredentials = !!process.env.OMBALA_TOKEN && !!process.env.OMBALA_BASE_URL;
const testPhones = ['931459010', '926926937'];

describe.skipIf(!hasCredentials)('E2E - Ombala Batch', () => {
  it('deve enviar SMS em lote com sucesso (apenas um teste real)', async () => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           TESTE DE ENVIO EM LOTE - OMBALA API               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // 1. Configuração
    console.log('📋 1. CONFIGURAÇÃO DO TESTE');
    console.log('   ┌─────────────────────────────────────────────────────────');
    console.log(`   │ Provider: Ombala`);
    console.log(`   │ From: 943811042`);
    console.log(`   │ Token: ${process.env.OMBALA_TOKEN!.substring(0, 15)}...`);
    console.log(`   │ Base URL: ${process.env.OMBALA_BASE_URL}`);
    console.log(`   │ Timeout: 15000ms`);
    console.log('   └─────────────────────────────────────────────────────────\n');

    // 2. Números testados
    console.log('📞 2. NÚMEROS DESTINATÁRIOS');
    console.log('   ┌─────────────────────────────────────────────────────────');
    testPhones.forEach((phone, index) => {
      console.log(`   │ ${index + 1}. ${phone}`);
    });
    console.log(`   │ Total: ${testPhones.length} números`);
    console.log('   └─────────────────────────────────────────────────────────\n');

    // 3. Criar provider
    console.log('🔧 3. CRIANDO PROVIDER');
    console.log('   ┌─────────────────────────────────────────────────────────');
    
    const sms = await createSender('ombala', {
      token: process.env.OMBALA_TOKEN!,
      baseUrl: process.env.OMBALA_BASE_URL!,
      from: '943811042',
      timeout: 15000,
    });
    
    console.log('   │ ✅ Provider criado com sucesso');
    console.log('   └─────────────────────────────────────────────────────────\n');

    // 4. Enviar mensagem
    const message = `[TESTE BATCH] Ombala: ${new Date().toISOString()}`;
    console.log('📤 4. ENVIANDO MENSAGEM EM LOTE');
    console.log('   ┌─────────────────────────────────────────────────────────');
    console.log(`   │ Mensagem: "${message}"`);
    console.log(`   │ Tamanho: ${message.length} caracteres`);
    console.log('   └─────────────────────────────────────────────────────────\n');

    const startTime = Date.now();

    try {
      const result = await sms.sendBatch({
        to: testPhones,
        message: message,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 5. Resultado
      console.log('✅ 5. RESULTADO DO ENVIO');
      console.log('   ┌─────────────────────────────────────────────────────────');
      console.log(`   │ Status: ${result.success ? 'SUCESSO' : 'FALHA'}`);
      console.log(`   │ Provider: ${result.provider}`);
      console.log(`   │ Tempo total: ${duration}ms`);
      console.log('   └─────────────────────────────────────────────────────────\n');

      // 6. Estatísticas
      console.log('📊 6. ESTATÍSTICAS DO LOTE');
      console.log('   ┌─────────────────────────────────────────────────────────');
      console.log(`   │ Total enviados: ${testPhones.length}`);
      console.log(`   │ Sucessos: ${result.successful.length}`);
      console.log(`   │ Falhas: ${result.failed.length}`);
      console.log(`   │ Taxa de sucesso: ${(result.successful.length / testPhones.length * 100).toFixed(1)}%`);
      console.log('   └─────────────────────────────────────────────────────────\n');

      // 7. Detalhes individuais
      console.log('📝 7. DETALHES INDIVIDUAIS');
      console.log('   ┌─────────────────────────────────────────────────────────');
      if (result.details) {
        result.details.forEach((detail, index) => {
          if (detail.messageId) {
            console.log(`   │ ✅ ${detail.to}:`);
            console.log(`   │    Message ID: ${detail.messageId}`);
          } else if (detail.error) {
            console.log(`   │ ❌ ${detail.to}:`);
            console.log(`   │    Erro: ${detail.error}`);
          }
        });
      }
      console.log('   └─────────────────────────────────────────────────────────\n');

      // 8. Resposta completa da API
      if (result.raw) {
        console.log('🔍 8. RESPOSTA COMPLETA DA API (RAW)');
        console.log('   ┌─────────────────────────────────────────────────────────');
        const rawStr = JSON.stringify(result.raw, null, 2);
        rawStr.split('\n').forEach(line => {
          console.log(`   │ ${line}`);
        });
        console.log('   └─────────────────────────────────────────────────────────\n');
      }

      // 9. Análise dos recipients
      if (result.raw?.recipients) {
        console.log('📨 9. ANÁLISE DOS RECIPIENTS');
        console.log('   ┌─────────────────────────────────────────────────────────');
        result.raw.recipients.forEach((recipient: any, index: number) => {
          console.log(`   │ Destinatário ${index + 1}:`);
          console.log(`   │   Telefone: ${recipient.phone_number}`);
          console.log(`   │   Status: ${recipient.message_status}`);
          console.log(`   │   Message ID: ${recipient.message_id}`);
          console.log(`   │   ─────────────────────────────────────`);
        });
        console.log('   └─────────────────────────────────────────────────────────\n');
      }

      // 10. Custos (se disponível)
      if (result.raw?.cost) {
        console.log('💰 10. INFORMAÇÕES DE CUSTO');
        console.log('   ┌─────────────────────────────────────────────────────────');
        console.log(`   │ Custo total: ${result.raw.cost} KZ`);
        console.log(`   │ Tamanho: ${result.raw.size} caracteres`);
        console.log(`   │ Partes: ${result.raw.parts}`);
        console.log('   └─────────────────────────────────────────────────────────\n');
      }

      // Assertions
      expect(result.success).toBe(true);
      expect(result.provider).toBe('ombala');
      expect(result.successful.length).toBeGreaterThan(0);
      expect(result.details).toBeDefined();

    } catch (error) {
      // Tratamento de erro detalhado
      console.log('❌ ERRO DURANTE O ENVIO');
      console.log('   ┌─────────────────────────────────────────────────────────');
      
      if (error instanceof ValidationError) {
        console.log(`   │ Tipo: ValidationError`);
        console.log(`   │ Mensagem: ${error.message}`);
        console.log(`   │ Status HTTP: ${error.status || 'N/A'}`);
        if (error.response) {
          console.log(`   │ Resposta da API:`);
          const responseStr = JSON.stringify(error.response, null, 2);
          responseStr.split('\n').forEach(line => {
            console.log(`   │   ${line}`);
          });
        }
      } else if (error instanceof AuthenticationError) {
        console.log(`   │ Tipo: AuthenticationError`);
        console.log(`   │ Mensagem: ${error.message}`);
        console.log(`   │ Status HTTP: ${error.status || 'N/A'}`);
        if (error.response) {
          console.log(`   │ Resposta da API:`);
          const responseStr = JSON.stringify(error.response, null, 2);
          responseStr.split('\n').forEach(line => {
            console.log(`   │   ${line}`);
          });
        }
      } else if (error instanceof ProviderError) {
        console.log(`   │ Tipo: ProviderError`);
        console.log(`   │ Mensagem: ${error.message}`);
        console.log(`   │ Status HTTP: ${error.status || 'N/A'}`);
        if (error.response) {
          console.log(`   │ Resposta da API:`);
          const responseStr = JSON.stringify(error.response, null, 2);
          responseStr.split('\n').forEach(line => {
            console.log(`   │   ${line}`);
          });
        }
      } else {
        console.log(`   │ Tipo: Erro desconhecido`);
        console.log(`   │ Mensagem: ${error.message}`);
      }
      
      console.log('   └─────────────────────────────────────────────────────────\n');
      throw error;
    }
  });
});