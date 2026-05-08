## Visão geral

O Sender SDK suporta múltiplos gateways de SMS angolanos. Cada provider tem sua própria configuração específica, mas todos seguem a mesma interface `SmsProvider`.

## Provider Ombala

### Configuração

```typescript
import { createSender } from "@jscode/sender";

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});
```

### Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"ombala"` |
| Site oficial | [useombala.ao](https://useombala.ao) |

> 📝 Documentação completa da API Ombala: consultar o site oficial do provider.

## Provider KambaSMS

### Configuração

```typescript
import { createSender } from "@jscode/sender";

const sms = createSender({
  providerName: "kambasms",
  providerConfig: {
    token: process.env.KAMBASMS_API_KEY,
    baseUrl: "https://api.kambasms.ao/v1",
    timeout: 10000,
    data: {
      // Configurações específicas do provider
    },
  },
});
```

### Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"kambasms"` |
| Site oficial | [kambasms.ao](https://kambasms.ao) |

> 📝 Documentação completa da API KambaSMS: consultar o site oficial do provider.

## Comparação entre providers

| Característica | Ombala | KambaSMS |
|----------------|--------|----------|
| Envio simples | ✅ | ✅ |
| Envio em lote | ✅ | ✅ |

## Adicionar novo provider

Para usar um provider que não está na lista, consulte o guia [Provider customizado](./custom-provider.md).

## Roadmap de providers

- [x] Ombala
- [x] KambaSMS
- [ ] Ecsend
- [ ] KwanzaSMS
- [ ] Africell SMS
