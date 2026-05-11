# Erros

Todos os erros do SDK estendem a classe base `SenderError`, permitindo tratamento específico por tipo de erro.

## Hierarquia de erros

```
SenderError (base)
├── ConfigurationError   // Erro de configuração
├── AuthenticationError  // Token/API key inválido
├── RateLimitError       // Limite de requisições excedido
├── ValidationError      // Dados inválidos (número, from, etc)
├── ProviderError        // Erro genérico do provider
└── TimeoutError         // Timeout na requisição
```

## Importação

```typescript
import { 
  SenderError,
  ConfigurationError, 
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError 
} from "@jcsolutions/sender";
```

---

## SenderError (base)

Classe base para todos os erros do SDK.

```typescript
class SenderError extends Error {
  public readonly status?: number;   // Status HTTP (se aplicável)
  public readonly response?: any;    // Resposta completa da API (se aplicável)
}
```

### Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `status` | `number` | Status HTTP da resposta (ex: 400, 401, 429) |
| `response` | `any` | Resposta completa da API para debug |

---

## ConfigurationError

Lançado quando há erro na configuração do provider.

```typescript
class ConfigurationError extends SenderError
```

### Quando ocorre

- Token não fornecido
- BaseUrl não fornecida
- From não fornecido (no caso da Ombala)

### Exemplo

```typescript
try {
  const sms = await createSender("ombala", {
    token: "",  // ❌ vazio
    baseUrl: "https://api.useombala.ao/v1",
  });
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error("Erro de configuração:", error.message);
    // "Token é obrigatório. Forneça sua API key ou token de acesso."
  }
}
```

---

## AuthenticationError

Lançado quando as credenciais são inválidas ou expiradas.

```typescript
class AuthenticationError extends SenderError
```

### Quando ocorre

- Token inválido
- Token expirado
- Token sem permissão

### Exemplo

```typescript
try {
  await sms.send({ to: "923000000", message: "Teste" });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Erro de autenticação:", error.message);
    console.error("Status HTTP:", error.status);  // 401
    console.error("Resposta:", error.response);
  }
}
```

---

## RateLimitError

Lançado quando o limite de requisições é excedido.

```typescript
class RateLimitError extends SenderError
```

### Quando ocorre

- Muitas requisições em curto período
- Limite mensal excedido

### Exemplo

```typescript
try {
  await sms.send({ to: "923000000", message: "Teste" });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error("Limite excedido:", error.message);
    console.error("Status HTTP:", error.status);  // 429
    console.error("Aguarde alguns minutos e tente novamente.");
  }
}
```

---

## ValidationError

Lançado quando os dados da requisição são inválidos.

```typescript
class ValidationError extends SenderError
```

### Quando ocorre

- Número de telefone inválido
- Formato do número incorreto
- Remetente inválido (from não cadastrado)
- Mensagem vazia ou muito longa
- Schedule em formato inválido

### Exemplo

```typescript
try {
  await sms.send({ to: "123", message: "Teste" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Erro de validação:", error.message);
    console.error("Status HTTP:", error.status);  // 400
    console.error("Resposta da API:", error.response);
    // Mensagem pode ser: "Formato de número angolano inválido"
    // Ou: "O campo 'from' não está autorizado"
  }
}
```

---

## ProviderError

Lançado quando ocorre um erro genérico no provider.

```typescript
class ProviderError extends SenderError
```

### Quando ocorre

- Erro interno da API (status 500)
- Erro inesperado
- Provider indisponível

### Exemplo

```typescript
try {
  await sms.send({ to: "923000000", message: "Teste" });
} catch (error) {
  if (error instanceof ProviderError) {
    console.error("Erro no provider:", error.message);
    console.error("Status HTTP:", error.status);  // 500
    console.error("Resposta:", error.response);
  }
}
```

---

## TimeoutError

Lançado quando a requisição excede o tempo limite.

```typescript
class TimeoutError extends SenderError
```

### Quando ocorre

- API demora mais que o timeout configurado
- Rede lenta ou instável

### Exemplo

```typescript
try {
  await sms.send({ to: "923000000", message: "Teste" });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error("Timeout:", error.message);
    // "Timeout após 10000ms. A requisição demorou muito tempo."
  }
}
```

---

## Tratamento completo de erros

```typescript
import { createSender } from "@jcsolutions/sender";
import {
  ConfigurationError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ProviderError,
  TimeoutError,
} from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

try {
  const result = await sms.send({
    to: "923000000",
    message: "Mensagem de teste",
  });
  console.log("✅ Enviado:", result.messageId);
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error("❌ Verifique suas credenciais:", error.message);
  } else if (error instanceof AuthenticationError) {
    console.error("❌ Token inválido ou expirado");
  } else if (error instanceof RateLimitError) {
    console.error("❌ Muitas requisições. Aguarde um momento.");
  } else if (error instanceof ValidationError) {
    console.error("❌ Dados inválidos:", error.message);
    if (error.response?.errors) {
      console.error("   Detalhe:", error.response.errors[0].message);
    }
  } else if (error instanceof TimeoutError) {
    console.error("❌ Tempo limite excedido. Tente novamente.");
  } else if (error instanceof ProviderError) {
    console.error("❌ Erro no provedor:", error.message);
  } else {
    console.error("❌ Erro desconhecido:", error);
  }
}
```

---

## Acessando detalhes do erro

Todos os erros (exceto `ConfigurationError`) podem conter `status` e `response`:

```typescript
catch (error) {
  if (error instanceof ValidationError) {
    console.log("Mensagem:", error.message);
    console.log("Status HTTP:", error.status);     // 400
    console.log("Resposta completa:", error.response);
    
    // Acessar detalhes da resposta da API
    if (error.response?.errors) {
      error.response.errors.forEach((err: any) => {
        console.log(`  - ${err.message}`);
      });
    }
  }
}
```

## Próxima secção

- [Voltar ao índice da API](../api.md)