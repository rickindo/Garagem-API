// js/storage.js

const BACKEND_API_URL = 'https://garagem-api.onrender.com';

/**
 * Salva ou atualiza um veículo no banco de dados.
 * @param {Object} veiculo - O veículo para salvar/atualizar.
 */
async function salvarVeiculo(veiculo) {
    try {
        const method = veiculo._id ? 'PUT' : 'POST';
        const url = veiculo._id 
            ? `${BACKEND_API_URL}/api/veiculos/${veiculo._id}`
            : `${BACKEND_API_URL}/api/veiculos`;

        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(veiculo)
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar veículo: ${response.statusText}`);
        }

        const veiculoSalvo = await response.json();
        console.log('Veículo salvo com sucesso:', veiculoSalvo);
        return veiculoSalvo;
    } catch (e) {
        console.error("Erro ao salvar veículo:", e);
        throw e;
    }
}

/**
 * Carrega todos os veículos do banco de dados.
 * @returns {Array} Lista de veículos reconstruídos.
 */
async function carregarGaragem() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/veiculos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Erro ao carregar veículos: ${response.statusText}`);
        }
        
        const veiculos = await response.json();
        return veiculos.map(v => reconstruirVeiculo(v));
    } catch (e) {
        console.error("Erro ao carregar veículos:", e);
        return [];
    }
}


/**
 * Reconstrói um objeto Veiculo a partir de um objeto do banco de dados.
 * @param {object} obj - O objeto do banco de dados.
 * @returns {Veiculo|null} A instância reconstruída do Veiculo ou null se o tipo for desconhecido.
 */
function reconstruirVeiculo(obj) {
    if (!obj || !obj.tipo) {
        console.warn("Tentativa de reconstruir objeto sem tipo:", obj);
        return null;
    }

    let instancia = null;
    try {
        switch (obj.tipo) {
            case 'Carro':
                instancia = new Carro(obj.placa, obj.modelo, obj.cor, obj.numPortas);
                break;
            case 'CarroEsportivo':
                instancia = new CarroEsportivo(obj.placa, obj.modelo, obj.cor, obj.numPortas);
                if (obj.hasOwnProperty('turboAtivado')) {
                    instancia.turboAtivado = obj.turboAtivado;
                }
                break;
            case 'Caminhao':
                instancia = new Caminhao(obj.placa, obj.modelo, obj.cor, obj.numEixos, obj.capacidadeCarga);
                if (obj.hasOwnProperty('cargaAtual')) {
                    instancia.cargaAtual = obj.cargaAtual;
                }
                break;
            default:
                console.warn(`Tipo de veículo desconhecido: ${obj.tipo}`);
                return null;
        }

        // Copia outras propriedades do banco de dados
        if (obj._id) instancia._id = obj._id;
        if (obj.historicoManutencao) {
            instancia.historicoManutencao = obj.historicoManutencao.map(mObj => {
                if (mObj && mObj.data && mObj.descricaoServico && mObj.hasOwnProperty('custo')) {
                    const manutencao = {
                        data: new Date(mObj.data),
                        tipo: mObj.descricaoServico,
                        custo: mObj.custo,
                        descricao: mObj.descricao || ''
                    };
                    return manutencao;
                }
                return null;
            }).filter(m => m !== null);
        }
        if (obj.estado) instancia.estado = obj.estado;
        
        return instancia;
    } catch (e) {
        console.error("Erro ao reconstruir veículo:", e);
        return null;
    }
}

/**
 * Exclui um veículo do banco de dados.
 * @param {string} id - ID do veículo a ser excluído.
 */
async function excluirVeiculo(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/veiculos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir veículo: ${response.statusText}`);
        }

        console.log('Veículo excluído com sucesso');
        return true;
    } catch (e) {
        console.error("Erro ao excluir veículo:", e);
        throw e;
    }
}

/**
 * Salva toda a garagem no banco de dados.
 * @param {Array} veiculos - Array de veículos para salvar.
 */
async function salvarGaragem(veiculos) {
    try {
        // Itera sobre cada veículo e salva/atualiza no banco
        const promessas = veiculos.map(async veiculo => {
            await salvarVeiculo(veiculo);
        });

        await Promise.all(promessas);
        console.log('Garagem salva com sucesso');
        return true;
    } catch (e) {
        console.error('Erro ao salvar garagem:', e);
        throw e;
    }
}

/**
 * Salva ou atualiza uma manutenção no banco de dados.
 * @param {string} veiculoId - ID do veículo.
 * @param {Object} manutencao - A manutenção para salvar/atualizar.
 */
async function salvarManutencao(veiculoId, manutencao) {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/veiculos/${veiculoId}/manutencoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                descricaoServico: manutencao.tipo,
                data: manutencao.data,
                custo: manutencao.custo,
                descricao: manutencao.descricao || ''
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao salvar manutenção: ${response.statusText}`);
        }

        const manutencaoSalva = await response.json();
        console.log('Manutenção salva com sucesso:', manutencaoSalva);
        return manutencaoSalva;
    } catch (e) {
        console.error("Erro ao salvar manutenção:", e);
        throw e;
    }
}

export { 
    salvarVeiculo,
    salvarGaragem,
    carregarGaragem,
    excluirVeiculo,
    reconstruirVeiculo,
    salvarManutencao
};