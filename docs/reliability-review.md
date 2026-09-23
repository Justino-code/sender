# Revisão de fallback, retry e documentação

Este documento registra pontos identificados durante a análise do `@jcsolutions/sender` que devem ser considerados antes ou durante a preparação da v2.

O objetivo é separar problemas de comportamento, que devem ser tratados como issues técnicas, de melhorias de documentação e consistência que podem ser aplicadas independentemente da refatoração principal.

## Escopo

A revisão cobre principalmente:

- fallback entre providers;
- retries e backoff;
- risco de duplicação de SMS;
- idempotência e erros ambíguos;
- envio em lote;
- consistência da documentação;
- compatibilidade com Node.js 22;
- preparação para possíveis breaking changes na v2.

## Problemas que devem ser tratados como issues técnicas

### 1. Política de fallback e possível duplicação de SMS

O fallback atual pode tentar outro provider quando o provider anterior lança um erro. Em determinados cenários, a mensagem pode ter sido processada pelo primeiro provider, mas a resposta pode ter sido perdida ou ter excedido o timeout.

Fluxo possível:

```text
A aplicação envia o SMS
        ↓
O provider processa a mensagem
        ↓
A resposta falha ou expira
        ↓
O sender interpreta a operação como falha
        ↓
Outro provider é acionado
        ↓
O destinatário pode receber dois SMS
```

É necessário definir uma política explícita para determinar quais erros permitem fallback e quais devem ser devolvidos diretamente à aplicação.

Casos a analisar:

- erro de configuração: não fazer fallback;
- erro de validação: não fazer fallback;
- erro de autenticação: interromper ou permitir fallback conforme política definida;
- rate limit: fallback opcional e configurável;
- timeout: operação potencialmente ambígua;
- erro de conexão antes do envio: possível candidato a fallback;
- erro após aceite ou processamento pelo provider: evitar nova tentativa quando possível.

Também devem ser avaliados a persistência do estado interno do fallback, a aplicação de overrides de configuração e o tratamento de erros quando todos os providers falham.

### 2. Política de retry, idempotência e erros transitórios

O SDK possui suporte a retries configuráveis e backoff, mas a política precisa ser definida de forma explícita e coberta por testes.

A revisão deve decidir:

- quais erros são retentáveis;
- quais erros nunca devem ser retentados;
- como tratar `TimeoutError`;
- como tratar `RateLimitError`;
- qual o limite máximo de tentativas;
- como aplicar backoff e jitter;
- como evitar retries agressivos;
- como distinguir falha antes do envio de falha depois do envio;
- se os providers suportam chaves de idempotência;
- como lidar com operações em lote;
- como registrar tentativas sem expor dados sensíveis.

Retries em operações de envio podem causar duplicação quando o provider processa a mensagem, mas a resposta não chega ao SDK. Essa possibilidade deve fazer parte do contrato e da documentação.

### 3. Estado e comportamento do fallback entre chamadas

O mecanismo de fallback mantém estado interno sobre o provider atual. Deve ser decidido se esse comportamento é desejado entre chamadas diferentes ou se cada operação deve iniciar sempre pelo provider padrão.

A revisão deve considerar:

- isolamento entre chamadas concorrentes;
- comportamento após uma recuperação do provider principal;
- impacto de uma falha temporária;
- comportamento em `send` e `sendBatch`;
- reset automático ou manual do provider atual;
- observabilidade das trocas de provider.

## Melhorias de documentação

As seguintes melhorias podem ser feitas sem esperar pela refatoração completa:

### 1. Documentar fallback e retry com precisão

A documentação deve distinguir claramente:

- **retry:** repetir uma operação no mesmo provider;
- **fallback:** tentar outro provider;
- **timeout:** limite de espera da requisição;
- **erro ambíguo:** a mensagem pode ter sido processada apesar da falha percebida pelo SDK.

Também deve indicar:

- valores padrão de `maxRetries` e `retryDelay`;
- backoff utilizado;
- erros que não são retentados;
- que fallback e retry podem resultar em duplicação em cenários ambíguos;
- que o comportamento pode mudar na v2.

### 2. Documentar diferenças de batch

Deve ficar explícita a diferença entre:

- batch nativo: uma operação específica do provider;
- batch baseado na implementação comum: múltiplas chamadas individuais.

A documentação deve explicar os impactos em:

- latência;
- quotas;
- rate limits;
- custo;
- concorrência;
- resultados parciais;
- limites de destinatários.

### 3. Adicionar limitações e responsabilidades

A documentação deve deixar claro que o SDK não garante:

- entrega final do SMS;
- disponibilidade dos providers;
- equivalência de resultados entre providers;
- ausência de custos ou quotas externas;
- ausência de duplicação em falhas ambíguas;
- que todos os providers suportem as mesmas operações.

### 4. Alinhar o status dos providers

O status dos providers deve ser consistente entre:

- `README.md`;
- `docs/index.md`;
- `docs/providers.md`;
- documentação específica de cada provider;
- changelog, quando aplicável.

Em especial, o status do KambaSMS deve ser definido como um único estado em todos os documentos.

### 5. Documentar Node.js 22

A documentação de utilização e contribuição deve indicar Node.js 22 ou superior, em alinhamento com o campo `engines` do `package.json`.

### 6. Indicar a evolução para a v2

A documentação deve informar que a API atual pode sofrer alterações durante a revisão da v2, especialmente nos contratos de:

- fallback;
- retry;
- erros;
- providers;
- configuração;
- envio em lote.

## Ordem sugerida

1. Definir a política de fallback e duplicação.
2. Definir a política de retry e idempotência.
3. Cobrir os comportamentos com testes determinísticos.
4. Documentar fallback, retry e batch.
5. Alinhar status, requisitos e limitações da documentação.
6. Incorporar as decisões na arquitetura da v2.

## Resultado esperado

A v2 deve oferecer uma política previsível para falhas, retries e fallback, com contratos documentados, comportamento testado e limites claros para o consumidor da biblioteca.
