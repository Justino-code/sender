# Provider customizado

## Quando criar um provider customizado

Cria um provider customizado quando precisares usar um gateway que não está disponível nativamente no Sender SDK, ou quando precisares modificar o comportamento de um provider existente.

## Interface SmsProvider

Todo provider deve implementar a interface `SmsProvider`:

```typescript
interface SmsProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}
```

## Passo a passo

### 1. Criar a classe do provider

```typescript
import type {
  SmsProvider,
  SendMessageDto,
  SendBatchMessageDto,
  SendMessageResponse,
  SendBatchMessageResponse,
  ProviderConfig,
} from "@jcsolutions/sender";

import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  ValidationError,
  TimeoutError,
  ConfigurationError,
} from "@jcsolutions/sender";

export class MeuProvider implements SmsProvider {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly token: string;

  constructor(private readonly config: ProviderConfig) {
    // Validar configurações obrigatórias
    if (!config.token) {
      throw new ConfigurationError("MeuProvider: token é obrigatório");
    }

    if (!config.baseUrl) {
      throw new ConfigurationError("MeuProvider: baseUrl é obrigatória");
    }

    this.token = config.token;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 10000;
  }

  private buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          to: data.to,
          from: data.from,
          message: data.message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) throw new AuthenticationError();
        if (response.status === 429) throw new RateLimitError();
        throw new ProviderError(result.message || "Erro desconhecido");
      }

      return {
        success: true,
        provider: "meuprovider",
        messageId: result.id,
        raw: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(this.timeout);
      }
      throw error;
    }
  }

  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    // Implementação para envio em lote
    // Pode ser chamadas individuais ou nativo do provider
    
    const results = await Promise.allSettled(
      data.to.map(phone =>
        this.send({
          from: data.from,
          to: phone,
          message: data.message,
        })
      )
    );

    const successful: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(data.to[index]);
      } else {
        failed.push(data.to[index]);
      }
    });

    return {
      success: successful.length > 0,
      provider: "meuprovider",
      successful,
      failed,
    };
  }
}
```

### 2. Registrar o provider

```typescript
import { registerProvider } from "@jcsolutions/sender";
import { MeuProvider } from "./meu.provider.js";

registerProvider("meuprovider", MeuProvider);
```

### 3. Usar o provider

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = createSender({
  providerName: "meuprovider",
  providerConfig: {
    token: "minha-chave-api",
    baseUrl: "https://api.meuprovider.com/v1",
    timeout: 10000,
  },
});

await sms.send({
  from: "MEUAPP",
  to: "923000000",
  message: "Olá via provider customizado!",
});
```

## Sobrescrever provider existente

Podes sobrescrever um provider já registado:

```typescript
import { registerProvider } from "@jcsolutions/sender";
import { OmbalaProvider } from "@jcsolutions/sender";

class MeuOmbalaModificado extends OmbalaProvider {
  async send(data) {
    console.log("Antes do envio");
    const result = await super.send(data);
    console.log("Depois do envio");
    return result;
  }
}

// Sobrescrever com override = true
registerProvider("ombala", MeuOmbalaModificado, true);
```

## Dicas importantes

| Dica | Descrição |
|------|-----------|
| **Validação** | Valide todas as configurações no construtor |
| **Erros** | Use os erros padrão da biblioteca (`AuthenticationError`, `RateLimitError`, etc) |
| **Timeout** | Implemente timeout em todas as requisições |
| **Batch** | Se o provider não suportar lote nativo, implemente com `Promise.allSettled` |
| **Tipos** | Use os tipos exportados pela biblioteca |

## Exemplo mínimo

Para um provider muito simples:

```typescript
import type { SmsProvider, SendMessageDto, SendMessageResponse } from "@jcsolutions/sender";

export class ProviderMinimo implements SmsProvider {
  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    return {
      success: true,
      provider: "minimo",
      messageId: "123",
    };
  }

  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    return {
      success: true,
      provider: "minimo",
      successful: data.to,
      failed: [],
    };
  }
}
```

## Referência

- [API Reference](./api.md) - Tipos e interfaces disponíveis
- [Providers](./providers.md) - Exemplos de providers existentes
