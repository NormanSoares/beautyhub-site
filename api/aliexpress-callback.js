/**
 * AliExpress Callback Handler - Node.js Version
 * Recebe notificações de mudanças de status de pedidos do AliExpress
 * 
 * Endpoint: https://seudominio.com/api/aliexpress-callback
 * Método: POST
 */

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Configurações
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';
const WEBHOOK_SECRET = process.env.ALIEXPRESS_WEBHOOK_SECRET || '67beautyhub_webhook_secret_2024';

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
 * Escreve log em arquivo
 */
async function writeLog(message, data = null) {
    try {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
        const fullMessage = `${logMessage}${logData}\n`;
        
        // Criar diretório de logs se não existir
        const logDir = path.join(__dirname, 'logs');
        try {
            await fs.mkdir(logDir, { recursive: true });
        } catch (err) {
            // Diretório já existe
        }
        
        const logFile = path.join(logDir, 'aliexpress-callback.log');
        await fs.appendFile(logFile, fullMessage);
    } catch (error) {
        console.error('Erro ao escrever log:', error);
    }
}

/**
 * Valida assinatura do webhook
 */
function validateSignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
    );
}

/**
 * Valida IP da requisição (simplificado para Vercel)
 */
function validateIP(clientIP) {
    // IPs permitidos do AliExpress (exemplo)
    const allowedIPs = [
        '47.254.128.0/18',
        '47.254.192.0/19',
        '47.254.224.0/19',
        '47.254.240.0/20',
        '47.254.248.0/21',
        '47.254.252.0/22',
        '47.254.254.0/23',
        '47.254.255.0/24'
    ];
    
    // Para desenvolvimento, aceitar todos os IPs
    // Em produção, implementar validação de IP
    return true;
}

/**
 * Processa diferentes tipos de eventos do AliExpress
 */
async function processAliExpressEvent(eventData) {
    const eventType = eventData.event_type || 'unknown';
    const orderData = eventData.order || {};
    
    await writeLog(`Processando evento: ${eventType}`, eventData);
    
    switch (eventType) {
        case 'order_created':
            return await handleOrderCreated(orderData);
            
        case 'order_paid':
            return await handleOrderPaid(orderData);
            
        case 'order_shipped':
            return await handleOrderShipped(orderData);
            
        case 'order_delivered':
            return await handleOrderDelivered(orderData);
            
        case 'order_cancelled':
            return await handleOrderCancelled(orderData);
            
        case 'order_refunded':
            return await handleOrderRefunded(orderData);
            
        default:
            await writeLog(`Tipo de evento não reconhecido: ${eventType}`);
            return { success: false, error: 'Event type not supported' };
    }
}

/**
 * Processa criação de pedido
 */
async function handleOrderCreated(orderData) {
    const orderId = orderData.order_id || '';
    const customerEmail = orderData.customer?.email || '';
    
    await writeLog('Novo pedido criado', {
        order_id: orderId,
        customer_email: customerEmail
    });
    
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Salvar pedido no MongoDB
        await db.collection('orders').insertOne({
            order_id: orderId,
            customer_email: customerEmail,
            status: 'created',
            created_at: new Date(),
            data: orderData
        });
        
        return { success: true, message: 'Order created successfully' };
    } catch (error) {
        await writeLog('Erro ao salvar pedido', { error: error.message });
        return { success: false, error: 'Failed to save order' };
    }
}

/**
 * Processa pagamento confirmado
 */
async function handleOrderPaid(orderData) {
    const orderId = orderData.order_id || '';
    const amount = orderData.total_amount || 0;
    
    await writeLog('Pedido pago', {
        order_id: orderId,
        amount: amount
    });
    
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Atualizar status do pedido
        await db.collection('orders').updateOne(
            { order_id: orderId },
            { 
                $set: { 
                    status: 'paid',
                    paid_at: new Date(),
                    amount: amount
                }
            }
        );
        
        return { success: true, message: 'Payment confirmed' };
    } catch (error) {
        await writeLog('Erro ao atualizar pagamento', { error: error.message });
        return { success: false, error: 'Failed to update payment' };
    }
}

/**
 * Processa envio do pedido
 */
async function handleOrderShipped(orderData) {
    const orderId = orderData.order_id || '';
    const trackingNumber = orderData.tracking_number || '';
    const shippingCompany = orderData.shipping_company || '';
    
    await writeLog('Pedido enviado', {
        order_id: orderId,
        tracking_number: trackingNumber,
        shipping_company: shippingCompany
    });
    
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Atualizar status de envio
        await db.collection('orders').updateOne(
            { order_id: orderId },
            { 
                $set: { 
                    status: 'shipped',
                    shipped_at: new Date(),
                    tracking_number: trackingNumber,
                    shipping_company: shippingCompany
                }
            }
        );
        
        return { success: true, message: 'Order shipped' };
    } catch (error) {
        await writeLog('Erro ao atualizar envio', { error: error.message });
        return { success: false, error: 'Failed to update shipping' };
    }
}

/**
 * Processa entrega do pedido
 */
