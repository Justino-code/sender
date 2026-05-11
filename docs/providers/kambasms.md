# Provider KambaSMS

## Sobre

A KambaSMS é uma plataforma de comunicação que utiliza autenticação via X-API-Key.

## Status

🚧 **Em desenvolvimento** - API instável, não recomendado para produção

> ⚠️ **Nota**: A documentação oficial da KambaSMS é limitada. As informações abaixo são baseadas no que está publicamente disponível.

## Configuração

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://api.kambasms.ao/v1",
  timeout: 10000,           // opcional (padrão: 10000)
});
```

### Com senderId opcional

```typescript
const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://api.kambasms.ao/v1",
  data: {
    senderId: "MEUAPP",     // opcional
  },
});
```

## Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"kambasms"` |
| Autenticação | `X-API-Key: {token}` |
| Campo mensagem | `text` |
| Campo from | ❌ Não documentado |
| Campo schedule | ❌ Não documentado |
| Batch nativo | ❌ Não documentado |
| Site oficial | [kambasms.ao](https://kambasms.ao) |

## Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem de teste",
});
```

## Envio em lote (implementação base)

Como a KambaSMS não possui batch nativo documentado, o envio em lote é feito através de múltiplas chamadas individuais:

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
});
```

## Exemplo com arquivo de configuração

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  providers: {
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://api.kambasms.ao/v1",
      data: {
        senderId: "MEUAPP",
      },
    },
  },
});
```

## Limitações conhecidas

| Item | Status | Nota |
|------|--------|------|
| Agendamento (`schedule`) | ❌ Não disponível | API não documenta este recurso |
| Remetente personalizado | ❌ Não disponível | Não é possível definir `from` |
| Sender ID | ⚠️ Limitado | Pode ser configurado via `data.senderId` |
| Envio em lote nativo | ❌ Não disponível | Usa implementação base (chamadas individuais) |

## Próximos passos

Assim que a documentação oficial da KambaSMS for atualizada, este provider será promovido para estável.

> 📝 Para mais detalhes, consulte o [site oficial da KambaSMS](https://kambasms.ao).