# Exemplos práticos

Esta página contém exemplos completos e prontos para usar com o `@jscode/sender`.

## Índice

1. [Envio simples](#envio-simples)
2. [Envio com variáveis de ambiente](#envio-com-variáveis-de-ambiente)
3. [Envio em lote](#envio-em-lote)
4. [Tratamento de erros completo](#tratamento-de-erros-completo)
5. [Validação de números](#validação-de-números)
6. [Provider com fallback manual](#provider-com-fallback-manual)
7. [Envio com retry automático](#envio-com-retry-automático)
8. [Provider customizado completo](#provider-customizado-completo)
9. [Serviço Node.js com Express](#serviço-nodejs-com-express)
10. [Função utilitária para OTP](#função-utilitária-para-otp)

---

## Envio simples

O exemplo mais básico de envio de SMS.

```typescript
import { createSender } from "@jscode/sender";

// Configurar o provider
const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: "sua-api-key-aqui",
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});

// Enviar SMS
async function sendSimpleSms() {
  const result = await sms.send({
    from: "LEVAJA",
    to: "923000000",
    message: "Olá! Esta é uma mensagem de teste.",
  });

  if (result.success) {
    console.log("✅ SMS enviado com sucesso!");
    console.log(`ID da mensagem: ${result.messageId}`);
  } else {
    console.log("❌ Falha ao enviar SMS");
  }
}

sendSimpleSms();
```

---

Envio com variáveis de ambiente

Recomendado para produção. Nunca coloque API keys no código.

```typescript
// .env
// OMBALA_API_KEY=sua-chave-aqui
// OMBALA_BASE_URL=https://api.useombala.ao/v1

import { createSender } from "@jscode/sender";
import dotenv from "dotenv";

dotenv.config();

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY!,
    baseUrl: process.env.OMBALA_BASE_URL!,
    timeout: 10000,
  },
});

async function sendSmsWithEnv() {
  const result = await sms.send({
    from: "MEUAPP",
    to: "923000000",
    message: "Mensagem enviada com variáveis de ambiente!",
  });

  return result;
}
```

---

Envio em lote

Envie a mesma mensagem para múltiplos destinatários.

```typescript
import { createSender } from "@jscode/sender";

const sms = createSender({
  providerName: "kambasms",
  providerConfig: {
    token: process.env.KAMBASMS_API_KEY!,
    baseUrl: "https://api.kambasms.ao/v1",
    timeout: 15000,
    data: {
      senderId: "PROMO",
    },
  },
});

async function sendBatchSms() {
  const phones = [
    "923000001",
    "923000002",
    "923000003",
    "923000004",
    "923000005",
  ];

  const result = await sms.sendBatch({
    from: "PROMO",
    to: phones,
    message: "Promoção especial! Desconto de 20% hoje.",
  });

  console.log(`
    📊 Resumo do envio em lote:
    ✅ Sucessos: ${result.successful.length}
    ❌ Falhas: ${result.failed.length}
  `);

  // Detalhes individuais
  result.details?.forEach((detail) => {
    if (detail.messageId) {
      console.log(`✓ ${detail.to}: ${detail.messageId}`);
    } else {
      console.log(`✗ ${detail.to}: ${detail.error}`);
    }
  });

  return result;
}

sendBatchSms();
```

---

Tratamento de erros completo

Capturando todos os tipos de erro possíveis.

```typescript
import { createSender } from "@jscode/sender";
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError,
  ConfigurationError,
} from "@jscode/sender";

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY!,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 5000,
  },
});

async function sendSmsWithErrorHandling(phone: string, message: string) {
  try {
    const result = await sms.send({
      from: "LEVAJA",
      to: phone,
      message,
    });

    console.log("✅ Enviado com sucesso!");
    return { success: true, data: result };
  } catch (error) {
    // Erro de configuração
    if (error instanceof ConfigurationError) {
      console.error("❌ Erro de configuração:", error.message);
      console.error("Verifique se token e baseUrl estão corretos.");
      return { success: false, error: "CONFIG_ERROR", message: error.message };
    }

    // Erro de autenticação
    if (error instanceof AuthenticationError) {
      console.error("❌ Erro de autenticação:", error.message);
      console.error("Sua API key pode estar inválida ou expirada.");
      return { success: false, error: "AUTH_ERROR", message: error.message };
    }

    // Número inválido
    if (error instanceof ValidationError) {
      console.error("❌ Número inválido:", error.message);
      console.error("Use 9 dígitos (ex: 923000000)");
      return { success: false, error: "INVALID_PHONE", message: error.message };
    }

    // Limite excedido
    if (error instanceof RateLimitError) {
      console.error("❌ Limite excedido:", error.message);
      console.error("Aguarde alguns minutos e tente novamente.");
      return { success: false, error: "RATE_LIMIT", message: error.message };
    }

    // Timeout
    if (error instanceof TimeoutError) {
      console.error("❌ Timeout:", error.message);
      console.error("O servidor demorou muito para responder.");
      return { success: false, error: "TIMEOUT", message: error.message };
    }

    // Erro do provider
    if (error instanceof ProviderError) {
      console.error("❌ Erro no provider:", error.message);
      return { success: false, error: "PROVIDER_ERROR", message: error.message };
    }

    // Erro desconhecido
    console.error("❌ Erro desconhecido:", error);
    return { success: false, error: "UNKNOWN", message: String(error) };
  }
}

// Uso
sendSmsWithErrorHandling("923000000", "Teste de erro");
```

---

Validação de números

Valide números antes de enviar para evitar erros desnecessários.

```typescript
import {
  validatePhoneNumber,
  validatePhoneNumbers,
  normalizePhoneNumber,
  createSender,
} from "@jscode/sender";

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY!,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
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

  // Normalizar números (adiciona +244)
  const normalizedPhones = validPhones.map((p) => normalizePhoneNumber(p));
  console.log(`📞 Enviando para: ${normalizedPhones.join(", ")}`);

  const result = await sms.sendBatch({
    from: "LEVAJA",
    to: validPhones,
    message,
  });

  console.log(`✅ Enviados: ${result.successful.length}`);
  return result;
}

// Uso
const phones = ["923000001", "invalid", "813000000", "923000002"];
sendToValidPhones(phones, "Mensagem apenas para números válidos!");
```

---

Provider com fallback manual

Se um provider falhar, tenta outro automaticamente.

```typescript
import { createSender } from "@jscode/sender";

async function sendWithFallback(phone: string, message: string) {
  const providers = [
    {
      name: "ombala",
      config: {
        token: process.env.OMBALA_API_KEY!,
        baseUrl: "https://api.useombala.ao/v1",
        timeout: 10000,
      },
    },
    {
      name: "kambasms",
      config: {
        token: process.env.KAMBASMS_API_KEY!,
        baseUrl: "https://api.kambasms.ao/v1",
        timeout: 10000,
        data: { senderId: "FALLBACK" },
      },
    },
  ];

  for (const provider of providers) {
    try {
      console.log(`📤 Tentando com ${provider.name}...`);

      const sms = createSender({
        providerName: provider.name,
        providerConfig: provider.config,
      });

      const result = await sms.send({
        from: "LEVAJA",
        to: phone,
        message,
      });

      console.log(`✅ Enviado com ${provider.name}! ID: ${result.messageId}`);
      return { success: true, provider: provider.name, result };
    } catch (error) {
      console.log(`⚠️ Falha com ${provider.name}:`, error.message);
      // Continua para o próximo provider
    }
  }

  console.log("❌ Todos os providers falharam");
  return { success: false };
}

// Uso
sendWithFallback("923000000", "Mensagem com fallback!");
```

---

Envio com retry automático

Tenta enviar novamente em caso de falha.

```typescript
import { createSender } from "@jscode/sender";

async function sendWithRetry(
  phone: string,
  message: string,
  maxRetries: number = 3,
  delayMs: number = 2000
) {
  const sms = createSender({
    providerName: "ombala",
    providerConfig: {
      token: process.env.OMBALA_API_KEY!,
      baseUrl: "https://api.useombala.ao/v1",
      timeout: 10000,
    },
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Tentativa ${attempt}/${maxRetries}...`);

      const result = await sms.send({
        from: "LEVAJA",
        to: phone,
        message,
      });

      console.log(`✅ Enviado na tentativa ${attempt}! ID: ${result.messageId}`);
      return { success: true, attempt, result };
    } catch (error) {
      lastError = error as Error;
      console.log(`⚠️ Tentativa ${attempt} falhou:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando ${delayMs}ms antes de tentar novamente...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.log(`❌ Falhou após ${maxRetries} tentativas`);
  return { success: false, error: lastError };
}

// Uso
sendWithRetry("923000000", "Mensagem com retry!");
```

---

Provider customizado completo

Criando um provider do zero para um gateway hipotético.

```typescript
import {
  registerProvider,
  createSender,
  type SmsProvider,
  type SendMessageDto,
  type SendBatchMessageDto,
  type SendMessageResponse,
  type SendBatchMessageResponse,
  type ProviderConfig,
  AuthenticationError,
  RateLimitError,
  ProviderError,
  ValidationError,
  TimeoutError,
  ConfigurationError,
} from "@jscode/sender";

// 1. Criar a classe do provider
class MeuGatewayProvider implements SmsProvider {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly apiKey: string;

  constructor(private readonly config: ProviderConfig) {
    // Validações
    if (!config.token) {
      throw new ConfigurationError("API key é obrigatória");
    }

    if (!config.baseUrl) {
      throw new ConfigurationError("Base URL é obrigatória");
    }

    this.apiKey = config.token;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 10000;
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/sms/send`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          to: data.to,
          from: data.from,
          text: data.message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) throw new AuthenticationError();
        if (response.status === 429) throw new RateLimitError();
        if (response.status === 400) throw new ValidationError(result.message);
        throw new ProviderError(result.message);
      }

      return {
        success: true,
        provider: "meugateway",
        messageId: result.id,
        raw: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(this.timeout);
      }
      throw error;
    }
  }

  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse> {
    // Implementação simplificada para batch
    const results = await Promise.allSettled(
      data.to.map((phone) =>
        this.send({
          from: data.from,
          to: phone,
          message: data.message,
        })
      )
    );

    const successful: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(data.to[index]);
      } else {
        failed.push(data.to[index]);
      }
    });

    return {
      success: successful.length > 0,
      provider: "meugateway",
      successful,
      failed,
    };
  }
}

// 2. Registrar o provider
registerProvider("meugateway", MeuGatewayProvider);

// 3. Usar o provider
async function useCustomProvider() {
  const sms = createSender({
    providerName: "meugateway",
    providerConfig: {
      token: "minha-api-key",
      baseUrl: "https://api.meugateway.com/v1",
      timeout: 10000,
    },
  });

  const result = await sms.send({
    from: "MEUAPP",
    to: "923000000",
    message: "Enviado via provider customizado!",
  });

  console.log("Resultado:", result);
}
```

---

Serviço Node.js com Express

API REST para enviar SMS.

```typescript
import express, { Request, Response } from "express";
import { createSender } from "@jscode/sender";

const app = express();
app.use(express.json());

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY!,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});