async function handleOrderDelivered(orderData) {
    const orderId = orderData.order_id || '';
    const deliveryDate = orderData.delivery_date || '';
    
    await writeLog('Pedido entregue', {
        order_id: orderId,
        delivery_date: deliveryDate
    });
    
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Atualizar status de entrega
        await db.collection('orders').updateOne(
            { order_id: orderId },
            { 
                $set: { 
                    status: 'delivered',
                    delivered_at: new Date(),
                    delivery_date: deliveryDate
                }
            }
        );
        
        return { success: true, message: 'Order delivered' };
    } catch (error) {
        await writeLog('Erro ao atualizar entrega', { error: error.message });
        return { success: false, error: 'Failed to update delivery' };
    }
}

/**
 * Processa cancelamento do pedido
 */
async function handleOrderCancelled(orderData) {
    const orderId = orderData.order_id || '';
    const reason = orderData.cancellation_reason || '';
    
    await writeLog('Pedido cancelado', {
        order_id: orderId,
        reason: reason
    });
    
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Atualizar status de cancelamento
        await db.collection('orders').updateOne(
            { order_id: orderId },
            { 
                $set: { 
                    status: 'cancelled',
                    cancelled_at: new Date(),
                    cancellation_reason: reason
                }
            }
        );
        
        return { success: true, message: 'Order cancelled' };
    } catch (error) {
        await writeLog('Erro ao cancelar pedido', { error: error.message });
        return { success: false, error: 'Failed to cancel order' };
    }
}

/**
 * Processa reembolso do pedido
 */
async function handleOrderRefunded(orderData) {
    const orderId = orderData.order_id || '';
    const refundAmount = orderData.refund_amount || 0;
    
    await writeLog('Pedido reembolsado', {
        order_id: orderId,
        refund_amount: refundAmount
    });
    
    try {
        const client = await connectToMongoDB();
        const db = client.db();
        
        // Atualizar status de reembolso
        await db.collection('orders').updateOne(
            { order_id: orderId },
            { 
                $set: { 
                    status: 'refunded',
                    refunded_at: new Date(),
                    refund_amount: refundAmount
                }
            }
        );
        
        return { success: true, message: 'Order refunded' };
    } catch (error) {
        await writeLog('Erro ao processar reembolso', { error: error.message });
        return { success: false, error: 'Failed to process refund' };
    }
}

/**
 * Salva dados do pedido para integração com frontend
 */
async function saveOrderToFrontend(orderData) {
    try {
        const dataDir = path.join(__dirname, 'data');
        await fs.mkdir(dataDir, { recursive: true });
        
        const orderFile = path.join(dataDir, 'orders.json');
        let orders = {};
        
        try {
            const existingData = await fs.readFile(orderFile, 'utf8');
            orders = JSON.parse(existingData);
        } catch (err) {
            // Arquivo não existe, criar novo
        }
        
        const orderId = orderData.order_id || `order_${Date.now()}`;
        orders[orderId] = {
            order_id: orderId,
            timestamp: new Date().toISOString(),
            data: orderData,
            status: orderData.event_type || 'unknown'
        };
        
        await fs.writeFile(orderFile, JSON.stringify(orders, null, 2));
    } catch (error) {
        await writeLog('Erro ao salvar dados para frontend', { error: error.message });
    }
}

/**
 * Handler principal do Vercel
 */
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-AliExpress-Signature');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Log da requisição
        await writeLog(`${req.method} /api/aliexpress-callback`, {
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            timestamp: new Date().toISOString()
        });
        
        // Verificar método HTTP
        if (req.method !== 'POST' && req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        // Endpoint de teste
        if (req.method === 'GET' && req.query.test === '1') {
            const testData = {
                event_type: 'order_created',
                order: {
                    order_id: `TEST_${Date.now()}`,
                    customer: {
                        email: 'test@example.com',
                        name: 'Cliente Teste'
                    },
                    total_amount: 99.99,
                    currency: 'BRL',
                    items: [
                        {
                            product_id: 'PHOERA_FOUNDATION',
                            quantity: 1,
                            price: 99.99
                        }
                    ]
                }
            };
            
            const result = await processAliExpressEvent(testData);
            
            return res.status(200).json({
                success: true,
                message: 'Test completed',
                test_data: testData,
                result: result,
                timestamp: new Date().toISOString()
            });
        }
        
        // Processar webhook POST
        if (req.method === 'POST') {
            const rawPayload = JSON.stringify(req.body);
            const payload = req.body;
            
            if (!payload || Object.keys(payload).length === 0) {
                await writeLog('Payload inválido', { raw: rawPayload });
                return res.status(400).json({ error: 'Invalid JSON payload' });
            }
            
            // Validar assinatura (opcional)
            const signature = req.headers['x-aliexpress-signature'] || '';
            if (signature && !validateSignature(rawPayload, signature, WEBHOOK_SECRET)) {
                await writeLog('Assinatura inválida');
                return res.status(401).json({ error: 'Invalid signature' });
            }
            
            // Processar evento
            const result = await processAliExpressEvent(payload);
            
            // Salvar dados para integração com frontend
            await saveOrderToFrontend(payload);
            
            // Log do resultado
            await writeLog('Evento processado', result);
            
            // Resposta de sucesso
            return res.status(200).json({
                success: true,
                timestamp: new Date().toISOString(),
                result: result
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        await writeLog('Erro no callback', { error: error.message });
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Para desenvolvimento local
if (process.env.NODE_ENV === 'development') {
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    
    app.all('/api/aliexpress-callback', async (req, res) => {
        await handler(req, res);
    });
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`AliExpress Callback server running on port ${PORT}`);
        console.log(`Test: http://localhost:${PORT}/api/aliexpress-callback?test=1`);
    });
}
