/**
 * API de Pedidos - 67 Beauty Hub
 * Sistema de processamento de pedidos dos clientes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache de pedidos
let ordersCache = [];
let lastUpdate = null;

/**
 * Salvar pedidos em arquivo
 */
function saveOrdersToFile(orders) {
    try {
        const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');
        
        // Criar diretório se não existir
        const dataDir = path.dirname(ordersFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
        console.log(`📦 ${orders.length} pedidos salvos em ${ordersFile}`);
    } catch (error) {
        console.error('Erro ao salvar pedidos:', error);
    }
}

/**
 * Carregar pedidos do arquivo
 */
function loadOrdersFromFile() {
    try {
        const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');
        
        if (fs.existsSync(ordersFile)) {
            const content = fs.readFileSync(ordersFile, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
    
    return [];
}

/**
 * Obter pedidos (com cache)
 */
function getOrders() {
    const now = new Date();
    
    // Cache válido por 2 minutos
    if (!ordersCache.length || !lastUpdate || (now - lastUpdate) > 2 * 60 * 1000) {
        ordersCache = loadOrdersFromFile();
        lastUpdate = now;
        console.log(`📦 Pedidos carregados: ${ordersCache.length} itens`);
    }
    
    // Garantir que sempre retorna um array
    return Array.isArray(ordersCache) ? ordersCache : [];
}

/**
 * Criar novo pedido
 */
function createOrder(orderData) {
    const orders = getOrders();
    
    const newOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer: {
            name: orderData.customer_name || 'Cliente',
            email: orderData.customer_email || '',
            phone: orderData.customer_phone || ''
        },
        products: orderData.products || [],
        total: orderData.total || 0,
        status: orderData.status || 'pending', // pending, processing, shipped, delivered, cancelled
        payment_status: orderData.payment_status || 'pending', // pending, processing, confirmed, failed, refunded
        shipping_address: orderData.shipping_address || {},
        notes: orderData.notes || '',
        payment_method: orderData.payment_method || 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tracking: {
            number: '',
            carrier: '',
            status: 'pending'
        }
    };
    
    orders.push(newOrder);
    ordersCache = orders;
    saveOrdersToFile(orders);
    
    console.log(`✅ Novo pedido criado: ${newOrder.id}`);
    console.log('📊 Dados do pedido:', {
        customer: newOrder.customer,
        products: newOrder.products.length,
        total: newOrder.total,
        status: newOrder.status,
        payment_status: newOrder.payment_status
    });
    
    return newOrder;
}

/**
 * Atualizar status do pedido
 */
function updateOrderStatus(orderId, status, notes = '') {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
        throw new Error('Pedido não encontrado');
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    if (notes) {
        orders[orderIndex].notes = notes;
    }
    
    ordersCache = orders;
    saveOrdersToFile(orders);
    
    console.log(`📝 Pedido ${orderId} atualizado para status: ${status}`);
    return orders[orderIndex];
}


/**
 * API de Pedidos
 */
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const action = req.query.action || 'list';
        const orderId = req.query.order_id;
        
        // Handle PUT requests for updating orders
        if (req.method === 'PUT') {
            return handlePut(req, res);
        }
        
        switch (req.method) {
            case 'GET':
                return await handleGet(req, res, action, orderId);
            case 'POST':
                return await handlePost(req, res, action);
            case 'PUT':
                return await handlePut(req, res, orderId);
            default:
                return res.status(405).json({
                    success: false,
                    error: 'Método não permitido'
                });
        }
        
    } catch (error) {
        console.error('Erro na API de pedidos:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Handle GET requests
 */
async function handleGet(req, res, action, orderId) {
    switch (action) {
        case 'list':
            const ordersList = getOrders();
            const limit = parseInt(req.query.limit) || 1000; // Aumentar limite para mostrar todos os pedidos
            const status = req.query.status;
            
            let filteredOrders = ordersList;
            
            if (status) {
                filteredOrders = ordersList.filter(order => order.status === status);
            }
            
            filteredOrders = filteredOrders.slice(0, limit);
            
            return res.status(200).json({
                success: true,
                data: filteredOrders,
                count: filteredOrders.length,
                total: ordersList.length,
                filters: {
                    status: status || 'all',
                    limit: limit
                },
                timestamp: new Date().toISOString()
            });
            
        case 'stats':
            const ordersStats = getOrders();
            const stats = {
                total: ordersStats.length,
                pending: ordersStats.filter(o => o.status === 'pending').length,
                processing: ordersStats.filter(o => o.status === 'processing').length,
                shipped: ordersStats.filter(o => o.status === 'shipped').length,
                delivered: ordersStats.filter(o => o.status === 'delivered').length,
                cancelled: ordersStats.filter(o => o.status === 'cancelled').length,
                total_value: ordersStats.reduce((sum, order) => sum + (order.total || 0), 0)
            };
            
            return res.status(200).json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
            
        case 'get':
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID do pedido é obrigatório'
                });
            }
            
            const ordersGet = getOrders();
            const order = ordersGet.find(o => o.id === orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Pedido não encontrado'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: order,
                timestamp: new Date().toISOString()
            });
            
        default:
            return res.status(400).json({
                success: false,
                error: 'Ação não reconhecida',
                available_actions: ['list', 'stats', 'get']
            });
    }
}

