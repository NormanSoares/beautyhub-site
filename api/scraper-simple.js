/**
 * Scraper Simplificado
 * Versão sem dependências complexas
 */

import express from 'express';
const router = express.Router();

// GET /api/scraper-simple
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Scraper API funcionando',
        data: {
            products: [
                {
                    id: 'product_001',
                    name: 'PHOERA Foundation',
                    price: 17.45,
                    currency: 'USD',
                    stock: 'in_stock',
                    supplier: 'AliExpress',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 'product_002',
                    name: 'Alligator Hair Clips',
                    price: 8.99,
                    currency: 'USD', 
                    stock: 'in_stock',
                    supplier: 'AliExpress',
                    lastUpdated: new Date().toISOString()
                }
            ]
        },
        timestamp: new Date().toISOString()
    });
});

// POST /api/scraper-simple/scrape
router.post('/scrape', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL é obrigatória'
        });
    }
    
    res.json({
        success: true,
        message: 'Scraping iniciado com sucesso',
        data: {
            url,
            productId: 'scraped_' + Date.now(),
            status: 'processing',
            estimatedTime: '30-60 segundos',
            timestamp: new Date().toISOString()
        }
    });
});

// GET /api/scraper-simple/stock/:id
router.get('/stock/:id', (req, res) => {
    const { id } = req.params;
    
    res.json({
        success: true,
        message: 'Dados de estoque obtidos',
        data: {
            productId: id,
            stock: Math.floor(Math.random() * 100) + 1,
            status: 'in_stock',
            lastChecked: new Date().toISOString()
        }
    });
});

export default router;





