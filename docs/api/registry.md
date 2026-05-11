# Registry API

O Registry é um sistema central que mantém o registro de todos os providers disponíveis. Permite registrar, listar e recuperar providers dinamicamente.

## registerProvider

Registra um novo provider no sistema.

```typescript
function registerProvider(name: string, providerClass: ProviderConstructor, override?: boolean): void
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | `string` | Nome único do provider (ex: "ombala", "kambasms") |
| `providerClass` | `ProviderConstructor` | Classe que estende `Provider` |
| `override` | `boolean` | Se `true`, sobrescreve provider existente (padrão: `false`) |

### Exemplo

```typescript
import { registerProvider } from "@jcsolutions/sender";

class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  // ...
}

registerProvider("meuprovider", MeuProvider);
```

### Erro de duplicação

```typescript
registerProvider("ombala", OmbalaProvider);
registerProvider("ombala", OutroProvider); // ❌ Lança erro

// Para sobrescrever, use override: true
registerProvider("ombala", OutroProvider, true); // ✅ Funciona
```

---

## registerProviders

Registra múltiplos providers de uma vez.

```typescript
function registerProviders(providers: Record<string, ProviderConstructor>, override?: boolean): void
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `providers` | `Record<string, ProviderConstructor>` | Objeto com pares nome/classe |
| `override` | `boolean` | Se deve sobrescrever (padrão: `false`) |

### Exemplo

```typescript
import { registerProviders } from "@jcsolutions/sender";

registerProviders({
  ombala: OmbalaProvider,
  kambasms: KambaSmsProvider,
});
```

---

## listProviders

Lista todos os providers registrados.

```typescript
function listProviders(): string[]
```

### Retorno

Um array com os nomes de todos os providers registrados.

### Exemplo

```typescript
import { listProviders } from "@jcsolutions/sender";

const providers = listProviders();
console.log(providers); // ['ombala', 'kambasms', 'meuprovider']
```

---

## hasProvider

Verifica se um provider está registrado.

```typescript
function hasProvider(name: string): boolean
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | `string` | Nome do provider a verificar |

### Retorno

`true` se o provider estiver registrado, `false` caso contrário.

### Exemplo

```typescript
import { hasProvider } from "@jcsolutions/sender";

if (hasProvider("ombala")) {
  console.log("Provider Ombala disponível");
} else {
  console.log("Provider Ombala não registrado");
}
```

---

## getProvider

Obtém a classe do provider registrado.

```typescript
function getProvider(name: string): ProviderConstructor | undefined
```

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | `string` | Nome do provider a recuperar |

### Retorno

A classe do provider se estiver registrada, `undefined` caso contrário.

### Exemplo

```typescript
import { getProvider } from "@jcsolutions/sender";

const ProviderClass = getProvider("ombala");
if (ProviderClass) {
  const provider = new ProviderClass({
    token: "xxx",
    baseUrl: "https://api.com",
    from: "TESTE",
  });
}
```

---

## Uso interno (registry)

O registry também é usado internamente pela função `createSender`:

```typescript
// Funcionamento interno
export async function createSender(providerName: string, config: ProviderConfig) {
  const ProviderClass = registry.get(providerName);
  if (!ProviderClass) {
    throw new Error(`Provider "${providerName}" não encontrado`);
  }
  return new ProviderClass(config);
}
```

---

## Exemplo completo

```typescript
import { 
  registerProvider, 
  listProviders, 
  hasProvider, 
  getProvider,
  createSender 
} from "@jcsolutions/sender";

// 1. Registrar provider
class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  async send(data) {
    return { success: true, provider: this.providerName, messageId: "123" };
  }
}

registerProvider("meuprovider", MeuProvider);

// 2. Verificar
console.log(listProviders());        // ['ombala', 'kambasms', 'meuprovider']
console.log(hasProvider("meuprovider")); // true

// 3. Usar o provider
const sms = await createSender("meuprovider", {
  token: "test",
  baseUrl: "https://api.com",
});
```

## Próxima secção

- [Config API](./config.md)