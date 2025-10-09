/**
 * Health Check Endpoint
 * Verifica se o sistema está funcionando corretamente
 */

const { MongoClient } = require('mongodb');

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || process.env.ROCKETDB_URI || process.env.NORMANDB_URI || 'mongodb://localhost:27017/beautyhub';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            api: 'ok',
            mongodb: 'checking',
            environment: 'checking'
        },
        environment: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'not configured',
            ROCKETDB_URI: process.env.ROCKETDB_URI ? 'configured' : 'not configured',
            NORMANDB_URI: process.env.NORMANDB_URI ? 'configured' : 'not configured'
        }
    };

    try {
        // Teste de conexão MongoDB
        const client = new MongoClient(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        
        await client.connect();
        await client.db('beautyhub').admin().ping();
        await client.close();
        
        healthCheck.services.mongodb = 'ok';
        healthCheck.services.environment = 'ok';
        
        return res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.status = 'error';
        healthCheck.services.mongodb = 'error';
        healthCheck.error = {
            message: error.message,
            name: error.name
        };
        
        return res.status(500).json(healthCheck);
    }
}
