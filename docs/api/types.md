# Tipos e DTOs

## Bases

```typescript
type BaseMessageDto = {
  message: string;
  schedule?: string;
}

type BaseResponse = {
  success: boolean;
  provider: string;
  raw?: unknown;
}
```

---

## SendMessageDto

```typescript
type SendMessageDto = BaseMessageDto & {
  to: string;
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `to` | `string` | Número do destinatário |
| `message` | `string` | Texto da mensagem |
| `schedule` | `string` | Agendamento (formato: `yyyyMMddHHmmss`) |

---

## SendBatchMessageDto

```typescript
type SendBatchMessageDto = BaseMessageDto & {
  to: string[];
  campaignName?: string;
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `to` | `string[]` | Array de números dos destinatários |
| `message` | `string` | Texto da mensagem |
| `schedule` | `string` | Agendamento (formato: `yyyyMMddHHmmss`) |
| `campaignName` | `string` | Nome da campanha (opcional, específico para batch) |

---

## SendMessageResponse

```typescript
type SendMessageResponse = BaseResponse & {
  messageId?: string;
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | `boolean` | Indica sucesso da operação |
| `provider` | `string` | Nome do provider utilizado |
| `messageId` | `string` | ID da mensagem no provider |
| `raw` | `unknown` | Resposta original da API |

---

## SendBatchMessageResponse

```typescript
type SendBatchMessageResponse = BaseResponse & {
  successful: string[];
  failed: string[];
  details?: Array<{
    to: string;
    messageId?: string;
    error?: string;
  }>;
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | `boolean` | Indica se pelo menos uma mensagem foi enviada |
| `provider` | `string` | Nome do provider utilizado |
| `successful` | `string[]` | Números enviados com sucesso |
| `failed` | `string[]` | Números que falharam |
| `details` | `array` | Detalhes individuais de cada envio |
| `raw` | `unknown` | Resposta original da API |

---

## ProviderConfig

```typescript
type ProviderConfig = {
  token: string;
  baseUrl: string;
  timeout?: number;
  from?: string;
  data?: {
    senderId?: string;
    maxBatchSize?: number;
    maxMessageLength?: number;
    rateLimitPerHour?: number;
    [key: string]: unknown;
  };
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `token` | `string` | ✅ Sim | API key ou token de acesso |
| `baseUrl` | `string` | ✅ Sim | URL base da API |
| `timeout` | `number` | ❌ Não | Timeout em ms (padrão: 10000) |
| `from` | `string` | ❌ Não | Remetente da mensagem |
| `data` | `object` | ❌ Não | Configurações específicas |

### Campos de `data`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `senderId` | `string` | Identificador do remetente |
| `maxBatchSize` | `number` | Limite de destinatários por lote |
| `maxMessageLength` | `number` | Limite de caracteres por mensagem |
| `rateLimitPerHour` | `number` | Limite de requisições por hora |

---

## CreateSenderConfig

```typescript
type CreateSenderConfig = {
  providerName: string;
  providerConfig: ProviderConfig;
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `providerName` | `string` | Nome do provider registrado |
| `providerConfig` | `ProviderConfig` | Configuração do provider |

---

## SenderConfigFile

```typescript
type SenderConfigFile = {
  defaultProvider?: string;
  fallbackProviders?: string[];
  providers: Record<string, Partial<ProviderConfig>>;
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `defaultProvider` | `string` | Provider padrão |
| `fallbackProviders` | `string[]` | Ordem de fallback |
| `providers` | `object` | Configurações dos providers |

---

## ValidatedPhone

```typescript
type ValidatedPhone = { 
  valid: string[]; 
  invalid: string[];
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `valid` | `string[]` | Números válidos |
| `invalid` | `string[]` | Números inválidos |

---

## Próxima secção

- [Registry API](./registry.md)