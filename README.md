v# @jcsolutions/sender

> ⚠️ **Aviso**: Esta biblioteca está em desenvolvimento (alpha). A API pode sofrer alterações até a versão estável 1.0.0.

[![npm version](https://badge.fury.io/js/%40jcsolutions%2Fsender.svg)](https://www.npmjs.com/package/@jcsolutions/sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

SDK universal para envio de SMS com suporte a gateways angolanos.

---

## 📦 Sobre o projeto

**@jcsolutions/sender** é uma biblioteca simples, extensível e type-safe para envio de SMS em aplicações Node.js. Foi construída com foco em **developers angolanos** que precisam integrar diferentes gateways de SMS (Ombala, KambaSMS, etc) sem reescrever lógica de integração.

### Filosofia

- **API limpa** — Envie SMS com poucas linhas de código
- **Desacoplamento** — Troque de provider sem alterar o resto da aplicação
- **Extensível** — Adicione qualquer gateway através do registry pattern
- **TypeScript first** — Tipos completos, autocomplete e segurança
- **Fallback automático** — Resiliência com múltiplos providers

### Casos de uso

- Códigos de verificação (OTP)
- Notificações transaccionais
- Alertas e lembretes
- Marketing SMS (envio em lote)

---

## 🚀 Instalação

```bash
yarn add @jcsolutions/sender
# ou
npm install @jcsolutions/sender
```

### Requisitos

- Node.js 18+ (para suporte ao fetch nativo)
- TypeScript 5+ (recomendado, mas opcional)

---

## 🔧 Providers suportados

| Provider | Status | Documentação |
|----------|--------|--------------|
| **Ombala** | ✅ Estável | [Ver docs](./docs/providers.md#ombala) |
| **KambaSMS** | ✅ Estável | [Ver docs](./docs/providers.md#kambasms) |

> Planeados: Sms.to, TelcoSMS, MIMO, WeSender

---

## 📝 Exemplo básico

```typescript
import { createSender } from "@jcsolutions/sender";

// Configurar o provider
const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",           // obrigatório para Ombala
});

// Enviar SMS
const result = await sms.send({
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

[https://justino-code.github.io/sender/](https://justino-code.github.io/sender/)

---

## 🧪 Exemplos práticos

### Configuração centralizada (recomendado)

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
// app.ts
const sms = await createSender();  // usa ombala com fallback para kambasms

await sms.send({
  to: "923000000",
  message: "Mensagem com fallback automático!",
});
```

### Envio em lote

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial: 20% off hoje!",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);
```

### Tratamento de erros

```typescript
import { AuthenticationError, RateLimitError, ValidationError } from "@jcsolutions/sender";

try {
  await sms.send({
    to: "923000000",
    message: "Teste",
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Token inválido ou expirado");
  } else if (error instanceof RateLimitError) {
    console.error("Limite de requisições excedido");
  } else if (error instanceof ValidationError) {
    console.error("Número de telefone inválido");
  } else {
    console.error("Erro desconhecido:", error.message);
  }
}
```

### Validar número antes de enviar

```typescript
import { validatePhoneNumber, normalizePhoneNumber } from "@jcsolutions/sender";

const phone = "923000000";

if (validatePhoneNumber(phone)) {
  const normalized = normalizePhoneNumber(phone); // +244923000000
  await sms.send({
    to: phone,
    message: "Olá!",
  });
} else {
  console.error("Número inválido");
}
```

### Provider customizado (estendendo Provider)

```typescript
import { Provider, registerProvider, createSender } from "@jcsolutions/sender";

class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  
  async send(data) {
    // implementação
    return { success: true, provider: this.providerName, messageId: "123" };
  }
}

registerProvider("meuprovider", MeuProvider);

const sms = await createSender("meuprovider", {
  token: "xyz",
  baseUrl: "https://api.com",
});
```

---

## 🤝 Contribuição

Contribuições são bem-vindas!

Consulte o [guia de contribuição](./CONTRIBUTING.md) para mais detalhes.

### Reportar bugs

Abra uma [issue](https://github.com/Justino-code/sender/issues)

---

## 📄 Licença

MIT © [Justino Contingo](https://github.com/Justino-code)

---

## 👤 Autor

**Justino Contingo**
- GitHub: [@Justino-code](https://github.com/Justino-code)
- Email: justinocontingo@gmail.com

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
- [x] Classe base Provider
- [x] Configuração centralizada (sender.config.ts)
- [x] Fallback automático
- [ ] Provider Sms.to
- [ ] Provider TelcoSMS
- [ ] Provider MIMO
- [ ] Provider WeSender
- [ ] Retry automático
- [ ] Webhooks para status de entrega
