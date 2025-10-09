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

// Cliente MongoDB (global para reutilização no Vercel)
let mongoClient = null;
let isConnecting = false;

/**
 * Conecta ao MongoDB com otimizações para Vercel
 */
async function connectToMongoDB() {
    // Se já está conectado, retorna o cliente
    if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
        return mongoClient;
    }
    
    // Se já está tentando conectar, aguarda
    if (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return connectToMongoDB();
    }
    
    isConnecting = true;
    
    try {
        // Fechar conexão anterior se existir
        if (mongoClient) {
            try {
                await mongoClient.close();
            } catch (err) {
                // Ignorar erros ao fechar
            }
        }
        
        // Configurações otimizadas para Vercel
        mongoClient = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 1, // Limitar pool para Vercel
            serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
            connectTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            maxIdleTimeMS: 30000, // Fechar conexões inativas após 30s
            retryWrites: true,
            retryReads: true
        });
        
        await mongoClient.connect();
        console.log('✅ Conectado ao MongoDB');
        return mongoClient;
    } catch (error) {
        console.error('❌ Erro ao conectar MongoDB:', error.message);
        mongoClient = null;
        throw error;
    } finally {
        isConnecting = false;
    }
}

/**
 * Obtém estatísticas da API com timeout
 */
async function getAPIStats() {
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Timeout de 10 segundos para operações
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao obter estatísticas')), 10000)
        );
        
        const statsPromise = Promise.all([
            db.collection('orders').countDocuments().catch(() => 0),
            db.collection('payments').countDocuments().catch(() => 0),
            db.collection('users').countDocuments().catch(() => 0),
            db.collection('products').countDocuments().catch(() => 0),
            db.collection('aliexpress_orders').countDocuments().catch(() => 0),
            db.collection('webhooks').countDocuments().catch(() => 0),
            db.collection('logs').countDocuments().catch(() => 0)
        ]);
        
        const [orders, payments, users, products, aliexpress_orders, webhooks, logs] = 
            await Promise.race([statsPromise, timeoutPromise]);
        
        return {
            orders,
            payments,
            users,
            products,
            aliexpress_orders,
            webhooks,
            logs,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error.message);
        return {
            error: 'Falha ao obter estatísticas',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Obtém informações de saúde da API com timeout
 */
async function getHealthStatus() {
    try {
        // Timeout de 5 segundos para health check
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout no health check')), 5000)
        );
        
        const healthPromise = (async () => {
            const client = await connectToMongoDB();
            await client.db().admin().ping();
            return {
                status: 'healthy',
                database: 'connected',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            };
        })();
        
        return await Promise.race([healthPromise, timeoutPromise]);
    } catch (error) {
        console.error('❌ Health check falhou:', error.message);
        return {
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
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
    
    try {
        switch (action) {
            case 'get_stats':
                return await getAPIStats();
                
            case 'get_health':
                return await getHealthStatus();
                
            case 'get_endpoints':
                return getAvailableEndpoints();
                
            case 'test_connection':
                // Timeout de 10 segundos para teste de conexão
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout no teste de conexão')), 10000)
                );
                
                const connectionPromise = (async () => {
                    const client = await connectToMongoDB();
                    const result = await client.db().admin().ping();
                    return {
                        success: true,
                        message: 'Conexão com MongoDB estabelecida',
                        result,
                        timestamp: new Date().toISOString()
                    };
                })();
                
                return await Promise.race([connectionPromise, timeoutPromise]);
                
            case 'get_collections':
                // Listar collections disponíveis
                const client = await connectToMongoDB();
                const db = client.db();
                const collections = await db.listCollections().toArray();
                return {
                    success: true,
                    collections: collections.map(c => c.name),
                    count: collections.length,
                    timestamp: new Date().toISOString()
                };
                
            default:
                return {
                    success: false,
                    error: 'Ação não reconhecida',
                    available_actions: [
                        'get_stats', 
                        'get_health', 
                        'get_endpoints', 
                        'test_connection',
                        'get_collections'
                    ],
                    timestamp: new Date().toISOString()
                };
        }
    } catch (error) {
        console.error(`❌ Erro ao processar ação '${action}':`, error.message);
        return {
            success: false,
            error: 'Erro interno ao processar requisição',
            message: error.message,
            action: action,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Handler principal do Vercel
 */
export default async function handler(req, res) {
    const startTime = Date.now();
    
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
        console.log(`🚀 ${req.method} /api/`, {
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            timestamp: new Date().toISOString()
        });
        
        // Timeout geral de 25 segundos (limite do Vercel)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 25000)
        );
        
        const requestPromise = (async () => {
            // Resposta para GET - Informações da API
            if (req.method === 'GET') {
                const [health, stats, endpoints] = await Promise.all([
                    getHealthStatus(),
                    getAPIStats(),
                    Promise.resolve(getAvailableEndpoints())
                ]);
                
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
                    },
                    performance: {
                        responseTime: Date.now() - startTime
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
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                
                const result = await processAPIRequest(req.body);
                
                return res.status(200).json({
                    success: true,
                    timestamp: new Date().toISOString(),
                    result,
                    performance: {
                        responseTime: Date.now() - startTime
                    }
                });
            }
            
            // Método não permitido
            return res.status(405).json({
                success: false,
                error: 'Método não permitido',
                allowed: ['GET', 'POST', 'OPTIONS'],
                timestamp: new Date().toISOString()
            });
        })();
        
        return await Promise.race([requestPromise, timeoutPromise]);
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Erro na API:', {
            error: error.message,
            stack: error.stack,
            responseTime,
            timestamp: new Date().toISOString()
        });
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString(),
            performance: {
                responseTime
            }
        });
    }
}

// Para desenvolvimento local
if (process.env.NODE_ENV === 'development') {
    const express = require('express');
    const app = express();
    
    // Middleware para parsing JSON
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Middleware de logging
    app.use((req, res, next) => {
        console.log(`📝 ${req.method} ${req.path}`, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });
        next();
    });
    
    // Rota principal da API
    app.all('/api/', async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            console.error('❌ Erro no handler:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                message: error.message
            });
        }
    });
    
    // Rota de health check simples
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    
    // Tratamento de erros global
    app.use((error, req, res, next) => {
        console.error('❌ Erro não tratado:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    });
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 API server running on port ${PORT}`);
        console.log(`📍 Access: http://localhost:${PORT}/api/`);
        console.log(`❤️  Health: http://localhost:${PORT}/health`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
