# Providers

## Visão geral

O @jcsolutions/sender SDK suporta múltiplos gateways de SMS angolanos. Cada provider tem sua própria configuração específica, mas todos estendem a classe base `Provider` e seguem a mesma interface `IProvider`.

## Providers disponíveis

| Provider | Status | Documentação |
|----------|--------|--------------|
| **Ombala** | ✅ Estável | [Documentação completa](./providers/ombala.md) |
| **TelcoSMS** | ✅ Estável | [Documentação completa](./providers/telcosms.md) |
| **KambaSMS** | 🚧 Em desenvolvimento | [Documentação completa](./providers/kambasms.md) |

> ✅ **Estável**: Providers testados e validados com API real.
> 🚧 **Em desenvolvimento**: Em fase de testes, aguardando validação completa.

## Comparação rápida

| Característica | Ombala | KambaSMS | TelcoSMS |
|----------------|--------|----------|----------|
| Autenticação | `Token {token}` | `X-API-Key` | `api_key_app` |
| Campo mensagem | `message` | `text` | `message_body` |
| `from` obrigatório | ✅ Sim | ❌ Não | ❌ Não |
| Agendamento | ✅ Sim | ✅ Sim | ❌ Não |
| Batch nativo | ✅ Sim (vírgula) | ✅ Sim | ❌ Não |
| Retry automático | ✅ Sim | ✅ Sim | ✅ Sim |
| Status | ✅ Estável | 🚧 Em desenvolvimento | ✅ Estável |

## Configuração recomendada com fallback

Para maior resiliência, configure os providers com fallback automático:

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["telcosms", "kambasms"],
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
    },
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://nexasms-api.onrender.com",
    },
  },
});
```

## Adicionar novo provider

Para usar um provider que não está na lista, consulte o guia [Provider customizado](./custom-provider.md).

## Roadmap

| Provider | Status | Previsão |
|----------|--------|----------|
| Ombala | ✅ Estável | - |
| TelcoSMS | ✅ Estável | - |
| KambaSMS | 🚧 Em desenvolvimento | Em breve |
| Sms.to | 📋 Planeado | TBD |
| MIMO | 📋 Planeado | TBD |