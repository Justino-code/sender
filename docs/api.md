# API Reference

## Índice

1. [Funções principais](#funções-principais)
   - [createSender](#createsender)
   - [createSenders](#createsenders)
   - [createSenderSync](#createsendersync)
2. [Interfaces e Classes](#interfaces-e-classes)
   - [IProvider](#iprovider)
   - [Provider (Classe Base)](#provider-classe-base)
3. [Tipos e DTOs](#tipos-e-dtos)
   - [SendMessageDto](#sendmessagedto)
   - [SendBatchMessageDto](#sendbatchmessagedto)
   - [SendMessageResponse](#sendmessageresponse)
   - [SendBatchMessageResponse](#sendbatchmessageresponse)
   - [ProviderConfig](#providerconfig)
   - [CreateSenderConfig](#createsenderconfig)
4. [Registry API](#registry-api)
   - [registerProvider](#registerprovider)
   - [registerProviders](#registerproviders)
   - [listProviders](#listproviders)
   - [hasProvider](#hasprovider)
   - [getProvider](#getprovider)
5. [Config API](#config-api)
   - [defineConfig](#defineconfig)
   - [loadConfig](#loadconfig)
   - [getDefaultProvider](#getdefaultprovider)
   - [getFallbackProviders](#getfallbackproviders)
6. [Utilitários](#utilitários)
   - [validatePhoneNumber](#validatephonenumber)
   - [validatePhoneNumbers](#validatephonenumbers)
   - [normalizePhoneNumber](#normalizephonenumber)
   - [normalizePhoneNumbers](#normalizephonenumbers)
7. [Erros](#erros)

---

## Funções principais

### createSender

Cria uma instância de um provider para envio de SMS.

```typescript
function createSender(providerName?: string, override?: Partial<ProviderConfig>): Promise<IProvider>
function createSender(config: CreateSenderConfig): IProvider
```

#### Formas de uso

| Forma | Exemplo | Descrição |
|-------|---------|-----------|
| **String + override** | `await createSender("ombala", { from: "APP" })` | Provider específico com sobrescrita parcial |
| **Sem parâmetros** | `await createSender()` | Usa `defaultProvider` e `fallbackProviders` do `sender.config.ts` |
| **Objeto completo** | `createSenderSync({ providerName, providerConfig })` | Configuração explícita (versão síncrona) |

#### Comportamento com fallback

Quando usado sem parâmetros e o `sender.config.ts` define `fallbackProviders`, o sender tenta os providers em ordem automática:

1. Tenta o `defaultProvider`
2. Se falhar, tenta o primeiro `fallbackProvider`
3. Se falhar, tenta o próximo, e assim por diante

#### Exemplos

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

// Exemplo 3: Configuração explícita (síncrono)
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

### createSenders

Cria instâncias de **todos** os providers configurados no `sender.config.ts`.

```typescript
function createSenders(): Promise<Record<string, IProvider>>
```

#### Retorno

Um objeto onde cada chave é o nome do provider e o valor é a instância do provider.

#### Exemplo

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

#### Aviso

Providers com configuração incompleta (sem `token` ou `baseUrl`) são ignorados automaticamente.

---

### createSenderSync

Versão síncrona do `createSender` para uso sem `await`.

```typescript
function createSenderSync(config: CreateSenderConfig): IProvider
```

#### Exemplo

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

---

## Interfaces e Classes

### IProvider

Interface base que define o contrato que todos os providers devem seguir.

```typescript
interface IProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}
```

#### Métodos

| Método | Descrição |
|--------|-----------|
| `send(data)` | Envia uma única mensagem SMS |
| `sendBatch(data)` | Envia mensagens para múltiplos destinatários |

---

### Provider (Classe Base)

Classe abstrata base que todos os providers devem estender. Fornece implementações comuns e métodos auxiliares para evitar repetição de código.

```typescript
export abstract class Provider implements IProvider {
  // Propriedades protegidas
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly token: string;
  protected abstract readonly providerName: string;
  protected readonly from?: string;
  protected readonly customData?: Record<string, unknown>;

  // Construtor
  protected constructor(config: ProviderConfig);

  // Métodos protegidos (podem ser sobrescritos)
  protected buildHeaders(): HeadersInit;
  protected normalizePhone(phone: string): string;
  protected normalizePhones(phones: string[]): string[];
  protected validatePhone(phone: string): boolean;
  protected validatePhones(phones: string[]): { valid: string[]; invalid: string[] };
  protected async request(url: string, body: unknown): Promise<Response>;
  protected handleErrorResponse(status: number, message: string): never;
  protected extractMessageId(result: any): string | undefined;

  // Métodos públicos
  async sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
  abstract send(data: SendMessageDto): Promise<SendMessageResponse>;
}
```

#### Métodos Protegidos

| Método | Descrição | Quando sobrescrever |
|--------|-----------|---------------------|
| `buildHeaders()` | Constrói os headers da requisição HTTP | Provider usa autenticação diferente (ex: `X-API-Key` em vez de `Bearer`) |
| `normalizePhone()` | Converte número para formato internacional | Provider exige formato específico |
| `normalizePhones()` | Converte múltiplos números | Provider exige formato específico |
| `validatePhone()` | Verifica se número é válido | Regras de validação diferentes |
| `validatePhones()` | Verifica múltiplos números | Regras de validação diferentes |
| `request()` | Executa requisição HTTP com timeout | Necessário comportamento customizado |
| `handleErrorResponse()` | Converte status HTTP em erro apropriado | Provider usa códigos de erro diferentes |
| `extractMessageId()` | Extrai o ID da mensagem da resposta | Campo do ID tem nome diferente |

#### Métodos Públicos

| Método | Descrição |
|--------|-----------|
| `sendBatch()` | Implementação base: faz chamadas individuais para cada número. Providers com suporte nativo a lote devem sobrescrever |
| `send()` | **Abstract** - Cada provider deve implementar sua lógica específica de envio |

#### Propriedade `providerName` (obrigatória)

Todos os providers **devem** declarar o nome via propriedade abstrata:

```typescript
export class OmbalaProvider extends Provider {
  protected readonly providerName = "ombala";  // ← obrigatório
  // ...
}
```

O TypeScript obriga a implementação desta propriedade em todas as classes filhas.

#### Exemplo de Provider customizado

```typescript
import { Provider, ConfigurationError, ValidationError } from "@jcsolutions/sender";

export class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  private readonly from: string;

  constructor(config: ProviderConfig) {
    super(config);
    
    if (!config.from) {
      throw new ConfigurationError("MeuProvider: from é obrigatório");
    }
    this.from = config.from;
  }

  protected buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.token,  // Autenticação diferente
    };
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    if (!this.validatePhone(data.to)) {
      throw new ValidationError("Número inválido");
    }

    const body = {
      to: this.normalizePhone(data.to),
      from: this.from,
      text: data.message,
    };

    const response = await this.request("/send", body);
    const result = await response.json();

    if (!response.ok) {
      this.handleErrorResponse(response.status, result?.message);
    }

    return {
      success: true,
      provider: this.providerName,
      messageId: this.extractMessageId(result),
      raw: result,
    };
  }
}
```

---

## Tipos e DTOs

### SendMessageDto

Dados necessários para enviar uma única mensagem SMS.

```typescript
type SendMessageDto = {
  to: string;        // Número do destinatário (9 dígitos, ex: "923000000")
  message: string;   // Texto da mensagem
  schedule?: string; // Agendamento (formato: yyyyMMddHHmmss, opcional)
}
```

#### Exemplo

```typescript
const data: SendMessageDto = {
  to: "923000000",
  message: "Seu código é 482913",
  schedule: "20251210150000",  // Enviar em 10/12/2025 às 15:00
};
```

---

### SendBatchMessageDto

Dados necessários para enviar mensagens para múltiplos destinatários.

```typescript
type SendBatchMessageDto = {
  to: string[];      // Array de números (9 dígitos cada)
  message: string;   // Texto da mensagem
  schedule?: string; // Agendamento (formato: yyyyMMddHHmmss, opcional)
}
```

#### Exemplo

```typescript
const data: SendBatchMessageDto = {
  to: ["923000001", "923000002", "923000003"],
  message: "Promoção especial: 20% off!",
};
```

---

### SendMessageResponse

Resposta do envio de uma única mensagem.

```typescript
type SendMessageResponse = {
  success: boolean;   // Se o envio foi bem sucedido
  provider: string;   // Nome do provider que enviou (ex: "ombala")
  messageId?: string; // ID da mensagem no provider (para rastreamento)
  raw?: unknown;      // Resposta original da API (debug)
}
```

#### Exemplo

```typescript
{
  success: true,
  provider: "ombala",
  messageId: "msg_123456",
  raw: { id: "msg_123456", status: "sent" }
}
```

---

### SendBatchMessageResponse

Resposta do envio em lote.

```typescript
type SendBatchMessageResponse = {
  success: boolean;                // Se pelo menos uma mensagem foi enviada
  provider: string;                // Nome do provider usado
  successful: string[];            // Números que foram enviados com sucesso
  failed: string[];                // Números que falharam
  details?: Array<{                // Detalhes individuais de cada envio
    to: string;
    messageId?: string;
    error?: string;
  }>;
  raw?: unknown;                   // Resposta original da API
}
```

#### Exemplo

```typescript
{
  success: true,
  provider: "kambasms",
  successful: ["923000001", "923000002"],
  failed: ["923000003"],
  details: [
    { to: "923000001", messageId: "msg_001" },
    { to: "923000002", messageId: "msg_002" },
    { to: "923000003", error: "Número inválido" },
  ],
}
```

---

### ProviderConfig

Configuração necessária para instanciar um provider.

```typescript
type ProviderConfig = {
  token: string;                    // API key ou token de acesso (obrigatório)
  baseUrl: string;                  // URL base da API do provider (obrigatório)
  timeout?: number;                 // Timeout em ms (padrão: 10000)
  from?: string;                    // Remetente (obrigatório para Ombala)
  data?: Record<string, unknown>;   // Configurações específicas do provider
}
```

#### Exemplo (Ombala)

```typescript
const config: ProviderConfig = {
  token: "omb_abc123",
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
  timeout: 15000,
};
```

#### Exemplo (KambaSMS)

```typescript
const config: ProviderConfig = {
  token: "kam_xyz789",
  baseUrl: "https://api.kambasms.ao/v1",
  timeout: 10000,
  data: {
    senderId: "MEUAPP",  // Identificador do remetente
  },
};
```

---

### CreateSenderConfig

Configuração para criar um sender explicitamente.

```typescript
type CreateSenderConfig = {
  providerName: string;
  providerConfig: ProviderConfig;
}
```

#### Exemplo

```typescript
const config: CreateSenderConfig = {
  providerName: "ombala",
  providerConfig: {
    token: process.env.OMBALA_TOKEN,
    baseUrl: "https://api.useombala.ao/v1",
    from: "LEVAJA",
  },
};

const sms = createSenderSync(config);
```

---

## Registry API

### registerProvider

Registra um novo provider no sistema.

```typescript
function registerProvider(name: string, providerClass: ProviderConstructor, override?: boolean): void
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | `string` | Nome único do provider |
| `providerClass` | `ProviderConstructor` | Classe que estende `Provider` |
| `override` | `boolean` | Se `true`, sobrescreve provider existente (padrão: `false`) |

#### Exemplo

```typescript
import { registerProvider } from "@jcsolutions/sender";

class MeuProvider extends Provider {
  protected readonly providerName = "meuprovider";
  // ...
}

registerProvider("meuprovider", MeuProvider);
```

---

### registerProviders

Registra múltiplos providers de uma vez.

```typescript
function registerProviders(providers: Record<string, ProviderConstructor>, override?: boolean): void
```

#### Exemplo

```typescript
import { registerProviders } from "@jcsolutions/sender";

registerProviders({
  ombala: OmbalaProvider,
  kambasms: KambaSmsProvider,
});
```

---

### listProviders

Lista todos os providers registrados.

```typescript
function listProviders(): string[]
```

#### Exemplo

```typescript
import { listProviders } from "@jcsolutions/sender";

console.log(listProviders()); // ['ombala', 'kambasms', 'meuprovider']
```

---

### hasProvider

Verifica se um provider está registrado.

```typescript
function hasProvider(name: string): boolean
```

#### Exemplo

```typescript
import { hasProvider } from "@jcsolutions/sender";

if (hasProvider("ombala")) {
  console.log("Provider Ombala disponível");
}
```

---

### getProvider

Obtém a classe do provider registrado.

```typescript
function getProvider(name: string): ProviderConstructor | undefined
```

#### Exemplo

```typescript
import { getProvider } from "@jcsolutions/sender";

const ProviderClass = getProvider("ombala");
if (ProviderClass) {
  const provider = new ProviderClass(config);
}
```

---

## Config API

Funções para trabalhar com o arquivo de configuração `sender.config.ts`.

### defineConfig

Define a configuração do sender (usado no arquivo de configuração).

```typescript
function defineConfig(config: SenderConfigFile): SenderConfigFile
```

#### Exemplo (`sender.config.ts`)

```typescript
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

---

### loadConfig

Carrega a configuração do arquivo `sender.config.ts`.

```typescript
function loadConfig(): Promise<SenderConfigFile | null>
```

#### Exemplo

```typescript
import { loadConfig } from "@jcsolutions/sender";

const config = await loadConfig();
console.log(config?.defaultProvider);
```

---

### getDefaultProvider

Obtém o nome do provider padrão da configuração.

```typescript
function getDefaultProvider(): Promise<string | null>
```

#### Exemplo

```typescript
import { getDefaultProvider } from "@jcsolutions/sender";

const defaultProvider = await getDefaultProvider();
console.log(`Provider padrão: ${defaultProvider}`);
```

---

### getFallbackProviders

Obtém a lista de fallback providers da configuração.

```typescript
function getFallbackProviders(): Promise<string[]>
```

#### Exemplo

```typescript
import { getFallbackProviders } from "@jcsolutions/sender";

const fallbacks = await getFallbackProviders();
console.log(`Ordem de fallback: ${fallbacks.join(" → ")}`);
```

---

## Utilitários

Funções auxiliares para manipulação de números de telefone.

### validatePhoneNumber

Valida se um número segue o padrão angolano.

```typescript
function validatePhoneNumber(phone: string): boolean
```

| Formato aceite | Exemplo |
|----------------|---------|
| Local (9 dígitos) | `"923000000"` |
| Com 0 | `"0923000000"` |
| Internacional | `"+244923000000"` |

#### Exemplo

```typescript
import { validatePhoneNumber } from "@jcsolutions/sender";

validatePhoneNumber("923000000");      // true
validatePhoneNumber("813000000");      // false (começa com 8)
validatePhoneNumber("+244923000000");  // true
```

---

### validatePhoneNumbers

Valida múltiplos números e separa válidos de inválidos.

```typescript
function validatePhoneNumbers(phones: string[]): { valid: string[]; invalid: string[] }
```

#### Exemplo

```typescript
import { validatePhoneNumbers } from "@jcsolutions/sender";

const { valid, invalid } = validatePhoneNumbers([
  "923000001",
  "813000000",
  "933000002",
]);

console.log(valid);   // ['923000001', '933000002']
console.log(invalid); // ['813000000']
```

---

### normalizePhoneNumber

Normaliza o número para o formato internacional `+244XXXXXXXXX`.

```typescript
function normalizePhoneNumber(phone: string): string
```

| Entrada | Saída |
|---------|-------|
| `"923000000"` | `"+244923000000"` |
| `"0923000000"` | `"+244923000000"` |
| `"+244923000000"` | `"+244923000000"` |

#### Exemplo

```typescript
import { normalizePhoneNumber } from "@jcsolutions/sender";

normalizePhoneNumber("923000000");  // "+244923000000"
```

---

### normalizePhoneNumbers

Normaliza múltiplos números.

```typescript
function normalizePhoneNumbers(phones: string[]): string[]
```

#### Exemplo

```typescript
import { normalizePhoneNumbers } from "@jcsolutions/sender";

const normalized = normalizePhoneNumbers([
  "923000001",
  "0933000002",
  "+244943000003",
]);

// Resultado: ['+244923000001', '+244933000002', '+244943000003']
```

---

## Erros

Todos os erros estendem a classe base `SenderError`.

### Hierarquia de erros

```
SenderError (base)
├── ConfigurationError   // Erro de configuração
├── AuthenticationError  // Token/API key inválido
├── RateLimitError       // Limite de requisições excedido
├── ValidationError      // Dados inválidos (número, from, etc)
├── ProviderError        // Erro genérico do provider
└── TimeoutError         // Timeout na requisição
```

### Importação

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

### Exemplo de tratamento

```typescript
try {
  await sms.send({ to: "923000000", message: "Teste" });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Token inválido. Verifique suas credenciais.");
  } else if (error instanceof RateLimitError) {
    console.error("Limite excedido. Aguarde alguns minutos.");
  } else if (error instanceof ValidationError) {
    console.error("Número inválido. Use 9 dígitos.");
  } else if (error instanceof TimeoutError) {
    console.error("Tempo limite excedido. Tente novamente.");
  } else if (error instanceof ConfigurationError) {
    console.error("Erro de configuração:", error.message);
  } else if (error instanceof ProviderError) {
    console.error("Erro no provider:", error.message);
  } else {
    console.error("Erro desconhecido:", error);
  }
}
```

---

## Resumo rápido

| O que fazer | Como |
|-------------|------|
| **Enviar SMS** | `await createSender().send({ to, message })` |
| **Enviar em lote** | `await createSender().sendBatch({ to: [...], message })` |
| **Configurar provider** | Criar `sender.config.ts` ou passar configuração diretamente |
| **Adicionar fallback** | Configurar `fallbackProviders` no `sender.config.ts` |
| **Criar provider customizado** | Estender `Provider` e implementar `send()` |
| **Validar número** | `validatePhoneNumber("923000000")` |
| **Normalizar número** | `normalizePhoneNumber("923000000")` → `"+244923000000"` |