# Utilitários

Funções auxiliares para manipulação de números de telefone angolanos.

## validatePhoneNumber

Valida se um número segue o padrão angolano.

```typescript
function validatePhoneNumber(phoneNumber: string): boolean
```

| Formato | Exemplo |
|---------|---------|
| Local | `"923000000"` |
| Com 0 | `"0923000000"` |
| Internacional | `"+244923000000"` |
| Com espaços | `"923 000 000"` |

---

## validatePhoneNumbers

Valida múltiplos números.

```typescript
function validatePhoneNumbers(phoneNumbers: string[]): { valid: string[]; invalid: string[] }
```

---

## normalizeToInternational

Normaliza número para formato internacional `+244...`.

```typescript
function normalizeToInternational(phoneNumber: string): string
```

| Entrada | Saída |
|---------|-------|
| `"923000000"` | `"+244923000000"` |
| `"0923000000"` | `"+244923000000"` |
| `"+244923000000"` | `"+244923000000"` |

---

## normalizeToNational

Normaliza número para formato nacional (sem `+244`).

```typescript
function normalizeToNational(phoneNumber: string): string
```

| Entrada | Saída |
|---------|-------|
| `"+244923000000"` | `"923000000"` |
| `"0923000000"` | `"923000000"` |
| `"923000000"` | `"923000000"` |

---

## normalizePhoneNumber

Normaliza um número (alias unificado).

```typescript
function normalizePhoneNumber(phoneNumber: string, internacional?: boolean): string
```

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `internacional` | `false` | `true` = formato internacional, `false` = nacional |

---

## normalizePhoneNumbers

Normaliza múltiplos números.

```typescript
function normalizePhoneNumbers(phoneNumbers: string[], internacional?: boolean): string[]
```

---

## Exemplo completo

```typescript
import {
  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
  normalizePhoneNumbers,
} from "@jcsolutions/sender";

// Validar antes de enviar
const phone = "923000000";
if (validatePhoneNumber(phone)) {
  const normalized = normalizePhoneNumber(phone, true);
  await sms.send({ to: normalized, message: "Olá!" });
}

// Filtrar e normalizar lote
const phones = ["923000001", "invalid", "813000000", "923000002"];
const { valid, invalid } = validatePhoneNumbers(phones);

if (invalid.length > 0) {
  console.log(`Ignorados: ${invalid.join(", ")}`);
}

const normalized = normalizePhoneNumbers(valid, true);
await sms.sendBatch({ to: normalized, message: "Promoção!" });
```

## Próxima secção

- [Erros](./errors.md)