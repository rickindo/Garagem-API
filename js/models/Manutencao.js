const mongoose = require('mongoose');

const manutencaoSchema = new mongoose.Schema({
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória']
    },
    data: {
        type: Date,
        required: [true, 'A data é obrigatória'],
        default: Date.now
    },
    custo: {
        type: Number,
        required: [true, 'O custo é obrigatório'],
        min: [0, 'O custo não pode ser negativo']
    },
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa']
    },
    veiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veiculo',
        required: [true, 'O veículo é obrigatório']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Manutencao', manutencaoSchema);
