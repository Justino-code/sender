# Primeiros passos

## Instalação

```bash
yarn add sender
# ou
npm install sender
```

## Configuração

### Provider Ombala

```typescript
import { createSender } from "sender";

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});
```

### Provider KambaSMS

```typescript
import { createSender } from "sender";

const sms = createSender({
  providerName: "kambasms",
  providerConfig: {
    token: process.env.KAMBASMS_API_KEY,
    baseUrl: "https://api.kambasms.ao/v1",
    timeout: 10000,
    data: {
      senderId: "MEUAPP",
    },
  },
});
```

### Parâmetros de configuração

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `token` | `string` | ✅ Sim | - | API key ou token de acesso |
| `baseUrl` | `string` | ✅ Sim | - | URL base da API do provider |
| `timeout` | `number` | ❌ Não | `10000` | Timeout em milissegundos |
| `data` | `object` | ❌ Não | `{}` | Configurações específicas do provider |

## Primeiro envio

```typescript
const result = await sms.send({
  from: "LEVAJA",
  to: "923000000",
  message: "Olá mundo!",
});

if (result.success) {
  console.log(`✅ Enviado! ID: ${result.messageId}`);
} else {
  console.log(`❌ Falha no envio`);
}
```

## Envio em lote

```typescript
const result = await sms.sendBatch({
  from: "LEVAJA",
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);

// Resultado individual
result.details?.forEach((detail) => {
  if (detail.messageId) {
    console.log(`✓ ${detail.to}: ${detail.messageId}`);
  } else {
    console.log(`✗ ${detail.to}: ${detail.error}`);
  }
});
```

## Tratamento de erros

```typescript
import { 
  AuthenticationError, 
  RateLimitError, 
  ValidationError,
  ProviderError,
  TimeoutError 
} from "sender";

try {
  await sms.send({
    from: "LEVAJA",
    to: "923000000",
    message: "Teste",
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Token inválido ou expirado");
  } else if (error instanceof RateLimitError) {
    console.error("Limite de requisições excedido");
  } else if (error instanceof ValidationError) {
    console.error("Número de telefone inválido");
  } else if (error instanceof TimeoutError) {
    console.error("Tempo limite excedido");
  } else if (error instanceof ProviderError) {
    console.error("Erro no provider:", error.message);
  } else {
    console.error("Erro desconhecido:", error.message);
  }
}
```

## Validar números antes de enviar

```typescript
import { validatePhoneNumber, normalizePhoneNumber } from "sender";

const phone = "923000000";

if (validatePhoneNumber(phone)) {
  const normalized = normalizePhoneNumber(phone); // +244923000000
  await sms.send({
    from: "LEVAJA",
    to: phone,
    message: "Olá!",
  });
} else {
  console.error("Número inválido");
}
```

## Próximos passos

- [API Reference](./api.md) - Conheça todas as funções e tipos
- [Providers](./providers.md) - Detalhes específicos de cada gateway
- [Provider customizado](./custom-provider.md) - Crie seu próprio provider