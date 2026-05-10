# Exemplos práticos

Esta página contém exemplos completos e prontos para usar com o `@jcsolutions/sender`.

## Índice

1. [Envio simples](#envio-simples)
2. [Envio com configuração centralizada](#envio-com-configuração-centralizada)
3. [Envio em lote](#envio-em-lote)
4. [Tratamento de erros completo](#tratamento-de-erros-completo)
5. [Validação de números](#validação-de-números)
6. [Fallback automático (config)](#fallback-automático-config)
7. [Fallback manual (código)](#fallback-manual-código)
8. [Envio com retry automático](#envio-com-retry-automático)
9. [Provider customizado estendendo Provider](#provider-customizado-estendendo-provider)
10. [Serviço Node.js com Express](#serviço-nodejs-com-express)
11. [Função utilitária para OTP](#função-utilitária-para-otp)

---

## Envio simples

O exemplo mais básico de envio de SMS.

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

const result = await sms.send({
  to: "923000000",
  message: "Olá! Esta é uma mensagem de teste.",
});

if (result.success) {
  console.log(`✅ Enviado! ID: ${result.messageId}`);
} else {
  console.log("❌ Falha ao enviar SMS");
}
```

---

## Envio com configuração centralizada

Usando o arquivo `sender.config.ts`.

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
  },
});
```

```typescript
// app.ts
import { createSender } from "@jcsolutions/sender";

const sms = await createSender();  // usa configuração do arquivo

const result = await sms.send({
  to: "923000000",
  message: "Mensagem com configuração centralizada!",
});
```

---

## Envio em lote

Envie a mesma mensagem para múltiplos destinatários.

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://api.kambasms.ao/v1",
});

const phones = ["923000001", "923000002", "923000003"];

const result = await sms.sendBatch({
  to: phones,
  message: "Promoção especial! Desconto de 20% hoje.",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);

// Detalhes individuais
result.details?.forEach((detail) => {
  if (detail.messageId) {
    console.log(`✓ ${detail.to}: ${detail.messageId}`);
  } else {
    console.log(`✗ ${detail.to}: ${detail.error}`);
  }
});
```

---

## Tratamento de erros completo

Capturando todos os tipos de erro possíveis.

```typescript
import { createSender } from "@jcsolutions/sender";
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError,
  ConfigurationError,
} from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

async function sendSmsWithErrorHandling(phone: string, message: string) {
  try {
    const result = await sms.send({
      to: phone,
      message,
    });

    console.log("✅ Enviado com sucesso!");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error("❌ Configuração inválida:", error.message);
      return { success: false, error: "CONFIG_ERROR", message: error.message };
    }

    if (error instanceof AuthenticationError) {
      console.error("❌ Token inválido:", error.message);
      return { success: false, error: "AUTH_ERROR", message: error.message };
    }

    if (error instanceof ValidationError) {
      console.error("❌ Número inválido:", error.message);
      return { success: false, error: "INVALID_PHONE", message: error.message };
    }

    if (error instanceof RateLimitError) {
      console.error("❌ Limite excedido:", error.message);
      return { success: false, error: "RATE_LIMIT", message: error.message };
    }

    if (error instanceof TimeoutError) {
      console.error("❌ Timeout:", error.message);
      return { success: false, error: "TIMEOUT", message: error.message };
    }

    if (error instanceof ProviderError) {
      console.error("❌ Erro no provider:", error.message);
      return { success: false, error: "PROVIDER_ERROR", message: error.message };
    }

    console.error("❌ Erro desconhecido:", error);
    return { success: false, error: "UNKNOWN", message: String(error) };
  }
}
```

---

## Validação de números

Valide números antes de enviar para evitar erros desnecessários.

```typescript
import {
  createSender,
  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
} from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

// Validar um único número
function isValidAngolanPhone(phone: string): boolean {
  const isValid = validatePhoneNumber(phone);
  if (!isValid) {
    console.log(`❌ ${phone} não é um número angolano válido`);
  }
  return isValid;
}

// Validar múltiplos números
function filterValidPhones(phones: string[]): string[] {
  const { valid, invalid } = validatePhoneNumbers(phones);

  if (invalid.length > 0) {
    console.log(`⚠️ Números inválidos ignorados: ${invalid.join(", ")}`);
  }

  return valid;
}

// Enviar apenas para números válidos
async function sendToValidPhones(phones: string[], message: string) {
  const validPhones = filterValidPhones(phones);

  if (validPhones.length === 0) {
    console.log("❌ Nenhum número válido para enviar");
    return;
  }

  const normalizedPhones = validPhones.map((p) => normalizePhoneNumber(p));
  console.log(`📞 Enviando para: ${normalizedPhones.join(", ")}`);

  const result = await sms.sendBatch({
    to: validPhones,
    message,
  });

  console.log(`✅ Enviados: ${result.successful.length}`);
  return result;
}

// Uso
const phones = ["923000001", "invalid", "813000000", "923000002"];
await sendToValidPhones(phones, "Mensagem apenas para números válidos!");
```

---

## Fallback automático (config)

Configure fallback no `sender.config.ts` para resiliência automática.

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms"],  // se ombala falhar, tenta kambasms
  
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
import { createSender } from "@jcsolutions/sender";

const sms = await createSender();  // fallback automático!

// Se Ombala falhar, tenta KambaSMS automaticamente
const result = await sms.send({
  to: "923000000",
  message: "Mensagem com fallback automático!",
});
```

---

## Fallback manual (código)

Implemente fallback manualmente sem arquivo de configuração.

```typescript
import { createSender } from "@jcsolutions/sender";

async function sendWithFallback(phone: string, message: string) {
  const providers = [
    { name: "ombala", config: { token: process.env.OMBALA_TOKEN, baseUrl: "https://api.useombala.ao/v1", from: "LEVAJA" } },
    { name: "kambasms", config: { token: process.env.KAMBASMS_TOKEN, baseUrl: "https://api.kambasms.ao/v1" } },
  ];

  for (const provider of providers) {
    try {
      console.log(`📤 Tentando com ${provider.name}...`);
      const sms = await createSender(provider.name, provider.config);
      const result = await sms.send({ to: phone, message });
      console.log(`✅ Enviado com ${provider.name}! ID: ${result.messageId}`);
      return { success: true, provider: provider.name, result };
    } catch (error) {
      console.log(`⚠️ Falha com ${provider.name}:`, error.message);
    }
  }

  console.log("❌ Todos os providers falharam");
  return { success: false };
}
```

---

## Envio com retry automático

Tenta enviar novamente em caso de falha.

```typescript
import { createSender } from "@jcsolutions/sender";

async function sendWithRetry(
  phone: string,
  message: string,
  maxRetries: number = 3,
  delayMs: number = 2000
) {
  const sms = await createSender("ombala", {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Tentativa ${attempt}/${maxRetries}...`);
      const result = await sms.send({ to: phone, message });
      console.log(`✅ Enviado na tentativa ${attempt}! ID: ${result.messageId}`);
      return { success: true, attempt, result };
    } catch (error) {
      lastError = error as Error;
      console.log(`⚠️ Tentativa ${attempt} falhou:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.log(`❌ Falhou após ${maxRetries} tentativas`);
  return { success: false, error: lastError };
}
```

---

## Provider customizado estendendo Provider

Criando um provider do zero estendendo a classe base `Provider`.

```typescript
import {
  Provider,
  registerProvider,
  createSender,
  type SendMessageDto,
  type SendMessageResponse,
  type ProviderConfig,
  ConfigurationError,
  ValidationError,
} from "@jcsolutions/sender";

// 1. Estender a classe Provider
class MeuGatewayProvider extends Provider {
  protected readonly providerName = "meugateway";
  private readonly from: string;

  constructor(config: ProviderConfig) {
    super(config);
    
    if (!config.from) {
      throw new ConfigurationError("MeuGatewayProvider: from é obrigatório");
    }
    this.from = config.from;
  }

  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError("Número inválido");
    }

    const body = {
      to: this.normalizePhone(data.to),
      from: this.from,
      text: data.message,
    };

    const response = await this.request("/send", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result?.message);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: this.extractMessageId(result),
      raw: result,
    };
  }
}

// 2. Registrar o provider
registerProvider("meugateway", MeuGatewayProvider);

// 3. Usar o provider
const sms = await createSender("meugateway", {
  token: "minha-api-key",
  baseUrl: "https://api.meugateway.com/v1",
  from: "MEUAPP",
});

const result = await sms.send({
  to: "923000000",
  message: "Enviado via provider customizado!",
});
```

---

## Serviço Node.js com Express

API REST para enviar SMS.

```typescript
import express, { Request, Response } from "express";
import { createSender } from "@jcsolutions/sender";

const app = express();
app.use(express.json());

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

// Endpoint para enviar SMS
app.post("/api/send", async (req: Request, res: Response) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: "Os campos 'to' e 'message' são obrigatórios",
    });
  }

  try {
    const result = await sms.send({ to, message });
    return res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para envio em lote
app.post("/api/send-batch", async (req: Request, res: Response) => {
  const { to, message } = req.body;

  if (!to || !Array.isArray(to) || to.length === 0) {
    return res.status(400).json({
      success: false,
      error: "O campo 'to' deve ser um array não vazio",
    });
  }

  try {
    const result = await sms.sendBatch({ to, message });
    return res.json({
      success: true,
      successful: result.successful.length,
      failed: result.failed.length,
      details: result.details,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
```

---

## Função utilitária para OTP

Envio de códigos de verificação.

```typescript
import { createSender, validatePhoneNumber } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "VERIFY",
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(phone: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  if (!validatePhoneNumber(phone)) {
    return {
      success: false,
      error: "Número de telefone inválido. Use 9 dígitos (ex: 923000000)",
    };
  }

  const code = generateOtp();

  try {
    await sms.send({
      to: phone,
      message: `Seu código de verificação é: ${code}. Válido por 5 minutos.`,
    });

    return { success: true, code };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Uso
const result = await sendOtp("923000000");
if (result.success) {
  console.log(`✅ Código enviado: ${result.code}`);
} else {
  console.log(`❌ Erro: ${result.error}`);
}
```

---

## Resumo dos exemplos

| Exemplo | Descrição |
|---------|-----------|
| Envio simples | Configuração direta e envio básico |
| Configuração centralizada | Usando `sender.config.ts` |
| Envio em lote | Múltiplos destinatários |
| Tratamento de erros | Captura de todos os tipos de erro |
| Validação de números | Filtra números inválidos |
| Fallback automático | Configuração no arquivo |
| Fallback manual | Implementação em código |
| Retry automático | Tentativas em caso de falha |
| Provider customizado | Estendendo a classe `Provider` |
| Serviço Express | API REST para SMS |
| Utilitário OTP | Códigos de verificação |