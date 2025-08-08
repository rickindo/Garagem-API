// js/server.js

// --- Importações ---
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose'; // Mongoose é nosso ORM para o MongoDB

// --- Configuração Inicial ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;
const mongoURI = process.env.MONGODB_URI;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// =========================================================================
// === 1. DEFINIÇÃO DOS SCHEMAS E MODELS (ESTRUTURA DOS DADOS NO MONGO) ===
// =========================================================================
// Um Schema define como os dados devem ser no banco (campos, tipos, etc.)
// Um Model é o que usamos no código para criar, ler, atualizar e deletar dados.

// Schema para as dicas gerais de manutenção
const DicaGeralSchema = new mongoose.Schema({
    dica: { type: String, required: true }
});
const DicaGeral = mongoose.model('DicaGeral', DicaGeralSchema);

// Schema para as dicas específicas por tipo de veículo
const DicaEspecificaSchema = new mongoose.Schema({
    tipo: { type: String, required: true, lowercase: true }, // ex: 'carro', 'moto'
    dica: { type: String, required: true }
});
const DicaEspecifica = mongoose.model('DicaEspecifica', DicaEspecificaSchema);

// Schema para os veículos em destaque
const VeiculoDestaqueSchema = new mongoose.Schema({
    modelo: { type: String, required: true },
    ano: { type: Number, required: true },
    destaque: { type: String, required: true },
    imagemUrl: { type: String, required: true }
});
const VeiculoDestaque = mongoose.model('VeiculoDestaque', VeiculoDestaqueSchema);

// Schema para os serviços da garagem
const ServicoGaragemSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    precoEstimado: { type: String, required: true }
});
const ServicoGaragem = mongoose.model('ServicoGaragem', ServicoGaragemSchema);

// === SCHEMA DO VEÍCULO (exemplo, ajuste conforme seu projeto) ===
const VeiculoSchema = new mongoose.Schema({
    tipo: String,
    placa: String,
    modelo: String,
    cor: String,
    portas: Number,
    eixos: Number,
    capacidade: Number
});
const Veiculo = mongoose.model('Veiculo', VeiculoSchema);


// =========================================================================
// ======================= ROTAS DA API ATUALIZADAS ========================
// =========================================================================

app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Conectada está funcionando e conectado ao MongoDB!');
});

// --- Rota de previsão do tempo (NÃO MUDA, pois usa API externa) ---
app.get('/api/previsao/:cidade', async (req, res) => {
    // ... (seu código de previsão do tempo continua o mesmo)
    const { cidade } = req.params;
    if (!apiKey || apiKey.length < 20) {
        console.error("[Servidor] ERRO: Chave da API OpenWeatherMap não configurada.");
        return res.status(500).json({ error: 'Erro interno do servidor: Configuração da API está incompleta.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
        const apiResponse = await axios.get(weatherAPIUrl);
        res.json(apiResponse.data);
    } catch (error) {
        console.error(`[Servidor] ERRO ao buscar previsão para ${cidade}:`, error.message);
        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = error.response.data?.message || 'Erro na API externa.';
            if (statusCode === 404) {
                 return res.status(404).json({ error: `Cidade '${cidade}' não encontrada.` });
            }
            return res.status(statusCode).json({ error: errorMessage });
        }
        return res.status(500).json({ error: 'Erro interno no servidor ao tentar buscar previsão.' });
    }
});


// --- Rotas de Dicas (agora buscando do MongoDB) ---
app.get('/api/dicas-manutencao', async (req, res) => {
    try {
        console.log("[Servidor] Buscando dicas gerais do MongoDB...");
        const dicas = await DicaGeral.find(); // .find() busca todos os documentos
        res.json(dicas);
    } catch (error) {
        console.error("Erro ao buscar dicas gerais:", error);
        res.status(500).json({ error: 'Erro interno ao buscar dicas de manutenção.' });
    }
});

app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => {
    try {
        const { tipoVeiculo } = req.params;
        const tipoNormalizado = tipoVeiculo.toLowerCase();
        console.log(`[Servidor] Buscando dicas para o tipo '${tipoNormalizado}' do MongoDB...`);

        const dicas = await DicaEspecifica.find({ tipo: tipoNormalizado }); // Busca por um campo específico

        if (dicas && dicas.length > 0) {
            res.json(dicas);
        } else {
            res.status(404).json({ error: `Nenhuma dica específica encontrada para o tipo: ${tipoVeiculo}` });
        }
    } catch (error) {
        console.error("Erro ao buscar dicas específicas:", error);
        res.status(500).json({ error: 'Erro interno ao buscar dicas específicas.' });
    }
});

