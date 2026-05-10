import { describe, it, expect } from 'vitest';
import { 
  validatePhoneNumber, 
  validatePhoneNumbers,
  normalizePhoneNumber, 
  normalizePhoneNumbers 
} from '../../../src/shared/utils/index.js';

describe('Utils - Validação de telefone angolano', () => {
  describe('validatePhoneNumber', () => {
    it('deve validar números no formato local (9 dígitos)', () => {
      expect(validatePhoneNumber('923000000')).toBe(true);
      expect(validatePhoneNumber('933000000')).toBe(true);
      expect(validatePhoneNumber('943000000')).toBe(true);
      expect(validatePhoneNumber('999999999')).toBe(true);
    });

    it('deve validar números no formato internacional (+244 + 9 dígitos)', () => {
      expect(validatePhoneNumber('+244923000000')).toBe(true);
      expect(validatePhoneNumber('+244933000000')).toBe(true);
      expect(validatePhoneNumber('+244943000000')).toBe(true);
      expect(validatePhoneNumber('+244999999999')).toBe(true);
    });

    it('deve rejeitar números inválidos', () => {
      expect(validatePhoneNumber('92300000')).toBe(false);    // 8 dígitos
      expect(validatePhoneNumber('9230000000')).toBe(false);  // 10 dígitos
      expect(validatePhoneNumber('813000000')).toBe(false);   // Começa com 8
      expect(validatePhoneNumber('+24492300000')).toBe(false); // +244 + 8 dígitos
      expect(validatePhoneNumber('+2449230000000')).toBe(false); // +244 + 10 dígitos
      expect(validatePhoneNumber('')).toBe(false);
    });

    it('deve ignorar espaços na validação', () => {
      expect(validatePhoneNumber('923 000 000')).toBe(true);
      expect(validatePhoneNumber('+244 923 000 000')).toBe(true);
    });
  });

  describe('validatePhoneNumbers', () => {
    it('deve separar números válidos e inválidos', () => {
      const result = validatePhoneNumbers([
        '923000000',      // válido local
        '+244933000000',  // válido internacional
        '813000000',      // inválido
        '123',            // inválido
      ]);
      
      expect(result.valid).toEqual(['923000000', '+244933000000']);
      expect(result.invalid).toEqual(['813000000', '123']);
    });

    it('deve retornar arrays vazios quando não há números', () => {
      const result = validatePhoneNumbers([]);
      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
    });
  });

  describe('normalizePhoneNumber', () => {
    it('deve normalizar números locais (9 dígitos)', () => {
      expect(normalizePhoneNumber('923000000')).toBe('+244923000000');
      expect(normalizePhoneNumber('933000000')).toBe('+244933000000');
    });

    it('deve normalizar números com 0', () => {
      expect(normalizePhoneNumber('0923000000')).toBe('+244923000000');
    });

    it('deve manter números já internacionais', () => {
      expect(normalizePhoneNumber('+244923000000')).toBe('+244923000000');
    });

    it('deve remover espaços', () => {
      expect(normalizePhoneNumber('923 000 000')).toBe('+244923000000');
      expect(normalizePhoneNumber('+244 923 000 000')).toBe('+244923000000');
    });
  });

  describe('normalizePhoneNumbers', () => {
    it('deve normalizar múltiplos números', () => {
      const result = normalizePhoneNumbers([
        '923000000',
        '0933000000',
        '+244943000000'
      ]);
      
      expect(result).toEqual([
        '+244923000000',
        '+244933000000',
        '+244943000000'
      ]);
    });
  });
});