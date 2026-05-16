# @jcsolutions/sender

> ⚠️ **Aviso**: Em desenvolvimento (alpha). A API pode mudar até a versão 1.0.0.

SDK para envio de SMS com suporte a gateways angolanos.

[![GitHub](https://img.shields.io/badge/GitHub-Justino--code/sender-181717?logo=github)](https://github.com/Justino-code/sender)

## Introdução

O **@jcsolutions/sender** é uma biblioteca simples, extensível e type-safe para envio de SMS em aplicações Node.js. Foi construída com foco em **developers angolanos** que precisam integrar diferentes gateways de SMS (Ombala, KambaSMS, etc) sem reescrever lógica de integração.

## Características principais

- **API simples** — Envie SMS com poucas linhas de código
- **TypeScript first** — Tipos completos e autocomplete
- **Múltiplos providers** — Ombala, KambaSMS e mais em breve
- **Envio em lote** — Suporte nativo para múltiplos destinatários
- **Extensível** — Adicione qualquer gateway através do registry pattern
- **Fallback automático** — Resiliência com múltiplos providers

## Começar agora

| Guia | Descrição |
|------|-----------|
| [Primeiros passos](./getting-started.md) | Instalação, configuração e primeiro envio |
| [API Reference](./api.md) | Todas as funções, tipos e interfaces |
| [Exemplos práticos](./examples.md) | Códigos completos prontos para usar |
| [Provider customizado](./custom-provider.md) | Como criar seu próprio provider |

## Providers suportados

| Provider | Status | Documentação |
|----------|--------|--------------|
| **Ombala** | ✅ Estável | [docs](./providers/ombala.md) |
| **KambaSMS** | 🚧 Em desenvolvimento | [docs](./providers/kambasms.md) |

## Instalação

```bash
yarn add @jcsolutions/sender
# ou
npm install @jcsolutions/sender
```

## Uso rápido

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

const result = await sms.send({
  to: "923000000",
  message: "Seu código é 482913",
});

console.log(result.success ? "✅ Enviado" : "❌ Falha");
```

## Licença

MIT © [Justino Contingo](https://github.com/Justino-code)