const { MongoClient, ServerApiVersion } = require('mongodb');

// IMPORTANTE: Substitua a string abaixo pela sua string de conexão!
// E NÃO ESQUEÇA de substituir <password> pela sua senha real!
const uri = "mongodb+srv://seu_usuario:SUA_SENHA_AQUI@meucluster.f1xyz.mongodb.net/?retryWrites=true&w=majority";

// Cria um novo cliente MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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