// Endpoint para enviar SMS
app.post("/api/send", async (req: Request, res: Response) => {
  const { from, to, message } = req.body;

  // Validações
  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: "Os campos 'to' e 'message' são obrigatórios",
    });
  }

  try {
    const result = await sms.send({
      from: from || "LEVAJA",
      to,
      message,
    });

    return res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para envio em lote
app.post("/api/send-batch", async (req: Request, res: Response) => {
  const { from, to, message } = req.body;

  if (!to || !Array.isArray(to) || to.length === 0) {
    return res.status(400).json({
      success: false,
      error: "O campo 'to' deve ser um array não vazio",
    });
  }

  try {
    const result = await sms.sendBatch({
      from: from || "LEVAJA",
      to,
      message,
    });

    return res.json({
      success: true,
      successful: result.successful.length,
      failed: result.failed.length,
      details: result.details,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint para verificar status
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
```

---

Função utilitária para OTP

Envio de códigos de verificação.

```typescript
import { createSender, validatePhoneNumber } from "@jscode/sender";

const sms = createSender({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_API_KEY!,
    baseUrl: "https://api.useombala.ao/v1",
    timeout: 10000,
  },
});

// Gerar código OTP de 6 dígitos
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Enviar OTP
async function sendOtp(phone: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  // Validar número
  if (!validatePhoneNumber(phone)) {
    return {
      success: false,
      error: "Número de telefone inválido. Use 9 dígitos (ex: 923000000)",
    };
  }

  const code = generateOtp();

  try {
    const result = await sms.send({
      from: "VERIFY",
      to: phone,
      message: `Seu código de verificação é: ${code}. Válido por 5 minutos.`,
    });

    return {
      success: true,
      code,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Verificar OTP (simplificado - em produção, salvar no banco)
const otpStore = new Map<string, { code: string; expiresAt: Date }>();

async function sendAndStoreOtp(phone: string) {
  const result = await sendOtp(phone);

  if (result.success && result.code) {
    // Salvar OTP com expiração de 5 minutos
    otpStore.set(phone, {
      code: result.code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`✅ OTP enviado para ${phone}`);
    console.log(`🔑 Código: ${result.code} (apenas para teste)`);
  }

  return result;
}

function verifyOtp(phone: string, code: string): boolean {
  const record = otpStore.get(phone);

  if (!record) {
    console.log("❌ Nenhum código encontrado para este número");
    return false;
  }

  if (record.expiresAt < new Date()) {
    console.log("❌ Código expirado");
    otpStore.delete(phone);
    return false;
  }

  if (record.code !== code) {
    console.log("❌ Código incorreto");
    return false;
  }

  console.log("✅ Código verificado com sucesso!");
  otpStore.delete(phone);
  return true;
}

// Uso completo
async function otpFlow() {
  const phone = "923000000";

  // 1. Enviar OTP
  const sendResult = await sendAndStoreOtp(phone);
  if (!sendResult.success) {
    console.log("Falha ao enviar OTP:", sendResult.error);
    return;
  }

  // 2. Simular usuário digitando código
  const userCode = sendResult.code; // Em produção, viria do input do usuário

  // 3. Verificar OTP
  const isValid = verifyOtp(phone, userCode!);
  console.log(isValid ? "Acesso permitido" : "Acesso negado");
}

otpFlow();
```

---

Resumo dos exemplos

Exemplo Descrição
Envio simples O mínimo necessário para enviar SMS
Com variáveis de ambiente Configuração segura para produção
Envio em lote Enviar para múltiplos números
Tratamento de erros completo Capturar todos os tipos de erro
Validação de números Filtrar números inválidos
Fallback manual Tentar outro provider em caso de falha
Retry automático Tentar novamente em caso de falha
Provider customizado Criar seu próprio gateway
Serviço Express API REST para enviar SMS
Utilitário OTP Códigos de verificação completos
