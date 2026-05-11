# API Reference

Bem-vindo à referência completa da API do `@jcsolutions/sender`.

## Índice

| Secção | Descrição |
|--------|-----------|
| [Funções principais](./api/core.md) | `createSender`, `createSenders`, `createSenderSync` |
| [Interfaces e Classes](./api/interfaces.md) | `IProvider`, `Provider` (Classe Base) |
| [Tipos e DTOs](./api/types.md) | `SendMessageDto`, `SendBatchMessageDto`, `SendMessageResponse`, `SendBatchMessageResponse`, `ProviderConfig`, `CreateSenderConfig` |
| [Registry API](./api/registry.md) | `registerProvider`, `registerProviders`, `listProviders`, `hasProvider`, `getProvider` |
| [Config API](./api/config.md) | `defineConfig`, `loadConfig`, `getDefaultProvider`, `getFallbackProviders` |
| [Utilitários](./api/utils.md) | `validatePhoneNumber`, `validatePhoneNumbers`, `normalizePhoneNumber`, `normalizePhoneNumbers` |
| [Erros](./api/errors.md) | `SenderError`, `ConfigurationError`, `AuthenticationError`, `RateLimitError`, `ValidationError`, `ProviderError`, `TimeoutError` |