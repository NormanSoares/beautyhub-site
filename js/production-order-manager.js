/**
 * Gerenciador de Pedidos de Produção - 67 Beauty Hub
 * Sistema real para gerenciar pedidos de clientes
 */

class ProductionOrderManager {
    constructor() {
        this.orders = [];
        this.orderCounter = 1;
        this.init();
    }

    async init() {
        console.log('🏭 Inicializando sistema de produção...');
        await this.loadOrders();
        this.setupEventListeners();
        console.log('✅ Sistema de produção pronto!');
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                this.orders = await response.json();
                console.log(`📦 ${this.orders.length} pedidos carregados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar pedidos:', error);
            this.orders = [];
        }
    }

    setupEventListeners() {
        // Escutar novos pedidos
        document.addEventListener('newOrder', (event) => {
            this.handleNewOrder(event.detail);
        });

        // Escutar atualizações de status
        document.addEventListener('orderStatusUpdate', (event) => {
            this.handleStatusUpdate(event.detail);
        });
    }

    async handleNewOrder(orderData) {
        try {
            console.log('📦 Novo pedido recebido:', orderData);
            
            // Validar dados do pedido
            if (!this.validateOrderData(orderData)) {
                throw new Error('Dados do pedido inválidos');
            }

            // Processar pedido
            const processedOrder = await this.processOrder(orderData);
            
            // Adicionar ao sistema
            this.orders.push(processedOrder);
            
            // Salvar no servidor
            await this.saveOrder(processedOrder);
            
            // Notificar dashboard
            this.notifyDashboard(processedOrder);
            
            console.log('✅ Pedido processado com sucesso:', processedOrder.id);
            
        } catch (error) {
            console.error('❌ Erro ao processar pedido:', error);
            this.showError('Erro ao processar pedido: ' + error.message);
        }
    }

    validateOrderData(orderData) {
        const required = ['customer', 'products', 'shipping_address'];
        
        for (const field of required) {
            if (!orderData[field]) {
                console.error(`❌ Campo obrigatório ausente: ${field}`);
                return false;
            }
        }

        if (!orderData.customer.name || !orderData.customer.email) {
            console.error('❌ Dados do cliente incompletos');
            return false;
        }

        if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
            console.error('❌ Lista de produtos vazia');
            return false;
        }

        return true;
    }

    async processOrder(orderData) {
        const orderId = this.generateOrderId();
        const now = new Date().toISOString();
        
        const processedOrder = {
            id: orderId,
            customer: {
                name: orderData.customer.name.trim(),
                email: orderData.customer.email.trim().toLowerCase(),
                phone: orderData.customer.phone || '',
                country: orderData.customer.country || 'Brasil'
            },
            products: orderData.products.map(product => ({
                id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: product.name,
                price: parseFloat(product.price) || 0,
                quantity: parseInt(product.quantity) || 1,
                color: product.color || '',
                size: product.size || '',
                supplier: product.supplier || 'aliexpress'
            })),
            total: this.calculateTotal(orderData.products),
            status: 'pending',
            payment_status: 'pending',
            payment_method: orderData.payment_method || 'paypal',
            shipping_address: {
                street: orderData.shipping_address.street,
                city: orderData.shipping_address.city,
                state: orderData.shipping_address.state,
                zip: orderData.shipping_address.zip,
                country: orderData.shipping_address.country || 'Brasil'
            },
            notes: orderData.notes || '',
            created_at: now,
            updated_at: now,
            tracking: {
                number: '',
                carrier: '',
                status: 'pending'
            },
            financial: {
                revenue: this.calculateTotal(orderData.products),
                cost: this.calculateCost(orderData.products),
                profit: 0,
                margin: 0
            }
        };

        // Calcular métricas financeiras
        processedOrder.financial.profit = processedOrder.financial.revenue - processedOrder.financial.cost;
        processedOrder.financial.margin = processedOrder.financial.revenue > 0 
            ? (processedOrder.financial.profit / processedOrder.financial.revenue) * 100 
            : 0;

        return processedOrder;
    }

    calculateTotal(products) {
        return products.reduce((total, product) => {
            const price = parseFloat(product.price) || 0;
            const quantity = parseInt(product.quantity) || 1;
            return total + (price * quantity);
        }, 0);
    }

    calculateCost(products) {
        // Cálculo de custo baseado no fornecedor
        return products.reduce((total, product) => {
            const price = parseFloat(product.price) || 0;
            const quantity = parseInt(product.quantity) || 1;
            const supplier = product.supplier || 'aliexpress';
            
            // Margem padrão por fornecedor
            const margins = {
                'aliexpress': 0.3, // 30% de margem
                'amazon': 0.25,    // 25% de margem
                'other': 0.35      // 35% de margem
            };
            
            const margin = margins[supplier] || margins.other;
            const cost = price * (1 - margin);
            
            return total + (cost * quantity);
        }, 0);
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `order_${timestamp}_${random}`;
    }

    async saveOrder(order) {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar pedido: ${response.status}`);
            }

            console.log('✅ Pedido salvo no servidor');
        } catch (error) {
            console.error('❌ Erro ao salvar pedido:', error);
            throw error;
        }
    }

    notifyDashboard(order) {
        // Disparar evento para o dashboard
        const event = new CustomEvent('orderAdded', {
            detail: order
        });
        document.dispatchEvent(event);
    }

    async handleStatusUpdate(updateData) {
        try {
            const { orderId, status, notes } = updateData;
            
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                throw new Error('Pedido não encontrado');
            }

            order.status = status;
            order.updated_at = new Date().toISOString();
            if (notes) order.notes = notes;

            // Salvar no servidor
            await this.updateOrder(order);
            
            console.log(`✅ Status do pedido ${orderId} atualizado para: ${status}`);
            
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            this.showError('Erro ao atualizar status: ' + error.message);
        }
    }

    async updateOrder(order) {
        try {
            const response = await fetch(`/api/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar pedido: ${response.status}`);
            }

            console.log('✅ Pedido atualizado no servidor');
        } catch (error) {
            console.error('❌ Erro ao atualizar pedido:', error);
            throw error;
        }
    }

    showError(message) {
        // Mostrar erro para o usuário
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
            ">
                <strong>Erro:</strong> ${message}
                <button onclick="this.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    float: right;
                    font-size: 18px;
                    cursor: pointer;
                ">&times;</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Métodos públicos para o dashboard
    getOrders() {
        return this.orders;
    }

    getOrderById(orderId) {
        return this.orders.find(o => o.id === orderId);
    }

    getOrdersByStatus(status) {
        return this.orders.filter(o => o.status === status);
    }

    getTotalRevenue() {
        return this.orders.reduce((total, order) => total + (order.financial?.revenue || 0), 0);
    }

    getTotalProfit() {
        return this.orders.reduce((total, order) => total + (order.financial?.profit || 0), 0);
    }

    getAverageMargin() {
        if (this.orders.length === 0) return 0;
        const totalMargin = this.orders.reduce((total, order) => total + (order.financial?.margin || 0), 0);
        return totalMargin / this.orders.length;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.productionOrderManager = new ProductionOrderManager();
});

export default ProductionOrderManager;

