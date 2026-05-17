# Classe Provider

Classe abstrata base que todos os providers devem estender. Fornece implementações comuns e métodos auxiliares.

## Definição

```typescript
export abstract class Provider implements IProvider {
  // Propriedades
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly token: string;
  protected abstract readonly providerName: string;
  protected readonly from?: string;
  protected readonly customData?: Record<string, unknown>;
  
  // Limites configuráveis
  protected readonly maxBatchSize: number;
  protected readonly maxMessageLength: number;
  
  // Retry
  protected readonly maxRetries: number;
  protected readonly retryDelay: number;

  // Construtor
  public constructor(config: ProviderConfig);

  // Métodos protegidos (validação)
  protected validatePhone(phone: string): boolean;
  protected validatePhoneOrThrow(phone: string): void;
  protected validatePhones(phones: string[]): ValidatedPhone;
  protected validateFromRequired(): void;
  protected validateMessageLength(message: string): void;
  protected validateNoUrls(message: string): void;
  protected validateBatchSize(validCount: number): void;
  protected validateCampaignName(campaignName?: string): void;
  protected validatedBatchPhoneNumbers(phoneNumbers: string[]): ValidatedPhone;

  // Métodos protegidos (utilitários)
  protected buildHeaders(): HeadersInit;
  protected normalizePhone(phone: string, internacional?: boolean): string;
  protected normalizePhones(phones: string[], internacional?: boolean): string[];
  protected async request(url: string, body: unknown): Promise<Response>;
  protected handleErrorResponse(status: number, response: any): never;
  protected extractMessageId(result: any): string | undefined;
  
  // Retry
  protected async withRetry<T>(fn: () => Promise<T>, retries?: number): Promise<T>;

  // Métodos públicos
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
  abstract send(data: SendMessageDto): Promise<SendMessageResponse>;
}
```

## Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `baseUrl` | `string` | URL base da API do provider |
| `timeout` | `number` | Timeout em milissegundos |
| `token` | `string` | API key ou token de acesso |
| `providerName` | `string` | **Abstract** - Nome do provider (obrigatório) |
| `from` | `string` | Remetente padrão (opcional) |
| `customData` | `object` | Dados customizados do provider |
| `maxBatchSize` | `number` | Limite de destinatários por lote (padrão: 1000) |
| `maxMessageLength` | `number` | Limite de caracteres por mensagem (padrão: 160) |
| `maxRetries` | `number` | Número de tentativas (padrão: 0) |
| `retryDelay` | `number` | Delay inicial em ms (padrão: 1000) |

## Construtor

```typescript
public constructor(config: ProviderConfig)
```

O construtor valida:
- `token` é obrigatório
- `baseUrl` é obrigatória
- Configura limites via `config.data` (opcional)

## Métodos de Validação

### validatePhone()

Valida um número angolano (retorna boolean).

```typescript
protected validatePhone(phone: string): boolean
```

### validatePhoneOrThrow()

Valida um número e lança exceção se inválido.

```typescript
protected validatePhoneOrThrow(phone: string): void
```

**Lança:** `ValidationError`

### validatePhones()

Valida múltiplos números.

```typescript
protected validatePhones(phones: string[]): ValidatedPhone
```

Retorna `{ valid: string[], invalid: string[] }`

### validateFromRequired()

Valida se `from` está configurado (para providers que exigem).

```typescript
protected validateFromRequired(): void
```

**Lança:** `ConfigurationError`

### validateMessageLength()

Valida o tamanho da mensagem.

```typescript
protected validateMessageLength(message: string): void
```

**Lança:** `ValidationError` se exceder `maxMessageLength`

### validateNoUrls()

Valida ausência de URLs na mensagem.

```typescript
protected validateNoUrls(message: string): void
```

**Lança:** `ValidationError` se encontrar URL

### validateBatchSize()

Valida o tamanho do lote.

```typescript
protected validateBatchSize(validCount: number): void
```

**Lança:** `ValidationError` se exceder `maxBatchSize`

### validateCampaignName()

