# Utilitários

Funções auxiliares para manipulação de números de telefone angolanos.

## validatePhoneNumber

Valida se um número segue o padrão angolano.

```typescript
function validatePhoneNumber(phone: string): boolean
```

### Formatos aceitos

| Formato | Exemplo | Válido |
|---------|---------|--------|
| Local (9 dígitos) | `"923000000"` | ✅ |
| Com 0 | `"0923000000"` | ✅ |
| Internacional | `"+244923000000"` | ✅ |
| Com espaços | `"923 000 000"` | ✅ |
| Inválido (começa com 8) | `"813000000"` | ❌ |
| Inválido (menos dígitos) | `"92300000"` | ❌ |

### Exemplo

```typescript
import { validatePhoneNumber } from "@jcsolutions/sender";

validatePhoneNumber("923000000");      // true
validatePhoneNumber("813000000");      // false
validatePhoneNumber("+244923000000");  // true
validatePhoneNumber("0923000000");     // true
validatePhoneNumber("923 000 000");    // true
```

### Uso prático

```typescript
const phone = "923000000";

if (validatePhoneNumber(phone)) {
  console.log("✅ Número válido");
  await sms.send({ to: phone, message: "Olá!" });
} else {
  console.error("❌ Número inválido");
}
```

---

## validatePhoneNumbers

Valida múltiplos números e separa válidos de inválidos.

```typescript
function validatePhoneNumbers(phones: string[]): { valid: string[]; invalid: string[] }
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `phones` | `string[]` | Array de números a validar |

### Retorno

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `valid` | `string[]` | Números válidos |
| `invalid` | `string[]` | Números inválidos |

### Exemplo

```typescript
import { validatePhoneNumbers } from "@jcsolutions/sender";

const { valid, invalid } = validatePhoneNumbers([
  "923000001",
  "813000000",
  "933000002",
  "invalid",
]);

console.log(valid);   // ['923000001', '933000002']
console.log(invalid); // ['813000000', 'invalid']
```

### Uso prático

```typescript
const phones = ["923000001", "invalid", "813000000", "923000002"];
const { valid, invalid } = validatePhoneNumbers(phones);

console.log(`✅ Válidos: ${valid.length}`);
console.log(`❌ Inválidos: ${invalid.length}`);

if (valid.length > 0) {
  await sms.sendBatch({ to: valid, message: "Promoção!" });
}
```

---

## normalizePhoneNumber

Normaliza o número para o formato internacional `+244XXXXXXXXX`.

```typescript
function normalizePhoneNumber(phone: string): string
```

### Transformações

| Entrada | Saída |
|---------|-------|
| `"923000000"` | `"+244923000000"` |
| `"0923000000"` | `"+244923000000"` |
| `"+244923000000"` | `"+244923000000"` |
| `"923 000 000"` | `"+244923000000"` |

### Exemplo

```typescript
import { normalizePhoneNumber } from "@jcsolutions/sender";

normalizePhoneNumber("923000000");     // "+244923000000"
normalizePhoneNumber("0923000000");    // "+244923000000"
normalizePhoneNumber("+244923000000"); // "+244923000000"
```

### Uso prático

```typescript
const phone = "923000000";
const normalized = normalizePhoneNumber(phone);

// Para providers que exigem formato internacional (ex: KambaSMS)
await sms.send({ to: normalized, message: "Olá!" });
```

---

## normalizePhoneNumbers

Normaliza múltiplos números.

```typescript
function normalizePhoneNumbers(phones: string[]): string[]
```

### Exemplo

```typescript
import { normalizePhoneNumbers } from "@jcsolutions/sender";

const normalized = normalizePhoneNumbers([
  "923000001",
  "0933000002",
  "+244943000003",
]);

// Resultado: ['+244923000001', '+244933000002', '+244943000003']
```

### Uso prático

```typescript
const phones = ["923000001", "923000002", "923000003"];
const normalized = normalizePhoneNumbers(phones);

await sms.sendBatch({ to: normalized, message: "Lote normalizado!" });
```

---

## Funções específicas por provider

### Para Ombala (formato nacional)

A Ombala não aceita o código do país. Use o número limpo (9 dígitos):

```typescript
// Ombala quer apenas 9 dígitos
const phone = "923000000";  // ← sem +244

await ombalaSms.send({ to: phone, message: "Olá!" });
```

### Para KambaSMS (formato internacional)

A KambaSMS exige o código do país:

```typescript
// KambaSMS quer formato internacional
const phone = normalizePhoneNumber("923000000");  // +244923000000

await kambasms.send({ to: phone, message: "Olá!" });
```

---

## Exemplo completo

```typescript
import {
  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
  normalizePhoneNumbers,
  createSender,
} from "@jcsolutions/sender";

const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://api.kambasms.ao/v1",
});

// Validar e normalizar antes de enviar
async function sendToPhone(phone: string, message: string) {
  if (!validatePhoneNumber(phone)) {
    throw new Error(`Número inválido: ${phone}`);
  }
  
  const normalized = normalizePhoneNumber(phone);
  return sms.send({ to: normalized, message });
}

// Enviar para múltiplos números
async function sendBatchToPhones(phones: string[], message: string) {
  const { valid, invalid } = validatePhoneNumbers(phones);
  
  if (invalid.length > 0) {
    console.warn(`Números inválidos ignorados: ${invalid.join(", ")}`);
  }
  
  if (valid.length === 0) {
    throw new Error("Nenhum número válido");
  }
  
  const normalized = normalizePhoneNumbers(valid);
  return sms.sendBatch({ to: normalized, message });
}
```

## Próxima secção

- [Erros](./errors.md)