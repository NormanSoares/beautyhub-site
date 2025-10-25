/**
 * Sistema de Webhooks para Atualizações de Preços
 * Notifica mudanças de preços em tempo real
 */

// Lista de webhooks registrados
const registeredWebhooks = new Map();

/**
 * Registra um webhook para notificações de preços
 */
function registerWebhook(webhookId, callback) {
    registeredWebhooks.set(webhookId, {
        callback: callback,
        registeredAt: new Date(),
        active: true
    });
    
    console.log(`🔗 Webhook registrado: ${webhookId}`);
}

/**
 * Remove um webhook
 */
function unregisterWebhook(webhookId) {
    const removed = registeredWebhooks.delete(webhookId);
    console.log(`🗑️ Webhook removido: ${webhookId}`, removed);
    return removed;
}

/**
 * Notifica todos os webhooks sobre mudança de preços
 */
function notifyPriceChange(productId, oldPrice, newPrice, currency = 'USD') {
    const notification = {
        type: 'price_change',
        productId: productId,
        oldPrice: oldPrice,
        newPrice: newPrice,
        currency: currency,
        timestamp: new Date().toISOString()
    };
    
    console.log(`📢 Notificando webhooks sobre mudança de preço: ${productId}`);
    
    registeredWebhooks.forEach((webhook, webhookId) => {
        if (webhook.active) {
            try {
                webhook.callback(notification);
                console.log(`✅ Webhook ${webhookId} notificado com sucesso`);
            } catch (error) {
                console.error(`❌ Erro ao notificar webhook ${webhookId}:`, error);
            }
        }
    });
}

/**
 * Notifica sobre sincronização de preços
 */
function notifyPriceSync(syncData) {
    const notification = {
        type: 'price_sync',
        data: syncData,
        timestamp: new Date().toISOString()
    };
    
    registeredWebhooks.forEach((webhook, webhookId) => {
        if (webhook.active) {
            try {
                webhook.callback(notification);
            } catch (error) {
                console.error(`❌ Erro ao notificar webhook ${webhookId}:`, error);
            }
        }
    });
}

/**
 * API Handler para webhooks
 */
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        if (req.method === 'POST') {
            const { action, webhookId, productId, oldPrice, newPrice, currency } = req.body;
            
            switch (action) {
                case 'register':
                    if (!webhookId) {
                        res.status(400).json({
                            success: false,
                            error: 'webhookId é obrigatório'
                        });
                        return;
                    }
                    
                    registerWebhook(webhookId, () => {
                        console.log(`Webhook ${webhookId} ativado`);
                    });
                    
                    res.status(200).json({
                        success: true,
                        message: 'Webhook registrado com sucesso',
                        webhookId: webhookId
                    });
                    break;
                    
                case 'unregister':
                    if (!webhookId) {
                        res.status(400).json({
                            success: false,
                            error: 'webhookId é obrigatório'
                        });
                        return;
                    }
                    
                    const removed = unregisterWebhook(webhookId);
                    
                    res.status(200).json({
                        success: true,
                        message: removed ? 'Webhook removido com sucesso' : 'Webhook não encontrado',
                        webhookId: webhookId
                    });
                    break;
                    
                case 'notify':
                    if (!productId || !newPrice) {
                        res.status(400).json({
                            success: false,
                            error: 'productId e newPrice são obrigatórios'
                        });
                        return;
                    }
                    
                    notifyPriceChange(productId, oldPrice, newPrice, currency);
                    
                    res.status(200).json({
                        success: true,
                        message: 'Notificação enviada com sucesso'
                    });
                    break;
                    
                default:
                    res.status(400).json({
                        success: false,
                        error: 'Ação não reconhecida'
                    });
            }
        }
        
        else if (req.method === 'GET') {
            const { webhookId } = req.query;
            
            if (webhookId) {
                const webhook = registeredWebhooks.get(webhookId);
                
                if (webhook) {
                    res.status(200).json({
                        success: true,
                        data: {
                            webhookId: webhookId,
                            active: webhook.active,
                            registeredAt: webhook.registeredAt
                        }
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        error: 'Webhook não encontrado'
                    });
                }
            } else {
                // Listar todos os webhooks
                const webhooks = Array.from(registeredWebhooks.entries()).map(([id, webhook]) => ({
                    webhookId: id,
                    active: webhook.active,
                    registeredAt: webhook.registeredAt
                }));
                
                res.status(200).json({
                    success: true,
                    data: webhooks,
                    total: webhooks.length
                });
            }
        }
        
        else {
            res.status(405).json({
                success: false,
                error: 'Método não permitido'
            });
        }
        
    } catch (error) {
        console.error('Erro no sistema de webhooks:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
}

// Exportar funções para uso interno
export { registerWebhook, unregisterWebhook, notifyPriceChange, notifyPriceSync };

