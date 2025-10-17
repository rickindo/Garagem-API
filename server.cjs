const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do MongoDB
const mongoURI = 'mongodb://127.0.0.1:27017/garagem';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexão com MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    console.log('Verifique sua conexão com a internet e as credenciais do MongoDB');
    process.exit(1);
  });

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Rotas de Autenticação
app.post('/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'sua_chave_secreta', { expiresIn: '24h' });
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'sua_chave_secreta', { expiresIn: '24h' });
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// Rotas protegidas
app.use('/api', authMiddleware);

// Rotas de Veículos
app.get('/api/veiculos', async (req, res) => {
  try {
    const veiculos = await Veiculo.find({ owner: req.userId });
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar veículos', error: error.message });
  }
});

app.post('/api/veiculos', async (req, res) => {
  try {
    const veiculo = new Veiculo({ ...req.body, owner: req.userId });
    await veiculo.save();
    res.status(201).json(veiculo);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar veículo', error: error.message });
  }
});

app.put('/api/veiculos/:id', async (req, res) => {
  try {
    const veiculo = await Veiculo.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, req.body, { new: true });
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
    const veiculo = await Veiculo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
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