/**
 * Handle PUT requests
 */
async function handlePut(req, res) {
    const orderId = req.params.orderId || req.query.order_id;
    
    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'ID do pedido é obrigatório'
        });
    }
    
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Pedido não encontrado'
        });
    }
    
    // Atualizar pedido com dados do body
    const updatedOrder = { ...orders[orderIndex], ...req.body };
    updatedOrder.updated_at = new Date().toISOString();
    
    orders[orderIndex] = updatedOrder;
    ordersCache = orders;
    saveOrdersToFile(orders);
    
    console.log(`✅ Pedido ${orderId} atualizado com sucesso`);
    
    return res.status(200).json({
        success: true,
        data: updatedOrder,
        message: 'Pedido atualizado com sucesso',
        timestamp: new Date().toISOString()
    });
}

/**
 * Handle POST requests
 */
async function handlePost(req, res, action) {
    switch (action) {
        case 'create':
            const orderData = req.body;
            
            if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Lista de produtos é obrigatória'
                });
            }
            
            const newOrder = createOrder(orderData);
            
            return res.status(201).json({
                success: true,
                data: newOrder,
                message: 'Pedido criado com sucesso',
                timestamp: new Date().toISOString()
            });
            
        case 'update_fields':
            return updateOrderFields(req, res);
            
        case 'send_to_suppliers':
            return sendToSuppliers(req, res);
            
        default:
            return res.status(400).json({
                success: false,
                error: 'Ação não reconhecida',
                available_actions: ['create', 'update_fields', 'send_to_suppliers']
            });
    }
}

/**
 * Atualizar campos específicos do pedido
 */
async function updateOrderFields(req, res) {
    try {
        const orderId = req.query.id;
        const updates = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'ID do pedido é obrigatório'
            });
        }
        
        const orders = getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado'
            });
        }
        
        // Atualizar campos aninhados
        Object.keys(updates).forEach(key => {
            const value = updates[key];
            const keys = key.split('.');
            
            if (keys.length === 2) {
                // Campo aninhado (ex: customer.name, shipping.address)
                if (!orders[orderIndex][keys[0]]) {
                    orders[orderIndex][keys[0]] = {};
                }
                orders[orderIndex][keys[0]][keys[1]] = value;
            } else {
                // Campo direto
                orders[orderIndex][key] = value;
            }
        });
        
        // Atualizar timestamp
        orders[orderIndex].updated_at = new Date().toISOString();
        
        // Salvar no arquivo
        saveOrdersToFile(orders);
        
        return res.json({
            success: true,
            data: orders[orderIndex],
            message: 'Campos atualizados com sucesso',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro ao atualizar campos do pedido:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * Enviar dados para fornecedores
 */
async function sendToSuppliers(req, res) {
    try {
        const orderId = req.query.id;
        const supplierData = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'ID do pedido é obrigatório'
            });
        }
        
        const orders = getOrders();
        const order = orders.find(order => order.id === orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado'
            });
        }
        
        // Simular envio para fornecedores
        console.log(`📤 Enviando pedido ${orderId} para fornecedores:`, {
            supplier: supplierData.supplier,
            products: order.products,
            customer: order.customer,
            shipping: order.shipping
        });
        
        // Aqui seria feita a integração real com APIs dos fornecedores
        // Por enquanto, apenas simular sucesso
        
        return res.json({
            success: true,
            message: 'Dados enviados para fornecedores com sucesso',
            data: {
                orderId: orderId,
                supplier: supplierData.supplier,
                sentAt: new Date().toISOString(),
                status: 'sent_to_supplier'
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro ao enviar para fornecedores:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

