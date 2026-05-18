# Configuração do @jcsolutions/sender

O SDK oferece um sistema de configuração flexível que permite centralizar as credenciais dos seus providers e configurar fallback automático.

## Índice

1. [Arquivo de configuração](#arquivo-de-configuração)
2. [Configuração básica](#configuração-básica)
3. [Fallback automático](#fallback-automático)
4. [Variáveis de ambiente](#variáveis-de-ambiente)
5. [Múltiplos ambientes](#múltiplos-ambientes)
6. [API de configuração](#api-de-configuração)
7. [Exemplos completos](#exemplos-completos)

---

## Arquivo de configuração

Crie um arquivo `sender.config.ts` (ou `.js`) na raiz do seu projeto:

```typescript
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  // Configuração aqui
});
```

### Estrutura completa

```typescript
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  // Provider padrão (obrigatório se usar fallback)
  defaultProvider: "ombala",
  
  // Fallback providers (tentados em ordem)
  fallbackProviders: ["telcosms"],
  
  // Configuração de cada provider
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
      timeout: 10000,
    },
    
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
      timeout: 10000,
    },
    
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://nexasms-api.onrender.com",
      timeout: 10000,
      data: {
        senderId: "MEUAPP",
      },
    },
  },
});
```

---

## Configuração básica

### Provider Ombala

```typescript
ombala: {
  token: process.env.OMBALA_TOKEN,        // Obrigatório
  baseUrl: "https://api.useombala.ao/v1", // Obrigatório
  from: "LEVAJA",                         // Obrigatório para Ombala
  timeout: 10000,                         // Opcional (padrão: 10000)
}
```

### Provider TelcoSMS

```typescript
telcosms: {
  token: process.env.TELCOSMS_API_KEY,    // Obrigatório
  baseUrl: "https://www.telcosms.co.ao",  // Obrigatório
  timeout: 10000,                         // Opcional (padrão: 10000)
}
```

### Provider KambaSMS

```typescript
kambasms: {
  token: process.env.KAMBASMS_TOKEN,             // Obrigatório
  baseUrl: "https://nexasms-api.onrender.com",   // Obrigatório
  timeout: 10000,                                // Opcional
  data: {
    senderId: "MEUAPP",                          // Opcional
  },
}
```

---

## Fallback automático

Quando configurado, o SDK tenta automaticamente os providers em ordem:

```typescript
export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["telcosms", "kambasms"],
  
  providers: {
    ombala: { ... },
    telcosms: { ... },
    kambasms: { ... },
  },
});
```

### Comportamento:

| Tentativa | Provider | Ação |
|-----------|----------|------|
| 1º | Ombala | Tenta enviar |
| 2º | TelcoSMS | Se Ombala falhar |
| 3º | KambaSMS | Se TelcoSMS falhar |

### Uso:

```typescript
import { createSender } from "@jcsolutions/sender";

// Já tem fallback automático!
const sms = await createSender();

// Se Ombala falhar, tenta TelcoSMS, depois KambaSMS
await sms.send({
  to: "923000000",
  message: "Mensagem com fallback automático!",
});
```

### Fallback com provider específico

Quando você especifica um provider, o fallback **não** é aplicado:

```typescript
// Sem fallback (usa apenas Ombala)
const sms = await createSender("ombala");
```

---

## Variáveis de ambiente

Recomendado para produção (secrets não ficam no código):

### Arquivo `.env`

```env
# Ombala
OMBALA_TOKEN=omb_abc123def456
OMBALA_BASE_URL=https://api.useombala.ao/v1
OMBALA_FROM=LEVAJA

# TelcoSMS
TELCOSMS_API_KEY=tel_xyz789ghi012
TELCOSMS_BASE_URL=https://www.telcosms.co.ao

# KambaSMS
KAMBASMS_TOKEN=kam_345jkl678mno
KAMBASMS_BASE_URL=https://nexasms-api.onrender.com
KAMBASMS_SENDER_ID=MEUAPP
```

### Arquivo `sender.config.ts`

```typescript
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["telcosms", "kambasms"],
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: process.env.OMBALA_BASE_URL,
      from: process.env.OMBALA_FROM,
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: process.env.TELCOSMS_BASE_URL,
    },
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: process.env.KAMBASMS_BASE_URL,
      data: {
        senderId: process.env.KAMBASMS_SENDER_ID,
      },
    },
  },
});
```

---

## Múltiplos ambientes

### Desenvolvimento vs Produção

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: isProduction ? ["telcosms", "kambasms"] : ["telcosms"],
  
  providers: {
    ombala: {
      token: isProduction 
        ? process.env.OMBALA_TOKEN_PROD 
        : process.env.OMBALA_TOKEN_DEV,
      baseUrl: isProduction 
        ? "https://api.useombala.ao/v1"
        : "https://sandbox.useombala.ao/v1",
      from: "LEVAJA",
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
    },
  },
});
```

### Múltiplas configurações nomeadas

```typescript
// sender.config.ts
export default defineConfig({
  defaultProvider: "ombala",
  
  providers: {
    // Produção
    ombala: {
      token: process.env.OMBALA_TOKEN_PROD,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    
    // Sandbox para testes
    ombala_sandbox: {
      token: process.env.OMBALA_TOKEN_SANDBOX,
      baseUrl: "https://sandbox.useombala.ao/v1",
      from: "TESTE",
    },
  },
});
```

```typescript
// Usar sandbox
const sms = await createSender("ombala_sandbox");
```

---

## API de configuração

### `defineConfig(config)`

Define a configuração do sender (usado no `sender.config.ts`).

```typescript
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  providers: { ... },
});
```

### `loadConfig()`

Carrega a configuração do arquivo.

```typescript
import { loadConfig } from "@jcsolutions/sender";

const config = await loadConfig();
console.log(config?.defaultProvider);
```

### `getProviderConfig(providerName)`

Obtém a configuração de um provider específico.

```typescript
import { getProviderConfig } from "@jcsolutions/sender";

const ombalaConfig = await getProviderConfig("ombala");
console.log(ombalaConfig?.baseUrl);
```

### `getDefaultProvider()`

Obtém o nome do provider padrão.

```typescript
import { getDefaultProvider } from "@jcsolutions/sender";

const defaultProvider = await getDefaultProvider();
console.log(`Provider padrão: ${defaultProvider}`);
```

### `getFallbackProviders()`

Obtém a lista de fallback providers.

```typescript
import { getFallbackProviders } from "@jcsolutions/sender";

const fallbacks = await getFallbackProviders();
console.log(`Fallback: ${fallbacks.join(" → ")}`);
```

---

## Exemplos completos

### Exemplo 1: Configuração mínima (apenas Ombala)

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
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

const sms = await createSender("ombala");
```

### Exemplo 2: Configuração com fallback (Ombala → TelcoSMS)

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["telcosms"],
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
    },
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
    },
  },
});
```

```typescript
// app.ts
const sms = await createSender(); // fallback automático!
```

### Exemplo 3: Configuração avançada com múltiplos providers

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: process.env.NODE_ENV === "production" ? "ombala" : "ombala_sandbox",
  fallbackProviders: process.env.NODE_ENV === "production" ? ["telcosms", "kambasms"] : [],
  
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN_PROD,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",
      timeout: 10000,
    },
    
    ombala_sandbox: {
      token: process.env.OMBALA_TOKEN_SANDBOX,
      baseUrl: "https://sandbox.useombala.ao/v1",
      from: "TESTE",
      timeout: 5000,
    },
    
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
      timeout: 10000,
    },
    
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://nexasms-api.onrender.com",
      timeout: 15000,
      data: {
        senderId: "PROD_APP",
      },
    },
  },
});
```

