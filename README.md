# @jcsolutions/sender

> 📌 **Aviso de independência**: Este projeto é de código aberto, **independente** e não é oficialmente afiliado, patrocinado ou endossado por nenhum dos provedores de SMS suportados. Os nomes e marcas mencionados pertencem aos seus respectivos proprietários.

[![npm version](https://img.shields.io/npm/v/@jcsolutions/sender.svg)](https://www.npmjs.com/package/@jcsolutions/sender)
[![Socket Badge](https://badge.socket.dev/npm/package/@jcsolutions/sender)](https://socket.dev/npm/package/@jcsolutions/sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@jcsolutions/sender)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tests](https://github.com/Justino-code/sender/actions/workflows/test.yml/badge.svg)](https://github.com/Justino-code/sender/actions/workflows/test.yml)
[![Security Audit](https://github.com/Justino-code/sender/actions/workflows/audit.yml/badge.svg)](https://github.com/Justino-code/sender/actions/workflows/audit.yml)
![Coverage](https://img.shields.io/badge/coverage-84.86%25-brightgreen)

SDK para envio de SMS com suporte a gateways angolanos.

O `@jcsolutions/sender` funciona como uma camada de integração entre aplicações e providers de SMS. Ele fornece uma interface consistente para envio de mensagens, mantendo a lógica específica de cada provider isolada.

## O que resolve

Integrar diretamente vários gateways de SMS pode exigir lógica específica para cada API, incluindo autenticação, formatos de requisição, respostas, tratamento de erros e limites de utilização.

O `sender` centraliza essas preocupações e permite que a aplicação utilize providers diferentes sem espalhar integrações específicas pelo código.

O projeto não é um gateway de telecomunicações e não substitui os providers suportados. O envio depende das APIs, credenciais, disponibilidade, quotas e regras de cada provider.

## Funcionalidades

- Interface comum para diferentes providers de SMS;
- suporte a envio individual e em lote;
- validação e normalização de números angolanos;
- tratamento padronizado de erros;
- timeout de requisições;
- retries configuráveis;
- fallback entre providers configurados;
- registro e criação de providers personalizados;
- suporte a TypeScript;
- utilização do `fetch` nativo do Node.js.

## Segurança

O SDK faz requisições HTTP para as APIs dos provedores de SMS. Todas as requisições são feitas via `fetch` nativo do Node.js.

Não coloque tokens diretamente no código ou no repositório. Utilize variáveis de ambiente e evite registrar credenciais, mensagens ou respostas completas dos providers em logs públicos.

O `sender` não garante a entrega final do SMS. A entrega depende do provider, da rede móvel, das quotas, das credenciais e das condições externas do serviço utilizado.

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
  from: "923000000",  // Seu número cadastrado na plataforma
});

const result = await sms.send({
  to: "923000000",
  message: "Seu código é 482913",
});

console.log(result.success ? "✅ Enviado" : "❌ Falha");
```

## 🔁 Fallback e confiabilidade

Quando configurado com um provider padrão e providers alternativos, o `sender` pode tentar outro provider caso o atual falhe.

O comportamento de fallback depende da configuração e das características de cada provider. Providers diferentes podem possuir APIs, limites, custos e resultados distintos.

Timeouts e retries também devem ser configurados de acordo com as regras do provider e com as necessidades da aplicação. Em operações de envio, retries devem ser usados com cuidado para evitar mensagens duplicadas quando o resultado de uma requisição for desconhecido.

## 📦 Envio em lote

O SDK permite enviar mensagens para vários números e retornar o resultado individual de cada destinatário, incluindo sucessos, falhas e números inválidos.

Os limites de lote, formatos aceitos e requisitos adicionais podem variar de acordo com o provider utilizado.

## 📚 Documentação

- [Documentação completa](https://justino-code.github.io/sender/)
- [Primeiros passos](https://justino-code.github.io/sender/getting-started)
- [API Reference](https://justino-code.github.io/sender/api)

## 🔧 Providers

| Provider | Status | Adicionado em | Estável desde |
|----------|--------|---------------|---------------|
| **Ombala** | ✅ Estável | `v0.1.0-alpha.1` | `v0.1.0-alpha.4` |
| **TelcoSMS** | ✅ Estável | - | `1.0.0` |
| **WhatsApp (Meta)** | 🚧 Em desenvolvimento | - | - |
| **KambaSMS** | 🚧 Em pausa | `v0.1.0-alpha.1` | - |
| MIMO | 📋 Planeado | - | - |
| Sms.to | 📋 Planeado | - | - |
| WeSender | 📋 Planeado | - | - |

## 🤝 Contribuição

As contribuições são bem-vindas. Consulte o [guia de contribuição](CONTRIBUTING.md) antes de abrir uma issue ou pull request.

## 📄 Licença

MIT © [Justino Contingo](https://github.com/Justino-code)
