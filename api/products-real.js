/**
 * API de Produtos Reais - 67 Beauty Hub
 * Endpoint para produtos dos fornecedores sem dependência do MongoDB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache de produtos
let productsCache = null;
let lastUpdate = null;

/**
 * Obter preço realista baseado no nome do produto
 */
function getRealisticPrice(productName) {
    const priceMap = {
        'Detachable Sofa Cover Bean Bag Cover Lazy Person\'s Couch': 45.00,
        'Human Dog bad': 25.00,
        'SNOOZE BUNDLE': 35.00,
        '8pcs Makeup Brush': 8.00,
        'Alligator Hair Clips': 3.00,
        'Towel cloth-pink': 2.50,
        '10pcsTouMing-blue': 5.00,
        'Heat-Resistant Mat': 1.50,
        'LAIKOU Vitamin C 24K Golden Sakura Skin Care Sets Face Cream': 15.00,
        'type1 set nobox': 12.00,
        '2 Pack PHOERA Foundation': 80.00,
        '2 Pack PHOERA Primer': 65.00,
        'Face and Neck Massager Tool, 7-in-1 Color Red-Light-Therapy Wand for Skin Care': 120.00
    };
    
    return priceMap[productName] || 25.00;
}

/**
 * Mapear nomes de produtos para imagens específicas
 */
function getProductImage(productName) {
    const imageMap = {
        'Detachable Sofa Cover Bean Bag Cover Lazy Person\'s Couch': 'Produtos de conforto/Detachable Sofa Cover Bean Bag Cover Lazy Person\'s Couch/Apresentação.jpeg',
        'Human Dog bad': 'Produtos de conforto/Human Dog bad/Apresentação.jpeg',
        'SNOOZE BUNDLE': 'Produtos de conforto/SNOOZE BUNDLE/apresentação.jpg',
        '8pcs Makeup Brush': 'Produtos de beleza/2 Pack PHOERA Foundation + Combo/8pcs Makeup Brush.png',
        'Alligator Hair Clips': 'Produtos de beleza/Alligator Hair Clips + Combo/Nude Pink (6 Pieces).png',
        'Towel cloth-pink': 'Produtos de beleza/Alligator Hair Clips + Combo/Towel cloth-pink.png',
        '10pcsTouMing-blue': 'Produtos de beleza/Alligator Hair Clips + Combo/10pcsTouMing-blue.png',
        'Heat-Resistant Mat': 'Produtos de beleza/Heat-Resistant Mat + Combo/Apresentação 1.png',
        'LAIKOU Vitamin C 24K Golden Sakura Skin Care Sets Face Cream': 'Produtos de beleza/LAIKOU Vitamin C 24K Golden Sakura Skin Care Sets Face Cream/Apresentação.png',
        'type1 set nobox': 'Produtos de beleza/Wrinkle Reducer - Red Light Therapy + Combo/type1 set nobox.png',
        '2 Pack PHOERA Foundation': 'Produtos de beleza/2 Pack PHOERA Foundation + Combo/Apresentação 1.png',
        '2 Pack PHOERA Primer': 'Produtos de beleza/2 Pack PHOERA Foundation + Combo/2 Pack PHOERA Primer.png',
        'Face and Neck Massager Tool, 7-in-1 Color Red-Light-Therapy Wand for Skin Care': 'Produtos de beleza/Wrinkle Reducer - Red Light Therapy + Combo/Face and Neck Massager Tool, 7-in-1 Color Red-Light-Therapy Wand for Skin Care.png'
    };
    
    return imageMap[productName] || 'Produtos de beleza/2 Pack PHOERA Foundation + Combo/Apresentação 1.png';
}

/**
 * Ler produtos dos fornecedores
 */
