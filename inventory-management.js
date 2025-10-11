/**
 * Sistema de Gestão de Estoque e Disponibilidade
 * 67 Beauty Hub - Dropshipping
 */

import fs from 'fs';
import axios from 'axios';

class InventoryManagement {
    constructor() {
        this.inventory = new Map();
        this.stockAlerts = new Map();
        this.config = {
            lowStockThreshold: 5,
            outOfStockThreshold: 0,
            checkInterval: '0 */4 * * *', // A cada 4 horas
            alertThresholds: {
                low: 5,
                critical: 2,
                out: 0
            }
        };
    }

    async initialize() {
        console.log('📦 Inicializando Sistema de Gestão de Estoque...');
        await this.loadInventory();
        await this.loadStockAlerts();
        console.log('✅ Sistema de Estoque inicializado!');
    }

    async loadInventory() {
        try {
            const inventoryFile = 'data/inventory.json';
            if (fs.existsSync(inventoryFile)) {
                const data = JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
                this.inventory = new Map(Object.entries(data));
                console.log(`📦 ${this.inventory.size} produtos no inventário`);
            } else {
                // Criar inventário inicial baseado nos fornecedores
                await this.initializeInventoryFromSuppliers();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar inventário:', error);
        }
    }

    async initializeInventoryFromSuppliers() {
        console.log('🔄 Inicializando inventário a partir dos fornecedores...');
        
        try {
            // Carregar produtos do AliExpress
            const aliexpressProducts = await this.parseSupplierFile('Fornecedores/Aliexpress.txt');
            aliexpressProducts.forEach(product => {
                this.addProductToInventory(product, 'aliexpress');
            });

            // Carregar produtos do Amazon
            const amazonProducts = await this.parseSupplierFile('Fornecedores/Amazon.txt');
            amazonProducts.forEach(product => {
                this.addProductToInventory(product, 'amazon');
            });

            await this.saveInventory();
            console.log(`✅ Inventário inicializado com ${this.inventory.size} produtos`);
        } catch (error) {
            console.error('❌ Erro ao inicializar inventário:', error);
        }
    }

    async parseSupplierFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const products = [];

        for (const line of lines) {
            if (line.includes('http')) {
                const parts = line.split('--');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const url = parts[1].trim();
                    const id = this.generateProductId(name, url);
                    
                    products.push({
                        id,
                        name,
                        url,
                        supplier: filePath.includes('Aliexpress') ? 'aliexpress' : 'amazon'
                    });
                }
            }
        }

