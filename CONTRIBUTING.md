# Guia de contribuição

Obrigado por querer contribuir com o `@jcsolutions/sender`! 🎉

## Código de conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e colaborativo.

## Como contribuir

### Reportar bugs

Antes de abrir uma issue, verifique se o bug já não foi reportado.

Abra uma issue com:

- Versão do Node.js (`node --version`)
- Versão do pacote (`npm list @jcsolutions/sender`)
- Código mínimo para reproduzir o problema
- Comportamento esperado
- Comportamento atual

### Sugerir features

Abra uma issue descrevendo:

- Qual o problema que a feature resolve
- Como você imagina a API
- Exemplos de uso

### Pull Requests

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Faça as alterações
4. Adicione testes para as novas funcionalidades
5. Execute os testes (`yarn test`)
6. Commit (`git commit -m 'feat: adiciona nova feature'`)
7. Push (`git push origin feature/nova-feature`)
8. Abra um Pull Request

## Padrões de código

### Commits

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Descrição |
|------|-----------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `test:` | Testes |
| `chore:` | Manutenção |
| `refactor:` | Refatoração |

Exemplos:
```bash
git commit -m "feat: adiciona provider Ecsend"
git commit -m "fix: corrige validação de números"
git commit -m "docs: atualiza README"
```

Código

· Use TypeScript
· Siga as interfaces existentes
· Adicione JSDoc em funções públicas
· Mantenha os testes passando

Testes

Todos os PRs devem incluir testes:

```bash
# Executar testes
yarn test

# Executar com cobertura
yarn test:coverage
```

Adicionar novo provider

1. Criar src/providers/novoprovider.provider.ts
2. Implementar SmsProvider
3. Adicionar na factory
4. Adicionar testes
5. Atualizar documentação

Estrutura do projeto

```
src/
├── core/          # Lógica principal
├── providers/     # Providers implementados
├── shared/        # Tipos, erros e utilitários
└── index.ts       # Ponto de entrada
```

Dúvidas

Abra uma issue ou contacte: justinocontingo@gmail.com


