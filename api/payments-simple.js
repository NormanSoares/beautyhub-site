/**
 * API de Pagamentos Simplificada
 * Versão sem dependências complexas
 */

import express from 'express';
const router = express.Router();

// GET /api/payments-simple
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Payments API funcionando',
        data: {
            payments: [
                {
                    id: 'payment_001',
                    amount: 17.45,
                    currency: 'USD',
                    method: 'PayPal',
                    status: 'completed',
                    timestamp: new Date().toISOString()
                },
                {
                    id: 'payment_002', 
                    amount: 25.99,
                    currency: 'BRL',
                    method: 'PIX',
                    status: 'pending',
                    timestamp: new Date().toISOString()
                }
            ]
        },
        timestamp: new Date().toISOString()
    });
});

// POST /api/payments-simple
router.post('/', (req, res) => {
    const { amount, currency, method } = req.body;
    
    res.json({
        success: true,
        message: 'Pagamento processado com sucesso',
        data: {
            paymentId: 'payment_' + Date.now(),
            amount,
            currency,
            method,
            status: 'processing',
            timestamp: new Date().toISOString()
        }
    });
});

export default router;

