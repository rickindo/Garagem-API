// js/models/ManutencaoFrontend.js

export class Manutencao {
    /**
     * @param {string} data - Data da manutenção em formato ISO
     * @param {string} tipo - Tipo da manutenção
     * @param {number} custo - Custo da manutenção
     * @param {string} descricao - Descrição opcional da manutenção
     */
    constructor(data, tipo, custo, descricao = '') {
        this.data = data;
        this.tipo = tipo;
        this.custo = parseFloat(custo);
        this.descricao = descricao;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {boolean} true se os dados são válidos, false caso contrário.
     */
    validar() {
        if (!this.data || !this.tipo || this.custo === undefined || this.custo === null) {
            return false;
        }
        if (isNaN(this.custo) || this.custo < 0) {
            return false;
        }
        const dataManutencao = new Date(this.data);
        if (isNaN(dataManutencao.getTime())) {
            return false;
        }
        return true;
    }

    /**
     * Formata a manutenção para exibição.
     * @returns {string} String formatada com os dados da manutenção.
     */
    formatar() {
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataFormatada = new Date(this.data).toLocaleDateString('pt-BR');
        return `${dataFormatada}: ${this.tipo} - ${custoFormatado}${this.descricao ? ` (${this.descricao})` : ''}`;
    }
}