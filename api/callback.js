/**
 * API Callback Endpoint - Compatível com Vercel e MongoDB
 * Recebe webhooks e callbacks de diferentes serviços
 * 
 * Endpoint: /api/callback
 * Métodos: POST, GET (para teste)
 */

import { MongoClient } from 'mongodb';

// Configurações
const MONGODB_URI = process.env.ROCKETDB_URI || process.env.ROCKETDB || process.env.NORMANDB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';

// Debug: Log da configuração MongoDB
console.log('=== DEBUG CALLBACK MONGODB ===');
console.log('ROCKETDB_URI configurada:', process.env.ROCKETDB_URI ? 'SIM' : 'NÃO');
console.log('ROCKETDB configurada:', process.env.ROCKETDB ? 'SIM' : 'NÃO');
console.log('NORMANDB_URI configurada:', process.env.NORMANDB_URI ? 'SIM' : 'NÃO');
console.log('MONGODB_URI configurada:', process.env.MONGODB_URI ? 'SIM' : 'NÃO');
console.log('MONGODB_URI final:', MONGODB_URI ? 'SIM' : 'NÃO');
console.log('==============================');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '67beautyhub_webhook_secret_2024';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

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
 * Valida origem da requisição
 */
function validateOrigin(origin) {
    if (ALLOWED_ORIGINS.includes('*')) {
        return true;
    }
    return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Valida assinatura do webhook
 */
function validateSignature(payload, signature, secret) {
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}

/**
 * Salva dados no MongoDB
 */
async function saveToMongoDB(collection, data) {
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        const result = await db.collection(collection).insertOne({
            ...data,
            timestamp: new Date(),
            createdAt: new Date()
        });
        
        console.log(`Dados salvos em ${collection}:`, result.insertedId);
        return result;
    } catch (error) {
        console.error('Erro ao salvar no MongoDB:', error);
        throw error;
    }
}

/**
 * Atualiza dados no MongoDB
 */
async function updateInMongoDB(collection, filter, update) {
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        const result = await db.collection(collection).updateOne(filter, {
            $set: {
                ...update,
                updatedAt: new Date()
            }
        });
        
        console.log(`Dados atualizados em ${collection}:`, result.modifiedCount);
        return result;
    } catch (error) {
        console.error('Erro ao atualizar no MongoDB:', error);
        throw error;
    }
}

/**
 * Processa diferentes tipos de callbacks
 */
async function processCallback(data) {
    const callbackType = data.type || data.event_type || 'unknown';
    const source = data.source || 'unknown';
    
    console.log(`Processando callback: ${callbackType} de ${source}`);
    
    switch (callbackType) {
        case 'order_created':
        case 'order_paid':
        case 'order_shipped':
        case 'order_delivered':
        case 'order_cancelled':
        case 'order_refunded':
            return await handleOrderEvent(data);
            
        case 'payment_webhook':
            return await handlePaymentWebhook(data);
            
        case 'aliexpress_webhook':
            return await handleAliExpressWebhook(data);
            
        case 'user_registration':
            return await handleUserRegistration(data);
            
        case 'product_update':
            return await handleProductUpdate(data);
            
        default:
            console.log(`Tipo de callback não reconhecido: ${callbackType}`);
            return { success: false, error: 'Callback type not supported' };
    }
}

/**
 * Processa eventos de pedidos
 */
async function handleOrderEvent(data) {
    const orderData = {
        orderId: data.order_id || data.orderId,
        status: data.event_type || data.status,
        customerEmail: data.customer?.email || data.customerEmail,
        totalAmount: data.total_amount || data.totalAmount,
        currency: data.currency || 'BRL',
        items: data.items || [],
        metadata: data
    };
    
    // Salvar no MongoDB
    await saveToMongoDB('orders', orderData);
    
    // Atualizar status se necessário
    if (data.event_type) {
        await updateInMongoDB('orders', 
            { orderId: orderData.orderId },
            { status: data.event_type }
        );
    }
    
    return { 
        success: true, 
        message: `Order ${data.event_type || 'updated'} successfully`,
        orderId: orderData.orderId
    };
}

