// js/server.js

// --- Importações ---
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { fileURLToPath } = require('url');
const authMiddleware = require('./middleware/auth');

// Importação dos modelos
const User = require('./models/User');
// Removido import duplicado do Veiculo

// Configuração do __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuração Inicial ---
// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;
const mongoURI = process.env.MONGODB_URI;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// --- Conexão com o MongoDB ---
mongoose.connect(mongoURI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Modelos ---
const VeiculoSchema = new mongoose.Schema({
    placa: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    ano: { type: Number, required: true },
    quilometragem: { type: Number, required: true },
    status: { type: String, required: true },
    tipo: { type: String, required: true },
    ultimaManutencao: { type: Date },
    proximaManutencao: { type: Date },
    observacoes: { type: String }
});

const Veiculo = mongoose.model('Veiculo', VeiculoSchema);

// --- Rotas de Autenticação ---
app.post('/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verifica se o usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Este email já está em uso' });
        }

        // Cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Cria o usuário
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Gera o token JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );

        // Remove a senha antes de enviar a resposta
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            token,
            user: userResponse,
            message: 'Usuário registrado com sucesso'
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
});

app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Verifica a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );

        // Remove a senha antes de enviar a resposta
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            token,
            user: userResponse,
            message: 'Login realizado com sucesso'
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
    }
});

// --- Rotas Protegidas ---
app.use(authMiddleware);

// --- Rotas de Veículos ---
app.get('/api/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find();
        res.json(veiculos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar veículos', error: error.message });
    }
});

app.post('/api/veiculos', async (req, res) => {
    try {
        const veiculo = new Veiculo(req.body);
        await veiculo.save();
        res.status(201).json(veiculo);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar veículo', error: error.message });
    }
});

app.put('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculo = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        const veiculo = await Veiculo.findByIdAndDelete(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ message: 'Veículo não encontrado' });
        }
        res.json({ message: 'Veículo removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover veículo', error: error.message });
    }
});

// --- Rotas de Clima ---
app.get('/api/clima/:cidade', async (req, res) => {
    try {
        const cidade = req.params.cidade;
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados do clima', error: error.message });
    }
});

// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});