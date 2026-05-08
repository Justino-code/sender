# @jcsolutions/sender

> ⚠️ **Aviso**: Esta biblioteca está em desenvolvimento (alpha). A API pode sofrer alterações até a versão estável 1.0.0.

[![npm version](https://badge.fury.io/js/%40justino-code%2Fsender.svg)](https://www.npmjs.com/package/@justino-code/sender)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

SDK universal para envio de SMS com suporte a gateways angolanos.

---

## 📦 Sobre o projeto

**@jscode/sender** é uma biblioteca simples, extensível e type-safe para envio de SMS em aplicações Node.js. Foi construída com foco em **developers angolanos** que precisam integrar diferentes gateways de SMS (Ombala, KambaSMS, etc) sem reescrever lógica de integração.

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
yarn add @jcsolutions/sender
# ou
npm install @jcsolutions/sender
```

Requisitos

· Node.js 18+ (para suporte ao fetch nativo)
· TypeScript 5+ (recomendado, mas opcional)

---

🔧 Providers suportados

Provider Status Documentação
Ombala ✅ Estável Ver docs
KambaSMS ✅ Estável Ver docs

Planeados: Ecsend, KwanzaSMS, Africell SMS

---

📝 Exemplo básico

```typescript
import { createSender } from "@jcsolutions/sender";

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

📚 Documentação completa

A documentação completa está disponível em:

https://justino-code.github.io/sender/

---

🧪 Exemplos práticos

Envio em lote

```typescript
const result = await sms.sendBatch({
  from: "LEVAJA",
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial: 20% off hoje!",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);
```

Tratamento de erros

```typescript
import { AuthenticationError, RateLimitError, ValidationError } from "@justino-code/sender";

try {
  await sms.send({
    from: "LEVAJA",
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

Validar número antes de enviar

```typescript
import { validatePhoneNumber, normalizePhoneNumber } from "@jcsolutions/sender";

const phone = "923000000";

if (validatePhoneNumber(phone)) {
  const normalized = normalizePhoneNumber(phone); // +244923000000
  await sms.send({
    from: "LEVAJA",
    to: phone,
    message: "Olá!",
  });
} else {
  console.error("Número inválido");
}
```

Provider customizado

```typescript
import { registerProvider, createSender, type SmsProvider } from "@jcsolutions/sender";

class MeuProvider implements SmsProvider {
  async send(data) {
    return { success: true, provider: "meuprovider", messageId: "123" };
  }
  
  async sendBatch(data) {
    return { success: true, provider: "meuprovider", successful: data.to, failed: [] };
  }
}

registerProvider("meuprovider", MeuProvider);

const sms = createSender({
  providerName: "meuprovider",
  providerConfig: { token: "xyz", baseUrl: "https://api.com", timeout: 10000 },
});
```

---

🤝 Contribuição

Contribuições são bem-vindas!

Consulte o guia de contribuição para mais detalhes.

Reportar bugs

Abra uma issue

---

📄 Licença

MIT © Justino Contingo

---

👤 Autor

Justino Contingo

· GitHub: @Justino-code
· Email: justinocontingo@gmail.com

---

🌟 Agradecimentos

· Ombala — Gateway angolano de SMS
· KambaSMS — Plataforma de comunicação angolana

---

📊 Roadmap

· Provider Ombala
· Provider KambaSMS
· Envio em lote
· Registry pattern para providers customizados
· Validação de números angolanos
· Provider Ecsend
· Provider KwanzaSMS
· Provider Africell SMS
· Retry automático
· Fallback entre providers
· Webhooks para status de entrega
