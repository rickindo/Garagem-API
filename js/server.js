// js/server.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

// Carrega variáveis de ambiente do arquivo .env
// Certifique-se de que existe um arquivo .env na raiz do projeto com:
// OPENWEATHER_API_KEY=sua_chave_aqui
// PORT=3000 (opcional, o padrão será 3000 se não definido)
dotenv.config();

// Inicializa o aplicativo Express
const app = express();

// Define a porta. Usa a variável de ambiente PORT se disponível, senão 3000.
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;

// --- Middleware ---

// 1. Middleware para CORS (Cross-Origin Resource Sharing)
// Este middleware DEVE vir ANTES das suas definições de rotas.
app.use((req, res, next) => {
    // Permite requisições de qualquer origem.
    // Para produção, considere restringir a origens específicas:
    // const allowedOrigins = ['http://meusite.com', 'https://meufrontend.vercel.app'];
    // const origin = req.headers.origin;
    // if (allowedOrigins.includes(origin)) {
    //     res.setHeader('Access-Control-Allow-Origin', origin);
    // }
    res.header('Access-Control-Allow-Origin', '*');

    // Define quais cabeçalhos HTTP podem ser usados durante a requisição real.
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Define quais métodos HTTP são permitidos.
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Navegadores enviam uma requisição OPTIONS "preflight" para verificar o CORS
    // antes de fazer a requisição GET/POST real, especialmente para requisições "não simples".
    // É importante responder a ela com sucesso (200 ou 204).
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Ou res.sendStatus(204)
    }

    next(); // Passa para o próximo middleware ou manipulador de rota.
});

// 2. Middleware para parsear o corpo de requisições JSON
// Essencial se você tiver rotas POST ou PUT que enviam dados JSON.
app.use(express.json());

// --- Rotas ---

// Rota principal para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Conectada está funcionando!');
});

// Rota para obter previsão do tempo
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params; // Pega o parâmetro :cidade da URL

    // Validação da API Key
    if (!apiKey || apiKey === "" || apiKey.length < 20) { // Verificação um pouco mais robusta
        console.error("[Servidor] ERRO: Chave da API OpenWeatherMap não configurada ou inválida no servidor.");
        return res.status(500).json({ error: 'Erro interno do servidor: Configuração da API de previsão do tempo está incompleta ou inválida.' });
    }

    // Validação do parâmetro cidade
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}. URL: ${weatherAPIUrl.replace(apiKey, "CHAVE_OCULTA")}`);
        const apiResponse = await axios.get(weatherAPIUrl);

        console.log('[Servidor] Sucesso: Dados recebidos da OpenWeatherMap para', cidade);
        // Envia a resposta da API OpenWeatherMap diretamente para o nosso frontend
        // Os cabeçalhos CORS já foram adicionados pelo middleware app.use() no topo.
        res.json(apiResponse.data);

    } catch (error) {
        console.error(`[Servidor] ERRO ao buscar previsão para ${cidade}:`, error.message);

        // Tratamento de erros da chamada Axios para OpenWeatherMap
        if (error.response) {
            // A requisição foi feita e o servidor da OpenWeatherMap respondeu com um status code fora do range 2xx
            console.error("[Servidor] Detalhes do erro da API OpenWeatherMap:", error.response.status, error.response.data);
            const statusCode = error.response.status;
            const errorMessage = error.response.data?.message || 'Erro ao buscar dados na API de previsão externa.';
            
            if (statusCode === 401) {
                 return res.status(401).json({ error: 'Chave da API de previsão inválida ou não autorizada.' });
            } else if (statusCode === 404) {
                 return res.status(404).json({ error: `Cidade '${cidade}' não encontrada na API de previsão.` });
            }
            return res.status(statusCode).json({ error: errorMessage });

        } else if (error.request) {
            // A requisição foi feita mas nenhuma resposta foi recebida (ex: problema de rede, API offline)
            console.error("[Servidor] Nenhuma resposta recebida da API OpenWeatherMap.");
            return res.status(503).json({ error: 'Serviço da API de previsão indisponível no momento (sem resposta).' });
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error("[Servidor] Erro ao configurar a requisição para OpenWeatherMap:", error.message);
            return res.status(500).json({ error: 'Erro interno no servidor ao tentar buscar previsão.' });
        }
    }
});

// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey || apiKey === "" || apiKey === "SUA_CHAVE_OPENWEATHERMAP_AQUI" || apiKey.length < 20) {
        console.warn("***********************************************************************************");
        console.warn("ATENÇÃO: A chave da API OpenWeatherMap (OPENWEATHER_API_KEY) não parece estar");
        console.warn("configurada corretamente no seu arquivo .env ou é inválida.");
        console.warn("A funcionalidade de previsão do tempo pode não funcionar como esperado.");
        console.warn("Verifique seu arquivo .env e a validade da sua chave.");
        console.warn("***********************************************************************************");
    } else {
        console.log("[Servidor] Chave da API OpenWeatherMap carregada.");
    }
});