Valida se `campaignName` foi fornecido.

```typescript
protected validateCampaignName(campaignName?: string): void
```

**Lança:** `ValidationError` se não fornecido

### validatedBatchPhoneNumbers()

Valida e retorna números válidos em uma única operação.

```typescript
protected validatedBatchPhoneNumbers(phoneNumbers: string[]): ValidatedPhone
```

**Lança:** `ValidationError` se não houver números válidos

## Métodos Utilitários

### buildHeaders()

Constrói os headers da requisição HTTP.

```typescript
protected buildHeaders(): HeadersInit
```

**Padrão:** `Authorization: Bearer {token}`  
**Sobrescreva para:** `X-API-Key`, `Token {token}`, etc.

### normalizePhone()

Normaliza um número de telefone.

```typescript
protected normalizePhone(phone: string, internacional?: boolean): string
```

- `internacional = false` (padrão) → formato nacional (ex: `923000000`)
- `internacional = true` → formato internacional (ex: `+244923000000`)

### normalizePhones()

Normaliza múltiplos números.

```typescript
protected normalizePhones(phones: string[], internacional?: boolean): string[]
```

### request()

Executa requisição HTTP com timeout.

```typescript
protected async request(url: string, body: unknown): Promise<Response>
```

### handleErrorResponse()

Converte status HTTP em erro apropriado.

```typescript
protected handleErrorResponse(status: number, response: any): never
```

| Status | Erro |
|--------|------|
| 401, 403 | `AuthenticationError` |
| 429 | `RateLimitError` |
| 400 | `ValidationError` |
| outros | `ProviderError` |

### extractMessageId()

Extrai o ID da mensagem da resposta.

```typescript
protected extractMessageId(result: any): string | undefined
```

Busca por: `id`, `messageId`, `smsId`, `message_id`

## Retry Automático

### withRetry()

Executa uma função com retry automático.

```typescript
protected async withRetry<T>(fn: () => Promise<T>, retries?: number): Promise<T>
```

**Comportamento:**
- Se `maxRetries = 0` (padrão), executa apenas uma vez
- Se `maxRetries > 0`, tenta novamente em caso de falha
- Backoff exponencial: `retryDelay`, `retryDelay * 2`, `retryDelay * 4`...
- Não retenta para `ValidationError`, `AuthenticationError`, `ConfigurationError`

**Configuração:**
```typescript
const sms = await createSender("ombala", {
  token: "...",
  baseUrl: "...",
  from: "...",
  data: {
    maxRetries: 3,      // 3 tentativas (total 4)
    retryDelay: 1000,   // delay inicial: 1s, 2s, 4s
  },
});
```

## Métodos Públicos

### sendBatch()

Implementação base para envio em lote (com retry).

```typescript
async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>
```

**Comportamento:** Faz chamadas individuais para cada número usando `send()`.  
**Sobrescreva quando:** Provider suporta batch nativo.

### send()

**Abstract** - Cada provider deve implementar.

```typescript
abstract send(data: SendMessageDto): Promise<SendMessageResponse>
```

## Propriedade `providerName` (obrigatória)

Todos os providers devem declarar o nome:

```typescript
export class OmbalaProvider extends Provider {
  protected readonly providerName = "ombala";
}
```

## Fluxo do `sendBatch` base

```
1. validatePhones() → separa válidos/inválidos
2. Se não há válidos → ValidationError
3. Promise.allSettled(valid.map(phone => send()))
4. Coleta sucessos e falhas
5. Retorna SendBatchMessageResponse
```

## Quando sobrescrever métodos

| Método | Motivo para sobrescrever |
|--------|--------------------------|
| `buildHeaders()` | Autenticação diferente |
| `normalizePhone()` | Formato específico do provider |
| `validateNoUrls()` | Provider permite URLs |
| `sendBatch()` | Provider tem batch nativo |
| `handleErrorResponse()` | Códigos de erro diferentes |
| `extractMessageId()` | Campo do ID diferente |

## Próxima secção

- [Tipos e DTOs](./types.md)