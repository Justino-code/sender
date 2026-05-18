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
  fallbackProviders: ["telcosms"],  // opcional
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
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

// Exemplo com Ombala
const smsOmbala = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
    timeout: 10000,
  },
});

// Exemplo com TelcoSMS
const smsTelco = await createSender({
  providerName: "telcosms",
  providerConfig: {
    token: process.env.TELCOSMS_API_KEY,
    baseUrl: "https://www.telcosms.co.ao",
    timeout: 10000,
  },
});
```

### Provider Ombala (configuração mínima)

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});
```

### Provider TelcoSMS (configuração mínima)

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("telcosms", {
  token: process.env.TELCOSMS_API_KEY,
  baseUrl: "https://www.telcosms.co.ao",
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

### Com Ombala

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
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

### Com TelcoSMS

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("telcosms", {
  token: process.env.TELCOSMS_API_KEY,
  baseUrl: "https://www.telcosms.co.ao",
});

const result = await sms.send({
  to: "923000000",
  message: "Olá mundo!",
});

console.log(result.success ? "✅ Enviado" : "❌ Falha");
```

## Envio em lote

### Ombala (batch nativo)

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
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

### TelcoSMS (implementação base)

Como a TelcoSMS não possui batch nativo, o envio em lote é feito através de múltiplas chamadas individuais:

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);
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

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
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

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

const phone = "923000000";

// Validar número
if (validatePhoneNumber(phone)) {
  // Normalizar para formato nacional (Ombala)
  const national = normalizePhoneNumber(phone);  // "923000000"
  
  // Normalizar para formato internacional (TelcoSMS)
  const international = normalizePhoneNumber(phone, true);  // "+244923000000"
  
  await sms.send({
    to: phone,
    message: "Olá!",
  });
} else {
  console.error("Número inválido");
}
```

### Funções de normalização

| Função | Descrição | Exemplo |
|--------|-----------|---------|
| `normalizePhoneNumber(phone)` | Normaliza para nacional (Ombala) | `"923000000"` |
| `normalizePhoneNumber(phone, true)` | Normaliza para internacional (TelcoSMS) | `"+244923000000"` |
| `normalizePhoneNumbers(phones)` | Lote nacional | `["923000001", "923000002"]` |
| `normalizePhoneNumbers(phones, true)` | Lote internacional | `["+244923000001", "+244923000002"]` |

## Fallback automático (com arquivo de configuração)

Configure fallback entre providers estáveis:

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["telcosms"],
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
    },
  },
});
```

```typescript
// app.ts
const sms = await createSender();  // fallback automático!

// Se Ombala falhar, tenta TelcoSMS automaticamente
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