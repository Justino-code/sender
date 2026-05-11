# Envio simples

O exemplo mais básico de envio de SMS.

## Código

```typescript
import { createSender } from "@jcsolutions/sender";

// Configurar o provider
const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",           // obrigatório para Ombala
  timeout: 10000,           // opcional (padrão: 10000)
});

// Enviar SMS
const result = await sms.send({
  to: "923000000",
  message: "Olá! Esta é uma mensagem de teste.",
});

// Verificar resultado
if (result.success) {
  console.log(`✅ Enviado! ID: ${result.messageId}`);
} else {
  console.log("❌ Falha ao enviar SMS");
}
```

## Exemplo com números reais

```typescript
// Usando números de exemplo
await sms.send({
  to: "931459010",
  message: "Seu código de verificação é 482913",
});
```

## Explicação

| Parâmetro | Descrição |
|-----------|-----------|
| `token` | Sua API key do provedor (obrigatório) |
| `baseUrl` | URL da API do provedor (obrigatório) |
| `from` | Remetente da mensagem (obrigatório para Ombala) |
| `timeout` | Tempo máximo de espera em ms (opcional) |
| `to` | Número do destinatário (9 dígitos) |
| `message` | Texto da mensagem |

## Com variáveis de ambiente

Recomendado para produção. Nunca coloque API keys no código.

```typescript
// .env
OMBALA_TOKEN=sua-chave-aqui
OMBALA_BASE_URL=https://api.useombala.ao/v1
```

```typescript
import { createSender } from "@jcsolutions/sender";
import dotenv from "dotenv";

dotenv.config();

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN!,
  baseUrl: process.env.OMBALA_BASE_URL!,
  from: "LEVAJA",
});

const result = await sms.send({
  to: "923000000",
  message: "Mensagem com variável de ambiente!",
});
```

## Possíveis erros

| Erro | Solução |
|------|---------|
| `token não autorizado` | Verificar se o token está correto |
| `remetente inválido` | Verificar se o `from` está cadastrado |
| `destinatário inválido` | Usar 9 dígitos (ex: 923000000) |

## Próximo exemplo

- [Com configuração centralizada](./with-config.md)