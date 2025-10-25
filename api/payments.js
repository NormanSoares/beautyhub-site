/**
 * API de Pagamentos - 67 Beauty Hub
 * Endpoints para PayPal, Stripe e PIX Real
 */

import express from 'express';
import paymentConfig from '../config/payment-config.js';
const router = express.Router();

// PayPal SDK
import paypal from '@paypal/checkout-server-sdk';
const paypalClient = new paypal.core.PayPalHttpClient(
    new paypal.core.LiveEnvironment(
        paymentConfig.paypal.clientId,
        paymentConfig.paypal.clientSecret
    )
);

// Stripe SDK
import Stripe from 'stripe';
const stripe = new Stripe(paymentConfig.stripe.secretKey);

// PIX APIs
import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';

/**
 * PayPal - Criar pedido
 */
router.post('/paypal/create-order', async (req, res) => {
    try {
        const { amount, orderId, description } = req.body;
        
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount.toString()
                },
                custom_id: orderId,
                description: description || `Pedido ${orderId} - 67 Beauty Hub`
            }],
            application_context: {
                brand_name: '67 Beauty Hub',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: paymentConfig.paypal.returnUrl,
                cancel_url: paymentConfig.paypal.cancelUrl
            }
        });

        const response = await paypalClient.execute(request);
        
        res.json({
            success: true,
            orderId: response.result.id,
            status: response.result.status
        });
    } catch (error) {
        console.error('❌ Erro PayPal create order:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PayPal - Capturar pagamento
 */
router.post('/paypal/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        
        const response = await paypalClient.execute(request);
        
        if (response.result.status === 'COMPLETED') {
            // Salvar no banco de dados
            await savePaymentRecord({
                method: 'paypal',
                orderId: response.result.purchase_units[0].custom_id,
                transactionId: response.result.id,
                amount: response.result.purchase_units[0].amount.value,
                status: 'completed',
                paypalData: response.result
            });
            
            res.json({
                success: true,
                status: 'completed',
                transactionId: response.result.id
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Pagamento não foi completado'
            });
        }
    } catch (error) {
        console.error('❌ Erro PayPal capture:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Stripe - Criar Payment Intent
 */
router.post('/stripe/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, orderId, customerEmail } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'usd',
            metadata: {
                orderId: orderId,
                customerEmail: customerEmail
            },
            automatic_payment_methods: {
                enabled: true
            }
        });
        
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('❌ Erro Stripe create payment intent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Stripe - Confirmar pagamento
 */
router.post('/stripe/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Salvar no banco de dados
            await savePaymentRecord({
                method: 'stripe',
                orderId: paymentIntent.metadata.orderId,
                transactionId: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Stripe usa centavos
                status: 'completed',
                stripeData: paymentIntent
            });
            
            res.json({
                success: true,
                status: 'completed',
                transactionId: paymentIntent.id
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Pagamento não foi completado'
            });
        }
    } catch (error) {
        console.error('❌ Erro Stripe confirm payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PIX - Gerar cobrança
 */
router.post('/pix/generate', async (req, res) => {
    try {
        const { amount, orderId, description, customerEmail } = req.body;
        
        // Converter USD para BRL se necessário
        let pixAmount = amount;
        if (req.body.currency === 'USD') {
            const usdToBrlRate = 5.2; // Taxa de conversão atual
            pixAmount = amount * usdToBrlRate;
        }
        
        // Gerar PIX usando API bancária real
        const pixData = await generateRealPIX({
            amount: pixAmount,
            orderId: orderId,
            description: description,
            customerEmail: customerEmail
        });
        
        res.json({
            success: true,
            pixData: pixData,
            orderId: orderId,
            amount: pixAmount,
            originalAmount: amount
        });
    } catch (error) {
        console.error('❌ Erro PIX generate:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PIX - Verificar pagamento
 */
router.get('/pix/check-payment/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        // Verificar pagamento usando API bancária real
        const paymentStatus = await checkRealPIXPayment(transactionId);
        
        res.json({
            paid: paymentStatus.paid,
            amount: paymentStatus.amount,
            paidAt: paymentStatus.paidAt,
            transactionId: transactionId
        });
    } catch (error) {
        console.error('❌ Erro PIX check payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Confirmar pagamento (todos os métodos)
 */
router.post('/confirm', async (req, res) => {
    try {
        const { method, orderId, transactionId, amount, status, ...methodData } = req.body;
        
        // Salvar registro de pagamento
        const paymentRecord = await savePaymentRecord({
            method: method,
            orderId: orderId,
            transactionId: transactionId,
            amount: amount,
            status: status,
            methodData: methodData,
            confirmedAt: new Date()
        });
        
        // Atualizar status do pedido
        await updateOrderStatus(orderId, 'paid');
        
        // Enviar notificação
        await sendPaymentNotification(orderId, method, amount);
        
        res.json({
            success: true,
            paymentId: paymentRecord.id,
            status: status
        });
    } catch (error) {
        console.error('❌ Erro confirm payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Gerar PIX real usando API bancária
 */
async function generateRealPIX(pixData) {
    try {
        // Banco do Brasil PIX
        if (paymentConfig.pix.bancoBrasil.clientId !== 'YOUR_BB_CLIENT_ID') {
            return await generateBBPIX(pixData);
        }
        
        // Itaú PIX
        if (paymentConfig.pix.itau.clientId !== 'YOUR_ITAU_CLIENT_ID') {
            return await generateItauPIX(pixData);
        }
        
        // Bradesco PIX
        if (paymentConfig.pix.bradesco.clientId !== 'YOUR_BRADESCO_CLIENT_ID') {
            return await generateBradescoPIX(pixData);
        }
        
        // Fallback para PIX simulado
        return await generateSimulatedPIX(pixData);
    } catch (error) {
        console.error('❌ Erro generate real PIX:', error);
        throw error;
    }
}

/**
 * Gerar PIX Banco do Brasil
 */
async function generateBBPIX(pixData) {
    try {
        // Autenticar com BB
        const token = await authenticateBB();
        
        // Criar cobrança PIX
        const response = await axios.post(
            `${paymentConfig.pix.bancoBrasil.baseUrl}/cob`,
            {
                calendario: {
                    expiracao: paymentConfig.pix.merchant.expirationMinutes * 60
                },
                valor: {
                    original: pixData.amount.toFixed(2)
                },
                chave: paymentConfig.pix.merchant.pixKey,
                solicitacaoPagador: pixData.description
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return {
            transactionId: response.data.txid,
            qrCode: response.data.pixCopiaECola,
            qrCodeImage: response.data.imagemQrcode,
            expiration: new Date(Date.now() + (paymentConfig.pix.merchant.expirationMinutes * 60 * 1000))
        };
    } catch (error) {
        console.error('❌ Erro BB PIX:', error);
        throw error;
    }
}

/**
 * Autenticar com Banco do Brasil
 */
async function authenticateBB() {
    try {
        const response = await axios.post(
            `${paymentConfig.pix.bancoBrasil.baseUrl}/oauth/token`,
            {
                grant_type: 'client_credentials',
                scope: 'pix.read pix.write'
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: paymentConfig.pix.bancoBrasil.clientId,
                    password: paymentConfig.pix.bancoBrasil.clientSecret
                }
            }
        );
        
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Erro autenticação BB:', error);
        throw error;
    }
}

/**
 * Verificar pagamento PIX real
 */
async function checkRealPIXPayment(transactionId) {
    try {
        // Implementar verificação real com APIs bancárias
        // Por enquanto, simulação
        return {
            paid: false,
            amount: 0,
            paidAt: null
        };
    } catch (error) {
        console.error('❌ Erro check real PIX:', error);
        return {
            paid: false,
            amount: 0,
            paidAt: null
        };
    }
}

/**
 * Gerar PIX simulado (fallback)
 */
async function generateSimulatedPIX(pixData) {
    const transactionId = crypto.randomUUID();
    
    return {
        transactionId: transactionId,
        qrCode: `00020126580014br.gov.bc.pix0114${paymentConfig.pix.merchant.pixKey}52040000530398654${pixData.amount.toFixed(2)}5802BR59${paymentConfig.pix.merchant.name.length.toString().padStart(2, '0')}${paymentConfig.pix.merchant.name}60${paymentConfig.pix.merchant.city.length.toString().padStart(2, '0')}${paymentConfig.pix.merchant.city}62070503***6304`,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`00020126580014br.gov.bc.pix0114${paymentConfig.pix.merchant.pixKey}52040000530398654${pixData.amount.toFixed(2)}5802BR59${paymentConfig.pix.merchant.name.length.toString().padStart(2, '0')}${paymentConfig.pix.merchant.name}60${paymentConfig.pix.merchant.city.length.toString().padStart(2, '0')}${paymentConfig.pix.merchant.city}62070503***6304`)}`,
        expiration: new Date(Date.now() + (paymentConfig.pix.merchant.expirationMinutes * 60 * 1000))
    };
}

/**
 * Salvar registro de pagamento
 */
async function savePaymentRecord(paymentData) {
    try {
        // Implementar salvamento no MongoDB
        const db = require('../config/mongodb-config');
        const collection = db.collection('payments');
        
        const result = await collection.insertOne({
            ...paymentData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        return { id: result.insertedId, ...paymentData };
    } catch (error) {
        console.error('❌ Erro save payment record:', error);
        throw error;
    }
}

/**
 * Atualizar status do pedido
 */
async function updateOrderStatus(orderId, status) {
    try {
        const db = require('../config/mongodb-config');
        const collection = db.collection('orders');
        
        await collection.updateOne(
            { id: orderId },
            { 
                $set: { 
                    status: status,
                    updatedAt: new Date()
                }
            }
        );
    } catch (error) {
        console.error('❌ Erro update order status:', error);
        throw error;
    }
}

/**
 * Enviar notificação de pagamento
 */
async function sendPaymentNotification(orderId, method, amount) {
    try {
        // Implementar envio de email/SMS
        console.log(`📧 Notificação: Pedido ${orderId} pago via ${method} - $${amount}`);
    } catch (error) {
        console.error('❌ Erro send payment notification:', error);
    }
}

export default router;
