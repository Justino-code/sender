# @jcsolutions/sender

> ⚠️ **Aviso**: Em desenvolvimento (alpha). A API pode mudar até a versão 1.0.0.

[![npm](https://img.shields.io/npm/v/@jcsolutions/sender)](https://www.npmjs.com/package/@jcsolutions/sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@jcsolutions/sender)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

SDK para envio de SMS com suporte a gateways angolanos.

---

## 📦 Instalação

```bash
yarn add @jcsolutions/sender
# ou
npm install @jcsolutions/sender
```

## 🚀 Uso rápido

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

## 📚 Documentação

- [Documentação completa](https://justino-code.github.io/sender/)
- [Primeiros passos](https://justino-code.github.io/sender/getting-started)
- [API Reference](https://justino-code.github.io/sender/api)

## 🔧 Providers

| Provider | Status |
|----------|--------|
| Ombala | ✅ |
| KambaSMS | 🚧 Em desenvolvimento |
| Sms.to, TelcoSMS, MIMO, WeSender | 🚧 Planeados |

## 📄 Licença

MIT © [Justino Contingo](https://github.com/Justino-code)