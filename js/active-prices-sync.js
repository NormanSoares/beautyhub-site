/**
 * Sistema de Sincronização de Preços Ativos
 * Sincroniza preços do AliExpress com as páginas de produção
 */

class ActivePricesSync {
    constructor() {
        this.apiEndpoint = '/api/active-prices';
        this.syncInterval = 5 * 60 * 1000; // 5 minutos
        this.isSyncing = false;
        this.lastSync = null;
        this.cache = window.priceCache || new PriceCache();
        
        this.initializeSync();
    }
    
    /**
     * Inicializa o sistema de sincronização
     */
    initializeSync() {
        console.log('🔄 Inicializando sincronização de preços ativos...');
        
        // Sincronização inicial
        this.syncPrices();
        
        // Sincronização automática
        this.startAutoSync();
        
        // Eventos de sincronização manual
        this.setupManualSync();
    }
    
    /**
     * Sincroniza preços com a API
     */
    async syncPrices() {
        if (this.isSyncing) {
            console.log('⏳ Sincronização já em andamento...');
            return;
        }
        
        this.isSyncing = true;
        console.log('🔄 Sincronizando preços ativos...');
        
        try {
            // Tentar buscar do cache primeiro
            let activePrices = this.cache.get('all_products');
            
            if (!activePrices) {
                // Se não estiver no cache, buscar da API
                const response = await fetch(this.apiEndpoint);
                const data = await response.json();
                
                if (data.success) {
                    activePrices = data.data;
                    
                    // Armazenar no cache
                    this.cache.set('all_products', activePrices, {
                        source: 'api',
                        syncType: 'full'
                    });
                } else {
                    throw new Error(data.error || 'Erro na sincronização');
                }
            }
            
            this.updateProductionPages(activePrices);
            this.lastSync = new Date();
            console.log('✅ Preços sincronizados com sucesso');
            
            // Disparar evento de sincronização
            this.dispatchSyncEvent('success', activePrices);
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.dispatchSyncEvent('error', error.message);
        } finally {
            this.isSyncing = false;
        }
    }
    
    /**
     * Atualiza páginas de produção com novos preços
     */
    updateProductionPages(activePrices) {
        // Atualizar páginas de checkout
        this.updateCheckoutPages(activePrices);
        
        // Atualizar dashboard
        this.updateDashboard(activePrices);
        
        // Salvar no localStorage para persistência
        localStorage.setItem('activePrices', JSON.stringify(activePrices));
        localStorage.setItem('lastPriceSync', new Date().toISOString());
    }
    
    /**
     * Atualiza páginas de checkout
     */
    updateCheckoutPages(activePrices) {
        // Verificar se estamos em uma página de checkout
        if (!this.isCheckoutPage()) {
            return;
        }
        
        // Detectar produto atual
        const currentProduct = this.detectCurrentProduct();
        if (!currentProduct) {
            return;
        }
        
        // Buscar preços atualizados
        const productPrices = activePrices[currentProduct];
        if (!productPrices) {
            console.warn(`⚠️ Preços não encontrados para produto: ${currentProduct}`);
            return;
        }
        
        // Atualizar preços na página
        this.updatePagePrices(productPrices);
        
        console.log(`✅ Preços atualizados para ${currentProduct}`);
    }
    
    /**
     * Verifica se estamos em uma página de checkout
     */
    isCheckoutPage() {
        return window.location.pathname.includes('checkout-') || 
               window.location.pathname.includes('checkout');
    }
    
    /**
     * Detecta o produto atual baseado na URL
     */
    detectCurrentProduct() {
        const path = window.location.pathname;
        
        if (path.includes('phoera')) return 'phoera_foundation';
        if (path.includes('wrinkle')) return 'wrinkle_reducer';
        if (path.includes('heat-resistant')) return 'heat_resistant_mat';
        if (path.includes('alligator')) return 'alligator_hair_clips';
        if (path.includes('laikou')) return 'laikou_golden_sakura';
        if (path.includes('snooze')) return 'snooze_bundle';
        if (path.includes('human-dog')) return 'human_dog_bed';
        if (path.includes('detachable-sofa')) return 'detachable_sofa_cover';
        
        return null;
    }
    
    /**
     * Atualiza preços na página atual
     */
    updatePagePrices(productPrices) {
        const currentCurrency = window.currentCurrency || 'USD';
        const prices = productPrices.prices[currentCurrency] || productPrices.prices['USD'];
        
        // Atualizar preços das ofertas
        this.updateOfferPrices(prices, currentCurrency);
        
        // Atualizar resumo do pedido
        this.updateOrderSummary();
        
        // Mostrar notificação de atualização
        this.showPriceUpdateNotification();
    }
    
