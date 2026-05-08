# sender

[![npm version](https://badge.fury.io/js/sender.svg)](https://www.npmjs.com/package/sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

SDK universal para envio de SMS com suporte a gateways angolanos.

---

## 📦 Sobre o projeto

**Sender** é uma biblioteca simples, extensível e type-safe para envio de SMS em aplicações Node.js. Foi construída com foco em **developers angolanos** que precisam integrar diferentes gateways de SMS (Ombala, KambaSMS, etc) sem reescrever lógica de integração.

### Filosofia

- **API limpa** — Envie SMS com poucas linhas de código
- **Desacoplamento** — Troque de provider sem alterar o resto da aplicação
- **Extensível** — Adicione qualquer gateway através do registry pattern
- **TypeScript first** — Tipos completos, autocomplete e segurança

### Casos de uso

- Códigos de verificação (OTP)
- Notificações transaccionais
- Alertas e lembretes
- Marketing SMS (envio em lote)

---

## 🚀 Instalação

```bash
yarn add sender
# ou
npm install sender
```

### Requisitos

- Node.js 18+ (para suporte ao `fetch` nativo)
- TypeScript 5+ (recomendado, mas opcional)

---

## 🔧 Providers suportados

| Provider | Status | Documentação |
|----------|--------|--------------|
| **Ombala** | ✅ Estável | [Ver docs](./docs/providers/ombala.md) |
| **KambaSMS** | ✅ Estável | [Ver docs](./docs/providers/kambasms.md) |

> Planeados: Ecsend, KwanzaSMS, Africell SMS

---

## 📝 Exemplo básico

```typescript
import { createSender } from "sender";

// Configurar o provider
const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});

// Enviar SMS
const result = await sms.send({
  from: "LEVAJA",
  to: "923000000",
  message: "Seu código de verificação é 482913",
});

if (result.success) {
  console.log(`✅ Enviado! ID: ${result.messageId}`);
}
```

---

## 📚 Documentação completa

A documentação completa está disponível em:

[https://Justino-code.github.io/sender/](https://Justino-code.github.io/sender/)

---

## 🧪 Exemplos práticos

### Envio em lote

```typescript
const result = await sms.sendBatch({
  from: "LEVAJA",
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial: 20% off hoje!",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);

---

## 🤝 Contribuição

Contribuições são bem-vindas!

### Como contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Reportar bugs

Abra uma [issue](https://github.com/teu-usuario/sender/issues) com:
- Versão do Node.js
- Versão do sender
- Código mínimo para reproduzir
- Comportamento esperado vs actual

---

## 📄 Licença

MIT © [Seu Nome]

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seudousuario](https://github.com/seudousuario)
- Email: seu.email@exemplo.com

---

## 🌟 Agradecimentos

- [Ombala](https://useombala.ao) — Gateway angolano de SMS
- [KambaSMS](https://kambasms.ao) — Plataforma de comunicação angolana

---

## 📊 Roadmap

- [x] Provider Ombala
- [x] Provider KambaSMS
- [x] Envio em lote
- [x] Registry pattern para providers customizados
- [x] Validação de números angolanos
- [ ] Provider Ecsend
- [ ] Provider KwanzaSMS
- [ ] Provider Africell SMS
- [ ] Retry automático
- [ ] Fallback entre providers (ex: Ombala → KambaSMS)
- [ ] Webhooks para status de entrega
