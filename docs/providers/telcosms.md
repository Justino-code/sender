# Provider TelcoSMS

## Sobre

A TelcoSMS é uma plataforma de comunicação angolana que utiliza autenticação via `api_key_app`.

## Status

🚧 **Em desenvolvimento** - Provider em fase inicial de desenvolvimento

> ⚠️ **Aviso importante**: Este provider **não foi testado** com API real. Nenhum tipo de teste foi realizado. A implementação atual é apenas uma base que **será modificada** conforme os testes forem realizados. **Não recomendado para uso em produção.**

## Configuração

```typescript
import { createSender } from "@jcsolutions/sender";

const sms = await createSender("telcosms", {
  token: process.env.TELCOSMS_API_KEY,
  baseUrl: "https://www.telcosms.co.ao",
  timeout: 10000,
});
```

## Especificações

| Propriedade | Valor |
|-------------|-------|
| Provider name | `"telcosms"` |
| Autenticação | `api_key_app` (no body/query) |
| Campo mensagem | `message_body` |
| Formato do número | 9 dígitos (ex: `923000000`) |
| Batch nativo | ❌ Não suportado |
| Agendamento | ❌ Não suportado |

## Envio simples

```typescript
const result = await sms.send({
  to: "923000000",
  message: "Mensagem de teste",
});
```

## Limitações conhecidas

| Item | Status | Nota |
|------|--------|------|
| Resposta da API | ⚠️ Limitado | Apenas status HTTP (sem corpo) |
| Envio em lote | ❌ Não disponível | Usa implementação base |
| Agendamento | ❌ Não disponível | API não documenta este recurso |
| Testes reais | ❌ Pendentes | Nenhum teste realizado |

## Próximos passos

Assim que forem obtidas credenciais de teste, este provider será validado e ajustado conforme necessário.

> 📝 Para mais detalhes, consulte o [site oficial da TelcoSMS](https://www.telcosms.co.ao)