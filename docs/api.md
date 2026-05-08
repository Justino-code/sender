# API Reference

## createSender

Cria uma instância do provider escolhido.

```typescript
function createSender(config: CreateSenderConfig): SmsProvider
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `providerName` | `string` | Nome do provider registrado (ex: "ombala", "kambasms") |
| `providerConfig` | `ProviderConfig` | Configuração do provider |

### Retorno

Retorna uma instância que implementa a interface `SmsProvider`.

### Exemplo

```typescript
import { createSender } from "@justino-code/sender";

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: "sua-api-key",
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});
```

---

## SmsProvider Interface

Interface base que todos os providers implementam.

```typescript
interface SmsProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}
```

### send()

Envia uma única mensagem SMS.

```typescript
send(data: SendMessageDto): Promise<SendMessageResponse>
```

### sendBatch()

Envia mensagens para múltiplos destinatários.

```typescript
sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>
```

---

## Tipos e DTOs

### SendMessageDto

```typescript
interface SendMessageDto {
  from: string;      // Nome do remetente (ex: "LEVAJA")
  to: string;        // Número do destinatário (9 dígitos)
  message: string;   // Texto da mensagem
}
```

### SendBatchMessageDto

```typescript
interface SendBatchMessageDto {
  from: string;       // Nome do remetente
  to: string[];       // Array de números (9 dígitos cada)
  message: string;    // Texto da mensagem
}
```

### SendMessageResponse

```typescript
interface SendMessageResponse {
  success: boolean;   // Se o envio foi bem sucedido
  provider: string;   // Nome do provider usado
  messageId?: string; // ID da mensagem no provider
  raw?: unknown;      // Resposta original da API
}
```

### SendBatchMessageResponse

```typescript
interface SendBatchMessageResponse {
  success: boolean;                // Se pelo menos um foi enviado
  provider: string;                // Nome do provider usado
  successful: string[];            // Números enviados com sucesso
  failed: string[];                // Números que falharam
  details?: Array<{                // Detalhes individuais
    to: string;
    messageId?: string;
    error?: string;
  }>;
  raw?: unknown;                   // Resposta original da API
}
```

### ProviderConfig

```typescript
interface ProviderConfig {
  token: string;        // API key ou token de acesso
  baseUrl: string;      // URL base da API
  timeout: number;      // Timeout em milissegundos (padrão: 10000)
  data?: Record<string, unknown>; // Configurações específicas
}
```

---

## Registry API

### registerProvider()

Registra um novo provider.

```typescript
registerProvider(name: string, providerClass: ProviderConstructor, override?: boolean): void
```

| Parâmetro | Descrição |
|-----------|-----------|
| `name` | Nome único do provider |
| `providerClass` | Classe que implementa `SmsProvider` |
| `override` | Se deve sobrescrever caso já exista (padrão: false) |

```typescript
import { registerProvider } from "sender";

class MeuProvider implements SmsProvider {
  // ...
}

registerProvider("meuprovider", MeuProvider);
```

### registerProviders()

Registra múltiplos providers de uma vez.

```typescript
registerProviders(providers: Record<string, ProviderConstructor>, override?: boolean): void
```

```typescript
import { registerProviders } from "sender";

registerProviders({
  ombala: OmbalaProvider,
  kambasms: KambaSmsProvider,
});
```

### listProviders()

Lista todos os providers registrados.

```typescript
listProviders(): string[]
```

```typescript
import { listProviders } from "sender";

console.log(listProviders()); // ['ombala', 'kambasms']
```

### hasProvider()

Verifica se um provider está registrado.

```typescript
hasProvider(name: string): boolean
```

```typescript
import { hasProvider } from "sender";

if (hasProvider("ombala")) {
  // Provider disponível
}
```

### getProvider()

Obtém a classe do provider.

```typescript
getProvider(name: string): ProviderConstructor | undefined
```

```typescript
import { getProvider } from "@justino-code/sender";

const ProviderClass = getProvider("ombala");
if (ProviderClass) {
  const provider = new ProviderClass(config);
}
```

---

## Utilitários

### validatePhoneNumber()

Valida se o número segue o padrão angolano.

```typescript
validatePhoneNumber(phone: string): boolean
```

```typescript
import { validatePhoneNumber } from "sender";

validatePhoneNumber("923000000");  // true
validatePhoneNumber("813000000");  // false
validatePhoneNumber("+244923000000"); // true
```

### validatePhoneNumbers()

Valida múltiplos números e separa válidos de inválidos.

```typescript
validatePhoneNumbers(phones: string[]): { valid: string[]; invalid: string[] }
```

```typescript
import { validatePhoneNumbers } from "sender";

const { valid, invalid } = validatePhoneNumbers([
  "923000001",
  "813000000",
  "933000002",
]);

console.log(valid);   // ['923000001', '933000002']
console.log(invalid); // ['813000000']
```

### normalizePhoneNumber()

Normaliza o número para o formato internacional (+244...).

```typescript
normalizePhoneNumber(phone: string): string
```

```typescript
import { normalizePhoneNumber } from "sender";

normalizePhoneNumber("923000000");     // "+244923000000"
normalizePhoneNumber("0923000000");    // "+244923000000"
normalizePhoneNumber("+244923000000"); // "+244923000000"
```

### normalizePhoneNumbers()

Normaliza múltiplos números.

```typescript
normalizePhoneNumbers(phones: string[]): string[]
```

```typescript
import { normalizePhoneNumbers } from "sender";

const normalized = normalizePhoneNumbers([
  "923000001",
  "0933000002",
  "+244943000003",
]);

// Resultado: ['+244923000001', '+244933000002', '+244943000003']
```

---

## Erros

Todos os erros estendem a classe `SenderError`.

| Erro | Descrição |
|------|-----------|
| `ConfigurationError` | Configuração inválida ou faltando |
| `AuthenticationError` | Token/API key inválido |
| `RateLimitError` | Limite de requisições excedido |
| `ValidationError` | Dados inválidos (ex: número errado) |
| `ProviderError` | Erro genérico do provider |
| `TimeoutError` | Timeout na requisição |

```typescript
import { 
  SenderError,
  ConfigurationError, 
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError 
} from "sender";
```
