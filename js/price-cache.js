/**
 * Sistema de Cache Inteligente para Preços
 * Gerencia cache de preços com invalidação automática
 */

class PriceCache {
    constructor() {
        this.cache = new Map();
        this.maxAge = 5 * 60 * 1000; // 5 minutos
        this.cleanupInterval = 60 * 1000; // 1 minuto
        
        this.startCleanup();
    }
    
    /**
     * Armazena preços no cache
     */
    set(productId, prices, metadata = {}) {
        const cacheEntry = {
            data: prices,
            timestamp: Date.now(),
            metadata: {
                ...metadata,
                cachedAt: new Date().toISOString()
            }
        };
        
        this.cache.set(productId, cacheEntry);
        console.log(`💾 Preços armazenados no cache: ${productId}`);
    }
    
    /**
     * Recupera preços do cache
     */
    get(productId) {
        const entry = this.cache.get(productId);
        
        if (!entry) {
            return null;
        }
        
        // Verificar se o cache ainda é válido
        if (this.isExpired(entry)) {
            this.cache.delete(productId);
            console.log(`⏰ Cache expirado para: ${productId}`);
            return null;
        }
        
        console.log(`✅ Preços recuperados do cache: ${productId}`);
        return entry.data;
    }
    
    /**
     * Verifica se o cache expirou
     */
    isExpired(entry) {
        const age = Date.now() - entry.timestamp;
        return age > this.maxAge;
    }
    
    /**
     * Força atualização do cache
     */
    invalidate(productId) {
        const removed = this.cache.delete(productId);
        console.log(`🔄 Cache invalidado para: ${productId}`, removed);
        return removed;
    }
    
    /**
     * Invalida cache de todos os produtos
     */
    invalidateAll() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`🔄 Cache invalidado para todos os produtos (${size} entradas)`);
        return size;
    }
    
    /**
     * Obtém estatísticas do cache
     */
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        this.cache.forEach((entry, productId) => {
            if (this.isExpired(entry)) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        });
        
        return {
            totalEntries: this.cache.size,
            validEntries: validEntries,
            expiredEntries: expiredEntries,
            maxAge: this.maxAge,
            cleanupInterval: this.cleanupInterval
        };
    }
    
    /**
     * Limpa entradas expiradas
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        
        this.cache.forEach((entry, productId) => {
            if (this.isExpired(entry)) {
                this.cache.delete(productId);
                cleanedCount++;
            }
        });
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cache limpo: ${cleanedCount} entradas expiradas removidas`);
        }
        
        return cleanedCount;
    }
    
    /**
     * Inicia limpeza automática
     */
    startCleanup() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
        
        console.log(`🧹 Limpeza automática do cache iniciada (${this.cleanupInterval/1000}s)`);
    }
    
    /**
     * Obtém preços com fallback para API
     */
    async getPricesWithFallback(productId, currency = 'USD') {
        // Tentar buscar do cache primeiro
        let prices = this.get(productId);
        
        if (prices) {
            return prices;
        }
        
        // Se não estiver no cache, buscar da API
        try {
            console.log(`🔄 Buscando preços da API: ${productId}`);
            const response = await fetch(`/api/active-prices?productId=${productId}&currency=${currency}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                // Armazenar no cache
                this.set(productId, data.data, {
                    source: 'api',
                    currency: currency
                });
                
                return data.data;
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar preços da API:`, error);
        }
        
        return null;
    }
    
    /**
     * Atualiza preços no cache
     */
    updatePrices(productId, newPrices) {
        const entry = this.cache.get(productId);
        
        if (entry) {
            entry.data = newPrices;
            entry.timestamp = Date.now();
            entry.metadata.updatedAt = new Date().toISOString();
            
            console.log(`🔄 Preços atualizados no cache: ${productId}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Obtém todos os produtos em cache
     */
    getAllCachedProducts() {
        const products = [];
        
        this.cache.forEach((entry, productId) => {
            if (!this.isExpired(entry)) {
                products.push({
                    productId: productId,
                    data: entry.data,
                    cachedAt: entry.metadata.cachedAt,
                    age: Date.now() - entry.timestamp
                });
            }
        });
        
        return products;
    }
    
    /**
     * Exporta cache para localStorage
     */
    exportToLocalStorage() {
        const cacheData = {
            entries: Array.from(this.cache.entries()),
            exportedAt: new Date().toISOString()
        };
        
        localStorage.setItem('priceCache', JSON.stringify(cacheData));
        console.log(`💾 Cache exportado para localStorage`);
    }
    
    /**
     * Importa cache do localStorage
     */
    importFromLocalStorage() {
        try {
            const cacheData = localStorage.getItem('priceCache');
            if (cacheData) {
                const parsed = JSON.parse(cacheData);
                this.cache = new Map(parsed.entries);
                console.log(`📥 Cache importado do localStorage`);
                return true;
            }
        } catch (error) {
            console.error('❌ Erro ao importar cache do localStorage:', error);
        }
        
        return false;
    }
}

// Instância global do cache
window.priceCache = new PriceCache();

// Exportar para uso global
window.PriceCache = PriceCache;

