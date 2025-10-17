const mongoose = require('mongoose');

// String de conexão do MongoDB
const uri = "mongodb+srv://luizclaudiolc:luizinho123@clusterpw.i6b5pea.mongodb.net/garagem";

// Conecta ao MongoDB usando Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// Exporta a conexão do mongoose
module.exports = mongoose;

async function run() {
  try {
    // Conecta o cliente ao servidor (opcional a partir da v4.7)
    await client.connect();

    // Envia um ping para confirmar a conexão bem-sucedida
    await client.db("admin").command({ ping: 1 });
    console.log("Ping! Você se conectou com sucesso ao MongoDB Atlas!");

    // Aqui você pode colocar o resto do seu código, como fazer queries...
    // Exemplo: Listar os bancos de dados
    const databasesList = await client.db().admin().listDatabases();
    console.log("Bancos de dados:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

  } finally {
    // Garante que o cliente será fechado quando você terminar/errar
    await client.close();
  }
}

run().catch(console.dir);