        return products;
    }

    generateProductId(name, url) {
        const nameHash = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        const urlHash = url.split('/').pop().substring(0, 10);
        return `${nameHash}_${urlHash}`;
    }

    addProductToInventory(product, supplier) {
        const inventoryItem = {
            id: product.id,
            name: product.name,
            url: product.url,
            supplier,
            stock: {
                available: 0,
                reserved: 0,
                total: 0,
                lastUpdate: new Date(),
                status: 'unknown'
            },
            pricing: {
                cost: 0,
                markup: 1.5, // 50% de markup
                sellingPrice: 0,
                currency: 'USD'
            },
            alerts: {
                lowStock: false,
                outOfStock: false,
                priceChange: false
            },
            metadata: {
                category: this.categorizeProduct(product.name),
                tags: this.generateTags(product.name),
                weight: 0,
                dimensions: { length: 0, width: 0, height: 0 }
            }
        };

        this.inventory.set(product.id, inventoryItem);
    }

    categorizeProduct(name) {
        const categories = {
            'beauty': ['makeup', 'foundation', 'primer', 'brush', 'clips', 'skincare', 'cream', 'vitamin'],
            'comfort': ['sofa', 'bed', 'snooze', 'cover', 'mat', 'towel'],
            'home': ['cover', 'mat', 'towel', 'bed']
        };

        const lowerName = name.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerName.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    generateTags(name) {
        const words = name.toLowerCase().split(' ');
        return words.filter(word => word.length > 3);
    }

    async updateStock(productId, stockData) {
        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Produto ${productId} não encontrado no inventário`);
        }

        const oldStock = item.stock.available;
        item.stock.available = stockData.available || 0;
        item.stock.total = stockData.total || item.stock.available;
        item.stock.status = stockData.status || 'available';
        item.stock.lastUpdate = new Date();

        // Verificar alertas de estoque
        await this.checkStockAlerts(productId, oldStock, item.stock.available);

        await this.saveInventory();
        return item;
    }

    async checkStockAlerts(productId, oldStock, newStock) {
        const item = this.inventory.get(productId);
        if (!item) return;

        const alerts = item.alerts;
        
        // Resetar alertas
        alerts.lowStock = false;
        alerts.outOfStock = false;

        // Verificar estoque baixo
        if (newStock <= this.config.alertThresholds.low && newStock > 0) {
            alerts.lowStock = true;
            await this.triggerStockAlert(productId, 'low', newStock);
        }

        // Verificar estoque esgotado
        if (newStock <= this.config.alertThresholds.out) {
            alerts.outOfStock = true;
            await this.triggerStockAlert(productId, 'out', newStock);
        }

        // Verificar se voltou ao estoque
        if (oldStock === 0 && newStock > 0) {
            await this.triggerStockAlert(productId, 'restocked', newStock);
        }
    }

    async triggerStockAlert(productId, type, stock) {
        const item = this.inventory.get(productId);
        if (!item) return;

        const alert = {
            id: this.generateAlertId(),
            productId,
            productName: item.name,
            type,
            stock,
            timestamp: new Date(),
            supplier: item.supplier,
            url: item.url
        };

        this.stockAlerts.set(alert.id, alert);
        await this.saveStockAlerts();

        console.log(`🚨 ALERTA DE ESTOQUE: ${item.name} - ${type} (${stock} unidades)`);
        
        // Aqui você pode adicionar notificações por email, webhook, etc.
        await this.sendStockNotification(alert);
    }

    generateAlertId() {
        return `ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    async sendStockNotification(alert) {
        // Implementar envio de notificações
        const notification = {
            type: 'stock_alert',
            severity: this.getAlertSeverity(alert.type),
            message: this.generateAlertMessage(alert),
            data: alert
        };

        console.log(`📧 Notificação: ${notification.message}`);
        
        // Salvar notificação
        await this.saveNotification(notification);
    }

    getAlertSeverity(type) {
        const severities = {
            'out': 'critical',
            'low': 'warning',
            'restocked': 'info'
        };
        return severities[type] || 'info';
    }

    generateAlertMessage(alert) {
        const messages = {
            'out': `🚨 ESTOQUE ESGOTADO: ${alert.productName} está sem estoque!`,
            'low': `⚠️ ESTOQUE BAIXO: ${alert.productName} tem apenas ${alert.stock} unidades restantes.`,
            'restocked': `✅ ESTOQUE RESTAURADO: ${alert.productName} voltou ao estoque com ${alert.stock} unidades.`
        };
        return messages[alert.type] || `Alerta de estoque: ${alert.productName}`;
    }

    async reserveStock(productId, quantity) {
        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Produto ${productId} não encontrado`);
        }

        if (item.stock.available < quantity) {
            throw new Error(`Estoque insuficiente. Disponível: ${item.stock.available}, Solicitado: ${quantity}`);
        }

        item.stock.available -= quantity;
        item.stock.reserved += quantity;
        item.stock.lastUpdate = new Date();

        await this.saveInventory();
        return item;
    }

    async releaseStock(productId, quantity) {
        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Produto ${productId} não encontrado`);
        }

        if (item.stock.reserved < quantity) {
            throw new Error(`Quantidade reservada insuficiente. Reservado: ${item.stock.reserved}, Solicitado: ${quantity}`);
        }

        item.stock.available += quantity;
        item.stock.reserved -= quantity;
        item.stock.lastUpdate = new Date();

        await this.saveInventory();
        return item;
    }

    async confirmSale(productId, quantity) {
        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Produto ${productId} não encontrado`);
        }

        if (item.stock.reserved < quantity) {
            throw new Error(`Quantidade reservada insuficiente para confirmação de venda`);
        }

        item.stock.reserved -= quantity;
        item.stock.total -= quantity;
        item.stock.lastUpdate = new Date();

        await this.saveInventory();
        return item;
    }

    async updatePricing(productId, pricingData) {
        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Produto ${productId} não encontrado`);
        }

        const oldPrice = item.pricing.sellingPrice;
        item.pricing.cost = pricingData.cost || item.pricing.cost;
        item.pricing.markup = pricingData.markup || item.pricing.markup;
        item.pricing.sellingPrice = item.pricing.cost * item.pricing.markup;
        item.pricing.currency = pricingData.currency || item.pricing.currency;

        // Verificar mudança significativa de preço
        if (oldPrice && Math.abs(item.pricing.sellingPrice - oldPrice) / oldPrice > 0.1) {
            item.alerts.priceChange = true;
            await this.triggerPriceAlert(productId, oldPrice, item.pricing.sellingPrice);
        }

        await this.saveInventory();
        return item;
    }

    async triggerPriceAlert(productId, oldPrice, newPrice) {
        const item = this.inventory.get(productId);
        if (!item) return;

        const changePercent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
        const changeType = newPrice > oldPrice ? 'aumento' : 'redução';

        console.log(`💰 ALERTA DE PREÇO: ${item.name} - ${changeType} de ${changePercent}% (${oldPrice} → ${newPrice})`);
        
        // Resetar alerta
        item.alerts.priceChange = false;
    }

    async getInventoryStatus() {
        const status = {
            total: this.inventory.size,
            available: 0,
            lowStock: 0,
            outOfStock: 0,
            categories: {},
            suppliers: {}
        };

        for (const [id, item] of this.inventory) {
            // Contar por categoria
            if (!status.categories[item.metadata.category]) {
                status.categories[item.metadata.category] = 0;
            }
            status.categories[item.metadata.category]++;

            // Contar por fornecedor
            if (!status.suppliers[item.supplier]) {
                status.suppliers[item.supplier] = 0;
            }
            status.suppliers[item.supplier]++;

            // Contar status de estoque
            if (item.stock.available > 0) {
                status.available++;
            }
            if (item.alerts.lowStock) {
                status.lowStock++;
            }
            if (item.alerts.outOfStock) {
                status.outOfStock++;
            }
        }

        return status;
    }

    async getLowStockProducts() {
        return Array.from(this.inventory.values()).filter(item => item.alerts.lowStock);
    }

    async getOutOfStockProducts() {
        return Array.from(this.inventory.values()).filter(item => item.alerts.outOfStock);
    }

    async loadStockAlerts() {
        try {
            const alertsFile = 'data/stock-alerts.json';
            if (fs.existsSync(alertsFile)) {
                const data = JSON.parse(fs.readFileSync(alertsFile, 'utf8'));
                this.stockAlerts = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('❌ Erro ao carregar alertas de estoque:', error);
        }
    }

    async saveInventory() {
        try {
            const inventoryFile = 'data/inventory.json';
            const data = Object.fromEntries(this.inventory);
            fs.writeFileSync(inventoryFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar inventário:', error);
        }
    }

    async saveStockAlerts() {
        try {
            const alertsFile = 'data/stock-alerts.json';
            const data = Object.fromEntries(this.stockAlerts);
            fs.writeFileSync(alertsFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar alertas de estoque:', error);
        }
    }

    async saveNotification(notification) {
        try {
            const notificationsFile = 'data/notifications.json';
            let notifications = [];
            
            if (fs.existsSync(notificationsFile)) {
                notifications = JSON.parse(fs.readFileSync(notificationsFile, 'utf8'));
            }
            
            notifications.push(notification);
            
            // Manter apenas os últimos 1000 registros
            if (notifications.length > 1000) {
                notifications = notifications.slice(-1000);
            }
            
            fs.writeFileSync(notificationsFile, JSON.stringify(notifications, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar notificação:', error);
        }
    }
}

export default InventoryManagement;

