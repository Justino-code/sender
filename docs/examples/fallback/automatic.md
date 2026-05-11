# Fallback automático (config)

Configure fallback no `sender.config.ts` para resiliência automática entre providers.

## Arquivo de configuração

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

## Uso no código

```typescript
// app.ts
import { createSender } from "@jcsolutions/sender";

// Cria o sender com fallback automático
const sms = await createSender();

// Se Ombala falhar, tenta KambaSMS automaticamente
const result = await sms.send({
  to: "923000000",
  message: "Mensagem com fallback automático!",
});

console.log(`✅ Enviado via: ${result.provider}`);
```

## Com múltiplos fallbacks

```typescript
// sender.config.ts
export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms", "ecsend", "telcosms"],
  
  providers: {
    ombala: { ... },
    kambasms: { ... },
    ecsend: { ... },
    telcosms: { ... },
  },
});
```

Ordem de tentativa:

1. Ombala (default)
2. KambaSMS (1º fallback)
3. Ecsend (2º fallback)
4. TelcoSMS (3º fallback)

## Com fallback desativado

Para usar apenas o provider padrão sem fallback:

```typescript
// sender.config.ts
export default defineConfig({
  defaultProvider: "ombala",
  // fallbackProviders: [],  // omitir ou deixar vazio
  
  providers: {
    ombala: { ... },
  },
});
```

## Vantagens

| Vantagem | Descrição |
|----------|-----------|
| **Resiliência** | Sistema continua funcionando mesmo com falha de um provider |
| **Transparência** | Código não precisa saber qual provider está sendo usado |
| **Configurável** | Ordem de fallback definida centralizadamente |
| **Manutenção** | Adicionar/remover providers sem mudar o código |

## Próximo exemplo

- [Fallback manual (código)](./manual.md)