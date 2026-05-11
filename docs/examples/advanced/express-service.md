# Serviço Node.js com Express

Transforme o SDK em uma API REST para enviar SMS usando Express.js. Ideal para microsserviços, sistemas que não usam Node.js diretamente ou para separar a lógica de envio do resto da aplicação.

## Quando usar este padrão

| Cenário | Motivo |
|---------|--------|
| **Microsserviços** | Centraliza o envio de SMS em um serviço dedicado |
| **Múltiplas linguagens** | Permite que aplicações em PHP, Python, Java usem o mesmo serviço |
| **Filas e processamento** | Facilita integrar com sistemas de fila (RabbitMQ, Bull) |
| **Logs centralizados** | Todos os envios passam pelo mesmo ponto |

## Como funciona

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │ ──→ │  API REST   │ ──→ │SDK(Provider │
│   (React)   │     │  (Express)  │     │ ex: ombala) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   Logs,     │
                    │  Métricas   │
                    └─────────────┘
```

## Instalação das dependências

```bash
yarn add express @jcsolutions/sender
yarn add -D @types/express
```

## Serviço completo

```typescript
// server.ts
import express, { Request, Response } from "express";
import { createSender, validatePhoneNumber } from "@jcsolutions/sender";
import { 
  AuthenticationError, 
  RateLimitError, 
  ValidationError,
  ProviderError 
} from "@jcsolutions/sender";

const app = express();
app.use(express.json());

// Criar sender uma vez e reutilizar
const sms = await createSender("ombala", {
  token: process.env.OMBALA_TOKEN,
  baseUrl: "https://api.useombala.ao/v1",
  from: "LEVAJA",
});

// ============================================
// ENDPOINTS
// ============================================

/**
 * POST /api/send
 * Envia uma única mensagem SMS
 * 
 * Body: { "to": "923000000", "message": "Olá mundo!" }
 */
app.post("/api/send", async (req: Request, res: Response) => {
  const { to, message } = req.body;

  // Validação dos campos obrigatórios
  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: "Os campos 'to' e 'message' são obrigatórios",
    });
  }

  try {
    const result = await sms.send({ to, message });
    return res.json({ 
      success: true, 
      messageId: result.messageId,
      provider: result.provider 
    });
  } catch (error) {
    // Tratamento específico por tipo de erro
    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ 
        success: false, 
        error: error.message 
      });
    }
    if (error instanceof RateLimitError) {
      return res.status(429).json({ 
        success: false, 
        error: error.message 
      });
    }
    if (error instanceof ProviderError) {
      return res.status(502).json({ 
        success: false, 
        error: error.message 
      });
    }
    return res.status(500).json({ 
      success: false, 
      error: "Erro interno do servidor" 
    });
  }
});

/**
 * POST /api/send-batch
 * Envia mensagem para múltiplos destinatários
 * 
 * Body: { "to": ["923000001", "923000002"], "message": "Promoção!" }
 */
app.post("/api/send-batch", async (req: Request, res: Response) => {
  const { to, message } = req.body;

  if (!to || !Array.isArray(to) || to.length === 0) {
    return res.status(400).json({
      success: false,
      error: "O campo 'to' deve ser um array não vazio",
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "O campo 'message' é obrigatório",
    });
  }

  try {
    const result = await sms.sendBatch({ to, message });
    return res.json({
      success: true,
      total: to.length,
      successful: result.successful.length,
      failed: result.failed.length,
      details: result.details,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/health
 * Verifica se o serviço está funcionando
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    provider: "ombala" 
  });
});

/**
 * POST /api/validate
 * Valida um número de telefone sem enviar SMS
 * 
 * Body: { "phone": "923000000" }
 */
app.post("/api/validate", (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: "O campo 'phone' é obrigatório",
    });
  }

  const isValid = validatePhoneNumber(phone);
  return res.json({
    success: true,
    phone,
    valid: isValid,
    normalized: isValid ? `+244${phone}` : null,
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor SMS rodando em http://localhost:${PORT}`);
  console.log(`   POST /api/send - Enviar SMS`);
  console.log(`   POST /api/send-batch - Enviar lote`);
  console.log(`   POST /api/validate - Validar número`);
  console.log(`   GET  /api/health - Health check`);
});
```

## Exemplos de requisição

### Envio simples

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"to": "923000000", "message": "Olá via API SMS!"}'
```

**Resposta:**
```json
{
  "success": true,
  "messageId": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "ombala"
}
```

### Envio em lote

```bash
curl -X POST http://localhost:3000/api/send-batch \
  -H "Content-Type: application/json" \
  -d '{"to": ["923000001", "923000002"], "message": "Promoção especial!"}'
```

**Resposta:**
```json
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "details": [
    { "to": "923000001", "messageId": "abc-123" },
    { "to": "923000002", "messageId": "def-456" }
  ]
}
```

### Validar número

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"phone": "923000000"}'
```

**Resposta:**
```json
{
  "success": true,
  "phone": "923000000",
  "valid": true,
  "normalized": "+244923000000"
}
```

## Docker (opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.ts"]
```

```bash
docker build -t sms-api .
docker run -p 3000:3000 --env-file .env sms-api
```

## Próximo exemplo

- [Função utilitária para OTP](../utilities/otp.md)
