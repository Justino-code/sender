# Funções principais

## createSender

Cria uma instância de um provider para envio de SMS.

```typescript
function createSender(providerName?: string, override?: Partial<ProviderConfig>): Promise<IProvider>
function createSender(config: CreateSenderConfig): IProvider
```

### Formas de uso

| Forma | Exemplo | Descrição |
|-------|---------|-----------|
| **String + override** | `await createSender("ombala", { from: "APP" })` | Provider específico com sobrescrita parcial |
| **Sem parâmetros** | `await createSender()` | Usa `defaultProvider` e `fallbackProviders` do `sender.config.ts` |
| **Objeto completo** | `createSenderSync({ providerName, providerConfig })` | Configuração explícita (versão síncrona) |

### Parâmetros (forma objeto)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `providerName` | `string` | Nome do provider registrado (ex: "ombala", "kambasms") |
| `providerConfig` | `ProviderConfig` | Configuração do provider |

### Retorno

Retorna uma instância que implementa a interface `IProvider`.

### Comportamento com fallback

Quando usado sem parâmetros e o `sender.config.ts` define `fallbackProviders`, o sender tenta os providers em ordem automática:

1. Tenta o `defaultProvider`
2. Se falhar, tenta o primeiro `fallbackProvider`
3. Se falhar, tenta o próximo, e assim por diante

### Exemplos

```typescript
import { createSender } from "@jcsolutions/sender";

// Exemplo 1: Provider específico com sobrescrita
const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

// Exemplo 2: Usando configuração do arquivo (com fallback automático)
const sms = await createSender();

// Exemplo 3: Configuração explícita
const sms = createSenderSync({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
});

// Enviar mensagem
const result = await sms.send({
  to: "923000000",
  message: "Olá mundo!",
});
```

---

## createSenders

Cria instâncias de **todos** os providers configurados no `sender.config.ts`.

```typescript
function createSenders(): Promise<Record<string, IProvider>>
```

### Retorno

Um objeto onde cada chave é o nome do provider e o valor é a instância do provider.

### Exemplo

```typescript
import { createSenders } from "@jcsolutions/sender";

const { ombala, kambasms } = await createSenders();

await ombala.send({
  to: "923000000",
  message: "Mensagem via Ombala",
});

await kambasms.send({
  to: "923000000",
  message: "Mensagem via KambaSMS",
});
```

### Aviso

Providers com configuração incompleta (sem `token` ou `baseUrl`) são ignorados automaticamente.

---

## createSenderSync

Versão síncrona do `createSender` para uso sem `await`.

```typescript
function createSenderSync(config: CreateSenderConfig): IProvider
```

### Exemplo

```typescript
import { createSenderSync } from "@jcsolutions/sender";

const sms = createSenderSync({
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
});

// Uso normal (asíncrono para envio)
await sms.send({ to: "923000000", message: "Teste" });
```

## Próxima secção

- [Interfaces e Classes](./interfaces.md)