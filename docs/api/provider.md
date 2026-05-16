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

  // Construtor
  public constructor(config: ProviderConfig);

  // Métodos protegidos
  protected buildHeaders(): HeadersInit;
  protected normalizePhone(phone: string, internacional?: boolean): string;
  protected normalizePhones(phones: string[], internacional?: boolean): string[];
  protected validatePhone(phone: string): boolean;
  protected validatePhones(phones: string[]): ValidatedPhone;
  protected validateMessageLength(message: string): void;
  protected validateNoUrls(message: string): void;
  protected validateBatchSize(validCount: number): void;
  protected validatedBatchPhoneNumbers(phoneNumbers: string[]): ValidatedPhone;
  protected async request(url: string, body: unknown): Promise<Response>;
  protected handleErrorResponse(status: number, response: any): never;
  protected extractMessageId(result: any): string | undefined;

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

## Construtor

```typescript
public constructor(config: ProviderConfig)
```

O construtor valida:
- `token` é obrigatório
- `baseUrl` é obrigatória
- Configura limites via `config.data` (opcional)

## Métodos Protegidos

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

### validatePhone()

Valida um número angolano.

```typescript
protected validatePhone(phone: string): boolean
```

Aceita formatos: `923000000`, `0923000000`, `+244923000000`

### validatePhones()

Valida múltiplos números.

```typescript
protected validatePhones(phones: string[]): ValidatedPhone
```

Retorna `{ valid: string[], invalid: string[] }`

### validateMessageLength()

Valida o tamanho da mensagem.

```typescript
protected validateMessageLength(message: string): void
```

Lança `ValidationError` se exceder `maxMessageLength` (160 caracteres)

### validateNoUrls()

Valida ausência de URLs na mensagem.

```typescript
protected validateNoUrls(message: string): void
```

Bloqueia padrões como `https://`, `www.`, `.com`, `.ao`, etc.

### validateBatchSize()

Valida o tamanho do lote.

```typescript
protected validateBatchSize(validCount: number): void
```

Lança `ValidationError` se exceder `maxBatchSize` (1000)

### validatedBatchPhoneNumbers()

Valida e retorna números válidos em uma única operação.

```typescript
protected validatedBatchPhoneNumbers(phoneNumbers: string[]): ValidatedPhone
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

## Métodos Públicos

### sendBatch()

Implementação base para envio em lote.

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