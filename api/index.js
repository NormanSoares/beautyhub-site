/**
 * API Index - Ponto de entrada principal da API
 * Compatível com Vercel e MongoDB
 * 
 * Endpoint: /api/
 * Métodos: GET, POST, OPTIONS
 */

const { MongoClient } = require('mongodb');

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';
const API_VERSION = '1.0.0';
const API_NAME = '67 Beauty Hub API';

// Cliente MongoDB
let mongoClient = null;

/**
 * Conecta ao MongoDB
 */
async function connectToMongoDB() {
    if (mongoClient) {
        return mongoClient;
    }
    
    try {
        mongoClient = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        await mongoClient.connect();
        console.log('Conectado ao MongoDB');
        return mongoClient;
    } catch (error) {
        console.error('Erro ao conectar MongoDB:', error);
        throw error;
    }
}

/**
 * Obtém estatísticas da API
 */
async function getAPIStats() {
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        const stats = {
            orders: await db.collection('orders').countDocuments(),
            payments: await db.collection('payments').countDocuments(),
            users: await db.collection('users').countDocuments(),
            products: await db.collection('products').countDocuments(),
            aliexpress_orders: await db.collection('aliexpress_orders').countDocuments(),
            webhooks: await db.collection('webhooks').countDocuments(),
            logs: await db.collection('logs').countDocuments()
        };
        
        return stats;
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return null;
    }
}

/**
 * Obtém informações de saúde da API
 */
async function getHealthStatus() {
    try {
        const client = await connectToMongoDB();
        await client.db().admin().ping();
        
        return {
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Lista endpoints disponíveis
 */
function getAvailableEndpoints() {
    return {
        endpoints: [
            {
                path: '/api/',
                methods: ['GET', 'POST', 'OPTIONS'],
                description: 'API principal - informações e estatísticas'
            },
            {
                path: '/api/callback',
                methods: ['POST', 'GET'],
                description: 'Webhook callback - recebe notificações de serviços externos'
            },
            {
                path: '/api/orders',
                methods: ['GET', 'POST'],
                description: 'Gerenciamento de pedidos'
            },
            {
                path: '/api/products',
                methods: ['GET', 'POST', 'PUT'],
                description: 'Gerenciamento de produtos'
            },
            {
                path: '/api/users',
                methods: ['GET', 'POST'],
                description: 'Gerenciamento de usuários'
            },
            {
                path: '/api/health',
                methods: ['GET'],
                description: 'Status de saúde da API'
            }
        ]
    };
}

/**
 * Processa requisições POST para operações da API
 */
async function processAPIRequest(body) {
    const { action, data } = body;
    
    switch (action) {
        case 'get_stats':
            return await getAPIStats();
            
        case 'get_health':
            return await getHealthStatus();
            
        case 'get_endpoints':
            return getAvailableEndpoints();
            
        case 'test_connection':
            try {
                const client = await connectToMongoDB();
                const result = await client.db().admin().ping();
                return {
                    success: true,
                    message: 'Conexão com MongoDB estabelecida',
                    result
                };
            } catch (error) {
                return {
                    success: false,
                    message: 'Erro na conexão com MongoDB',
                    error: error.message
                };
            }
            
        default:
            return {
                success: false,
                error: 'Ação não reconhecida',
                available_actions: ['get_stats', 'get_health', 'get_endpoints', 'test_connection']
            };
    }
}

/**
 * Handler principal do Vercel
 */
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Log da requisição
        console.log(`${req.method} /api/`, {
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });
        
        // Resposta para GET - Informações da API
        if (req.method === 'GET') {
            const health = await getHealthStatus();
            const stats = await getAPIStats();
            const endpoints = getAvailableEndpoints();
            
            return res.status(200).json({
                api: {
                    name: API_NAME,
                    version: API_VERSION,
                    status: 'active',
                    timestamp: new Date().toISOString()
                },
                health,
                stats,
                endpoints: endpoints.endpoints,
                documentation: {
                    github: 'https://github.com/SEU-USUARIO/67-beauty-hub',
                    docs: '/docs/api-callback-guide.md'
                }
            });
        }
        
        // Resposta para POST - Operações da API
        if (req.method === 'POST') {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Body vazio ou inválido',
                    example: {
                        action: 'get_stats',
                        data: {}
                    }
                });
            }
            
            const result = await processAPIRequest(req.body);
            
            return res.status(200).json({
                success: true,
                timestamp: new Date().toISOString(),
                result
            });
        }
        
        // Método não permitido
        return res.status(405).json({
            success: false,
            error: 'Método não permitido',
            allowed: ['GET', 'POST', 'OPTIONS']
        });
        
    } catch (error) {
        console.error('Erro na API:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Para desenvolvimento local
if (process.env.NODE_ENV === 'development') {
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    
    app.all('/api/', async (req, res) => {
        await handler(req, res);
    });
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
        console.log(`Access: http://localhost:${PORT}/api/`);
    });
}
