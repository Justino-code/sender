# Documentação do Sender SDK

Bem-vindo à documentação oficial do **Sender** - o SDK universal para envio de SMS com suporte a gateways angolanos.

## Sobre o SDK

O Sender foi construído para simplificar a integração com diferentes gateways de SMS em Angola. Com uma API limpa e consistente, podes trocar de provider sem alterar o resto da tua aplicação.

### Características principais

- **API simples** - Envia SMS com poucas linhas de código
- **TypeScript first** - Tipos completos e autocomplete
- **Múltiplos providers** - Ombala, KambaSMS e mais em breve
- **Envio em lote** - Suporte nativo para múltiplos destinatários
- **Extensível** - Adiciona qualquer gateway com registry pattern
- **Validação local** - Normalização de números angolanos

### Casos de uso

- Códigos de verificação (OTP)
- Notificações transaccionais
- Alertas e lembretes
- Marketing SMS (envio em lote)

## Começar agora

| Guia | Descrição |
|------|-----------|
| [Primeiros passos](./getting-started.md) | Instalação, configuração e primeiro envio |
| [API Reference](./api.md) | Todas as funções, tipos e interfaces |
| [Providers](./providers.md) | Detalhes de cada gateway suportado |
| [Provider customizado](./custom-provider.md) | Como criar e registrar o seu próprio provider |

## Requisitos

- Node.js 18+ (para suporte ao fetch nativo)
- TypeScript 5+ (recomendado)

## Licença

MIT