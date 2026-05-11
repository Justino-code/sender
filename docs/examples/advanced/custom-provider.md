# Provider customizado

Criando um provider do zero estendendo a classe base `Provider`.

## Estrutura básica

```typescript
import {
  Provider,
  registerProvider,
  createSender,
  SendMessageDto,
  SendMessageResponse,
  ProviderConfig,
  ConfigurationError,
  ValidationError,
} from "@jcsolutions/sender";

// 1. Estender a classe Provider
class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  private readonly from: string;

  constructor(config: ProviderConfig) {
    super(config);
    
    if (!config.from) {
      throw new ConfigurationError("MeuProvider: from é obrigatório");
    }
    this.from = config.from;
  }

  // 2. Sobrescrever headers (se necessário)
  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,  // autenticação personalizada
    };
  }

  // 3. Implementar o método send (obrigatório)
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

## Registrar o provider

```typescript
// Registrar
registerProvider("meuprovider", MeuProvider);
```

## Usar o provider

```typescript
const sms = await createSender("meuprovider", {
  token: "minha-api-key",
  baseUrl: "https://api.meuprovider.com/v1",
  from: "MEUAPP",
});

const result = await sms.send({
  to: "923000000",
  message: "Enviado via provider customizado!",
});
```

## Métodos que podem ser sobrescritos

| Método | Descrição | Quando sobrescrever |
|--------|-----------|---------------------|
| `buildHeaders()` | Constrói headers da requisição | Autenticação diferente |
| `normalizePhone()` | Normaliza número de telefone | Formato específico |
| `validatePhone()` | Valida número | Regras diferentes |
| `request()` | Faz requisição HTTP | Comportamento customizado |
| `handleErrorResponse()` | Trata erros da API | Códigos de erro diferentes |
| `extractMessageId()` | Extrai ID da resposta | Campo do ID diferente |
| `sendBatch()` | Envio em lote | Provider tem batch nativo |

## Exemplo mínimo

```typescript
class ProviderMinimo extends Provider {
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

## Provider com batch nativo

```typescript
class MeuProviderComBatch extends Provider {
  protected readonly providerName = "meuprovider";

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    // implementação...
  }

  // Sobrescrever sendBatch para usar batch nativo
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    const { valid, invalid } = this.validatePhones(data.to);
    
    const body = {
      to: this.normalizePhones(valid).join(','),
      message: data.message,
    };

    const response = await this.request("/batch", body);
    const result = await response.json();

    // processar resposta...
  }
}
```

## Dicas importantes

| Dica | Descrição |
|------|-----------|
| **providerName** | Obrigatório declarar `protected readonly providerName` |
| **Validação** | Valide configurações específicas no construtor |
| **Erros** | Use `ConfigurationError`, `ValidationError`, etc |
| **Timeout** | O método `request()` já implementa timeout |
| **Batch** | A classe base já fornece implementação base |

## Próximo exemplo

- [Serviço Express](./express-service.md)