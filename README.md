
# Garagem Conectada - API & Frontend

## Descrição
Sistema completo para gerenciamento de veículos, manutenções, serviços de garagem e integração com previsão do tempo. Possui frontend em HTML/CSS/JS e backend em Node.js + Express + MongoDB.

---

## Funcionalidades

- **Veículos:**
	- Adicionar, editar e excluir veículos (Carro, Carro Esportivo, Caminhão)
	- Visualizar detalhes completos, histórico e agendamentos de manutenção
	- Agendar manutenções para cada veículo
	- Visualizar veículos em destaque

- **Manutenção:**
	- Registrar manutenções realizadas e agendar futuras
	- Visualizar histórico e próximos agendamentos

- **Serviços de Garagem:**
	- Listar serviços oferecidos (ex: alinhamento, troca de óleo)

- **Dicas de Manutenção:**
	- Buscar dicas gerais e específicas por tipo de veículo

- **Previsão do Tempo:**
	- Consultar previsão do tempo para viagens e agendamentos

- **Integração Backend:**
	- Persistência real dos dados via MongoDB
	- Endpoints REST para CRUD de veículos, dicas, serviços, destaques

---

## Estrutura do Projeto

```
Garagem-API-main/
├── index.html                  # Página principal do frontend
├── css/
│   └── style.css               # Estilos visuais
├── js/
│   ├── main.js                 # Lógica principal do frontend
│   ├── ui.js                   # Manipulação da interface e eventos
│   ├── veiculo.js              # Classes dos veículos
│   ├── manuntencao.js          # Classe e funções de manutenção
│   ├── storage.js              # Persistência local
│   ├── connect.js              # Conexão frontend-backend
│   ├── server.js               # Backend Node.js/Express/MongoDB
│   └── models/
│       └── Veiculos.js         # Modelos do MongoDB
├── dados_veiculos_api.json     # Dados simulados para API
├── package.json                # Dependências do projeto
└── README.md                   # Este arquivo
```

---

## Instalação e Execução

1. **Instale as dependências do backend:**
	 ```bash
	 npm install
	 ```
2. **Configure o arquivo `.env`:**
	 - Adicione sua chave do MongoDB Atlas em `MONGODB_URI`
	 - Adicione sua chave do OpenWeatherMap em `OPENWEATHER_API_KEY`
3. **Inicie o backend:**
	 ```bash
	 node js/server.js
	 ```
4. **Abra o frontend:**
	 - Abra o arquivo `index.html` no navegador

---

## Como Usar

- **Adicionar veículo:** Preencha o formulário e clique em "Adicionar".
- **Editar veículo:** Clique em "Detalhes / Interagir" e depois em "Editar". O formulário será preenchido automaticamente. Edite os dados e salve.
- **Excluir veículo:** Clique em "Detalhes / Interagir" e depois em "Excluir". Confirme para remover.
- **Agendar manutenção:** No detalhe do veículo, preencha o formulário de agendamento e salve.
- **Ver dicas:** Use os botões para buscar dicas gerais ou específicas.
- **Consultar previsão:** Informe a cidade e veja a previsão do tempo para viagens ou agendamentos.

---

## Integração Backend

- O backend Node.js/Express expõe endpoints REST para CRUD de veículos, dicas, serviços e destaques.
- Os dados são persistidos no MongoDB Atlas.
- O frontend pode funcionar localmente (dados em memória) ou integrado ao backend.

---

## Exemplos de Uso

### Adicionar Veículo
1. Preencha todos os campos do formulário
2. Clique em "Adicionar"
3. O veículo aparece na lista da garagem

### Editar Veículo
1. Clique em "Detalhes / Interagir" do veículo desejado
2. Clique em "Editar"
3. Altere os dados e salve

### Excluir Veículo
1. Clique em "Detalhes / Interagir"
2. Clique em "Excluir" e confirme

### Agendar Manutenção
1. No detalhe do veículo, preencha o formulário de agendamento
2. Clique em "Agendar"

### Buscar Dicas
1. Clique em "Buscar dicas gerais" ou informe o tipo e clique em "Buscar dicas específicas"

---

## Contato e Suporte

Em caso de dúvidas, sugestões ou problemas, consulte os arquivos JS para exemplos ou abra uma issue.