# Primeiros passos

## Instalação

```bash
yarn add @jcsolutions/sender
# ou
npm install @jcsolutions/sender
```

## Configuração

### Configuração rápida (recomendado)

Crie um arquivo `sender.config.ts` na raiz do projeto:

```typescript
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms"],  // opcional
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://api.kambasms.ao/v1",
    },
  },
});
```

Depois use de forma simples:

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender();  // usa configuração do arquivo

await sms.send({
  to: "923000000",
  message: "Olá mundo!",
});
```

### Configuração direta (sem arquivo)

Se preferir, pode passar a configuração diretamente:

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
    timeout: 10000,
  },
});
```

### Provider Ombala (configuração mínima)

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
});
```

### Provider KambaSMS (configuração mínima)

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "kambasms",
  providerConfig: {
    token: process.env.KAMBASMS_TOKEN,
    baseUrl: "https://api.kambasms.ao/v1",
  },
});
```

### Parâmetros de configuração

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `token` | `string` | ✅ Sim | - | API key ou token de acesso |
| `baseUrl` | `string` | ✅ Sim | - | URL base da API do provider |
| `timeout` | `number` | ❌ Não | `10000` | Timeout em milissegundos |
| `from` | `string` | ⚠️ Para Ombala | - | Remetente da mensagem |
| `data` | `object` | ❌ Não | `{}` | Configurações específicas do provider |

## Primeiro envio

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
});

const result = await sms.send({
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
  createSender,
  AuthenticationError, 
  RateLimitError, 
  ValidationError,
  ProviderError,
  TimeoutError 
} from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
});

try {
  await sms.send({
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
import { validatePhoneNumber, normalizePhoneNumber, createSender } from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
});

const phone = "923000000";

if (validatePhoneNumber(phone)) {
  const normalized = normalizePhoneNumber(phone); // +244923000000
  await sms.send({
    to: phone,
    message: "Olá!",
  });
} else {
  console.error("Número inválido");
}
```

## Fallback automático (com arquivo de configuração)

Se tiver um `sender.config.ts` com fallback configurado:

```typescript
// sender.config.ts
export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms"],
  providers: { ... }
});
```

```typescript
// app.ts
const sms = await createSender();  // fallback automático!

// Se Ombala falhar, tenta KambaSMS automaticamente
await sms.send({
  to: "923000000",
  message: "Mensagem com fallback!",
});
```

## Próximos passos

- [Configuração avançada](./configuration.md) - Configuração centralizada e fallback
- [API Reference](./api.md) - Todas as funções e tipos
- [Providers](./providers.md) - Detalhes específicos de cada gateway
- [Provider customizado](./custom-provider.md) - Crie seu próprio provider
- [Exemplos práticos](./examples.md) - Códigos completos prontos para usar