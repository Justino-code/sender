// Valida números no formato local (9 dígitos, começa com 9)
export function validatePhoneNumber(to: string): boolean {
  // Remove espaços e caracteres especiais
  const cleaned = to.replace(/\s/g, '');
  
  // Formatos aceites:
  // - 923000000 (9 dígitos, começa com 9)
  // - +244923000000 (formato internacional)
  const localPattern = /^9\d{8}$/;
  const internationalPattern = /^\+244\d{9}$/;
  
  return localPattern.test(cleaned) || internationalPattern.test(cleaned);
}

export function validatePhoneNumbers(to: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  for (const phone of to) {
    if (validatePhoneNumber(phone)) {
      valid.push(phone);
    } else {
      invalid.push(phone);
    }
  }
  
  return { valid, invalid };
}

/**
 * Normaliza número para formato internacional (+244...)
 * Exemplo: 923000000 → +244923000000
 * Uso: KambaSMS, Twilio, Infobip
 */
export function normalizeToInternational(to: string): string {
  // Remove espaços
  let cleaned = to.replace(/\s/g, '');
  
  // Se já estiver no formato internacional, retorna como está
  if (cleaned.startsWith('+244')) {
    return cleaned;
  }
  
  // Se começar com 0, remove o 0 e adiciona +244
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  
  // Se tiver 9 dígitos e começar com 9, adiciona +244
  if (cleaned.match(/^9\d{8}$/)) {
    return `+244${cleaned}`;
  }
  
  // Fallback: assume que é número local e adiciona +244
  return `+244${cleaned}`;
}

/**
 * Normaliza número para formato nacional (sem +244)
 * Exemplo: +244923000000 → 923000000
 * Uso: Ombala (não aceita +244)
 */
export function normalizeToNational(to: string): string {
  // Remove espaços
  let cleaned = to.replace(/\s/g, '');
  
  // Remove +244 se existir
  if (cleaned.startsWith('+244')) {
    cleaned = cleaned.slice(4);
  }
  
  // Remove 0 inicial se existir
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  
  // Retorna apenas os 9 dígitos
  return cleaned.slice(-9);
}

/**
 * @deprecated Use normalizeToInternational ou normalizeToNational
 */
export function normalizePhoneNumber(to: string): string {
  return normalizeToInternational(to);
}

export function normalizePhoneNumbers(to: string[]): string[] {
  return to.map(phone => normalizeToInternational(phone));
}

export function normalizeToInternationalBatch(to: string[]): string[] {
  return to.map(phone => normalizeToInternational(phone));
}

export function normalizeToNationalBatch(to: string[]): string[] {
  return to.map(phone => normalizeToNational(phone));
}