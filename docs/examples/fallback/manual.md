# Fallback manual (código)

Implemente fallback manualmente sem arquivo de configuração.

## Exemplo básico

```typescript
import { createSender } from "@jcsolutions/sender";

async function sendWithFallback(phone: string, message: string) {
  const providers = [
    { 
      name: "ombala", 
      config: { 
        token: process.env.OMBALA_TOKEN, 
        baseUrl: "https://api.useombala.ao/v1", 
        from: "LEVAJA" 
      } 
    },
    { 
      name: "kambasms", 
      config: { 
        token: process.env.KAMBASMS_TOKEN, 
        baseUrl: "https://api.kambasms.ao/v1" 
      } 
    },
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

## Uso

```typescript
const result = await sendWithFallback("923000000", "Mensagem importante!");

if (result.success) {
  console.log(`Mensagem enviada via ${result.provider}`);
} else {
  console.log("Falha ao enviar mensagem");
}
```

## Com retorno do último erro

```typescript
async function sendWithFallbackDetailed(phone: string, message: string) {
  const providers = [
    { name: "ombala", config: { token: process.env.OMBALA_TOKEN, baseUrl: "https://api.useombala.ao/v1", from: "LEVAJA" } },
    { name: "kambasms", config: { token: process.env.KAMBASMS_TOKEN, baseUrl: "https://api.kambasms.ao/v1" } },
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const sms = await createSender(provider.name, provider.config);
      const result = await sms.send({ to: phone, message });
      return { success: true, provider: provider.name, result };
    } catch (error) {
      lastError = error as Error;
      console.log(`⚠️ ${provider.name} falhou:`, error.message);
    }
  }

  return { success: false, error: lastError };
}
```

## Com fallback condicional

```typescript
async function sendWithConditionalFallback(phone: string, message: string) {
  // Tenta Ombala primeiro
  try {
    const ombala = await createSender("ombala", {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    });
    
    const result = await ombala.send({ to: phone, message });
    console.log("✅ Enviado via Ombala");
    return result;
  } catch (error) {
    console.log("⚠️ Ombala falhou, tentando KambaSMS...");
  }

  // Fallback para KambaSMS
  const kambasms = await createSender("kambasms", {
    token: process.env.KAMBASMS_TOKEN,
    baseUrl: "https://api.kambasms.ao/v1",
  });
  
  const result = await kambasms.send({ to: phone, message });
  console.log("✅ Enviado via KambaSMS (fallback)");
  return result;
}
```

## Quando usar fallback manual

| Cenário | Recomendação |
|---------|--------------|
| Configuração simples | Usar fallback automático no `sender.config.ts` |
| Lógica condicional complexa | Usar fallback manual |
| Testes específicos | Usar fallback manual |
| Integração com sistemas legados | Usar fallback manual |

## Próximo exemplo

- [Envio com retry automático](../advanced/retry.md)