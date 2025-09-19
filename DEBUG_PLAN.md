# Plano de Caça-Fantasmas - Garagem API

## Prioridade Alta (Bugs Críticos)
- [ ] **Problema:** Verificar a funcionalidade de adicionar veículos
  - **Hipótese:** Pode haver problemas na comunicação entre frontend e backend ou na validação dos dados
  - **Como Investigar:** 
    1. Testar o formulário de adição
    2. Verificar o console do navegador durante a submissão
    3. Adicionar logs no endpoint POST /api/veiculos
    4. Verificar se os dados estão chegando corretamente no MongoDB

- [ ] **Problema:** Verificar o relacionamento entre Veículos e Manutenções
  - **Hipótese:** O relacionamento pode não estar sendo salvo corretamente ou recuperado adequadamente
  - **Como Investigar:**
    1. Testar a adição de manutenções para um veículo
    2. Verificar se as manutenções aparecem na listagem
    3. Confirmar no MongoDB se o campo veiculo está sendo salvo corretamente
    4. Validar as queries de busca de manutenções por veículo

## Prioridade Média (Melhorias de UX)
- [ ] **Problema:** Layout responsivo e adaptação mobile
  - **Hipótese:** Alguns elementos podem não estar se ajustando corretamente em telas menores
  - **Como Investigar:**
    1. Testar em diferentes tamanhos de tela
    2. Usar as ferramentas de desenvolvimento mobile do navegador
    3. Verificar pontos de quebra do CSS

- [ ] **Problema:** Feedback visual para ações do usuário
  - **Hipótese:** Usuários podem não estar recebendo confirmação clara de suas ações
  - **Como Investigar:**
    1. Verificar se todas as ações têm notificações apropriadas
    2. Testar estados de loading durante operações
    3. Validar mensagens de erro e sucesso

## Prioridade Baixa (Bugs Menores)
- [ ] **Problema:** Validar formatação de dados
  - **Hipótese:** Alguns campos podem estar aceitando dados em formato incorreto
  - **Como Investigar:**
    1. Testar a inserção de dados em diferentes formatos
    2. Verificar as validações no frontend e backend
    3. Confirmar se as datas e valores numéricos estão sendo tratados corretamente

- [ ] **Problema:** Otimizar carregamento inicial
  - **Hipótese:** A aplicação pode estar demorando para carregar inicialmente
  - **Como Investigar:**
    1. Usar a aba Network do navegador para analisar tempos de carregamento
    2. Verificar se há requisições desnecessárias
    3. Avaliar o tamanho dos recursos carregados

## Logs e Melhorias Implementadas

### DD/MM/2025 - Início da Depuração
1. Adicionado logs no backend para melhor rastreamento
2. Implementado tratamento de erros mais detalhado
3. Melhorada a validação de dados no frontend

### Próximos Passos
1. Implementar testes automatizados para prevenir regressões
2. Melhorar a documentação do código
3. Adicionar mais feedback visual para ações do usuário

## Notas de Implementação
- Usar console.log estrategicamente no backend
- Verificar todos os endpoints no Insomnia/Postman antes de testar no frontend
- Manter registro de todos os bugs encontrados e corrigidos