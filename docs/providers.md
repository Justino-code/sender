# Providers

## Visão geral

O @jcsolutions/sender SDK suporta múltiplos gateways de SMS angolanos. Cada provider tem sua própria configuração específica, mas todos estendem a classe base `Provider` e seguem a mesma interface `IProvider`.

## Providers disponíveis

| Provider | Status | Documentação |
|----------|--------|--------------|
| **Ombala** | ✅ Estável | [Documentação completa](./providers/ombala.md) |
| **KambaSMS** | 🚧 Em desenvolvimento | [Documentação completa](./providers/kambasms.md) |
| **TelcoSMS** | 🚧 Em desenvolvimento | [Documentação completa](./providers/telcosms.md) |

> ⚠️ **Nota**: Providers em desenvolvimento podem ter APIs instáveis e não são recomendados para produção.

## Comparação rápida

| Característica | Ombala | KambaSMS | TelcoSMS |
|----------------|--------|----------|----------|
| Autenticação | `Token {token}` | `X-API-Key: {token}` | `api_key_app` |
| Campo mensagem | `message` | `text` | `message_body` |
| `from` obrigatório | ✅ Sim | ❌ Não | ❌ Não |
| Agendamento | ✅ Sim | ✅ Sim | ❌ Não |
| Batch nativo | ✅ Sim (vírgula) | ✅ Sim | ❌ Não |
| Documentação | [Ver](./providers/ombala.md) | [Ver](./providers/kambasms.md) | [Ver](./providers/telcosms.md) |

## Configuração recomendada com fallback

Para maior resiliência, configure os providers com fallback automático:

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms", "telcosms"],
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://nexasms-api.onrender.com",
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
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
| KambaSMS | 🚧 Em desenvolvimento | Em breve |
| TelcoSMS | 🚧 Em desenvolvimento | Em breve |
| Sms.to | 📋 Planeado | TBD |
| MIMO | 📋 Planeado | TBD |