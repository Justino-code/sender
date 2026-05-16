# Provider KambaSMS

## Sobre

A KambaSMS é uma plataforma de comunicação angolana que utiliza autenticação via X-API-Key.

## Status

🚧 **Em desenvolvimento** - Aguardando validação com API real

> ⚠️ **Nota**: Provider em desenvolvimento. Testes com API real pendentes.

## Configuração

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://nexasms-api.onrender.com",
  timeout: 10000,
});
```

### Com remetente (from)

```typescript
const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://nexasms-api.onrender.com",
  from: "LEVAJA",  // usado como sender_id quando obrigatório
});
```

## Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"kambasms"` |
| Autenticação | `X-API-Key: {token}` |
| Base URL | `https://nexasms-api.onrender.com` |
| Campo mensagem | `text` |
| Formato do número | `+244XXXXXXXXX` (internacional) |
| Limite mensagem | 160 caracteres |
| Limite batch | 1000 destinatários |
| Batch nativo | ✅ Suportado (`/messages/bulk`) |
| Agendamento | ✅ Suportado (`/messages/schedule`) |

## Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Olá! Mensagem de teste.",
});
```

## Envio com agendamento

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Lembrete: consulta amanhã",
  schedule: "2025-06-01T09:00:00.000Z",  // formato ISO 8601
});
```

## Envio em lote

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
  campaignName: "Promoção Natal", // ← obrigatório
});
```

## Limitações

| Item | Regra |
|------|-------|
| Links/URLs | ❌ Não permitidos |
| Tamanho máximo | 160 caracteres |
| Formato número | `+244XXXXXXXXX` |
| Limite por hora | 50 SMS/hora |

## Exemplo com arquivo de configuração

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  providers: {
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://nexasms-api.onrender.com",
      from: "LEVAJA",
    },
  },
});
```

## Próximos passos

Assim que os testes com API real forem concluídos, este provider será promovido para estável.

> 📝 Para mais detalhes, consulte o [site oficial da KambaSMS](https://kambasms.ao)