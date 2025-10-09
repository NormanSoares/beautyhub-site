/**
 * Teste de Conexão MongoDB - Endpoint de Teste
 * Endpoint: /api/test-mongodb
 */

const { MongoClient } = require('mongodb');

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    let client = null;
    
    try {
        console.log('🔍 Testando conexão MongoDB...');
        console.log('URI configurada:', MONGODB_URI ? 'SIM' : 'NÃO');
        
        // Testar conexão
        client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        await client.connect();
        console.log('✅ Conectado ao MongoDB');
        
        // Testar operação de escrita
        const db = client.db();
        const collection = db.collection('test_connection');
        
        const testDoc = {
            test: true,
            timestamp: new Date(),
            message: 'Teste de conexão MongoDB via API',
            environment: 'vercel'
        };
        
        const result = await collection.insertOne(testDoc);
        console.log('✅ Escrita bem-sucedida! ID:', result.insertedId);
        
        // Limpar documento de teste
        await collection.deleteOne({ _id: result.insertedId });
        console.log('✅ Limpeza concluída!');
        
        return res.status(200).json({
            success: true,
            message: 'Conexão MongoDB funcionando!',
            details: {
                connected: true,
                writeTest: true,
                cleanup: true,
                documentId: result.insertedId
            }
        });
        
    } catch (error) {
        console.error('❌ Erro na conexão MongoDB:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Falha na conexão MongoDB',
            details: {
                message: error.message,
                code: error.code,
                name: error.name,
                uriConfigured: !!MONGODB_URI
            }
        });
        
    } finally {
        if (client) {
            try {
                await client.close();
                console.log('🔒 Conexão MongoDB fechada');
            } catch (err) {
                console.error('Erro ao fechar conexão:', err.message);
            }
        }
    }
}
