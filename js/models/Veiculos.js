// models/Veiculo.js
import mongoose from 'mongoose';

// Esta é a "planta" do seu documento no banco de dados.
// Define os campos, tipos e regras (validações).
const veiculoSchema = new mongoose.Schema({
    placa: { 
        type: String, 
        required: [true, 'A placa é obrigatória.'],
        unique: true, // Garante que não teremos placas duplicadas
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
    ano: { type: Number, required: [true, 'O ano é obrigatório.'] }

}, { 
    // Isso cria os campos `createdAt` e `updatedAt` automaticamente. Ajuda muito!
    timestamps: true 
});

// A partir da "planta", criamos o Modelo. É ele que vai interagir com o DB.
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;