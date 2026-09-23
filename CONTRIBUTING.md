# Guia de contribuição

Obrigado por querer contribuir com o `@jcsolutions/sender`! 🎉

## Antes de começar

O `@jcsolutions/sender` é uma camada de integração para providers de SMS. Antes de propor uma alteração, consulte o [README](README.md) e a [documentação](https://justino-code.github.io/sender/) para compreender a arquitetura e os contratos públicos existentes.

Evite alterações que acoplem a aplicação diretamente a um provider específico ou que quebrem o comportamento dos providers existentes sem uma justificativa clara.

## Requisitos

- Node.js 20 ou superior;
- Yarn 1.22.22, conforme definido no projeto;
- Git;
- credenciais de provider apenas quando forem necessários testes E2E.

## Configuração do ambiente

```bash
git clone https://github.com/Justino-code/sender.git
cd sender
yarn install
```

Antes de abrir um Pull Request, confirme que o projeto compila e que os testes relevantes passam localmente.

## Executar testes

O projeto possui diferentes grupos de testes:

```bash
# Testes unitários
yarn test:unit

# Testes de integração
yarn test:integration

# Testes de segurança
yarn test:security

# Testes de performance
yarn test:performance

# Testes com cobertura
yarn test:coverage

# Todos os testes principais
yarn test:all
```

O comando `yarn test` inicia o Vitest em modo interativo. Para uma execução única, prefira os comandos específicos acima.

### Testes E2E

Os testes E2E dependem de credenciais configuradas no ambiente de testes e podem fazer chamadas reais aos providers. Alguns podem enviar SMS reais e gerar custos.

Não execute esses testes com credenciais de produção ou números reais sem verificar previamente o impacto:

```bash
yarn test:e2e

# Providers específicos
yarn test:e2e:ombala
yarn test:e2e:kambasms
yarn test:e2e:telcosms

# Testes E2E de lote
yarn test:e2e:batch
yarn test:e2e:telcosms-batch
```

Use o arquivo `tests/.env.test.example` como referência para configurar o ambiente local. Nunca faça commit de tokens, API keys ou outros secrets.

## Reportar bugs

Antes de abrir uma issue, verifique se o problema já foi reportado.

Inclua, quando possível:

- versão do Node.js (`node --version`);
- versão do pacote (`npm list @jcsolutions/sender`);
- versão ou commit do projeto;
- provider afetado;
- configuração relevante sem credenciais;
- código mínimo para reproduzir o problema;
- comportamento esperado;
- comportamento atual;
- mensagem de erro e stack trace, removendo dados sensíveis;
- testes que já foram executados.

Não publique tokens, API keys, números reais, mensagens sensíveis ou respostas completas de providers em issues.

## Sugerir funcionalidades

Abra uma issue descrevendo:

- qual problema a funcionalidade resolve;
- quem se beneficiaria dela;
- como você imagina a API;
- exemplos de uso;
- impacto sobre providers existentes;
- possíveis mudanças incompatíveis;
- comportamento esperado em caso de erro, timeout ou rate limit.

Para novos providers, explique também quais operações, autenticação e limites são suportados pela API externa.

## Pull Requests

1. Crie uma branch a partir de `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nova-feature
   ```

2. Faça uma alteração focada e compatível com a arquitetura existente.
3. Adicione ou atualize os testes relevantes.
4. Atualize a documentação quando o comportamento público mudar.
5. Execute o build e os testes aplicáveis:

   ```bash
   yarn build
   yarn test:unit
   yarn test:integration
   yarn test:security
   ```

6. Verifique se nenhum secret ou dado sensível foi incluído:

   ```bash
   git diff --check
   git status
   ```

7. Crie um commit seguindo Conventional Commits.
8. Envie a branch:

   ```bash
   git push origin feature/nova-feature
   ```

9. Abra um Pull Request direcionado para `develop`.

A descrição do Pull Request deve explicar:

- o problema abordado;
- a solução implementada;
- os arquivos ou providers afetados;
- os testes executados;
- eventuais limitações;
- possíveis breaking changes;
- alterações necessárias na configuração ou documentação.

Todos os Pull Requests podem passar por revisão de código, testes automatizados e validações de compatibilidade.

## Padrões de código

### TypeScript

- Use TypeScript e mantenha a tipagem explícita nas interfaces públicas.
- Siga as interfaces e abstrações existentes.
- Mantenha responsabilidades específicas separadas entre core, providers e shared.
- Adicione JSDoc às funções, classes e tipos públicos quando necessário.
- Não introduza dependências externas sem justificar a necessidade.
- Preserve os contratos de erro e resposta existentes, salvo quando a alteração for intencional e documentada.
- Mantenha os testes passando.

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Descrição |
|------|-----------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `test:` | Testes |
| `chore:` | Manutenção |
| `refactor:` | Refatoração |
| `perf:` | Melhoria de performance |
| `security:` | Alteração relacionada à segurança |

Exemplos:

```bash
git commit -m "feat: adiciona novo provider"
git commit -m "fix: corrige validação de números"
git commit -m "docs: atualiza README"
git commit -m "test: cobre timeout do provider"
```

## Adicionar um novo provider

Os providers ficam organizados em diretórios próprios dentro de `src/providers/`.

1. Crie um diretório para o provider:

   ```text
   src/providers/novoprovider/
   ```

2. Implemente o provider utilizando a abstração `Provider` e o contrato `IProvider`.
3. Implemente as operações suportadas pela API externa, como `send` e, quando aplicável, `sendBatch`.
4. Adicione o export em `src/providers/index.ts`.
5. Registre o provider no mecanismo de registro utilizado pelo projeto.
6. Implemente a autenticação e o formato de requisição específico do provider.
7. Normalize respostas e erros de acordo com os contratos existentes.
8. Adicione testes unitários para sucesso, validação, autenticação, rate limit e erros do provider.
9. Adicione testes de integração quando houver comportamento que não possa ser validado apenas com mocks.
10. Adicione testes E2E somente quando houver um ambiente seguro e credenciais apropriadas.
11. Atualize o README, a documentação e o changelog quando necessário.

Antes de adicionar um provider, verifique se a API permite testes seguros e se os termos de uso autorizam a integração.

## Segurança

Nunca inclua os seguintes dados em commits, issues, Pull Requests ou logs:

- tokens e API keys;
- credenciais de provider;
- números de telefone reais sem necessidade;
- mensagens de clientes;
- respostas completas contendo dados sensíveis;
- arquivos `.env` locais.

Use variáveis de ambiente para credenciais e remova dados sensíveis de mensagens de erro, exemplos e evidências de testes.

Para reportar uma vulnerabilidade de segurança, não abra uma issue pública com detalhes exploráveis. Contacte o mantenedor diretamente através de `justinocontingo@gmail.com`, descrevendo o impacto e os passos mínimos para reprodução sem incluir credenciais reais.

## Estrutura do projeto

```text
src/
├── core/          # Configuração, registry, factory e abstrações principais
├── providers/     # Implementações específicas dos providers
└── shared/        # Tipos, interfaces, erros e utilitários

tests/
├── unit/          # Testes unitários
├── integration/   # Testes de integração
├── security/      # Testes relacionados a dados sensíveis e credenciais
├── performance/   # Testes de performance
└── e2e/           # Testes contra APIs reais, quando configurados

docs/              # Documentação do projeto
```

## Código de conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso, profissional e colaborativo. Comentários, issues e Pull Requests devem permanecer focados no código, na documentação e na melhoria do projeto.

## Dúvidas

Abra uma issue para dúvidas gerais sobre o projeto ou contacte `justinocontingo@gmail.com` quando apropriado.
