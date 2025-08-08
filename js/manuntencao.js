// js/manutencao.js

/**
 * Representa um registro de manutenção de um veículo.
 */
class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string|Date} data - A data da manutenção (pode ser string 'YYYY-MM-DD' ou objeto Date).
     * @param {string} tipo - O tipo de serviço realizado (ex: "Troca de óleo").
     * @param {number} custo - O custo do serviço.
     * @param {string} [descricao=''] - Uma descrição opcional do serviço.
     */
    constructor(data, tipo, custo, descricao = '') {
        if (data instanceof Date) {
            this.data = data;
        } else {
            try {
                const dataObj = new Date(data + 'T00:00:00Z'); // Força UTC para consistência
                if (isNaN(dataObj.getTime())) {
                   throw new Error('Data string inválida fornecida.');
                }
                this.data = dataObj;
            } catch (e) {
                console.error("Erro ao converter string de data para Date:", data, e);
                this.data = new Date();
            }
        }

        this.tipo = tipo ? tipo.trim() : 'Serviço não especificado';
        this.custo = parseFloat(custo);
        if (isNaN(this.custo)) {
            this.custo = 0;
        }
        this.descricao = descricao ? descricao.trim() : '';

        if (this.custo < 0) {
             this.custo = 0;
        }
         if (!this.tipo) {
             this.tipo = 'Serviço não especificado';
         }
    }

    /**
     * Retorna uma representação formatada da manutenção.
     * @returns {string} A string formatada.
     */
    formatar() {
        const dataFormatada = this.data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC' // Exibe a data como se fosse UTC, para evitar shifts de dia
        });
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let resultado = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            resultado += ` (${this.descricao})`;
        }
        return resultado;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {boolean} True se os dados são válidos, False caso contrário.
     */
    validar() {
        const isDataValida = this.data instanceof Date && !isNaN(this.data.getTime());
        const isTipoValido = typeof this.tipo === 'string' && this.tipo.length > 0;
        const isCustoValido = typeof this.custo === 'number' && this.custo >= 0;
        return isDataValida && isTipoValido && isCustoValido;
    }
}

/**
 * Exibe a lista de veículos na interface.
 * @param {Array} veiculos - A lista de veículos a serem exibidos.
 */
function exibirVeiculos(veiculos) {
    const lista = document.getElementById('lista-veiculos');
    lista.innerHTML = '';
    veiculos.forEach(veiculo => {
        const item = document.createElement('div');
        item.className = 'veiculo-item';
        item.innerHTML = `
            <strong>${veiculo.modelo}</strong> (${veiculo.placa}) - ${veiculo.cor}
            <button class="btn-editar" data-id="${veiculo._id}">Editar</button>
            <button class="btn-excluir" data-id="${veiculo._id}">Excluir</button>
        `;
        lista.appendChild(item);
    });

    // Eventos dos botões
    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.onclick = async function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este veículo?')) {
                await fetch(`/api/veiculos/${id}`, { method: 'DELETE' });
                carregarVeiculos(); // Atualiza a lista
            }
        };
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.onclick = function() {
            const id = this.getAttribute('data-id');
            abrirFormularioEdicao(id);
        };
    });
}