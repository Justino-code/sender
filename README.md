# @jcsolutions/sender

> ⚠️ **Aviso**: Em desenvolvimento (alpha). A API pode mudar até a versão 1.0.0.

> 📌 **Aviso de independência**: Este projeto é de código aberto, **independente** e não é oficialmente afiliado, patrocinado ou endossado por nenhum dos provedores de SMS suportados. Os nomes dos provedores são marcas registradas de seus respectivos proprietários.

[![npm version](https://img.shields.io/npm/v/@jcsolutions/sender.svg)](https://www.npmjs.com/package/@jcsolutions/sender)
[![Socket Badge](https://badge.socket.dev/npm/package/@jcsolutions/sender)](https://socket.dev/npm/package/@jcsolutions/sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@jcsolutions/sender)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tests](https://github.com/Justino-code/sender/actions/workflows/test.yml/badge.svg)](https://github.com/Justino-code/sender/actions/workflows/test.yml)
[![Security Audit](https://github.com/Justino-code/sender/actions/workflows/audit.yml/badge.svg)](https://github.com/Justino-code/sender/actions/workflows/audit.yml)
![Coverage](https://img.shields.io/badge/coverage-84.86%25-brightgreen)
[![PR Checks](https://github.com/Justino-code/sender/actions/workflows/pr.yml/badge.svg)](https://github.com/Justino-code/sender/actions/workflows/pr.yml)

SDK para envio de SMS com suporte a gateways angolanos.

## Segurança

O SDK faz requisições HTTP para as APIs dos provedores de SMS.
Todas as requisições são feitas via `fetch` nativo do Node.js.

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

| Provider | Status | Adicionado em | Estável desde |
|----------|--------|---------------|---------------|
| **Ombala** | ✅ Estável | `v0.1.0-alpha.1` | `v0.1.0-alpha.4` |
| **TelcoSMS** | ✅ Estável | - | - |
| **KambaSMS** | 🚧 Em desenvolvimento | `v0.1.0-alpha.1` | - |
| MIMO | 📋 Planeado | - | - |
| Sms.to | 📋 Planeado | - | - |
| WeSender | 📋 Planeado | - | - |
## 📄 Licença

MIT © [Justino Contingo](https://github.com/Justino-code)
