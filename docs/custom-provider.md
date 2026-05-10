# Provider customizado

## Quando criar um provider customizado

Cria um provider customizado quando precisares usar um gateway que não está disponível nativamente no @jcsolutions/sender, ou quando precisares modificar o comportamento de um provider existente.

## Classe base Provider

Em vez de implementar a interface `IProvider` do zero, recomenda-se estender a classe abstrata `Provider`. Ela já fornece:

- Validação de configuração (`token`, `baseUrl`)
- Gerenciamento de timeout
- Métodos auxiliares (`validatePhone`, `normalizePhone`)
- Método `request()` com abort controller
- Tratamento de erros base (`handleErrorResponse`)
- Extração de `messageId` (`extractMessageId`)
- Implementação base de `sendBatch`

## Passo a passo

### 1. Estender a classe Provider

```typescript
import { 
  Provider,
  type SendMessageDto,
  type SendMessageResponse,
  type ProviderConfig,
  ConfigurationError,
  ValidationError,
} from "@jcsolutions/sender";

export class MeuProvider extends Provider {
  // Obrigatório: definir o nome do provider
  protected readonly providerName = "meuprovider";
  
  // Propriedades específicas do provider
  private readonly from?: string;

  constructor(config: ProviderConfig) {
    super(config);  // valida token, baseUrl, configura timeout
    
    // Configurações específicas
    this.from = config.from;
    
    // Validações adicionais se necessário
    if (!this.from) {
      throw new ConfigurationError("MeuProvider: from é obrigatório");
    }
  }

  // Opcional: sobrescrever headers (se autenticação for diferente)
  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,  // em vez de Bearer
    };
  }

  // Obrigatório: implementar o método send
  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    // Validar número (opcional, mas recomendado)
    if (!this.validatePhone(data.to)) {
      throw new ValidationError("Número de telefone inválido");
    }

    // Construir corpo da requisição conforme API do provider
    const body = {
      to: this.normalizePhone(data.to),
      from: this.from,
      text: data.message,  // campo pode ser 'message', 'text', etc
    };

    // Fazer requisição (usa timeout e headers já configurados)
    const response = await this.request("/send", body);
    const result = await response.json();

    // Tratar erros (usa mapeamento padrão: 401, 429, 400, etc)
    if (!response.ok) {
      this.handleErrorResponse(response.status, result?.message);
    }

    // Retornar resposta padronizada
    return {
      success: true,
      provider: this.providerName,
      messageId: this.extractMessageId(result),  // tenta id, messageId, smsId
      raw: result,
    };
  }

  // Opcional: sobrescrever sendBatch se provider tiver batch nativo
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    // Se o provider suporta batch nativo, implemente aqui
    // Caso contrário, a implementação base (chamadas individuais) será usada
    return super.sendBatch(data);
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

const sms = await createSender("meuprovider", {
  token: "minha-chave-api",
  baseUrl: "https://api.meuprovider.com/v1",
  from: "MEUAPP",           // conforme validação no construtor
  timeout: 10000,
});

await sms.send({
  to: "923000000",
  message: "Olá via provider customizado!",
});
```

---

## Exemplo mínimo (estendendo Provider)

```typescript
import { Provider, type SendMessageDto, type SendMessageResponse } from "@jcsolutions/sender";

export class ProviderMinimo extends Provider {
  protected readonly providerName = "minimo";

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    // Implementação mínima
    return {
      success: true,
      provider: this.providerName,
      messageId: "123",
    };
  }
}
```

---

## Exemplo completo (implementando IProvider diretamente)

Se preferir não usar a classe base, pode implementar `IProvider` diretamente:

```typescript
import type {
  IProvider,
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

export class MeuProviderDireto implements IProvider {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly token: string;

  constructor(config: ProviderConfig) {
    if (!config.token) {
      throw new ConfigurationError("Token é obrigatório");
    }
    if (!config.baseUrl) {
      throw new ConfigurationError("BaseUrl é obrigatória");
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
    const results = await Promise.allSettled(
      data.to.map(phone => this.send({
        to: phone,
        message: data.message,
      }))
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

---

## Sobrescrever provider existente

Podes sobrescrever um provider já registado:

```typescript
import { registerProvider } from "@jcsolutions/sender";
import { OmbalaProvider } from "@jcsolutions/sender";

class MeuOmbalaModificado extends OmbalaProvider {
  async send(data) {
    console.log("📤 Enviando mensagem...");
    const result = await super.send(data);
    console.log(`✅ Enviado! ID: ${result.messageId}`);
    return result;
  }
}

// Sobrescrever com override = true
registerProvider("ombala", MeuOmbalaModificado, true);
```

---

## Métodos da classe Provider que podem ser sobrescritos

| Método | Descrição | Quando sobrescrever |
|--------|-----------|---------------------|
| `buildHeaders()` | Constrói headers da requisição | Autenticação diferente (ex: `X-API-Key`) |
| `normalizePhone()` | Normaliza número de telefone | Formato específico do provider |
| `validatePhone()` | Valida número angolano | Regras de validação diferentes |
| `request()` | Faz requisição HTTP | Comportamento customizado |
| `handleErrorResponse()` | Trata erros da API | Códigos de erro diferentes |
| `extractMessageId()` | Extrai ID da resposta | Campo do ID tem nome diferente |
| `sendBatch()` | Envio em lote | Provider tem batch nativo |

---

## Dicas importantes

| Dica | Descrição |
|------|-----------|
| **Provider name** | Obrigatório declarar `protected readonly providerName` |
| **Validação** | Valide configurações específicas no construtor |
| **Erros** | Use `ConfigurationError`, `ValidationError`, `AuthenticationError`, etc |
| **Timeout** | O método `request()` já implementa timeout |
| **Batch** | A classe base já fornece implementação (chamadas individuais) |
| **Tipos** | Use os tipos exportados pela biblioteca |
| **from** | Cada provider decide se precisa (via `config.from`) |

---

## Fluxo de um provider customizado

```
1. Usuário chama createSender("meuprovider", config)
2. Registry encontra a classe MeuProvider
3. Instância é criada com new MeuProvider(config)
   ├── super(config) é chamado
   ├── Provider valida token, baseUrl
   └── Construtor do MeuProvider faz validações adicionais
4. Usuário chama send()
   ├── MeuProvider.send() implementa lógica
   ├── Pode usar this.validatePhone(), this.normalizePhone()
   ├── Pode usar this.request() para fazer chamada HTTP
   └── Retorna SendMessageResponse
5. Se necessário, this.sendBatch() usa implementação base
```

---

## Referência

- [API Reference](./api.md) - Tipos e interfaces disponíveis
- [Providers](./providers.md) - Exemplos de providers existentes
- [Classe Provider](./api.md#provider-classe-base) - Documentação da classe base