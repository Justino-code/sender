# Config API

Funções para trabalhar com o arquivo de configuração `sender.config.ts`. Este sistema permite centralizar as configurações dos providers e definir fallback automático.

## Estrutura do arquivo de configuração

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",           // Provider padrão
  fallbackProviders: ["kambasms"],     // Fallback em ordem
  
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

---

## defineConfig

Define a configuração do sender (usado no arquivo de configuração).

```typescript
function defineConfig(config: SenderConfigFile): SenderConfigFile
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `config` | `SenderConfigFile` | Objeto de configuração |

### Retorno

O mesmo objeto de configuração (para type safety).

### Exemplo

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

### Tipo SenderConfigFile

```typescript
type SenderConfigFile = {
  defaultProvider?: string;           // Provider padrão
  fallbackProviders?: string[];       // Ordem de fallback
  providers: Record<string, Partial<ProviderConfig>>;
}
```

---

## loadConfig

Carrega a configuração do arquivo `sender.config.ts` (ou `.js`).

```typescript
function loadConfig(): Promise<SenderConfigFile | null>
```

### Retorno

- `SenderConfigFile` - Se o arquivo existir e for válido
- `null` - Se o arquivo não existir

### Exemplo

```typescript
import { loadConfig } from "@jcsolutions/sender";

const config = await loadConfig();

if (config) {
  console.log('Provider padrão:', config.defaultProvider);
  console.log('Providers:', Object.keys(config.providers));
} else {
  console.log('Nenhum arquivo de configuração encontrado');
}
```

---

## getDefaultProvider

Obtém o nome do provider padrão da configuração.

```typescript
function getDefaultProvider(): Promise<string | null>
```

### Retorno

- `string` - Nome do provider padrão
- `null` - Se não houver configuração ou defaultProvider

### Exemplo

```typescript
import { getDefaultProvider } from "@jcsolutions/sender";

const defaultProvider = await getDefaultProvider();

if (defaultProvider) {
  console.log(`Provider padrão: ${defaultProvider}`);
} else {
  console.log('Nenhum provider padrão configurado');
}
```

---

## getFallbackProviders

Obtém a lista de fallback providers da configuração.

```typescript
function getFallbackProviders(): Promise<string[]>
```

### Retorno

Array com os nomes dos providers em ordem de fallback. Retorna array vazio se não houver configuração ou fallbackProviders.

### Exemplo

```typescript
import { getFallbackProviders } from "@jcsolutions/sender";

const fallbacks = await getFallbackProviders();

if (fallbacks.length > 0) {
  console.log(`Ordem de fallback: ${fallbacks.join(" → ")}`);
} else {
  console.log('Nenhum fallback configurado');
}
```

---

## Exemplo completo de uso

```typescript
// sender.config.ts
import { defineConfig } from "@jcsolutions/sender";

export default defineConfig({
  defaultProvider: "ombala",
  fallbackProviders: ["kambasms", "ecsend"],
  
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
    ecsend: {
      token: process.env.ECSEND_TOKEN,
      baseUrl: "https://api.ecsend.ao/v1",
    },
  },
});
```

```typescript
// app.ts
import { createSender, getDefaultProvider, getFallbackProviders } from "@jcsolutions/sender";

// Usar configuração do arquivo
const sms = await createSender();  // fallback automático!

// Acessar configurações diretamente
const defaultProvider = await getDefaultProvider();
const fallbacks = await getFallbackProviders();

console.log(`Default: ${defaultProvider}`);
console.log(`Fallback: ${fallbacks.join(" → ")}`);
```

---

## Ordem de prioridade

Quando você chama `createSender()`, a configuração é resolvida nesta ordem:

1. **Parâmetros diretos** (se fornecidos)
2. **Arquivo de configuração** (se existir)
3. **Erro** (se faltar dados obrigatórios)

```typescript
// Prioridade 1: Parâmetros diretos
const sms = await createSender("ombala", {
  token: "xxx",
  baseUrl: "https://api.com",
  from: "APP",
});

// Prioridade 2: Arquivo de configuração
const sms = await createSender();  // usa sender.config.ts

// Prioridade 3: Erro
const sms = await createSender();  // ❌ se não tiver config
```

## Próxima secção

- [Utilitários](./utils.md)