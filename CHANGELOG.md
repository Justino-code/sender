# Changelog

## [1.0.0] - 2026-05-20

### Adicionado
- **Provider Ombala** (estável) - Envio simples, lote nativo, agendamento
- **Provider TelcoSMS** (estável) - Envio simples e em lote
- Configuração centralizada (`sender.config.ts`)
- Fallback automático entre providers
- Retry automático configurável
- Validação e normalização de números angolanos
- Registry pattern para providers customizados
- TypeScript completo

### Modificado
- API estabilizada (sem mudanças previstas)
- Documentação reorganizada

### Provider KambaSMS
- 🚧 Em desenvolvimento (aguardando credenciais para testes)

---

## [0.1.0-alpha.4] - 2026-05-11

### Corrigido
- From faltando no sendBatch da Ombala
- Formato do número (Ombala: 9 dígitos, KambaSMS: +244)
- Tratamento de erros agora repassa resposta completa da API

### Adicionado
- Batch nativo para Ombala (números separados por vírgula)

---

## [0.1.0-alpha.3] - 2026-05-10

### Adicionado
- Classe base `Provider` com métodos comuns
- Sistema de configuração centralizada (`sender.config.ts`)
- Fallback automático entre providers
- `createSenders()` - cria todos providers configurados
- `createSender()` aceita string: `createSender("ombala", config)`
- Suporte a agendamento (`schedule`) no formato `yyyyMMddHHmmss`

### Modificado
- `from` movido do DTO para `ProviderConfig`
- `SendMessageDto` simplificado: `{ to, message, schedule? }`
- `createSender` agora é assíncrono
- Autenticação da Ombala: `Token` (era `Bearer`)
- Campo da KambaSMS: `text` (era `message`)

### Removido
- `from` do DTO (agora na configuração)
- Interface `SmsProvider` (substituída por `IProvider`)

### Corrigido
- Validação de `from` na Ombala lança `ConfigurationError`
- Campo `text` na KambaSMS

---

## [0.1.0-alpha.2] - 2026-01-10

### Adicionado
- Provider KambaSMS
- Validação de números angolanos
- Normalização de números
- Testes unitários com vitest

---

## [0.1.0-alpha.1] - 2026-01-05

### Adicionado
- Provider Ombala
- Envio simples e em lote
- Registry pattern
- TypeScript types