/**
 * Processa webhooks de pagamento
 */
async function handlePaymentWebhook(data) {
    const paymentData = {
        paymentId: data.payment_id || data.paymentId,
        orderId: data.order_id || data.orderId,
        amount: data.amount,
        currency: data.currency || 'BRL',
        status: data.status,
        method: data.method,
        metadata: data
    };
    
    await saveToMongoDB('payments', paymentData);
    
    return { 
        success: true, 
        message: 'Payment webhook processed',
        paymentId: paymentData.paymentId
    };
}

/**
 * Processa webhooks do AliExpress
 */
async function handleAliExpressWebhook(data) {
    const aliexpressData = {
        orderId: data.order_id || data.orderId,
        productId: data.product_id || data.productId,
        status: data.status,
        trackingNumber: data.tracking_number || data.trackingNumber,
        shippingCompany: data.shipping_company || data.shippingCompany,
        metadata: data
    };
    
    await saveToMongoDB('aliexpress_orders', aliexpressData);
    
    return { 
        success: true, 
        message: 'AliExpress webhook processed',
        orderId: aliexpressData.orderId
    };
}

/**
 * Processa registro de usuário
 */
async function handleUserRegistration(data) {
    const userData = {
        userId: data.user_id || data.userId,
        email: data.email,
        name: data.name,
        registrationDate: new Date(),
        metadata: data
    };
    
    await saveToMongoDB('users', userData);
    
    return { 
        success: true, 
        message: 'User registration processed',
        userId: userData.userId
    };
}

/**
 * Processa atualização de produto
 */
async function handleProductUpdate(data) {
    const productData = {
        productId: data.product_id || data.productId,
        name: data.name,
        price: data.price,
        stock: data.stock,
        status: data.status,
        metadata: data
    };
    
    await saveToMongoDB('products', productData);
    
    return { 
        success: true, 
        message: 'Product update processed',
        productId: productData.productId
    };
}

/**
 * Handler principal do Vercel
 */
export default async function handler(req, res) {
    // Configurar CORS
    const origin = req.headers.origin || req.headers.referer;
    if (validateOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Signature, X-AliExpress-Signature, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Log da requisição
        console.log(`${req.method} /api/callback`, {
            origin,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });
        
        // Endpoint de teste
        if (req.method === 'GET' && req.query.test === '1') {
            const testData = {
                type: 'order_created',
                order_id: `TEST_${Date.now()}`,
                customer: {
                    email: 'test@example.com',
                    name: 'Cliente Teste'
                },
                total_amount: 99.99,
                currency: 'BRL',
                items: [{
                    product_id: 'PHOERA_FOUNDATION',
                    quantity: 1,
                    price: 99.99
                }]
            };
            
            const result = await processCallback(testData);
            
            return res.status(200).json({
                success: true,
                message: 'Test callback processed',
                testData,
                result
            });
        }
        
        // Validar método HTTP - Permitir POST, GET e OPTIONS
        const allowedMethods = ['POST', 'GET', 'OPTIONS'];
        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({ 
                error: 'Method not allowed',
                allowed: allowedMethods,
                received: req.method
            });
        }
        
        // Validar payload
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                error: 'Empty or invalid payload' 
            });
        }
        
        // Validar assinatura (opcional)
        const signature = req.headers['x-webhook-signature'] || req.headers['x-aliexpress-signature'];
        if (signature && WEBHOOK_SECRET) {
            const payload = JSON.stringify(req.body);
            if (!validateSignature(payload, signature, WEBHOOK_SECRET)) {
                console.log('Assinatura inválida');
                return res.status(401).json({ 
                    error: 'Invalid signature' 
                });
            }
        }
        
        // Processar callback
        const result = await processCallback(req.body);
        
        // Resposta de sucesso
        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            result
        });
        
    } catch (error) {
        console.error('Erro no callback:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
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
    
    app.all('/api/callback', async (req, res) => {
        await handler(req, res);
    });
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Callback server running on port ${PORT}`);
    });
}
