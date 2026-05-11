# Provider Ombala

## Sobre

A Ombala é um gateway de SMS angolano que utiliza autenticação via Token e requer um remetente (`from`) configurado e aprovado (pode ser um nome ou número de telefone).

## Status

✅ **Estável** - Pronto para uso em produção

## Configuração

### Com remetente textual

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",           // ← nome do remetente
  timeout: 10000,           // opcional (padrão: 10000)
});
```

### Com remetente numérico

```typescript
const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "943811042",        // ← número de telefone como remetente
  timeout: 10000,
});
```

> 💡 **Dica**: O `from` pode ser tanto um nome (ex: "LEVAJA") quanto um número de telefone. Ambos precisam estar cadastrados e aprovados no dashboard da Ombala.

## Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"ombala"` |
| Autenticação | `Token {token}` |
| Campo mensagem | `message` |
| Campo from | ✅ **Obrigatório** na configuração |
| Campo schedule | ✅ Suportado |
| Batch nativo | ✅ Suportado (números separados por vírgula) |
| Site oficial | [useombala.ao](https://useombala.ao) |

## Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem de teste",
});
```

## Envio com agendamento

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem agendada",
  schedule: "20251210150000",  // 10/12/2025 às 15:00
});
```

## Envio em lote (nativo)

A Ombala suporta envio em lote nativo com números separados por vírgula:

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
});

console.log(`✅ Sucessos: ${result.successful.length}`);
console.log(`❌ Falhas: ${result.failed.length}`);
```

### Resposta do batch

```json
{
  "success": true,
  "provider": "ombala",
  "successful": ["923000001", "923000002", "923000003"],
  "failed": [],
  "details": [
    { "to": "923000001", "messageId": "abc-123" },
    { "to": "923000002", "messageId": "def-456" },
    { "to": "923000003", "messageId": "ghi-789" }
  ],
  "raw": {
    "id": "batch-id",
    "cost": "28.5",
    "recipients": [
      { "phone_number": "923000001", "message_status": "PENDING", "message_id": "abc-123" },
      { "phone_number": "923000002", "message_status": "PENDING", "message_id": "def-456" },
      { "phone_number": "923000003", "message_status": "PENDING", "message_id": "ghi-789" }
    ]
  }
}
```

## Exemplo com arquivo de configuração

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  providers: {
    ombala: {
      token: process.env.OMBALA_TOKEN,
      baseUrl: "https://api.useombala.ao/v1",
      from: "LEVAJA",  // ou "943811042"
    },
  },
});
```

## Tratamento de erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `remetente inválido` | `from` não cadastrado ou não aprovado | Cadastrar o remetente no dashboard da Ombala |
| `token não autorizado` | Token inválido ou expirado | Verificar token no dashboard |
| `destinatário inválido` | Número no formato errado | Usar 9 dígitos (ex: 923000000) |

## Limites conhecidos

| Item | Limite |
|------|--------|
| Tamanho máximo da mensagem | 160 caracteres (GSM) |
| Agendamento | Formato `yyyyMMddHHmmss` |
| Batch | Múltiplos números separados por vírgula |

> 📝 Para mais detalhes, consulte o [site oficial da Ombala](https://useombala.ao).