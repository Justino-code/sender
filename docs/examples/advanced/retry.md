# Envio com retry automático

> 🚧 **Em breve**: O retry automático será implementado nativamente em versões futuras. Acompanhe o [roadmap](https://justino-code.github.io/sender/#roadmap).

Por enquanto, você pode implementar manualmente um loop de tentativas ou aguardar a próxima versão.

## Exemplo simples (implementação manual temporária)

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

const maxRetries = 3;
let lastError;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    const result = await sms.send({
      to: "923000000",
      message: "Mensagem com retry",
    });
    console.log(`✅ Enviado na tentativa ${attempt}`);
    break;
  } catch (error) {
    lastError = error;
    if (attempt === maxRetries) throw lastError;
    console.log(`⚠️ Tentativa ${attempt} falhou, tentando novamente...`);
    await new Promise(r => setTimeout(r, 2000));
  }
}
```

## Próximo exemplo

- [Provider customizado](./custom-provider.md)