/**
 * Sistema Específico para Produtos Amazon
 * Busca apenas produtos listados em Fornecedores/Amazon.txt
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurações Amazon (quando disponíveis)
const AMAZON_CONFIG = {
    accessKey: 'NOT_CONFIGURED',
    secretKey: 'NOT_CONFIGURED',
    associateTag: 'NOT_CONFIGURED',
    baseUrl: 'https://webservices.amazon.com',
    region: 'us-east-1'
};

/**
 * Carrega produtos Amazon do arquivo
 */
function loadAmazonProducts() {
    try {
        const filePath = path.join(__dirname, '..', 'Fornecedores', 'Amazon.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        const products = [];
        lines.forEach((line, index) => {
            if (line.includes('--') && line.includes('amazon.com')) {
                const [name, url] = line.split('--');
                const asin = extractASIN(url);
                
                products.push({
                    id: `amazon_${index + 1}`,
                    name: name.trim(),
                    url: url.trim(),
                    asin: asin,
                    supplier: 'Amazon',
                    category: categorizeProduct(name.trim()),
                    lastUpdated: new Date().toISOString()
                });
            }
        });
        
        return products;
    } catch (error) {
        console.error('Erro ao carregar produtos Amazon:', error);
        return [];
    }
}

/**
 * Extrai ASIN do produto da URL
 */
function extractASIN(url) {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/);
    return match ? match[1] : null;
}

/**
 * Categoriza produto baseado no nome
 */
function categorizeProduct(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('foundation') || lowerName.includes('primer') || 
        lowerName.includes('massager') || lowerName.includes('therapy') || 
        lowerName.includes('skin care')) {
        return 'beleza';
    }
    
    return 'outros';
}

// GET /api/amazon-products
router.get('/', (req, res) => {
    try {
        const products = loadAmazonProducts();
        
        res.json({
            success: true,
            message: 'Produtos Amazon carregados',
            data: {
                total: products.length,
                products: products,
                categories: {
                    beleza: products.filter(p => p.category === 'beleza').length,
                    outros: products.filter(p => p.category === 'outros').length
                },
                config: {
                    status: 'credentials_not_configured',
                    note: 'Credenciais Amazon não configuradas ainda'
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

// GET /api/amazon-products/:id
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const products = loadAmazonProducts();
        const product = products.find(p => p.id === id || p.asin === id);
        
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

// POST /api/amazon-products/search
router.post('/search', (req, res) => {
    try {
        const { query, category } = req.body;
        const products = loadAmazonProducts();
        
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
                products: filteredProducts,
                note: 'Busca local - API Amazon não configurada'
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

// POST /api/amazon-products/check-stock
router.post('/check-stock', (req, res) => {
    try {
        const { asin } = req.body;
        
        if (!asin) {
            return res.status(400).json({
                success: false,
                error: 'ASIN é obrigatório'
            });
        }
        
        // Simular verificação de estoque (sem API real)
        const stockData = {
            asin: asin,
            stock: Math.floor(Math.random() * 50) + 1,
            status: 'in_stock',
            lastChecked: new Date().toISOString(),
            supplier: 'Amazon',
            note: 'Verificação simulada - API Amazon não configurada'
        };
        
        res.json({
            success: true,
            message: 'Estoque verificado (simulado)',
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

// POST /api/amazon-products/update-prices
router.post('/update-prices', (req, res) => {
    try {
        const products = loadAmazonProducts();
        
        // Simular atualização de preços (sem API real)
        const updatedProducts = products.map(product => ({
            ...product,
            price: (Math.random() * 100 + 10).toFixed(2),
            currency: 'USD',
            lastPriceUpdate: new Date().toISOString(),
            note: 'Preços simulados - API Amazon não configurada'
        }));
        
        res.json({
            success: true,
            message: 'Preços atualizados (simulados)',
            data: {
                totalUpdated: updatedProducts.length,
                products: updatedProducts,
                note: 'Atualização simulada - API Amazon não configurada'
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

// GET /api/amazon-products/config/status
router.get('/config/status', (req, res) => {
    res.json({
        success: true,
        message: 'Status da configuração Amazon',
        data: {
            status: 'not_configured',
            credentials: {
                accessKey: AMAZON_CONFIG.accessKey,
                secretKey: AMAZON_CONFIG.secretKey,
                associateTag: AMAZON_CONFIG.associateTag
            },
            note: 'Credenciais Amazon não configuradas ainda',
            nextSteps: [
                'Obter credenciais da Amazon Product Advertising API',
                'Configurar accessKey e secretKey',
                'Configurar associateTag',
                'Testar integração com API real'
            ],
            timestamp: new Date().toISOString()
        }
    });
});

export default router;

