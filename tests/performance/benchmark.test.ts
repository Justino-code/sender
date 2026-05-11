import { describe, it, expect, benchmark } from 'vitest';
import { 
  validatePhoneNumber, 
  normalizePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumbers 
} from '../../src/index.js';

describe('Performance Benchmarks', () => {
  const numbers = Array.from({ length: 10000 }, (_, i) => `923${String(i).padStart(6, '0')}`);
  const mixedNumbers = [
    ...numbers,
    'invalid1',
    'invalid2',
    '+244923000000',
    '0923000000'
  ];

  describe('validatePhoneNumber', () => {
    it('deve validar 10.000 números em menos de 50ms', () => {
      const start = performance.now();
      
      for (const num of numbers) {
        validatePhoneNumber(num);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      console.log(`✓ validatePhoneNumber: ${duration.toFixed(2)}ms para ${numbers.length} números`);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('normalizePhoneNumber', () => {
    it('deve normalizar 10.000 números em menos de 50ms', () => {
      const start = performance.now();
      
      for (const num of numbers) {
        normalizePhoneNumber(num);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      console.log(`✓ normalizePhoneNumber: ${duration.toFixed(2)}ms para ${numbers.length} números`);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('validatePhoneNumbers (batch)', () => {
    it('deve validar lote de 10.000 números em menos de 50ms', () => {
      const start = performance.now();
      
      const result = validatePhoneNumbers(mixedNumbers);
      
      const end = performance.now();
      const duration = end - start;
      
      console.log(`✓ validatePhoneNumbers: ${duration.toFixed(2)}ms para ${mixedNumbers.length} números`);
      console.log(`  Válidos: ${result.valid.length}, Inválidos: ${result.invalid.length}`);
      expect(duration).toBeLessThan(50);
      expect(result.valid.length + result.invalid.length).toBe(mixedNumbers.length);
    });
  });

  describe('normalizePhoneNumbers (batch)', () => {
    it('deve normalizar lote de 10.000 números em menos de 50ms', () => {
      const start = performance.now();
      
      const result = normalizePhoneNumbers(mixedNumbers);
      
      const end = performance.now();
      const duration = end - start;
      
      console.log(`✓ normalizePhoneNumbers: ${duration.toFixed(2)}ms para ${mixedNumbers.length} números`);
      expect(duration).toBeLessThan(50);
      expect(result.length).toBe(mixedNumbers.length);
    });
  });

  describe('Comparação de performance', () => {
    it('normalizePhoneNumber deve ser tão rápido quanto validatePhoneNumber', () => {
      const validateStart = performance.now();
      for (const num of numbers) {
        validatePhoneNumber(num);
      }
      const validateTime = performance.now() - validateStart;

      const normalizeStart = performance.now();
      for (const num of numbers) {
        normalizePhoneNumber(num);
      }
      const normalizeTime = performance.now() - normalizeStart;

      console.log(`📊 Comparação (${numbers.length} números):`);
      console.log(`   validatePhoneNumber: ${validateTime.toFixed(2)}ms`);
      console.log(`   normalizePhoneNumber: ${normalizeTime.toFixed(2)}ms`);
      
      // Normalização pode ser um pouco mais lenta, mas não deve ser muito diferente
      expect(Math.abs(normalizeTime - validateTime)).toBeLessThan(validateTime * 2);
    });
  });
});