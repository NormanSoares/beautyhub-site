/**
 * API de Preços Ativos - Sistema de Sincronização Automática
 * Sincroniza preços do AliExpress com margens aplicadas
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cache de preços ativos
let activePricesCache = {};
let lastUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Configurações de margem por produto
const MARGIN_CONFIG = {
    'phoera_foundation': 50,      // 50% margem
    'wrinkle_reducer': 50,        // 50% margem
    'heat_resistant_mat': 60,     // 60% margem
    'alligator_hair_clips': 55,   // 55% margem
    'laikou_golden_sakura': 45,   // 45% margem
    'snooze_bundle': 50,          // 50% margem
    'human_dog_bed': 40,          // 40% margem
    'detachable_sofa_cover': 50   // 50% margem
};

// Taxas de câmbio (atualizadas automaticamente)
let exchangeRates = {
    'USD': 1.00,
    'BRL': 5.27,
    'EUR': 0.92
};

/**
 * Carrega preços dos fornecedores
 */
function loadSupplierPrices() {
    try {
        const aliexpressFile = path.join(__dirname, '..', 'Fornecedores', 'Aliexpress.txt');
        const products = [];
        
        if (fs.existsSync(aliexpressFile)) {
            const content = fs.readFileSync(aliexpressFile, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            
            lines.forEach((line, index) => {
                if (line.includes('http')) {
                    const parts = line.split('--');
                    if (parts.length >= 2) {
                        const name = parts[0].trim();
                        const url = parts[1].trim();
                        
                        // Mapear nome para ID do produto
                        const productId = mapProductNameToId(name);
                        const margin = MARGIN_CONFIG[productId] || 50;
                        
                        // Preço base do fornecedor (simulado - em produção viria do scraping)
                        const basePrice = getBasePrice(productId);
                        
                        products.push({
                            productId: productId,
                            name: name,
                            url: url,
                            supplierPrice: basePrice,
                            margin: margin,
                            finalPrice: basePrice * (1 + margin/100),
                            currency: 'USD',
                            lastUpdated: new Date().toISOString()
                        });
                    }
                }
            });
        }
        
        return products;
    } catch (error) {
        console.error('Erro ao carregar preços dos fornecedores:', error);
        return [];
    }
}

/**
 * Mapeia nome do produto para ID
 */
function mapProductNameToId(name) {
    const mapping = {
        'PHOERA Foundation': 'phoera_foundation',
        'Wrinkle Reducer': 'wrinkle_reducer',
        'Heat Resistant Mat': 'heat_resistant_mat',
        'Alligator Hair Clips': 'alligator_hair_clips',
        'Laikou Golden Sakura': 'laikou_golden_sakura',
        'Snooze Bundle': 'snooze_bundle',
        'Human Dog Bed': 'human_dog_bed',
        'Detachable Sofa Cover': 'detachable_sofa_cover'
    };
    
    for (const [key, value] of Object.entries(mapping)) {
        if (name.includes(key)) {
            return value;
        }
    }
    
    return 'phoera_foundation'; // default
}

/**
 * Obtém preço base do produto
 */
function getBasePrice(productId) {
    const basePrices = {
        'phoera_foundation': 8.70,
        'wrinkle_reducer': 11.63,
        'heat_resistant_mat': 2.29,
        'alligator_hair_clips': 1.50,
        'laikou_golden_sakura': 12.99,
        'snooze_bundle': 15.99,
        'human_dog_bed': 25.99,
        'detachable_sofa_cover': 19.99
    };
    
    return basePrices[productId] || 10.00;
}

/**
 * Calcula preços com margem para todas as moedas
 */
function calculatePricesWithMargin(supplierPrice, margin) {
    const prices = {};
    
    for (const [currency, rate] of Object.entries(exchangeRates)) {
        const basePrice = supplierPrice * rate;
        const finalPrice = basePrice * (1 + margin/100);
        
        prices[currency] = {
            supplierPrice: basePrice,
            finalPrice: finalPrice,
            margin: margin,
            currency: currency
        };
    }
    
    return prices;
}

/**
 * Atualiza cache de preços ativos
 */
function updateActivePricesCache() {
    console.log('🔄 Atualizando cache de preços ativos...');
    
    const supplierProducts = loadSupplierPrices();
    const updatedCache = {};
    
    supplierProducts.forEach(product => {
        const prices = calculatePricesWithMargin(product.supplierPrice, product.margin);
        
        updatedCache[product.productId] = {
            name: product.name,
            url: product.url,
            supplierPrice: product.supplierPrice,
            margin: product.margin,
            prices: prices,
            lastUpdated: new Date().toISOString()
        };
    });
    
    activePricesCache = updatedCache;
    lastUpdate = new Date();
    
    console.log('✅ Cache de preços atualizado:', Object.keys(updatedCache).length, 'produtos');
}

/**
 * Verifica se cache precisa ser atualizado
 */
function shouldUpdateCache() {
    if (!lastUpdate) return true;
    
    const now = new Date();
    const timeDiff = now - lastUpdate;
    
    return timeDiff > CACHE_DURATION;
}

/**
 * Obtém preços ativos (com cache)
 */
function getActivePrices() {
    if (shouldUpdateCache()) {
        updateActivePricesCache();
    }
    
    return activePricesCache;
}

/**
 * Obtém preço específico de um produto
 */
function getProductPrice(productId, currency = 'USD') {
    const activePrices = getActivePrices();
    const product = activePrices[productId];
    
    if (!product) {
        return null;
    }
    
    return product.prices[currency] || product.prices['USD'];
}

/**
 * Atualiza preços de um produto específico
 */
function updateProductPrice(productId, newSupplierPrice) {
    const activePrices = getActivePrices();
    const product = activePrices[productId];
    
    if (!product) {
        return false;
    }
    
    // Recalcular preços com novo preço do fornecedor
    const prices = calculatePricesWithMargin(newSupplierPrice, product.margin);
    
    activePrices[productId].supplierPrice = newSupplierPrice;
    activePrices[productId].prices = prices;
    activePrices[productId].lastUpdated = new Date().toISOString();
    
    console.log(`✅ Preço atualizado para ${productId}: $${newSupplierPrice}`);
    return true;
}

// Middleware CORS
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// Rota GET - Buscar preços
router.get('/', (req, res) => {
    try {
        const { productId, currency } = req.query;
        
        if (productId) {
            // Buscar preço específico de um produto
            const price = getProductPrice(productId, currency);
            
            if (price) {
                res.status(200).json({
                    success: true,
                    data: price,
                    productId: productId,
                    currency: currency || 'USD'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Produto não encontrado'
                });
            }
        } else {
            // Buscar todos os preços ativos
            const activePrices = getActivePrices();
            
            res.status(200).json({
                success: true,
                data: activePrices,
                lastUpdated: lastUpdate,
                totalProducts: Object.keys(activePrices).length
            });
        }
    } catch (error) {
        console.error('Erro na API de preços ativos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota POST - Atualizar preços
router.post('/', (req, res) => {
    try {
        const { productId, supplierPrice } = req.body;
        
        if (!productId || !supplierPrice) {
            res.status(400).json({
                success: false,
                error: 'productId e supplierPrice são obrigatórios'
            });
            return;
        }
        
        const updated = updateProductPrice(productId, parseFloat(supplierPrice));
        
        if (updated) {
            res.status(200).json({
                success: true,
                message: 'Preço atualizado com sucesso',
                productId: productId,
                newPrice: getProductPrice(productId)
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Produto não encontrado'
            });
        }
    } catch (error) {
        console.error('Erro na API de preços ativos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Inicializar cache na primeira execução
updateActivePricesCache();

export default router;