---

## Erros comuns

### Erro: "Provider não especificado"

```
Error: Provider não especificado. Passe providerName ou configure defaultProvider no sender.config.ts
```

**Solução:** Defina `defaultProvider` no arquivo de configuração ou passe o nome do provider:

```typescript
// Opção 1: Configurar defaultProvider
export default defineConfig({
  defaultProvider: "ombala",
  providers: { ... }
});

// Opção 2: Passar providerName
const sms = await createSender("ombala");
```

### Erro: "Configuração incompleta"

```
Error: Configuração incompleta para provider "ombala". Verifique suas credenciais.
```

**Solução:** Verifique se `token` e `baseUrl` estão configurados:

```typescript
providers: {
  ombala: {
    token: process.env.OMBALA_TOKEN,     // ← obrigatório
    baseUrl: process.env.OMBALA_BASE_URL, // ← obrigatório
    from: "LEVAJA", // ← obrigatório para ombala
  },
}
```

---

## Boas práticas

| Prática | Recomendação |
|---------|--------------|
| **Secrets** | Use variáveis de ambiente, nunca hardcode |
| **Fallback** | Configure pelo menos 2 providers para produção |
| **Timeouts** | Ajuste conforme a confiabilidade do provider |
| **Ambientes** | Separe configurações de dev/prod |
| **Versionamento** | Commit apenas o `sender.config.ts` sem secrets |

---

## Próximos passos

- [Primeiros passos](./getting-started.md)
- [API Reference](./api.md)
- [Exemplos práticos](./examples.md)