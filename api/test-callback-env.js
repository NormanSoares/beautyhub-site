/**
 * Teste de variáveis de ambiente para callback
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const envVars = {
            ROCKETDB_URI: process.env.ROCKETDB_URI ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
            ROCKETDB: process.env.ROCKETDB ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
            NORMANDB_URI: process.env.NORMANDB_URI ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
            MONGODB_URI: process.env.MONGODB_URI ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
            NODE_ENV: process.env.NODE_ENV || 'NÃO CONFIGURADA'
        };

        // Teste de conexão MongoDB
        let mongoTest = 'NÃO TESTADO';
        try {
            const { MongoClient } = require('mongodb');
            const MONGODB_URI = process.env.ROCKETDB_URI || process.env.ROCKETDB || process.env.NORMANDB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';
            
            if (MONGODB_URI && MONGODB_URI.startsWith('mongodb')) {
                mongoTest = 'URI VÁLIDA';
            } else {
                mongoTest = 'URI INVÁLIDA: ' + MONGODB_URI;
            }
        } catch (error) {
            mongoTest = 'ERRO: ' + error.message;
        }

        return res.status(200).json({
            success: true,
            message: 'Teste de variáveis de ambiente',
            environment_variables: envVars,
            mongodb_test: mongoTest,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
