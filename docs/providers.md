# Providers

## Visão geral

O @jcsolutions/sender SDK suporta múltiplos gateways de SMS angolanos. Cada provider tem sua própria configuração específica, mas todos estendem a classe base `Provider` e seguem a mesma interface `IProvider`.

## Providers disponíveis

| Provider | Status | Documentação |
|----------|--------|--------------|
| **Ombala** | ✅ Estável | [Documentação completa](./providers/ombala.md) |
| **KambaSMS** | 🚧 Em desenvolvimento | [Documentação completa](./providers/kambasms.md) |

> ⚠️ **Nota**: Providers em desenvolvimento podem ter APIs instáveis e não são recomendados para produção.

## Comparação rápida

| Característica | Ombala | KambaSMS |
|----------------|--------|----------|
| Autenticação | `Token {token}` | `X-API-Key: {token}` |
| Campo mensagem | `message` | `text` |
| `from` obrigatório | ✅ Sim | ❌ Não |
| Agendamento | ✅ Sim | ❌ Não |
| Batch nativo | ✅ Sim (vírgula) | ❌ Não |
| Documentação | [Ver](./providers/ombala.md) | [Ver](./providers/kambasms.md) |

## Configuração recomendada com fallback

Para maior resiliência, configure ambos os providers com fallback automático:

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms"],
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://api.kambasms.ao/v1",
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
| Sms.to | 📋 Planeado | TBD |
| TelcoSMS | 📋 Planeado | TBD |
| MIMO | 📋 Planeado | TBD |
