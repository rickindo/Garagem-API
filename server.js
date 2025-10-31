// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Apenas imagens são permitidas!'), false);
        }
        cb(null, true);
    }
});

const app = express();
const port = process.env.PORT || 3000;

// Configuração do MongoDB
const mongoURI = process.env.MONGODB_URI;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static('uploads')); // Serve as imagens uploaded

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

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
    
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Cria o novo usuário
    const user = new User({ name, email, password });
    await user.save();

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retorna o token e os dados do usuário
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ 
      message: 'Erro ao registrar usuário', 
      error: error.message 
    });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Procura o usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verifica a senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retorna o token e os dados do usuário
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      message: 'Erro ao fazer login', 
      error: error.message 
    });
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

app.post('/api/veiculos', authMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const veiculo = new Veiculo({
            ...req.body,
            owner: req.userId,
            imageUrl
        });
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