// --- Rotas da Garagem (agora buscando do MongoDB) ---
app.get('/api/garagem/veiculos-destaque', async (req, res) => {
    try {
        console.log("[Servidor] Buscando veículos em destaque do MongoDB...");
        const veiculos = await VeiculoDestaque.find();
        res.json(veiculos);
    } catch (error) {
        console.error("Erro ao buscar veículos em destaque:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

app.get('/api/garagem/servicos-oferecidos', async (req, res) => {
    try {
        console.log("[Servidor] Buscando serviços oferecidos do MongoDB...");
        const servicos = await ServicoGaragem.find();
        res.json(servicos);
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        res.status(500).json({ error: 'Erro interno ao buscar serviços.' });
    }
});

// === ENDPOINTS CRUD VEÍCULO ===

// Atualizar veículo (PUT)
app.put('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!veiculoAtualizado) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        res.json(veiculoAtualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deletar veículo (DELETE)
app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculoRemovido = await Veiculo.findByIdAndDelete(req.params.id);
        if (!veiculoRemovido) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        res.json({ message: 'Veículo removido com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// =========================================================================
// === 2. FUNÇÃO PARA POPULAR O BANCO DE DADOS (SE ESTIVER VAZIO) ========
// =========================================================================
async function popularBancoDeDados() {
    try {
        // Popula Dicas Gerais
        if (await DicaGeral.countDocuments() === 0) {
            const dicasGeraisIniciais = [
                { dica: "Verifique o nível do óleo do motor regularmente." },
                { dica: "Calibre os pneus semanalmente para a pressão recomendada." },
                { dica: "Confira o nível do fluido de arrefecimento (radiador)." },
                { dica: "Teste os freios em um local seguro após iniciar a viagem." },
                { dica: "Mantenha os vidros, espelhos e faróis sempre limpos." }
            ];
            await DicaGeral.insertMany(dicasGeraisIniciais);
            console.log("[DB] Dicas gerais populadas no banco de dados.");
        }

        // Popula Dicas Específicas
        if (await DicaEspecifica.countDocuments() === 0) {
            const dicasEspecificasIniciais = [
                { tipo: 'carro', dica: "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
                { tipo: 'carro', dica: "Troque o filtro de ar do motor conforme especificado no manual." },
                { tipo: 'carroesportivo', dica: "Verifique o desgaste dos pneus de alta performance com mais frequência." },
                { tipo: 'carroesportivo', dica: "Utilize somente óleo sintético de alta qualidade recomendado pelo fabricante." },
                { tipo: 'caminhao', dica: "Inspecione o sistema de freios a ar diariamente antes de sair." },
                { tipo: 'caminhao', dica: "Verifique o estado e a lubrificação da quinta roda (se aplicável)." },
                { tipo: 'moto', dica: "Lubrifique e ajuste a tensão da corrente de transmissão regularmente." },
                { tipo: 'moto', dica: "Verifique o funcionamento de todas as luzes, incluindo piscas e luz de freio." }
            ];
            await DicaEspecifica.insertMany(dicasEspecificasIniciais);
            console.log("[DB] Dicas específicas populadas no banco de dados.");
        }

        // Popula Veículos em Destaque
        if (await VeiculoDestaque.countDocuments() === 0) {
            const veiculosIniciais = [
                { modelo: "Maverick Híbrido", ano: 2024, destaque: "Economia e Estilo", imagemUrl: "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/maverick/2023/fbr-maverick-hibrida-lariat-fx4-lateral.jpg.renditions.original.png" },
                { modelo: "Kombi Elétrica ID.Buzz", ano: 2025, destaque: "Nostalgia Eletrificada", imagemUrl: "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2022/03/VW_ID_Buzz_2.jpeg?w=1200&h=900&crop=1" },
                { modelo: "Mustang Mach-E", ano: 2024, destaque: "A Lenda, 100% Elétrica", imagemUrl: "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/mustang-mach-e/2023/colorizer/azul-estoril/fbr-mustang-mach-e-gt-performance-3-4-frente.png.renditions.original.png" }
            ];
            await VeiculoDestaque.insertMany(veiculosIniciais);
            console.log("[DB] Veículos em destaque populados no banco de dados.");
        }

        // Popula Serviços da Garagem
        if (await ServicoGaragem.countDocuments() === 0) {
            const servicosIniciais = [
                { nome: "Diagnóstico Eletrônico Completo", descricao: "Verificação de todos os sistemas eletrônicos do veículo com scanners de última geração.", precoEstimado: "R$ 250,00" },
                { nome: "Alinhamento e Balanceamento 3D", descricao: "Para uma direção perfeita e maior durabilidade dos pneus.", precoEstimado: "R$ 180,00" },
                { nome: "Troca de Óleo e Filtros Premium", descricao: "Utilizando óleos sintéticos e filtros de alta performance para máxima proteção.", precoEstimado: "R$ 450,00" },
                { nome: "Higienização Completa do Ar-Condicionado", descricao: "Eliminação de fungos, ácaros e bactérias, garantindo um ar mais puro no interior do veículo.", precoEstimado: "R$ 150,00" }
            ];
            await ServicoGaragem.insertMany(servicosIniciais);
            console.log("[DB] Serviços da garagem populados no banco de dados.");
        }
    } catch (error) {
        console.error("Erro ao popular o banco de dados:", error);
    }
}


// =========================================================================
// === 3. CONEXÃO COM O BANCO DE DADOS E INICIALIZAÇÃO DO SERVIDOR ========
// =========================================================================
// Agora, o servidor só inicia DEPOIS que a conexão com o banco é bem-sucedida.

console.log("Iniciando conexão com o MongoDB Atlas...");
mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Conectado ao MongoDB Atlas com sucesso!");

        // Chama a função para popular o DB (só vai adicionar se estiver vazio)
        popularBancoDeDados();

        // Inicia o servidor Express
        app.listen(port, () => {
            console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
            if (!apiKey || apiKey.length < 20) {
                console.warn("***********************************************************************************");
                console.warn("ATENÇÃO: A chave da API OpenWeatherMap não está configurada corretamente.");
                console.warn("***********************************************************************************");
            } else {
                console.log("[Servidor] Chave da API OpenWeatherMap carregada.");
            }
        });
    })
    .catch((err) => {
        console.error("❌ ERRO ao conectar com o MongoDB Atlas:");
        console.error(err);
        process.exit(1); // Encerra o processo se não conseguir conectar ao DB
    });