    /**
     * Atualiza preços das ofertas
     */
    updateOfferPrices(prices, currency) {
        // Atualizar oferta básica
        const basicPriceElement = document.getElementById('basic-price');
        if (basicPriceElement && prices) {
            const formattedPrice = this.formatPrice(prices.finalPrice, currency);
            basicPriceElement.textContent = formattedPrice;
        }
        
        // Atualizar oferta premium
        const premiumPriceElement = document.getElementById('premium-price');
        if (premiumPriceElement && prices) {
            const formattedPrice = this.formatPrice(prices.finalPrice, currency);
            premiumPriceElement.textContent = formattedPrice;
        }
        
        // Atualizar oferta completa (se existir)
        const completePriceElement = document.getElementById('complete-price');
        if (completePriceElement && prices) {
            const formattedPrice = this.formatPrice(prices.finalPrice, currency);
            completePriceElement.textContent = formattedPrice;
        }
    }
    
    /**
     * Formata preço para a moeda
     */
    formatPrice(price, currency) {
        const symbols = {
            'USD': '$',
            'BRL': 'R$',
            'EUR': '€',
            'AOA': 'Kz'
        };
        
        const symbol = symbols[currency] || '$';
        return `${symbol}${price.toFixed(2)}`;
    }
    
    /**
     * Atualiza resumo do pedido
     */
    updateOrderSummary() {
        // Chamar função de atualização do resumo se existir
        if (typeof window.updateOrderSummary === 'function') {
            window.updateOrderSummary();
        }
        
        // Ou chamar função de atualização de preços se existir
        if (typeof window.updateAllPrices === 'function') {
            window.updateAllPrices();
        }
    }
    
    /**
     * Mostra notificação de atualização de preços
     */
    showPriceUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10001;
            background: #28a745; color: white; padding: 15px 20px;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease; max-width: 300px;
            font-weight: 500;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>💰</span>
                <span>Preços atualizados!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Atualiza dashboard
     */
    updateDashboard(activePrices) {
        // Verificar se estamos no dashboard
        if (!this.isDashboard()) {
            return;
        }
        
        // Disparar evento para o dashboard
        const event = new CustomEvent('activePricesUpdated', {
            detail: { activePrices }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Verifica se estamos no dashboard
     */
    isDashboard() {
        return window.location.pathname.includes('dashboard') || 
               document.title.includes('Dashboard') ||
               document.querySelector('#capitalCards') !== null;
    }
    
    /**
     * Inicia sincronização automática
     */
    startAutoSync() {
        setInterval(() => {
            this.syncPrices();
        }, this.syncInterval);
        
        console.log(`🔄 Sincronização automática iniciada (${this.syncInterval/1000}s)`);
    }
    
    /**
     * Configura sincronização manual
     */
    setupManualSync() {
        // Botão de sincronização manual no dashboard
        if (this.isDashboard()) {
            this.addSyncButton();
        }
        
        // Eventos de teclado para sincronização manual
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r' && e.shiftKey) {
                e.preventDefault();
                this.syncPrices();
            }
        });
    }
    
    /**
     * Adiciona botão de sincronização no dashboard
     */
    addSyncButton() {
        const syncButton = document.createElement('button');
        syncButton.id = 'syncPricesButton';
        syncButton.innerHTML = `
            <i class="fas fa-sync-alt"></i> Sincronizar Preços
        `;
        syncButton.style.cssText = `
            position: fixed; top: 20px; left: 20px; z-index: 1000;
            background: #d4af37; color: white; border: none;
            padding: 10px 15px; border-radius: 5px; cursor: pointer;
            font-size: 0.9rem; font-weight: 500;
        `;
        
        syncButton.addEventListener('click', () => {
            this.syncPrices();
        });
        
        document.body.appendChild(syncButton);
    }
    
    /**
     * Dispara evento de sincronização
     */
    dispatchSyncEvent(type, data) {
        const event = new CustomEvent('priceSync', {
            detail: { type, data, timestamp: new Date() }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Obtém status da sincronização
     */
    getSyncStatus() {
        return {
            isSyncing: this.isSyncing,
            lastSync: this.lastSync,
            syncInterval: this.syncInterval
        };
    }
}

// Inicializar sistema de sincronização
document.addEventListener('DOMContentLoaded', function() {
    window.activePricesSync = new ActivePricesSync();
});

// Exportar para uso global
window.ActivePricesSync = ActivePricesSync;
