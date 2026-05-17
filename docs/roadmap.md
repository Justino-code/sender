# Roadmap de melhorias

Este documento descreve as funcionalidades planejadas para versões futuras do `@jcsolutions/sender`.

## Versionamento

- `v1.0.0` - Primeira versão estável (apenas envio de SMS)
- `v1.x.x` - Adições graduais (não quebram a API)
- `v2.0.0` - Mudanças significativas (se necessário)

---

## v1.0.0 (estável)

**Core implementado:**
- ✅ Envio simples (`send`)
- ✅ Envio em lote (`sendBatch`)
- ✅ Configuração centralizada (`sender.config.ts`)
- ✅ Fallback automático entre providers
- ✅ Validação de números angolanos
- ✅ Normalização de números
- ✅ Tratamento de erros completo
- ✅ Registry pattern para providers

**Providers incluídos:**
- ✅ Ombala
- ✅ KambaSMS
- ✅ TelcoSMS (pendente validação)

---

## v1.1.0 (primeiras melhorias)

### Ombala
- [ ] `getBalance()` - Consultar saldo de créditos
- [ ] `getSenders()` - Listar remetentes cadastrados
- [ ] `createSender(name)` - Criar novo remetente
- [ ] `getHistory(page?)` - Listar histórico de mensagens
- [ ] `getMessageById(id)` - Buscar mensagem específica

### KambaSMS
- [ ] `getBalance()` - Consultar saldo de créditos
- [ ] `getHistory()` - Listar histórico de mensagens
- [ ] `getScheduled()` - Listar agendamentos pendentes
- [ ] `cancelScheduled(id)` - Cancelar agendamento

### TelcoSMS
- [ ] `checkBalance()` - Verificar saldo disponível

---

## v1.2.0

### Geral
- [ ] Retry automático configurável
- [ ] Webhook para status de entrega
- [ ] Logging integrado (winston/pino)
- [ ] Métricas de uso (contador de SMS)

### Ombala
- [ ] Suporte a template de mensagens
- [ ] Relatórios de entrega

### KambaSMS
- [ ] Suporte a opt-out para campanhas
- [ ] Estatísticas de campanhas

---

## v1.3.0

### Geral
- [ ] Suporte a WhatsApp (via providers compatíveis)
- [ ] Suporte a RCS (Rich Communication Services)
- [ ] Cache de configurações (Redis)

### Novos providers
- [ ] Sms.to
- [ ] MIMO
- [ ] WeSender

---

## v2.0.0 (futuro)

- [ ] API completamente assíncrona (já é)
- [ ] Remoção de funcionalidades depreciadas
- [ ] Mudanças que quebram compatibilidade

---

## Como contribuir

Veja as issues marcadas com `good-first-issue` ou `help-wanted` no [GitHub](https://github.com/Justino-code/sender/issues).

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado |
| 🚧 | Em desenvolvimento |
| 📋 | Planeado |
| ❌ | Descartado |