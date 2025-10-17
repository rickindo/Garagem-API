// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken'); // REMOVIDO: jwt não é mais necessário
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do MongoDB
const mongoURI = process.env.MONGODB_URI;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexão com MongoDB
// Verifique se a mongoURI está definida antes de tentar conectar
if (!mongoURI) {
  console.error('A variável de ambiente MONGODB_URI não está definida. Verifique seu arquivo .env.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    console.log('Verifique sua conexão com a internet e as credenciais do MongoDB');
    process.exit(1);
  });

// --- Início da Definição de Schemas e Modelos ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Método para comparar a senha
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const veiculoSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  placa: { type: String, required: true, unique: true },
  ano: { type: Number },
  cor: { type: String }
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

// --- Fim da Definição de Schemas e Modelos ---

// REMOVIDO: O middleware de autenticação JWT não é mais necessário

// Rotas de Autenticação (apenas registro e login, sem geração de token JWT)
app.post('/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    const user = new User({ name, email, password });
    await user.save();
    // REMOVIDO: jwt.sign para gerar token
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    // REMOVIDO: jwt.sign para gerar token
    res.json({
      message: 'Login realizado com sucesso',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// REMOVIDO: app.use('/api', authMiddleware); as rotas abaixo agora são públicas

// Rotas de Veículos (agora públicas, pois o JWT foi removido)
app.get('/api/veiculos', async (req, res) => {
  try {
    // Note: 'owner: req.userId' não pode mais ser usado diretamente sem um usuário logado
    // Se a intenção é buscar todos os veículos, você pode simplesmente:
    const veiculos = await Veiculo.find();
    // Ou, se os veículos ainda precisam de um owner, mas a API não autentica:
    // Você pode adaptar isso para como você quer buscar os veículos sem um usuário logado.
    // Exemplo: Permitir acesso a todos os veículos para demonstração:
    // const veiculos = await Veiculo.find();

    // Se a rota continua esperando que um 'owner' seja fornecido de alguma outra forma
    // ou se você remover a propriedade 'owner' dos seus veículos temporariamente.
    // Por enquanto, vou fazer a rota retornar todos os veículos para evitar um erro.
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar veículos', error: error.message });
  }
});

app.post('/api/veiculos', async (req, res) => {
  try {
    // Note: 'owner: req.userId' não é mais disponível.
    // Você precisará decidir como o 'owner' será definido para novos veículos
    // ou se a propriedade 'owner' deve ser removida do esquema Veiculo.
    // Por enquanto, estou removendo a atribuição automática de 'owner'.
    // Isto fará com que o campo 'owner' seja tratado de outra forma ou precise ser fornecido no corpo da requisição.
    // SE O 'owner' CONTINUAR REQUIRED NO SEU SCHEMA, VOCÊ TERÁ QUE FORNECÊ-LO MANUALMENTE NO BODY OU REMOVÊ-LO DO SCHEMA.
    const veiculo = new Veiculo({ ...req.body /* , owner: /* alguma forma de owner */ });
    await veiculo.save();
    res.status(201).json(veiculo);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar veículo', error: error.message });
  }
});

app.put('/api/veiculos/:id', async (req, res) => {
  try {
    // Note: Sem 'req.userId', a atualização precisa ser feita pelo '_id' diretamente,
    // ou a lógica para encontrar o 'owner' precisará ser adaptada.
    const veiculo = await Veiculo.findOneAndUpdate({ _id: req.params.id /* , owner: req.userId */ }, req.body, { new: true });
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar veículo', error: error.message });
  }
});

app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    // Note: Sem 'req.userId', a exclusão precisa ser feita pelo '_id' diretamente,
    // ou a lógica para encontrar o 'owner' precisará ser adaptada.
    const veiculo = await Veiculo.findOneAndDelete({ _id: req.params.id /* , owner: req.userId */ });
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    res.json({ message: 'Veículo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover veículo', error: error.message });
  }
});

// Serve os arquivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});