// js/server.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'; // Importei o CORS para simplificar

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;

// --- Middleware ---
app.use(cors()); // Usando o pacote CORS para lidar com as permissões
app.use(express.json());


// =========================================================================
// ==================== BANCO DE DADOS SIMULADO EM MEMÓRIA ===================
// =========================================================================

// --- Dados da Atividade Anterior (Dicas de Manutenção) ---
const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo do motor regularmente." },
    { id: 2, dica: "Calibre os pneus semanalmente para a pressão recomendada." },
    { id: 3, dica: "Confira o nível do fluido de arrefecimento (radiador)." },
    { id: 4, dica: "Teste os freios em um local seguro após iniciar a viagem." },
    { id: 5, dica: "Mantenha os vidros, espelhos e faróis sempre limpos." }
];

const dicasPorTipo = {
    carro: [
        { id: 101, dica: "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
        { id: 102, dica: "Troque o filtro de ar do motor conforme especificado no manual." }
    ],
    carroesportivo: [
        { id: 201, dica: "Verifique o desgaste dos pneus de alta performance com mais frequência." },
        { id: 202, dica: "Utilize somente óleo sintético de alta qualidade recomendado pelo fabricante." }
    ],
    caminhao: [
        { id: 301, dica: "Inspecione o sistema de freios a ar diariamente antes de sair." },
        { id: 302, dica: "Verifique o estado e a lubrificação da quinta roda (se aplicável)." }
    ],
    moto: [
        { id: 401, dica: "Lubrifique e ajuste a tensão da corrente de transmissão regularmente." },
        { id: 402, dica: "Verifique o funcionamento de todas as luzes, incluindo piscas e luz de freio." }
    ]
};

// === INÍCIO ATIVIDADE B2.P1.A9: NOSSO NOVO ARSENAL DE DADOS ===
const veiculosDestaque = [
    { 
        id: 10, 
        modelo: "Maverick Híbrido", 
        ano: 2024, 
        destaque: "Economia e Estilo", 
        imagemUrl: "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/maverick/2023/fbr-maverick-hibrida-lariat-fx4-lateral.jpg.renditions.original.png" 
    },
    { 
        id: 11, 
        modelo: "Kombi Elétrica ID.Buzz", 
        ano: 2025, 
        destaque: "Nostalgia Eletrificada", 
        imagemUrl: "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/2022/03/VW_ID_Buzz_2.jpeg?w=1200&h=900&crop=1" 
    },
    { 
        id: 12, 
        modelo: "Mustang Mach-E", 
        ano: 2024, 
        destaque: "A Lenda, 100% Elétrica", 
        imagemUrl: "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/mustang-mach-e/2023/colorizer/azul-estoril/fbr-mustang-mach-e-gt-performance-3-4-frente.png.renditions.original.png" 
    }
];

const servicosGaragem = [
    { 
        id: "svc001", 
        nome: "Diagnóstico Eletrônico Completo", 
        descricao: "Verificação de todos os sistemas eletrônicos do veículo com scanners de última geração.", 
        precoEstimado: "R$ 250,00" 
    },
    { 
        id: "svc002", 
        nome: "Alinhamento e Balanceamento 3D", 
        descricao: "Para uma direção perfeita e maior durabilidade dos pneus.", 
        precoEstimado: "R$ 180,00" 
    },
    { 
        id: "svc003", 
        nome: "Troca de Óleo e Filtros Premium", 
        descricao: "Utilizando óleos sintéticos e filtros de alta performance para máxima proteção.", 
        precoEstimado: "R$ 450,00" 
    },
    {
        id: "svc004",
        nome: "Higienização Completa do Ar-Condicionado",
        descricao: "Eliminação de fungos, ácaros e bactérias, garantindo um ar mais puro no interior do veículo.",
        precoEstimado: "R$ 150,00"
    }
];
// === FIM ATIVIDADE B2.P1.A9 ===

// =========================================================================
// ============================= ROTAS DA API ==============================
// =========================================================================

app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Conectada está funcionando!');
});

// --- Rota de previsão do tempo (EXISTENTE) ---
app.get('/api/previsao/:cidade', async (req, res) => {
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

// --- Rotas de Dicas de Manutenção (ATIVIDADE ANTERIOR) ---
app.get('/api/dicas-manutencao', (req, res) => {
    console.log("[Servidor] Requisição recebida para /api/dicas-manutencao");
    res.json(dicasManutencaoGerais);
});

app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    const tipoNormalizado = tipoVeiculo.toLowerCase();
    console.log(`[Servidor] Requisição para dicas do tipo: ${tipoNormalizado}`);
    const dicas = dicasPorTipo[tipoNormalizado];
    if (dicas) {
        res.json(dicas);
    } else {
        res.status(404).json({ error: `Nenhuma dica específica encontrada para o tipo: ${tipoVeiculo}` });
    }
});


// === INÍCIO ATIVIDADE B2.P1.A9: NOVAS ROTAS DO ARSENAL DE DADOS ===

// Rota para Veículos em Destaque
app.get('/api/garagem/veiculos-destaque', (req, res) => {
    console.log(`[Servidor] Recebida requisição para /api/garagem/veiculos-destaque`);
    res.json(veiculosDestaque);
});

// Rota para Serviços Oferecidos
app.get('/api/garagem/servicos-oferecidos', (req, res) => {
    console.log(`[Servidor] Recebida requisição para /api/garagem/servicos-oferecidos`);
    res.json(servicosGaragem);
});

// === FIM ATIVIDADE B2.P1.A9 ===


// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey || apiKey.length < 20) {
        console.warn("***********************************************************************************");
        console.warn("ATENÇÃO: A chave da API OpenWeatherMap não está configurada corretamente.");
        console.warn("***********************************************************************************");
    } else {
        console.log("[Servidor] Chave da API OpenWeatherMap carregada.");
    }
});