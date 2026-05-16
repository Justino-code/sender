# IProvider

Interface base que define o contrato que todos os providers devem seguir.

## Definição

```typescript
interface IProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}
```

## Métodos

| Método | Descrição |
|--------|-----------|
| `send(data)` | Envia uma única mensagem SMS |
| `sendBatch(data)` | Envia mensagens para múltiplos destinatários |

## Uso

```typescript
import type { IProvider, SendMessageDto, SendMessageResponse } from "@jcsolutions/sender";

class MeuProvider implements IProvider {
  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    return { success: true, provider: "meuprovider", messageId: "123" };
  }
  
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    return { success: true, provider: "meuprovider", successful: data.to, failed: [] };
  }
}
```

## Próxima secção

- [Classe Provider](./provider.md)