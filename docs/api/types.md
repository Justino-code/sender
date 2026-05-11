# Tipos e DTOs

## SendMessageDto

Dados necessários para enviar uma única mensagem SMS.

```typescript
type SendMessageDto = {
  to: string;        // Número do destinatário (9 dígitos, ex: "923000000")
  message: string;   // Texto da mensagem
  schedule?: string; // Agendamento (formato: yyyyMMddHHmmss, opcional)
}
```

### Exemplo

```typescript
import type { SendMessageDto } from "@jcsolutions/sender";

const data: SendMessageDto = {
  to: "923000000",
  message: "Seu código é 482913",
  schedule: "20251210150000",  // Enviar em 10/12/2025 às 15:00
};
```

### Validações

| Campo | Regra |
|-------|-------|
| `to` | 9 dígitos, começa com 9 (ex: 923000000) |
| `message` | Texto livre, máximo 160 caracteres (GSM) |
| `schedule` | Formato `yyyyMMddHHmmss`, opcional |

---

## SendBatchMessageDto

Dados necessários para enviar mensagens para múltiplos destinatários.

```typescript
type SendBatchMessageDto = {
  to: string[];      // Array de números (9 dígitos cada)
  message: string;   // Texto da mensagem
  schedule?: string; // Agendamento (formato: yyyyMMddHHmmss, opcional)
}
```

### Exemplo

```typescript
import type { SendBatchMessageDto } from "@jcsolutions/sender";

const data: SendBatchMessageDto = {
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial: 20% off!",
};
```

### Validações

| Campo | Regra |
|-------|-------|
| `to` | Array de strings, cada uma com 9 dígitos começando com 9 |
| `message` | Texto livre, máximo 160 caracteres (GSM) |
| `schedule` | Formato `yyyyMMddHHmmss`, opcional |

---

## SendMessageResponse

Resposta do envio de uma única mensagem.

```typescript
type SendMessageResponse = {
  success: boolean;   // Se o envio foi bem sucedido
  provider: string;   // Nome do provider que enviou (ex: "ombala")
  messageId?: string; // ID da mensagem no provider (para rastreamento)
  raw?: unknown;      // Resposta original da API (debug)
}
```

### Exemplo

```json
{
  "success": true,
  "provider": "ombala",
  "messageId": "msg_123456",
  "raw": {
    "id": "msg_123456",
    "status": "sent",
    "cost": "9.5"
  }
}
```

---

## SendBatchMessageResponse

Resposta do envio em lote.

```typescript
type SendBatchMessageResponse = {
  success: boolean;                // Se pelo menos uma mensagem foi enviada
  provider: string;                // Nome do provider usado
  successful: string[];            // Números que foram enviados com sucesso
  failed: string[];                // Números que falharam
  details?: Array<{                // Detalhes individuais de cada envio
    to: string;
    messageId?: string;
    error?: string;
  }>;
  raw?: unknown;                   // Resposta original da API
}
```

### Exemplo

```json
{
  "success": true,
  "provider": "ombala",
  "successful": ["923000001", "923000002"],
  "failed": ["923000003"],
  "details": [
    { "to": "923000001", "messageId": "msg_001" },
    { "to": "923000002", "messageId": "msg_002" },
    { "to": "923000003", "error": "Número inválido" }
  ],
  "raw": {
    "id": "batch_123",
    "recipients": [...]
  }
}
```

---

## ProviderConfig

Configuração necessária para instanciar um provider.

```typescript
type ProviderConfig = {
  token: string;                    // API key ou token de acesso (obrigatório)
  baseUrl: string;                  // URL base da API do provider (obrigatório)
  timeout?: number;                 // Timeout em ms (padrão: 10000)
  from?: string;                    // Remetente (obrigatório para Ombala)
  data?: Record<string, unknown>;   // Configurações específicas do provider
}
```

### Exemplo (Ombala)

```typescript
const config: ProviderConfig = {
  token: "omb_abc123",
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
  timeout: 15000,
};
```

### Exemplo (KambaSMS)

```typescript
const config: ProviderConfig = {
  token: "kam_xyz789",
  baseUrl: "https://api.kambasms.ao/v1",
  timeout: 10000,
  data: {
    senderId: "MEUAPP",  // Identificador do remetente
  },
};
```

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| `token` | `string` | ✅ Sim | - | API key ou token de acesso |
| `baseUrl` | `string` | ✅ Sim | - | URL base da API do provider |
| `timeout` | `number` | ❌ Não | `10000` | Timeout em milissegundos |
| `from` | `string` | ⚠️ Para Ombala | - | Remetente da mensagem |
| `data` | `object` | ❌ Não | `{}` | Configurações específicas do provider |

---

## CreateSenderConfig

Configuração para criar um sender explicitamente.

```typescript
type CreateSenderConfig = {
  providerName: string;
  providerConfig: ProviderConfig;
}
```

### Exemplo

```typescript
const config: CreateSenderConfig = {
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
};

const sms = createSenderSync(config);
```

---

## Resumo dos tipos

| Tipo | Uso |
|------|-----|
| `SendMessageDto` | Envio de uma mensagem |
| `SendBatchMessageDto` | Envio de múltiplas mensagens |
| `SendMessageResponse` | Resposta de envio único |
| `SendBatchMessageResponse` | Resposta de envio em lote |
| `ProviderConfig` | Configuração do provider |
| `CreateSenderConfig` | Configuração para criar sender |

## Próxima secção

- [Registry API](./registry.md)