// models/Veiculo.js
const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O dono do veículo é obrigatório']
    },
    placa: { 
        type: String, 
        required: [true, 'A placa é obrigatória.'],
        unique: true,
        uppercase: true,
        trim: true
    },
    // No seu HTML o campo é "veiculo-modelo", que geralmente representa o nome do carro
    // Vamos chamar de "modelo" aqui, mas no frontend você pega do campo certo.
    modelo: { type: String, required: [true, 'O modelo é obrigatório.'] },
    
    // Vamos adicionar um campo "marca" que é importante ter
    marca: { type: String, required: [true, 'A marca é obrigatória.'] },

    cor: { type: String, required: [true, 'A cor é obrigatória.'] },

    // Vamos adicionar o ano também, é um dado útil
    ano: { type: Number, required: [true, 'O ano é obrigatório.'] },

    // Campo para armazenar o caminho da imagem do veículo
    imageUrl: { type: String }

}, { 
    // Isso cria os campos `createdAt` e `updatedAt` automaticamente. Ajuda muito!
    timestamps: true 
});

// A partir da "planta", criamos o Modelo. É ele que vai interagir com o DB.
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

module.exports = Veiculo;