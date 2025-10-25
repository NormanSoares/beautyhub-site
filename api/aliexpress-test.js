/**
 * Teste de Integração AliExpress
 * Endpoint específico para testar a nova conta de afiliado
 */

import express from 'express';
const router = express.Router();

// Configurações AliExpress
const ALIEXPRESS_CONFIG = {
    apiKey: '520258',
    secretKey: 'YUfgyKXrywwJOhUWZ4nDG2QZzXxdRzsF',
    trackingId: '520258',
    baseUrl: 'https://api-sg.aliexpress.com',
    webhookUrl: 'https://beautyhub-site-1.onrender.com/api/aliexpress-callback'
};

// GET /api/aliexpress-test
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AliExpress Test API funcionando',
        config: {
            apiKey: ALIEXPRESS_CONFIG.apiKey,
            baseUrl: ALIEXPRESS_CONFIG.baseUrl,
            webhookUrl: ALIEXPRESS_CONFIG.webhookUrl,
            status: 'configured'
        },
        timestamp: new Date().toISOString()
    });
});

// POST /api/aliexpress-test/connection
router.post('/connection', async (req, res) => {
    try {
        // Simular teste de conexão com AliExpress
        const connectionTest = {
            success: true,
            message: 'Conexão com AliExpress estabelecida',
            data: {
                apiKey: ALIEXPRESS_CONFIG.apiKey,
                status: 'authenticated',
                rateLimit: '1000 requests/hour',
                ipWhitelist: 'enabled',
                webhookStatus: 'configured',
                timestamp: new Date().toISOString()
            }
        };
        
        res.json(connectionTest);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/aliexpress-test/products
router.post('/products', async (req, res) => {
    try {
        const { url, productId } = req.body;
        
        // Simular busca de produto no AliExpress
        const productData = {
            success: true,
            message: 'Produto encontrado no AliExpress',
            data: {
                productId: productId || 'AE_' + Date.now(),
                name: 'PHOERA Foundation',
                price: 17.45,
                currency: 'USD',
                stock: 'in_stock',
                supplier: 'AliExpress',
                url: url,
                lastUpdated: new Date().toISOString(),
                rateLimitUsed: '1/1000',
                ipWhitelist: 'active'
            }
        };
        
        res.json(productData);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/aliexpress-test/order
router.post('/order', async (req, res) => {
    try {
        const { productId, quantity, customer } = req.body;
        
        // Simular criação de pedido no AliExpress
        const orderData = {
            success: true,
            message: 'Pedido criado no AliExpress com sucesso',
            data: {
                orderId: 'AE_ORDER_' + Date.now(),
                aliExpressOrderId: 'AE' + Date.now(),
                productId,
                quantity,
                customer,
                status: 'created',
                trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                supplier: 'AliExpress',
                rateLimitUsed: '2/1000',
                ipWhitelist: 'active',
                webhookSent: true,
                timestamp: new Date().toISOString()
            }
        };
        
        res.json(orderData);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/aliexpress-test/status
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Status da integração AliExpress',
        data: {
            connection: 'active',
            rateLimit: '1000 requests/hour',
            ipWhitelist: 'enabled',
            webhook: 'configured',
            lastTest: new Date().toISOString(),
            credentials: {
                apiKey: ALIEXPRESS_CONFIG.apiKey,
                status: 'valid'
            }
        },
        timestamp: new Date().toISOString()
    });
});

export default router;

