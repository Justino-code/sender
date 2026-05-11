# Tratamento de erros completo

Capturando todos os tipos de erro possíveis ao enviar SMS.

## Exemplo completo

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
    // Erro de configuração
    if (error instanceof ConfigurationError) {
      console.error("❌ Erro de configuração:", error.message);
      console.error("   Verifique se token e baseUrl estão corretos.");
      return { success: false, error: "CONFIG_ERROR", message: error.message };
    }

    // Erro de autenticação
    if (error instanceof AuthenticationError) {
      console.error("❌ Erro de autenticação:", error.message);
      console.error("   Sua API key pode estar inválida ou expirada.");
      return { success: false, error: "AUTH_ERROR", message: error.message };
    }

    // Número inválido
    if (error instanceof ValidationError) {
      console.error("❌ Número inválido:", error.message);
      console.error("   Use 9 dígitos (ex: 923000000)");
      return { success: false, error: "INVALID_PHONE", message: error.message };
    }

    // Limite excedido
    if (error instanceof RateLimitError) {
      console.error("❌ Limite excedido:", error.message);
      console.error("   Aguarde alguns minutos e tente novamente.");
      return { success: false, error: "RATE_LIMIT", message: error.message };
    }

    // Timeout
    if (error instanceof TimeoutError) {
      console.error("❌ Timeout:", error.message);
      console.error("   O servidor demorou muito para responder.");
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
```

## Uso

```typescript
const result = await sendSmsWithErrorHandling("923000000", "Teste");

if (result.success) {
  console.log("Mensagem enviada com sucesso!");
} else {
  console.error(`Falha: ${result.error} - ${result.message}`);
}
```

## Tipos de erro

| Erro | Descrição | Quando ocorre |
|------|-----------|---------------|
| `ConfigurationError` | Erro de configuração | Token ou baseUrl faltando |
| `AuthenticationError` | Erro de autenticação | Token inválido ou expirado |
| `ValidationError` | Dados inválidos | Número ou remetente inválido |
| `RateLimitError` | Limite excedido | Muitas requisições |
| `TimeoutError` | Tempo excedido | API demorou para responder |
| `ProviderError` | Erro do provider | Erro interno da API |

## Próximo exemplo

- [Validação de números](./validation.md)