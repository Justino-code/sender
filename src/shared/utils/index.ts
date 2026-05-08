// Valida números no formato local (9 dígitos, começa com 9)
export function validatePhoneNumber(to: string): boolean {
  // Remove espaços e caracteres especiais
  const cleaned = to.replace(/\s/g, '');
  
  // Aceita números com ou sem +244, mas valida o padrão angolano
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

export function normalizePhoneNumber(to: string): string {
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

export function normalizePhoneNumbers(to: string[]): string[] {
  return to.map(phone => normalizePhoneNumber(phone));
}