# Interfaces e Classes

## IProvider

Interface base que define o contrato que todos os providers devem seguir.

```typescript
interface IProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}
```

### Métodos

| Método | Descrição |
|--------|-----------|
| `send(data)` | Envia uma única mensagem SMS |
| `sendBatch(data)` | Envia mensagens para múltiplos destinatários |

### Exemplo

```typescript
import type { IProvider, SendMessageDto, SendMessageResponse } from "@jcsolutions/sender";

class MeuProvider implements IProvider {
  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    // implementação
    return { success: true, provider: "meuprovider", messageId: "123" };
  }
  
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    // implementação
    return { success: true, provider: "meuprovider", successful: data.to, failed: [] };
  }
}
```

---

## Provider (Classe Base)

Classe abstrata base que todos os providers devem estender. Fornece implementações comuns e métodos auxiliares para evitar repetição de código.

```typescript
export abstract class Provider implements IProvider {
  // Propriedades protegidas
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly token: string;
  protected abstract readonly providerName: string;
  protected readonly from?: string;
  protected readonly customData?: Record<string, unknown>;

  // Construtor
  public constructor(config: ProviderConfig);

  // Métodos protegidos (podem ser sobrescritos)
  protected buildHeaders(): HeadersInit;
  protected normalizePhone(phone: string): string;
  protected normalizePhones(phones: string[]): string[];
  protected validatePhone(phone: string): boolean;
  protected validatePhones(phones: string[]): { valid: string[]; invalid: string[] };
  protected async request(url: string, body: unknown): Promise<Response>;
  protected handleErrorResponse(status: number, message: string): never;
  protected extractMessageId(result: any): string | undefined;

  // Métodos públicos
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
  abstract send(data: SendMessageDto): Promise<SendMessageResponse>;
}
```

### Métodos Protegidos

| Método | Descrição | Quando sobrescrever |
|--------|-----------|---------------------|
| `buildHeaders()` | Constrói os headers da requisição HTTP | Provider usa autenticação diferente (ex: `X-API-Key` em vez de `Bearer`) |
| `normalizePhone()` | Converte número para formato internacional | Provider exige formato específico |
| `normalizePhones()` | Converte múltiplos números | Provider exige formato específico |
| `validatePhone()` | Verifica se número é válido | Regras de validação diferentes |
| `validatePhones()` | Verifica múltiplos números | Regras de validação diferentes |
| `request()` | Executa requisição HTTP com timeout | Necessário comportamento customizado |
| `handleErrorResponse()` | Converte status HTTP em erro apropriado | Provider usa códigos de erro diferentes |
| `extractMessageId()` | Extrai o ID da mensagem da resposta | Campo do ID tem nome diferente |

### Métodos Públicos

| Método | Descrição |
|--------|-----------|
| `sendBatch()` | Implementação base: faz chamadas individuais para cada número. Providers com suporte nativo a lote devem sobrescrever |
| `send()` | **Abstract** - Cada provider deve implementar sua lógica específica de envio |

### Propriedade `providerName` (obrigatória)

Todos os providers **devem** declarar o nome via propriedade abstrata:

```typescript
export class OmbalaProvider extends Provider {
  protected readonly providerName = "ombala";  // ← obrigatório
  // ...
}
```

O TypeScript obriga a implementação desta propriedade em todas as classes filhas.

### Exemplo de Provider customizado

```typescript
import { Provider, ConfigurationError, ValidationError } from "@jcsolutions/sender";

export class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  private readonly from: string;

  constructor(config: ProviderConfig) {
    super(config);
    
    if (!config.from) {
      throw new ConfigurationError("MeuProvider: from é obrigatório");
    }
    this.from = config.from;
  }

  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,  // Autenticação diferente
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError("Número inválido");
    }

    const body = {
      to: this.normalizePhone(data.to),
      from: this.from,
      text: data.message,
    };

    const response = await this.request("/send", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result?.message);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: this.extractMessageId(result),
      raw: result,
    };
  }
}
```

### Fluxo de execução do `sendBatch` base

```
1. Valida números (validatePhones)
2. Se não há números válidos → erro
3. Envia para cada número (Promise.allSettled)
4. Coleta sucessos e falhas
5. Retorna resposta normalizada
```

### Quando sobrescrever `sendBatch`?

| Caso | Ação |
|------|------|
| Provider suporta batch nativo | ✅ Sobrescrever |
| Precisa de lógica específica | ✅ Sobrescrever |
| Provider não suporta batch | ❌ Usar implementação base |

## Próxima secção

- [Tipos e DTOs](./types.md)