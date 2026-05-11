# Validação de números

Valide números antes de enviar para evitar erros desnecessários e economizar créditos.

## Validar um único número

```typescript
import { validatePhoneNumber } from "@jcsolutions/sender";

const phone = "923000000";

if (validatePhoneNumber(phone)) {
  console.log("✅ Número válido");
} else {
  console.error("❌ Número inválido");
}
```

## Validar antes de enviar

```typescript
import { createSender, validatePhoneNumber } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

async function sendValidated(phone: string, message: string) {
  if (!validatePhoneNumber(phone)) {
    console.error(`❌ ${phone} não é um número angolano válido`);
    return;
  }

  const result = await sms.send({ to: phone, message });
  console.log(result.success ? "✅ Enviado" : "❌ Falha");
}
```

## Validar múltiplos números

```typescript
import { validatePhoneNumbers } from "@jcsolutions/sender";

const phones = ["923000001", "813000000", "933000002", "invalid"];

const { valid, invalid } = validatePhoneNumbers(phones);

console.log("✅ Válidos:", valid);     // ['923000001', '933000002']
console.log("❌ Inválidos:", invalid); // ['813000000', 'invalid']
```

## Filtrar e enviar apenas válidos

```typescript
import { createSender, validatePhoneNumbers } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

const phones = ["923000001", "invalid", "813000000", "923000002"];

// Filtrar números válidos
const { valid, invalid } = validatePhoneNumbers(phones);

if (invalid.length > 0) {
  console.log(`⚠️ Ignorados: ${invalid.join(", ")}`);
}

if (valid.length > 0) {
  const result = await sms.sendBatch({
    to: valid,
    message: "Mensagem apenas para números válidos!",
  });
  console.log(`✅ Enviados: ${result.successful.length}`);
}
```

## Normalizar números

```typescript
import { normalizePhoneNumber, normalizePhoneNumbers } from "@jcsolutions/sender";

// Único número
normalizePhoneNumber("923000000");     // "+244923000000"
normalizePhoneNumber("0923000000");    // "+244923000000"
normalizePhoneNumber("+244923000000"); // "+244923000000"

// Múltiplos números
const normalized = normalizePhoneNumbers([
  "923000001",
  "0933000002",
  "+244943000003",
]);
// Resultado: ['+244923000001', '+244933000002', '+244943000003']
```

## Função completa de validação e envio

```typescript
import { validatePhoneNumbers, normalizePhoneNumbers, createSender } from "@jcsolutions/sender";

async function sendToValidPhones(phones: string[], message: string) {
  const { valid, invalid } = validatePhoneNumbers(phones);

  if (invalid.length > 0) {
    console.log(`⚠️ Números inválidos ignorados: ${invalid.join(", ")}`);
  }

  if (valid.length === 0) {
    console.log("❌ Nenhum número válido para enviar");
    return;
  }

  const normalizedPhones = normalizePhoneNumbers(valid);
  console.log(`📞 Enviando para: ${normalizedPhones.join(", ")}`);

  const sms = await createSender("ombala", {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  });

  const result = await sms.sendBatch({
    to: valid,
    message,
  });

  console.log(`✅ Enviados: ${result.successful.length}`);
  return result;
}

// Uso
await sendToValidPhones(
  ["923000001", "invalid", "813000000", "923000002"],
  "Mensagem apenas para números válidos!"
);
```

## Formato aceito

| Formato | Exemplo | Válido |
|---------|---------|--------|
| Local (9 dígitos) | `923000000` | ✅ |
| Com 0 | `0923000000` | ✅ |
| Internacional | `+244923000000` | ✅ |
| Com espaços | `923 000 000` | ✅ |
| Inválido | `813000000` | ❌ |

## Próximo exemplo

- [Fallback automático (config)](../fallback/automatic.md)