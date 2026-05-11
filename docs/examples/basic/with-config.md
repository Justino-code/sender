# Com configuração centralizada

Usando o arquivo `sender.config.ts` para centralizar as configurações dos providers.

## Arquivo de configuração

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

## Uso no código

```typescript
// app.ts
import { createSender } from "@jcsolutions/sender";

// Cria o sender usando a configuração do arquivo
const sms = await createSender();

const result = await sms.send({
  to: "923000000",
  message: "Mensagem com configuração centralizada!",
});

console.log(result.success ? "✅ Enviado" : "❌ Falha");
```

## Com fallback automático

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
const sms = await createSender();  // tenta Ombala, depois KambaSMS

await sms.send({
  to: "923000000",
  message: "Mensagem com fallback automático!",
});
```

## Vantagens

| Vantagem | Descrição |
|----------|-----------|
| **Centralização** | Todas as configurações em um único lugar |
| **Reutilização** | Não precisa repetir configurações |
| **Fallback** | Configuração simples de fallback entre providers |
| **Segurança** | Fácil usar variáveis de ambiente |

## Próximo exemplo

- [Envio em lote](./batch.md)