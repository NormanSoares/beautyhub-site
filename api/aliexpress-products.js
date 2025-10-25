/**
 * Sistema Específico para Produtos AliExpress
 * Busca apenas produtos listados em Fornecedores/Aliexpress.txt
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurações AliExpress
const ALIEXPRESS_CONFIG = {
    apiKey: '520258',
    secretKey: 'YUfgyKXrywwJOhUWZ4nDG2QZzXxdRzsF',
    trackingId: '520258',
    baseUrl: 'https://api-sg.aliexpress.com',
    webhookUrl: 'https://beautyhub-site-1.onrender.com/api/aliexpress-callback'
};

/**
 * Carrega produtos AliExpress do arquivo
 */
function loadAliExpressProducts() {
    try {
        const filePath = path.join(__dirname, '..', 'Fornecedores', 'Aliexpress.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        const products = [];
        lines.forEach((line, index) => {
            if (line.includes('--') && line.includes('aliexpress.com')) {
                const [name, url] = line.split('--');
                const productId = extractProductId(url);
                
                products.push({
                    id: `aliexpress_${index + 1}`,
                    name: name.trim(),
                    url: url.trim(),
                    productId: productId,
                    supplier: 'AliExpress',
                    category: categorizeProduct(name.trim()),
                    lastUpdated: new Date().toISOString()
                });
            }
        });
        
        return products;
    } catch (error) {
        console.error('Erro ao carregar produtos AliExpress:', error);
        return [];
    }
}

/**
 * Extrai ID do produto da URL
 */
function extractProductId(url) {
    const match = url.match(/\/item\/(\d+)/);
    return match ? match[1] : null;
}

/**
 * Categoriza produto baseado no nome
 */
function categorizeProduct(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('sofa') || lowerName.includes('pillow') || lowerName.includes('bed')) {
        return 'conforto';
    } else if (lowerName.includes('makeup') || lowerName.includes('brush') || lowerName.includes('cream') || 
               lowerName.includes('clips') || lowerName.includes('towel') || lowerName.includes('mat')) {
        return 'beleza';
    }
    
    return 'outros';
}

// GET /api/aliexpress-products
router.get('/', (req, res) => {
    try {
        const products = loadAliExpressProducts();
        
        res.json({
            success: true,
            message: 'Produtos AliExpress carregados',
            data: {
                total: products.length,
                products: products,
                categories: {
                    conforto: products.filter(p => p.category === 'conforto').length,
                    beleza: products.filter(p => p.category === 'beleza').length,
                    outros: products.filter(p => p.category === 'outros').length
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/aliexpress-products/:id
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const products = loadAliExpressProducts();
        const product = products.find(p => p.id === id || p.productId === id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Produto não encontrado',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            message: 'Produto encontrado',
            data: product,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/aliexpress-products/search
router.post('/search', (req, res) => {
    try {
        const { query, category } = req.body;
        const products = loadAliExpressProducts();
        
        let filteredProducts = products;
        
        if (query) {
            filteredProducts = products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        if (category) {
            filteredProducts = filteredProducts.filter(p => 
                p.category === category
            );
        }
        
        res.json({
            success: true,
            message: 'Busca realizada com sucesso',
            data: {
                query: query || 'all',
                category: category || 'all',
                total: filteredProducts.length,
                products: filteredProducts
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/aliexpress-products/check-stock
router.post('/check-stock', (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'productId é obrigatório'
            });
        }
        
        // Simular verificação de estoque
        const stockData = {
            productId: productId,
            stock: Math.floor(Math.random() * 100) + 1,
            status: 'in_stock',
            lastChecked: new Date().toISOString(),
            supplier: 'AliExpress',
            rateLimitUsed: '1/1000'
        };
        
        res.json({
            success: true,
            message: 'Estoque verificado',
            data: stockData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/aliexpress-products/update-prices
router.post('/update-prices', (req, res) => {
    try {
        const products = loadAliExpressProducts();
        
        // Simular atualização de preços
        const updatedProducts = products.map(product => ({
            ...product,
            price: (Math.random() * 50 + 5).toFixed(2),
            currency: 'USD',
            lastPriceUpdate: new Date().toISOString()
        }));
        
        res.json({
            success: true,
            message: 'Preços atualizados com sucesso',
            data: {
                totalUpdated: updatedProducts.length,
                products: updatedProducts,
                rateLimitUsed: `${updatedProducts.length}/1000`
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;