function loadSupplierProducts() {
    const aliexpressFile = path.join(__dirname, '..', 'Fornecedores', 'Aliexpress.txt');
    const amazonFile = path.join(__dirname, '..', 'Fornecedores', 'Amazon.txt');
    
    const products = [];
    
    // Ler AliExpress
    if (fs.existsSync(aliexpressFile)) {
        const content = fs.readFileSync(aliexpressFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach((line, index) => {
            if (line.includes('http')) {
                const parts = line.split('--');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const url = parts[1].trim();
                    const imagePath = getProductImage(name);
                    
                    products.push({
                        id: `aliexpress_${index + 1}`,
                        name: name,
                        url: url,
                        platform: 'aliexpress',
                        price: getRealisticPrice(name),
                        currency: 'BRL',
                        category: 'beauty',
                        stock: 'in_stock',
                        rating: 4.5,
                        supplier: 'AliExpress',
                        image: imagePath,
                        description: `Produto ${name} disponível no AliExpress com entrega rápida.`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        });
    }
    
    // Ler Amazon
    if (fs.existsSync(amazonFile)) {
        const content = fs.readFileSync(amazonFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach((line, index) => {
            if (line.includes('http')) {
                const parts = line.split('--');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const url = parts[1].trim();
                    const imagePath = getProductImage(name);
                    
                    products.push({
                        id: `amazon_${index + 1}`,
                        name: name,
                        url: url,
                        platform: 'amazon',
                        price: getRealisticPrice(name),
                        currency: 'BRL',
                        category: 'beauty',
                        stock: 'in_stock',
                        rating: 4.7,
                        supplier: 'Amazon',
                        image: imagePath,
                        description: `Produto ${name} disponível na Amazon com entrega rápida.`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        });
    }
    
    return products;
}

/**
 * Obter produtos (com cache)
 */
function getProducts() {
    const now = new Date();
    
    // Cache válido por 5 minutos
    if (!productsCache || !lastUpdate || (now - lastUpdate) > 5 * 60 * 1000) {
        productsCache = loadSupplierProducts();
        lastUpdate = now;
        console.log(`📦 Produtos carregados: ${productsCache.length} itens`);
    }
    
    return productsCache;
}

/**
 * API de Produtos Reais
 */
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const action = req.query.action || 'list';
        const limit = parseInt(req.query.limit) || 50;
        const platform = req.query.platform;
        const category = req.query.category;
        
        let products = getProducts();
        
        // Filtrar por plataforma
        if (platform) {
            products = products.filter(p => p.platform === platform);
        }
        
        // Filtrar por categoria
        if (category) {
            products = products.filter(p => p.category === category);
        }
        
        // Limitar resultados
        products = products.slice(0, limit);
        
        switch (action) {
            case 'list':
                return res.status(200).json({
                    success: true,
                    data: products,
                    count: products.length,
                    total: getProducts().length,
                    filters: {
                        platform: platform || 'all',
                        category: category || 'all',
                        limit: limit
                    },
                    timestamp: new Date().toISOString()
                });
                
            case 'stats':
                const allProducts = getProducts();
                const stats = {
                    total: allProducts.length,
                    aliexpress: allProducts.filter(p => p.platform === 'aliexpress').length,
                    amazon: allProducts.filter(p => p.platform === 'amazon').length,
                    in_stock: allProducts.filter(p => p.stock === 'in_stock').length,
                    categories: [...new Set(allProducts.map(p => p.category))],
                    platforms: [...new Set(allProducts.map(p => p.platform))]
                };
                
                return res.status(200).json({
                    success: true,
                    data: stats,
                    timestamp: new Date().toISOString()
                });
                
            case 'search':
                const query = req.query.q;
                if (!query) {
                    return res.status(400).json({
                        success: false,
                        error: 'Parâmetro de busca (q) é obrigatório'
                    });
                }
                
                const searchResults = getProducts().filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.description.toLowerCase().includes(query.toLowerCase())
                );
                
                return res.status(200).json({
                    success: true,
                    data: searchResults,
                    count: searchResults.length,
                    query: query,
                    timestamp: new Date().toISOString()
                });
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Ação não reconhecida',
                    available_actions: ['list', 'stats', 'search']
                });
        }
        
    } catch (error) {
        console.error('Erro na API de produtos reais:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
