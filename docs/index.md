# Documentação do @jcsolutions/sender

> ⚠️ **Aviso**: Esta biblioteca está em desenvolvimento (alpha). A API pode sofrer alterações até a versão estável 1.0.0.

Bem-vindo à documentação oficial do **@jcsolutions/sender** - o SDK universal para envio de SMS com suporte a gateways angolanos.

## Sobre o SDK

O @jcsolutions/sender foi construído para simplificar a integração com diferentes gateways de SMS em Angola. Com uma API limpa e consistente, podes trocar de provider sem alterar o resto da tua aplicação.

### Características principais

- **API simples** - Envia SMS com poucas linhas de código
- **TypeScript first** - Tipos completos e autocomplete
- **Múltiplos providers** - Suporte a diferentes gateways
- **Envio em lote** - Suporte nativo para múltiplos destinatários
- **Extensível** - Adiciona qualquer gateway com registry pattern
- **Validação local** - Normalização de números angolanos
- **Fallback automático** - Troca de provider em caso de falha

### Gateways suportados atualmente

No momento, o SDK suporta **dois gateways angolanos**:

| Provider | Status |
|----------|--------|
| **Ombala** | ✅ Estável |
| **KambaSMS** | ✅ Estável |

> Mais gateways serão adicionados em breve (Sms.to, TelcoSMS, MIMO, WeSender).

### Casos de uso

- Códigos de verificação (OTP)
- Notificações transaccionais
- Alertas e lembretes
- Marketing SMS (envio em lote)

## Começar agora

| Guia | Descrição |
|------|-----------|
| [Primeiros passos](./getting-started.md) | Instalação, configuração e primeiro envio |
| [API Reference](./api.md) | Todas as funções, tipos e interfaces |
| [Providers](./providers.md) | Detalhes de cada gateway suportado |
| [Exemplos práticos](./examples.md) | Códigos completos prontos para usar |
| [Provider customizado](./custom-provider.md) | Como criar e registrar o seu próprio provider |
| [Configuração](./configuration.md) | Configuração centralizada e fallback automático |

## Instalação

```bash
yarn add @jcsolutions/sender
# ou
npm install @jcsolutions/sender
```

## Exemplo rápido

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
    timeout: 10000,
  },
});

const result = await sms.send({
  to: "923000000",
  message: "Olá mundo!",
});

console.log(result.success ? "✅ Enviado" : "❌ Falha");
```

## Exemplo com configuração centralizada

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

```typescript
// app.ts - uso simples com fallback automático
import { createSender } from "@jcsolutions/sender";

const sms = await createSender(); // usa ombala, fallback para kambasms

await sms.send({
  to: "923000000",
  message: "Mensagem com fallback automático!",
});
```

## Requisitos

- Node.js 18+ (para suporte ao fetch nativo)
- TypeScript 5+ (recomendado)

## Licença

MIT
