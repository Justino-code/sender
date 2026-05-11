# Envio em lote

Envie a mesma mensagem para múltiplos destinatários de uma só vez.

## Com Ombala (batch nativo)

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

const phones = ["923000001", "923000002", "923000003"];

const result = await sms.sendBatch({
  to: phones,
  message: "Promoção especial! Desconto de 20% hoje.",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);

// Detalhes individuais
result.details?.forEach((detail) => {
  if (detail.messageId) {
    console.log(`✓ ${detail.to}: ${detail.messageId}`);
  } else {
    console.log(`✗ ${detail.to}: ${detail.error}`);
  }
});
```

## Com KambaSMS (implementação base)

A KambaSMS não possui batch nativo documentado, então usa múltiplas chamadas individuais:

```typescript
const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://api.kambasms.ao/v1",
});

const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
});
```

## Resposta do batch

```json
{
  "success": true,
  "provider": "ombala",
  "successful": ["923000001", "923000002", "923000003"],
  "failed": [],
  "details": [
    { "to": "923000001", "messageId": "abc-123" },
    { "to": "923000002", "messageId": "def-456" },
    { "to": "923000003", "messageId": "ghi-789" }
  ]
}
```

## Com números inválidos

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "invalid", "813000000", "923000002"],
  message: "Teste",
});

console.log(`✅ Válidos: ${result.successful.length}`);  // 2
console.log(`❌ Inválidos: ${result.failed.length}`);    // 2
console.log('Falhas:', result.failed);  // ['invalid', '813000000']
```

## Próximo exemplo

- [Tratamento de erros completo](../error-handling/full.md)