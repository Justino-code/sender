# Função utilitária para OTP

Envio de códigos de verificação (One-Time Password) para autenticação de dois fatores.

## Exemplo completo

```typescript
import { createSender, validatePhoneNumber } from "@jcsolutions/sender";

// Configurar o sender (uma vez)
const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "VERIFY",
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

## Com armazenamento em memória

```typescript
// Armazenamento temporário (em produção, use Redis ou banco de dados)
const otpStore = new Map<string, { code: string; expiresAt: Date }>();

async function sendAndStoreOtp(phone: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  if (!validatePhoneNumber(phone)) {
    return { success: false, error: "Número inválido" };
  }

  const code = generateOtp();

  try {
    await sms.send({
      to: phone,
      message: `Seu código de verificação é: ${code}. Válido por 5 minutos.`,
    });

    // Salvar OTP com expiração de 5 minutos
    otpStore.set(phone, {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`✅ OTP enviado para ${phone}`);
    return { success: true, code };
  } catch (error) {
    return { success: false, error: error.message };
  }
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

// Fluxo completo
async function otpFlow() {
  const phone = "923000000";

  // 1. Enviar OTP
  const sendResult = await sendAndStoreOtp(phone);
  if (!sendResult.success) {
    console.log("Falha ao enviar OTP:", sendResult.error);
    return;
  }

  console.log(`Código: ${sendResult.code}`); // Em produção, não logar!

  // 2. Simular verificação
  const isValid = verifyOtp(phone, sendResult.code!);
  console.log(isValid ? "Acesso permitido" : "Acesso negado");
}
```

## Com Redis (produção)

```typescript
import { Redis } from "ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function sendAndStoreOtpRedis(phone: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  if (!validatePhoneNumber(phone)) {
    return { success: false, error: "Número inválido" };
  }

  const code = generateOtp();

  try {
    await sms.send({
      to: phone,
      message: `Seu código é: ${code}. Válido por 5 minutos.`,
    });

    // Salvar no Redis com expiração de 5 minutos
    await redis.setex(`otp:${phone}`, 300, code);
    
    return { success: true, code };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyOtpRedis(phone: string, code: string): Promise<boolean> {
  const stored = await redis.get(`otp:${phone}`);
  
  if (!stored) {
    return false;
  }
  
  if (stored !== code) {
    return false;
  }
  
  await redis.del(`otp:${phone}`);
  return true;
}
```

## Com rate limiting

```typescript
// Limitar tentativas por número
const attemptStore = new Map<string, { count: number; lastAttempt: Date }>();

async function sendOtpWithRateLimit(phone: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  // Verificar rate limit (máximo 3 tentativas em 10 minutos)
  const attempts = attemptStore.get(phone);
  if (attempts && attempts.count >= 3) {
    const timeSinceLast = Date.now() - attempts.lastAttempt.getTime();
    if (timeSinceLast < 10 * 60 * 1000) {
      return { 
        success: false, 
        error: "Muitas tentativas. Aguarde 10 minutos." 
      };
    }
    // Reset após 10 minutos
    attemptStore.delete(phone);
  }

  const result = await sendAndStoreOtp(phone);

  if (result.success) {
    // Registrar tentativa
    const current = attemptStore.get(phone);
    attemptStore.set(phone, {
      count: (current?.count || 0) + 1,
      lastAttempt: new Date(),
    });
  }

  return result;
}
```

## Mensagem personalizada

```typescript
function getOtpMessage(code: string, appName: string = "App"): string {
  return `[${appName}] Seu código de verificação é: ${code}. Válido por 5 minutos. Não compartilhe este código.`;
}

// Uso
await sms.send({
  to: phone,
  message: getOtpMessage(code, "MeuBanco"),
});
// Resultado: "[MeuBanco] Seu código de verificação é: 482913. Válido por 5 minutos. Não compartilhe este código."
```

## Resumo

| Função | Descrição |
|--------|-----------|
| `generateOtp()` | Gera código aleatório de 6 dígitos |
| `sendOtp()` | Envia o código via SMS |
| `sendAndStoreOtp()` | Envia e armazena para verificação |
| `verifyOtp()` | Verifica se o código está correto |
| `sendOtpWithRateLimit()` | Adiciona limite de tentativas |

## Segurança

| Prática | Recomendação |
|---------|--------------|
| **Expiração** | 5 minutos é o padrão recomendado |
| **Rate limiting** | Máximo de 3 tentativas em 10 minutos |
| **Armazenamento** | Use Redis em produção (não memória) |
| **Logs** | Nunca logue códigos OTP em produção |

## Próximo passo

- [Voltar ao índice de exemplos](../examples.md)