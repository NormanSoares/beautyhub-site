/**
 * Debug MongoDB - Endpoint de Diagnóstico
 * Endpoint: /api/debug-mongodb
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
    const debugInfo = {
        uriConfigured: !!MONGODB_URI,
        uriLength: MONGODB_URI ? MONGODB_URI.length : 0,
        connectionAttempt: false,
        connectionSuccess: false,
        writeAttempt: false,
        writeSuccess: false,
        error: null
    };
    
    try {
        console.log('🔍 Debug MongoDB - Iniciando...');
        console.log('URI configurada:', !!MONGODB_URI);
        
        // Testar conexão
        debugInfo.connectionAttempt = true;
        client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        await client.connect();
        debugInfo.connectionSuccess = true;
        console.log('✅ Conectado ao MongoDB');
        
        // Testar operação de escrita
        debugInfo.writeAttempt = true;
        const db = client.db();
        const collection = db.collection('debug_test');
        
        const testDoc = {
            test: true,
            timestamp: new Date(),
            message: 'Debug test MongoDB',
            environment: 'vercel'
        };
        
        const result = await collection.insertOne(testDoc);
        debugInfo.writeSuccess = true;
        console.log('✅ Escrita bem-sucedida! ID:', result.insertedId);
        
        // Limpar documento de teste
        await collection.deleteOne({ _id: result.insertedId });
        console.log('✅ Limpeza concluída!');
        
        return res.status(200).json({
            success: true,
            message: 'Debug MongoDB - Tudo funcionando!',
            debug: debugInfo,
            documentId: result.insertedId
        });
        
    } catch (error) {
        console.error('❌ Erro no debug MongoDB:', error);
        debugInfo.error = {
            message: error.message,
            code: error.code,
            name: error.name
        };
        
        return res.status(500).json({
            success: false,
            error: 'Debug MongoDB - Erro encontrado',
            debug: debugInfo
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
