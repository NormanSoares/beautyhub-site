/**
 * Teste de Conexão MongoDB para Vercel
 * Execute este script para testar a conexão
 */

const { MongoClient } = require('mongodb');

// Use a mesma configuração do projeto
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';

async function testMongoConnection() {
    console.log('🔍 Testando conexão MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Mascarar credenciais
    
    let client = null;
    
    try {
        // Testar conexão
        client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 segundos timeout
            connectTimeoutMS: 5000,
        });
        
        console.log('⏳ Conectando...');
        await client.connect();
        console.log('✅ Conectado com sucesso!');
        
        // Testar operação de escrita
        const db = client.db();
        const collection = db.collection('test_connection');
        
        console.log('⏳ Testando escrita...');
        const testDoc = {
            test: true,
            timestamp: new Date(),
            message: 'Teste de conexão MongoDB'
        };
        
        const result = await collection.insertOne(testDoc);
        console.log('✅ Escrita bem-sucedida! ID:', result.insertedId);
        
        // Limpar documento de teste
        await collection.deleteOne({ _id: result.insertedId });
        console.log('✅ Limpeza concluída!');
        
        return { success: true, message: 'Conexão e escrita funcionando!' };
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Nome do erro:', error.name);
        
        return { 
            success: false, 
            error: error.message,
            code: error.code,
            name: error.name
        };
        
    } finally {
        if (client) {
            try {
                await client.close();
                console.log('🔒 Conexão fechada');
            } catch (err) {
                console.error('Erro ao fechar conexão:', err.message);
            }
        }
    }
}

// Executar teste
if (require.main === module) {
    testMongoConnection()
        .then(result => {
            console.log('\n📊 Resultado final:', JSON.stringify(result, null, 2));
            process.exit(result.success ? 0 : 1);
        })
        .catch(err => {
            console.error('Erro fatal:', err);
            process.exit(1);
        });
}

module.exports = { testMongoConnection };
