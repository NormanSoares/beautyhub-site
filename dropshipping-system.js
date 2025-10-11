/**
 * Sistema Completo de Dropshipping
 * Integração com AliExpress e Amazon
 * 67 Beauty Hub
 */

import puppeteer from 'puppeteer';
import axios from 'axios';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

class DropshippingSystem {
    constructor() {
        this.browser = null;
        this.products = new Map();
        this.priceHistory = new Map();
        this.stockStatus = new Map();
        this.config = {
            updateInterval: '0 */6 * * *', // A cada 6 horas
            priceChangeThreshold: 0.05, // 5% de mudança
            stockCheckInterval: '0 */2 * * *', // A cada 2 horas
            maxRetries: 3,
            timeout: 30000
        };
    }

    async initialize() {
        console.log('🚀 Inicializando Sistema de Dropshipping...');
        
        // Inicializar browser
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        // Carregar produtos dos fornecedores
        await this.loadSupplierProducts();
        
        // Configurar agendamentos
        this.setupSchedulers();
        
        console.log('✅ Sistema de Dropshipping inicializado com sucesso!');
    }

    async loadSupplierProducts() {
        console.log('📦 Carregando produtos dos fornecedores...');
        
        try {
            // Carregar produtos do AliExpress
            const aliexpressProducts = await this.parseSupplierFile('Fornecedores/Aliexpress.txt');
            aliexpressProducts.forEach(product => {
                this.products.set(product.id, {
                    ...product,
                    supplier: 'aliexpress',
                    lastUpdate: new Date(),
                    status: 'active'
                });
            });

            // Carregar produtos do Amazon
            const amazonProducts = await this.parseSupplierFile('Fornecedores/Amazon.txt');
            amazonProducts.forEach(product => {
                this.products.set(product.id, {
                    ...product,
                    supplier: 'amazon',
                    lastUpdate: new Date(),
                    status: 'active'
                });
            });

            console.log(`✅ ${this.products.size} produtos carregados dos fornecedores`);
        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
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
                        originalPrice: null,
                        currentPrice: null,
                        stock: 'unknown',
                        images: [],
                        description: '',
                        variations: []
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

    setupSchedulers() {
        console.log('⏰ Configurando agendamentos...');
        
        // Atualização de preços a cada 6 horas
        cron.schedule(this.config.updateInterval, async () => {
            console.log('🔄 Iniciando atualização de preços...');
            await this.updateAllPrices();
        });

        // Verificação de estoque a cada 2 horas
        cron.schedule(this.config.stockCheckInterval, async () => {
            console.log('📦 Verificando estoque...');
            await this.checkAllStock();
        });

        // Backup diário dos dados
        cron.schedule('0 2 * * *', async () => {
            console.log('💾 Fazendo backup dos dados...');
            await this.backupData();
        });
    }

    async updateAllPrices() {
        const promises = [];
        
        for (const [productId, product] of this.products) {
            promises.push(this.updateProductPrice(productId, product));
        }

        await Promise.allSettled(promises);
        await this.savePriceHistory();
    }

    async updateProductPrice(productId, product) {
        try {
            console.log(`💰 Atualizando preço: ${product.name}`);
            
            let priceData;
            if (product.supplier === 'aliexpress') {
                priceData = await this.scrapeAliExpressPrice(product.url);
            } else if (product.supplier === 'amazon') {
                priceData = await this.scrapeAmazonPrice(product.url);
            }

            if (priceData) {
                const oldPrice = product.currentPrice;
                product.currentPrice = priceData.price;
                product.originalPrice = priceData.originalPrice || priceData.price;
                product.stock = priceData.stock;
                product.lastUpdate = new Date();

                // Verificar mudança significativa de preço
                if (oldPrice && this.hasSignificantPriceChange(oldPrice, priceData.price)) {
                    await this.notifyPriceChange(productId, product, oldPrice, priceData.price);
                }

                // Atualizar histórico de preços
                this.updatePriceHistory(productId, priceData.price);
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar preço do produto ${productId}:`, error);
        }
    }

    async scrapeAliExpressPrice(url) {
        const page = await this.browser.newPage();
        
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: this.config.timeout });
            
            // Aguardar carregamento dos elementos de preço
            await page.waitForSelector('.notranslate', { timeout: 10000 });
            
            const priceData = await page.evaluate(() => {
                const priceElement = document.querySelector('.notranslate');
                const originalPriceElement = document.querySelector('.price-original');
                const stockElement = document.querySelector('.product-quantity-tip');
                
                let price = null;
                let originalPrice = null;
                let stock = 'available';
                
                if (priceElement) {
                    const priceText = priceElement.textContent.replace(/[^\d.,]/g, '');
                    price = parseFloat(priceText.replace(',', '.'));
                }
                
                if (originalPriceElement) {
                    const originalPriceText = originalPriceElement.textContent.replace(/[^\d.,]/g, '');
                    originalPrice = parseFloat(originalPriceText.replace(',', '.'));
                }
                
                if (stockElement && stockElement.textContent.includes('esgotado')) {
                    stock = 'out_of_stock';
                }
                
                return { price, originalPrice, stock };
            });
            
            return priceData;
        } finally {
            await page.close();
        }
    }

    async scrapeAmazonPrice(url) {
        const page = await this.browser.newPage();
        
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: this.config.timeout });
            
            const priceData = await page.evaluate(() => {
                const priceElement = document.querySelector('.a-price-whole');
                const originalPriceElement = document.querySelector('.a-price-was');
                const stockElement = document.querySelector('#availability');
                
                let price = null;
                let originalPrice = null;
                let stock = 'available';
                
                if (priceElement) {
                    const priceText = priceElement.textContent.replace(/[^\d.,]/g, '');
                    price = parseFloat(priceText);
                }
                
                if (originalPriceElement) {
                    const originalPriceText = originalPriceElement.textContent.replace(/[^\d.,]/g, '');
                    originalPrice = parseFloat(originalPriceText);
                }
                
                if (stockElement && stockElement.textContent.includes('unavailable')) {
                    stock = 'out_of_stock';
                }
                
                return { price, originalPrice, stock };
            });
            
            return priceData;
        } finally {
            await page.close();
        }
    }

    hasSignificantPriceChange(oldPrice, newPrice) {
        if (!oldPrice || !newPrice) return false;
        const changePercent = Math.abs(newPrice - oldPrice) / oldPrice;
        return changePercent >= this.config.priceChangeThreshold;
    }

    async notifyPriceChange(productId, product, oldPrice, newPrice) {
        const changePercent = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
        const changeType = newPrice > oldPrice ? 'aumento' : 'redução';
        
        console.log(`📢 ALERTA: ${product.name} - ${changeType} de ${changePercent}% (${oldPrice} → ${newPrice})`);
        
        // Aqui você pode adicionar notificações por email, webhook, etc.
        await this.logPriceAlert(productId, product, oldPrice, newPrice, changePercent);
    }

    async logPriceAlert(productId, product, oldPrice, newPrice, changePercent) {
        const alert = {
            timestamp: new Date(),
            productId,
            productName: product.name,
            supplier: product.supplier,
            oldPrice,
            newPrice,
            changePercent: parseFloat(changePercent),
            url: product.url
        };
        
        const logFile = `logs/price-alerts-${new Date().toISOString().split('T')[0]}.json`;
        const alerts = this.loadAlerts(logFile);
        alerts.push(alert);
        
        fs.writeFileSync(logFile, JSON.stringify(alerts, null, 2));
    }

    loadAlerts(logFile) {
        try {
            if (fs.existsSync(logFile)) {
                return JSON.parse(fs.readFileSync(logFile, 'utf8'));
            }
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
        }
        return [];
    }

    updatePriceHistory(productId, price) {
        if (!this.priceHistory.has(productId)) {
            this.priceHistory.set(productId, []);
        }
        
        const history = this.priceHistory.get(productId);
        history.push({
            timestamp: new Date(),
            price
        });
        
        // Manter apenas os últimos 30 registros
        if (history.length > 30) {
            history.shift();
        }
    }

    async checkAllStock() {
        for (const [productId, product] of this.products) {
            try {
                await this.checkProductStock(productId, product);
            } catch (error) {
                console.error(`❌ Erro ao verificar estoque do produto ${productId}:`, error);
            }
        }
    }

    async checkProductStock(productId, product) {
        // Implementar verificação de estoque específica para cada fornecedor
        console.log(`📦 Verificando estoque: ${product.name}`);
        // Lógica de verificação de estoque aqui
    }

    async backupData() {
        const backupData = {
            timestamp: new Date(),
            products: Object.fromEntries(this.products),
            priceHistory: Object.fromEntries(this.priceHistory),
            stockStatus: Object.fromEntries(this.stockStatus)
        };
        
        const backupFile = `backups/dropshipping-backup-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`💾 Backup salvo: ${backupFile}`);
    }

    async savePriceHistory() {
        const historyFile = 'data/price-history.json';
        const historyData = Object.fromEntries(this.priceHistory);
        fs.writeFileSync(historyFile, JSON.stringify(historyData, null, 2));
    }

    async getProductData(productId) {
        return this.products.get(productId);
    }

    async getAllProducts() {
        return Object.fromEntries(this.products);
    }

    async getPriceHistory(productId) {
        return this.priceHistory.get(productId) || [];
    }

    async shutdown() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🛑 Sistema de Dropshipping encerrado');
    }
}

export default DropshippingSystem;

