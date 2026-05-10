# Providers

## Visão geral

O @jcsolutions/sender SDK suporta múltiplos gateways de SMS angolanos. Cada provider tem sua própria configuração específica, mas todos estendem a classe base `Provider` e seguem a mesma interface `IProvider`.

---

## Provider Ombala

### Sobre

A Ombala é um gateway de SMS angolano que utiliza autenticação via Token e requer um remetente (`from`) configurado.

### Configuração

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",           // ← obrigatório
  timeout: 10000,           // opcional (padrão: 10000)
});
```

### Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"ombala"` |
| Autenticação | `Token {token}` |
| Campo mensagem | `message` |
| Campo from | ✅ **Obrigatório** na configuração |
| Campo schedule | ✅ Suportado (formato: `yyyyMMddHHmmss`) |
| Batch nativo | ❌ Não (usa implementação base) |
| Site oficial | [useombala.ao](https://useombala.ao) |

### Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem de teste",
});
```

### Envio com agendamento

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem agendada",
  schedule: "20251210150000",  // 10/12/2025 às 15:00
});
```

### Exemplo com arquivo de configuração

```typescript
// sender.config.ts
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

> 📝 Para mais detalhes sobre a API da Ombala, consulte o [site oficial](https://useombala.ao).

---

## Provider KambaSMS

### Sobre

A KambaSMS é uma plataforma de comunicação angolana que utiliza autenticação via X-API-Key.

> ⚠️ **Nota**: A documentação oficial da KambaSMS é limitada. As informações abaixo são baseadas no que está publicamente disponível.

### Configuração

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("kambasms", {
  token: process.env.KAMBASMS_TOKEN,
  baseUrl: "https://api.kambasms.ao/v1",
  timeout: 10000,           // opcional (padrão: 10000)
});
```

### Especificações (com base na documentação disponível)

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"kambasms"` |
| Autenticação | `X-API-Key: {token}` |
| Campo mensagem | `text` |
| Campo from | ❌ Não documentado |
| Campo schedule | ❌ Não documentado |
| Batch nativo | ❌ Não documentado (usa implementação base) |
| Site oficial | [kambasms.ao](https://kambasms.ao) |

### Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem de teste",
});
```

### Exemplo com arquivo de configuração

```typescript
// sender.config.ts
export default defineConfig({
  providers: {
    kambasms: {
      token: process.env.KAMBASMS_TOKEN,
      baseUrl: "https://api.kambasms.ao/v1",
    },
  },
});
```

### Limitações conhecidas

| Item | Status | Nota |
|------|--------|------|
| Agendamento (`schedule`) | ❌ Não disponível | API não documenta este recurso |
| Remetente personalizado | ❌ Não disponível | Não é possível definir `from` ou `senderId` |
| Envio em lote nativo | ❌ Não disponível | Usa implementação base (chamadas individuais) |

> 📝 Para mais detalhes sobre a API da KambaSMS, consulte o [site oficial](https://kambasms.ao).

---

## Comparação entre providers

| Característica | Ombala | KambaSMS |
|----------------|--------|----------|
| Provider name | `"ombala"` | `"kambasms"` |
| Autenticação | `Token {token}` | `X-API-Key: {token}` |
| Campo mensagem | `message` | `text` |
| `from` obrigatório | ✅ Sim | ❌ Não disponível |
| Agendamento (`schedule`) | ✅ Sim | ❌ Não documentado |
| Envio simples | ✅ | ✅ |
| Envio em lote | ✅ (base) | ✅ (base) |

---

## Configuração recomendada com fallback

Para maior resiliência, configure ambos os providers com fallback automático:

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

---

## Adicionar novo provider

Para usar um provider que não está na lista, consulte o guia [Provider customizado](./custom-provider.md).

---

## Roadmap de providers

| Provider | Status | Previsão |
|----------|--------|----------|
| Ombala | ✅ Estável | - |
| KambaSMS | ✅ Estável (limitado) | - |
| Ecsend | 🚧 Em desenvolvimento | Próxima release |
| KwanzaSMS | 📋 Planeado | TBD |
| Africell SMS | 📋 Planeado | TBD |

---

## Resumo dos parâmetros por provider

| Parâmetro | Ombala | KambaSMS |
|-----------|--------|----------|
| `token` | ✅ Obrigatório | ✅ Obrigatório |
| `baseUrl` | ✅ Obrigatório | ✅ Obrigatório |
| `timeout` | ⭕ Opcional | ⭕ Opcional |
| `from` | ✅ Obrigatório | ❌ Não disponível |
| `schedule` | ✅ Suportado | ❌ Não documentado |