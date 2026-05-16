/**
 * Valida se um número de telefone angolano é válido.
 * 
 * @param phoneNumber - Número a ser validado
 * @returns `true` se for válido, `false` caso contrário
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\s/g, '');
  const localPattern = /^9\d{8}$/;
  const internationalPattern = /^\+244\d{9}$/;
  
  return localPattern.test(cleaned) || internationalPattern.test(cleaned);
}

/**
 * Valida múltiplos números de telefone.
 * 
 * @param phoneNumbers - Array de números a serem validados
 * @returns Objeto com arrays de números válidos e inválidos
 */
export function validatePhoneNumbers(phoneNumbers: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  for (const phone of phoneNumbers) {
    if (validatePhoneNumber(phone)) {
      valid.push(phone);
    } else {
      invalid.push(phone);
    }
  }
  
  return { valid, invalid };
}

/**
 * Normaliza número para formato internacional (+244...).
 * 
 * @param phoneNumber - Número a ser normalizado
 * @returns Número no formato +244XXXXXXXXX
 * 
 */
export function normalizeToInternational(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\s/g, '');
  
  if (cleaned.startsWith('+244')) return cleaned;
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  if (cleaned.match(/^9\d{8}$/)) return `+244${cleaned}`;
  
  return `+244${cleaned}`;
}

/**
 * Normaliza número para formato nacional (sem +244).
 * 
 * @param phoneNumber - Número a ser normalizado
 * @returns Número no formato de 9 dígitos
 * 
 */
export function normalizeToNational(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\s/g, '');
  
  if (cleaned.startsWith('+244')) cleaned = cleaned.slice(4);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  
  return cleaned.slice(-9);
}
/**
 * Normaliza um número de telefone.
 * 
 * @param phoneNumber - Número a ser normalizado
 * @param internacional - Se `true`, usa formato internacional (+244). Padrão: `false` (nacional)
 * @returns Número normalizado
 */
export function normalizePhoneNumber(
  phoneNumber: string, 
  internacional: boolean = false
): string {
  return internacional ? normalizeToInternational(phoneNumber) : normalizeToNational(phoneNumber);
}

/**
 * Normaliza múltiplos números de telefone.
 * 
 * @param phoneNumbers - Array de números a serem normalizados
 * @param internacional - Se `true`, usa formato internacional (+244). Padrão: `false` (nacional)
 * @returns Array de números normalizados
 */
export function normalizePhoneNumbers(
  phoneNumbers: string[], 
  internacional: boolean = false
): string[] {
  return phoneNumbers.map(phone => normalizePhoneNumber(phone, internacional));
}