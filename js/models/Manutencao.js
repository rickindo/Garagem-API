const mongoose = require('mongoose');

const manutencaoSchema = new mongoose.Schema({
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória'],
        trim: true,
        minlength: [3, 'A descrição deve ter pelo menos 3 caracteres'],
        maxlength: [500, 'A descrição não pode ter mais de 500 caracteres']
    },
    data: {
        type: Date,
        required: [true, 'A data é obrigatória'],
        default: Date.now,
        validate: {
            validator: function(data) {
                return data <= new Date() && data >= new Date('2000-01-01');
            },
            message: 'Data inválida. Deve ser entre 01/01/2000 e a data atual'
        }
    },
    custo: {
        type: Number,
        required: [true, 'O custo é obrigatório'],
        min: [0, 'O custo não pode ser negativo'],
        max: [1000000, 'O custo parece ser muito alto. Verifique o valor.'],
        get: v => Math.round(v * 100) / 100 // Arredonda para 2 casas decimais
    },
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa'],
        max: [9999999, 'Quilometragem parece ser muito alta. Verifique o valor.']
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
