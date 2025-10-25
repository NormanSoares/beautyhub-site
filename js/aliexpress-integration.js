/**
 * AliExpress Integration System
 * Sistema de integração com AliExpress para monitoramento de pedidos
 */

class AliExpressIntegration {
    constructor() {
        this.apiEndpoint = '/api/aliexpress-callback.php';
        this.pollInterval = 30000; // 30 segundos
        this.isPolling = false;
        this.lastOrderId = null;
        
        this.initializeIntegration();
    }

    /**
     * Inicializa o sistema de integração
     */
    initializeIntegration() {
        console.log('🏭 Inicializando integração AliExpress...');
        
        // Verificar se estamos na página de checkout
        if (this.isCheckoutPage()) {
            this.setupOrderTracking();
        }
        
        // Iniciar polling para atualizações
        this.startPolling();
        
        // Configurar eventos de pedido
        this.setupOrderEvents();
    }

    /**
     * Verifica se estamos em uma página de checkout
     */
    isCheckoutPage() {
        return window.location.pathname.includes('checkout-');
    }

    /**
     * Configura o rastreamento de pedidos
     */
    setupOrderTracking() {
        // Interceptar submissão de formulário
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                this.handleOrderSubmission(e);
            });
        }
    }

    /**
     * Processa submissão de pedido
     */
    async handleOrderSubmission(event) {
        const formData = new FormData(event.target);
        const orderData = this.collectOrderData(formData);
        
        console.log('📦 Processando pedido para AliExpress:', orderData);
        
        try {
            // Enviar pedido para AliExpress
            const aliExpressOrder = await this.createAliExpressOrder(orderData);
            
            if (aliExpressOrder.success) {
                this.lastOrderId = aliExpressOrder.orderId;
                this.showOrderConfirmation(aliExpressOrder);
                this.startOrderTracking(aliExpressOrder.orderId);
            } else {
                throw new Error(aliExpressOrder.error || 'Erro ao criar pedido no AliExpress');
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar pedido AliExpress:', error);
            this.showOrderError(error.message);
        }
    }

    /**
     * Coleta dados do pedido do formulário
     */
    collectOrderData(formData) {
        const orderData = {};
        formData.forEach((value, key) => {
            orderData[key] = value;
        });
        
        // Adicionar dados específicos do AliExpress
        orderData.aliExpressData = {
            source: '67 Beauty Hub',
            timestamp: new Date().toISOString(),
            currency: this.getCurrentCurrency(),
            language: this.getCurrentLanguage()
        };
        
        return orderData;
    }

    /**
     * Cria pedido no AliExpress (simulado)
     */
    async createAliExpressOrder(orderData) {
        // Simular criação de pedido no AliExpress
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const orderId = 'AE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        return {
            success: true,
            orderId: orderId,
            aliExpressOrderId: 'AE' + Date.now(),
            trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            estimatedDelivery: this.calculateEstimatedDelivery(),
            status: 'created',
            supplier: this.getSupplierInfo(orderData)
        };
    }

    /**
     * Calcula data estimada de entrega
     */
    calculateEstimatedDelivery() {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 15); // 15 dias para AliExpress
        return deliveryDate.toLocaleDateString('pt-BR');
    }

    /**
     * Obtém informações do fornecedor baseado no produto
     */
    getSupplierInfo(orderData) {
        // Mapear produto para fornecedor AliExpress
        const productMapping = {
            'phoera-foundation': {
                name: 'PHOERA Official Store',
                storeId: 'PHOERA_STORE_001',
                location: 'China'
            },
            'alligator-clips': {
                name: 'Hair Tools Pro Store',
                storeId: 'HAIR_TOOLS_001',
                location: 'China'
            }
        };
        
        const productType = this.detectProductType(orderData);
        return productMapping[productType] || productMapping['phoera-foundation'];
    }

    /**
     * Detecta tipo de produto baseado na URL ou dados
     */
    detectProductType(orderData) {
        const path = window.location.pathname;
        if (path.includes('phoera')) return 'phoera-foundation';
        if (path.includes('alligator')) return 'alligator-clips';
        return 'phoera-foundation'; // default
    }

    /**
     * Inicia rastreamento de pedido
     */
    startOrderTracking(orderId) {
        console.log('🔍 Iniciando rastreamento do pedido:', orderId);
        
        // Salvar ID do pedido para polling
        localStorage.setItem('lastAliExpressOrderId', orderId);
        
        // Mostrar painel de rastreamento
        this.showTrackingPanel(orderId);
    }

    /**
     * Mostra painel de rastreamento
     */
    showTrackingPanel(orderId) {
        const trackingPanel = document.createElement('div');
        trackingPanel.id = 'aliExpressTrackingPanel';
        trackingPanel.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10001;
            background: white; border-radius: 10px; padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 300px; border-left: 4px solid #d4af37;
        `;
        
        trackingPanel.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <i class="fas fa-shipping-fast" style="color: #d4af37; font-size: 1.5rem; margin-right: 10px;"></i>
                <h4 style="margin: 0; color: #333;">Rastreamento AliExpress</h4>
            </div>
            <div style="margin-bottom: 15px;">
                <p style="margin: 0; font-size: 0.9rem; color: #666;">
                    <strong>Pedido:</strong> ${orderId}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #666;">
                    <strong>Status:</strong> <span id="orderStatus">Processando</span>
                </p>
            </div>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                <div style="font-size: 0.8rem; color: #666;">
                    <div style="margin-bottom: 5px;">📦 Pedido criado</div>
                    <div style="margin-bottom: 5px;">⏳ Aguardando pagamento</div>
                    <div style="margin-bottom: 5px;">🚚 Preparando envio</div>
                    <div>✅ Entregue</div>
                </div>
            </div>
            <button onclick="this.closest('#aliExpressTrackingPanel').remove();" 
                    style="background: #d4af37; color: white; border: none; 
                           padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
                <i class="fas fa-times"></i> Fechar
            </button>
        `;
        
        document.body.appendChild(trackingPanel);
        
        // Auto-remover após 30 segundos
        setTimeout(() => {
            if (trackingPanel.parentNode) {
                trackingPanel.remove();
            }
        }, 30000);
    }

    /**
     * Inicia polling para atualizações
     */
    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        console.log('🔄 Iniciando polling AliExpress...');
        
        setInterval(() => {
            this.checkForUpdates();
        }, this.pollInterval);
    }

    /**
     * Verifica atualizações de pedidos
     */
    async checkForUpdates() {
        const lastOrderId = localStorage.getItem('lastAliExpressOrderId');
        if (!lastOrderId) return;
        
        try {
            const updates = await this.fetchOrderUpdates(lastOrderId);
            if (updates && updates.length > 0) {
                this.processUpdates(updates);
            }
        } catch (error) {
            console.log('ℹ️ Nenhuma atualização disponível');
        }
    }

    /**
     * Busca atualizações de pedidos
     */
    async fetchOrderUpdates(orderId) {
        // Simular busca de atualizações
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Em produção, isso seria uma chamada real para a API
        const mockUpdates = [
            {
                orderId: orderId,
                status: 'paid',
                timestamp: new Date().toISOString(),
                message: 'Pagamento confirmado'
            }
        ];
        
        return mockUpdates;
    }

    /**
     * Processa atualizações recebidas
     */
    processUpdates(updates) {
        updates.forEach(update => {
            console.log('📬 Atualização recebida:', update);
            this.updateOrderStatus(update);
            this.showStatusNotification(update);
        });
    }

    /**
     * Atualiza status do pedido na interface
     */
    updateOrderStatus(update) {
        const statusElement = document.getElementById('orderStatus');
        if (statusElement) {
            const statusMap = {
                'created': 'Criado',
                'paid': 'Pago',
                'shipped': 'Enviado',
                'delivered': 'Entregue',
                'cancelled': 'Cancelado'
            };
            
            statusElement.textContent = statusMap[update.status] || update.status;
        }
    }

    /**
     * Mostra notificação de status
     */
    showStatusNotification(update) {
        // Verificar se estamos no dashboard
        const isDashboard = window.location.pathname.includes('dashboard') || 
                           document.title.includes('Dashboard') ||
                           document.querySelector('#capitalCards') !== null;
        
        if (!isDashboard) {
            // Nas páginas de checkout, apenas log no console
            console.log('📬 Atualização recebida:', update);
            return;
        }
        
        // No dashboard, mostrar notificação visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: #28a745; color: white; padding: 15px 20px;
            border-radius: 8px; z-index: 10002; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease; max-width: 350px;
            font-weight: 500;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>🛒</span>
                <span>AliExpress: ${update.message || 'Status atualizado'}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Mostra confirmação de pedido
     */
    showOrderConfirmation(orderData) {
        const confirmationModal = document.createElement('div');
        confirmationModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10002; display: flex;
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        confirmationModal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 40px; max-width: 500px; width: 100%; text-align: center;">
                <div style="color: #28a745; font-size: 3rem; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: #333; margin-bottom: 15px;">
                    Pedido Criado no AliExpress! 🎉
                </h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                    <p><strong>ID do Pedido:</strong> ${orderData.orderId}</p>
                    <p><strong>ID AliExpress:</strong> ${orderData.aliExpressOrderId}</p>
                    <p><strong>Fornecedor:</strong> ${orderData.supplier.name}</p>
                    <p><strong>Localização:</strong> ${orderData.supplier.location}</p>
                    <p><strong>Entrega Estimada:</strong> ${orderData.estimatedDelivery}</p>
                    <p><strong>Status:</strong> ${orderData.status}</p>
                </div>
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #1976d2; margin-bottom: 10px;">
                        <i class="fas fa-info-circle"></i> Próximos Passos
                    </h4>
                    <p style="color: #666; font-size: 0.9rem; margin: 0;">
                        Você receberá atualizações automáticas sobre o status do seu pedido. 
                        O rastreamento estará disponível em breve.
                    </p>
                </div>
                <button onclick="this.closest('div').remove(); window.location.href='index.html';" 
                        style="background: linear-gradient(135deg, #d4af37, #b8941f);
                               color: white; border: none; padding: 12px 30px;
                               border-radius: 8px; font-size: 1.1rem; font-weight: 600;
                               cursor: pointer; margin-top: 20px;">
                    <i class="fas fa-home"></i> Voltar ao Início
                </button>
            </div>
        `;
        
        document.body.appendChild(confirmationModal);
    }

    /**
     * Mostra erro de pedido
     */
    showOrderError(message) {
        const errorModal = document.createElement('div');
        errorModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10002; display: flex;
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        errorModal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 40px; max-width: 400px; width: 100%; text-align: center;">
                <div style="color: #dc3545; font-size: 3rem; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #333; margin-bottom: 15px;">Erro no Pedido</h2>
                <p style="color: #666; margin-bottom: 25px;">${message}</p>
                <button onclick="this.closest('div').remove();" 
                        style="background: #dc3545; color: white; border: none;
                               padding: 12px 30px; border-radius: 8px; font-size: 1rem; cursor: pointer;">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(errorModal);
    }

    /**
     * Obtém moeda atual
     */
    getCurrentCurrency() {
        return window.currentCurrency || 'BRL';
    }

    /**
     * Obtém idioma atual
     */
    getCurrentLanguage() {
        return window.currentLanguage || 'pt';
    }

    /**
     * Configura eventos de pedido
     */
    setupOrderEvents() {
        // Escutar eventos de mudança de status
        window.addEventListener('aliExpressOrderUpdate', (event) => {
            this.processUpdates([event.detail]);
        });
    }
}

// Inicializar integração quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.aliExpressIntegration = new AliExpressIntegration();
});

// Exportar para uso global
window.AliExpressIntegration = AliExpressIntegration;



