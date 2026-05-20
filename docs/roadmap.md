# Roadmap de melhorias

## Visão geral

```
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                         v1.0.0 (ATUAL)                          │
                    │  ✅ Envio simples  ✅ Envio em lote  ✅ Fallback  ✅ Retry       │
                    │  ✅ Ombala (estável)  ✅ TelcoSMS (estável)                      │
                    └─────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                     PRÓXIMAS MELHORIAS                           │
                    │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
                    │  │  Ombala     │    │  TelcoSMS   │    │  KambaSMS   │          │
                    │  │  getBalance │    │checkBalance │    │  API real   │          │
                    │  │  getSenders │    └──────┬──────┘    │  getBalance │          │
                    │  │  getHistory │           │           │  getHistory │          │
                    │  └──────┬──────┘           │           └──────┬──────┘          │
                    │         │                  │                  │                 │
                    │         └──────────────────┼──────────────────┘                 │
                    │                            ▼                                    │
                    │         ┌─────────────────────────────────────┐                 │
                    │         │          Refatoração (SRP)          │                 │
                    │         │  ValidationService  │  HttpClient   │                 │
                    │         │  RetryHandler       │  ProviderCore │                 │
                    │         └─────────────────────────────────────┘                 │
                    └─────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                      RECURSOS GLOBAIS                           │
                    │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
                    │  │  Webhook    │    │   Logging   │    │  Métricas   │          │
                    │  │  entrega    │    │  (winston)  │    │  (contador) │          │
                    │  └─────────────┘    └─────────────┘    └─────────────┘          │
                    │                                                                 │
                    │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
                    │  │  WhatsApp   │    │    RCS      │    │   Redis     │          │
                    │  │  suporte    │    │  suporte    │    │   cache     │          │
                    │  └─────────────┘    └─────────────┘    └─────────────┘          │
                    └─────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                       NOVOS PROVIDERS                           │
                    │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
                    │  │   Sms.to    │    │    MIMO     │    │  WeSender   │          │
                    │  │  (planeado) │    │  (planeado) │    │  (planeado) │          │
                    │  └─────────────┘    └─────────────┘    └─────────────┘          │
                    └─────────────────────────────────────────────────────────────────┘
```

---

## Detalhamento por área

### 🔧 Refatoração (SRP)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Provider (antes)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Validação │ │   HTTP   │ │  Retry   │ │   Core   │ │   Config │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Provider (depois)                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      ProviderCore                            │   │
│  │              (send, sendBatch, providerName)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                    │                    │                │
│         ▼                    ▼                    ▼                │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐         │
│  │ Validation  │      │ HttpClient  │      │ RetryHandler│         │
│  │   Service   │      │             │      │             │         │
│  └─────────────┘      └─────────────┘      └─────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

### 📱 Funcionalidades por provider

```
Ombala (✅ estável)
├── ✅ Envio simples
├── ✅ Envio em lote nativo
├── ✅ Agendamento
├── 📋 getBalance()
├── 📋 getSenders()
├── 📋 getHistory()
└── 📋 createSender()

TelcoSMS (✅ estável)
├── ✅ Envio simples
├── ✅ Envio em lote (base)
├── 📋 checkBalance()
└── 📋 (aguardando documentação)

KambaSMS (🚧 em desenvolvimento)
├── 🚧 Envio simples (aguardando credenciais)
├── 🚧 Envio em lote (aguardando credenciais)
├── 🚧 Agendamento (aguardando credenciais)
├── 📋 getBalance()
├── 📋 getHistory()
└── 📋 getScheduled()
```

### 🌐 Recursos globais

```
Recursos
├── 📋 Webhook para status de entrega
├── 📋 Logging integrado (winston/pino)
├── 📋 Métricas de uso
├── 📋 Suporte a WhatsApp
├── 📋 Suporte a RCS
└── 📋 Cache com Redis
```

---

## ⏱️ Timeline indicativa

```
Agora ★
  │
  ├── ● v1.0.0 (lançada) ──────────────────────────────────────────────►
  │
  ├── ○ Refatoração SRP
  │
  ├── ○ Funcionalidades específicas por provider
  │
  └── ○ Novos providers
                                                              ▼
                                                        Futuro ★
```

---

## 📊 Prioridades

```
Alta prioridade ●     Média prioridade ○     Baixa prioridade ◌

● Refatoração SRP
● getBalance() (Ombala)
● Testes KambaSMS (quando credenciais disponíveis)

○ getHistory() (Ombala)
○ Webhook entrega
○ Logging integrado

◌ Novos providers (Sms.to, MIMO, WeSender)
◌ Suporte WhatsApp/RCS
```

---

## 🤝 Como contribuir

1. Abra uma issue descrevendo a funcionalidade
2. Faça um fork do projeto
3. Implemente a funcionalidade
4. Envie um Pull Request

Consulte o [guia de contribuição](./contributing.md).

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado |
| 🚧 | Em desenvolvimento |
| 📋 | Planeado |
| ● | Alta prioridade |
| ○ | Média prioridade |
| ◌ | Baixa prioridade |