# Provider TelcoSMS

## Sobre

A TelcoSMS é uma plataforma de comunicação angolana que utiliza autenticação via `api_key_app`. O provider implementa fallback automático entre diferentes versões da API (v2 POST → v1 POST → v2 GET) para máxima compatibilidade.

## Status

✅ **Estável** - Testado e validado com API real

> 📌 **Nota**: O provider foi testado com sucesso em ambiente real. Todas as funcionalidades principais estão operacionais.

## Configuração

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("telcosms", {
  token: process.env.TELCOSMS_API_KEY,
  baseUrl: "https://www.telcosms.co.ao",
  timeout: 10000,
});
```

## Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"telcosms"` |
| Autenticação | `api_key_app` (via body ou query) |
| Campo mensagem | `message_body` |
| Formato do número | 9 dígitos (ex: `923000000`) |
| Formato do token | Qualquer string (api_key_app) |
| Batch nativo | ❌ Não suportado |
| Agendamento | ❌ Não suportado |
| Fallback de API | ✅ Automático (v2 POST → v1 POST → v2 GET) |

## Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem de teste",
});
```

## Envio em lote (implementação base)

Como a TelcoSMS não possui batch nativo, o envio em lote é feito através de múltiplas chamadas individuais:

```typescript
const result = await sms.sendBatch({
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial!",
});
```

## Resposta da API

### Sucesso (HTTP 200)

```json
{
  "success": true,
  "provider": "telcosms",
  "raw": {
    "status": 200,
    "message": "Message sent successfully"
  }
}
```

### Erro (HTTP 200 com status de erro no corpo)

```json
{
  "success": true,
  "provider": "telcosms",
  "raw": {
    "status": 404,
    "message": "API key not found"
  }
}
```

> ⚠️ **Importante**: A API retorna HTTP 200 mesmo em caso de erro. O erro é indicado no campo `status` do corpo da resposta.

## Tratamento de erros

| Código | Significado | Tratamento |
|--------|-------------|------------|
| 200/201 | Sucesso | Retorna sucesso |
| 400 | Dados inválidos | `ValidationError` |
| 401/403 | Não autorizado | `AuthenticationError` |
| 404 | Recurso não encontrado | `ProviderError` |
| 429 | Muitas requisições | `RateLimitError` |
| outros | Erro genérico | `ProviderError` |

## Características adicionais

### Fallback automático de versões

O provider tenta automaticamente os métodos de envio na seguinte ordem:

1. **v2 POST** - Método principal (`/api/v2/send_message`)
2. **v1 POST** - Fallback (`/send_message`)
3. **v2 GET** - Último fallback (`/api/v2/send_message` com query params)

### Retry automático

```typescript
const sms = await createSender("telcosms", {
  token: process.env.TELCOSMS_API_KEY,
  baseUrl: "https://www.telcosms.co.ao",
  data: {
    maxRetries: 3,      // Número de tentativas
    retryDelay: 1000,   // Delay em ms
  },
});
```

## Limitações conhecidas

| Item | Status | Nota |
|------|--------|------|
| Envio em lote | ❌ Não nativo | Usa implementação base (múltiplas chamadas) |
| Agendamento | ❌ Não suportado | API não documenta este recurso |
| Validação de URLs | ⚠️ Parcial | A API pode bloquear mensagens com links |

## Exemplo com arquivo de configuração

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  providers: {
    telcosms: {
      token: process.env.TELCOSMS_API_KEY,
      baseUrl: "https://www.telcosms.co.ao",
      data: {
        maxRetries: 2,
      },
    },
  },
});
```

## Resultado dos testes

| Teste | Status |
|-------|--------|
| Envio simples | ✅ Passou |
| Envio em lote | ✅ Passou |
| Validação de número | ✅ Passou |
| Token inválido | ✅ Passou |

> 📝 Para mais detalhes, consulte o [site oficial da TelcoSMS](https://www.telcosms.co.ao)