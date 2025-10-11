/**
 * API de Fornecedores - 67 Beauty Hub
 * Gerencia acesso aos fornecedores Amazon e AliExpress
 */

import { MongoClient } from 'mongodb';
import { getMongoURI } from '../mongodb-config.js';

/**
 * API de Fornecedores
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
        const action = req.query.action;
        
        switch (action) {
            case 'list':
                return await listSuppliers(req, res);
            case 'amazon':
                return await getAmazonSuppliers(req, res);
            case 'aliexpress':
                return await getAliExpressSuppliers(req, res);
            case 'contact':
                return await getSupplierContact(req, res);
            case 'products':
                return await getSupplierProducts(req, res);
            default:
                return await getAllSuppliers(req, res);
        }
        
    } catch (error) {
        console.error('Erro na API de fornecedores:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Listar todos os fornecedores
 */
async function getAllSuppliers(req, res) {
    const suppliers = {
        aliexpress: {
            phoera_official: {
                storeId: 'PHOERA_STORE_001',
                name: 'PHOERA Official Store',
                sellerId: '123456789',
                location: 'China',
                contact: {
                    email: 'orders@phoera.com',
                    phone: '+86 123 456 7890',
                    address: '123 Beauty Lane, Guangzhou, China'
                },
                products: [
                    'PHOERA Foundation',
                    '2 Pack PHOERA Foundation + Combo'
                ],
                shipping: {
                    standard: { time: '15-25 days', cost: 0 },
                    express: { time: '7-15 days', cost: 15.99 }
                },
                minOrderValue: 50.00,
                currency: 'USD'
            },
            hair_tools_pro: {
                storeId: 'HAIR_TOOLS_001',
                name: 'Hair Tools Pro Store',
                sellerId: '987654321',
                location: 'China',
                contact: {
                    email: 'sales@hairtoolspro.com',
                    phone: '+86 987 654 3210',
                    address: '456 Hair Street, Shenzhen, China'
                },
                products: [
                    'Alligator Hair Clips',
                    'Hair Styling Tools'
                ],
                shipping: {
                    standard: { time: '10-20 days', cost: 0 },
                    express: { time: '5-10 days', cost: 12.99 }
                },
                minOrderValue: 30.00,
                currency: 'USD'
            }
        },
        amazon: {
            phoera_amazon: {
                asin: 'B07SJYX8DV',
                name: 'PHOERA Foundation - Amazon',
                seller: 'PHOERA Cosmetics',
                location: 'USA',
                contact: {
                    email: 'amazon@phoera.com',
                    phone: '+1 (555) 123-4567',
                    address: '123 Beauty Lane, Los Angeles, CA 90210'
                },
                products: [
                    'PHOERA Foundation',
                    '2 Pack PHOERA Foundation + Combo'
                ],
                shipping: {
                    prime: { time: '1-2 days', cost: 0 },
                    standard: { time: '3-5 days', cost: 4.99 }
                },
                minOrderValue: 25.00,
                currency: 'USD'
            },
            heat_mat_amazon: {
                asin: 'B07CNSXKZW',
                name: 'Heat-Resistant Mat - Amazon',
                seller: 'Professional Tools Co',
                location: 'USA',
                contact: {
                    email: 'sales@protools.com',
                    phone: '+1 (555) 987-6543',
                    address: '789 Tools Ave, Chicago, IL 60601'
                },
                products: [
                    'Heat-Resistant Mat',
                    'Professional Silicone Mat'
                ],
                shipping: {
                    prime: { time: '1-2 days', cost: 0 },
                    standard: { time: '3-5 days', cost: 5.99 }
                },
                minOrderValue: 20.00,
                currency: 'USD'
            }
        }
    };
    
    return res.status(200).json({
        success: true,
        data: suppliers,
        count: Object.keys(suppliers.aliexpress).length + Object.keys(suppliers.amazon).length,
        timestamp: new Date().toISOString()
    });
}

/**
 * Listar fornecedores
 */
async function listSuppliers(req, res) {
    const suppliers = [
        {
            id: 'phoera_official',
            name: 'PHOERA Official Store',
            platform: 'AliExpress',
            location: 'China',
            products: 2,
            status: 'active'
        },
        {
            id: 'hair_tools_pro',
            name: 'Hair Tools Pro Store',
            platform: 'AliExpress',
            location: 'China',
            products: 2,
            status: 'active'
        },
        {
            id: 'phoera_amazon',
            name: 'PHOERA Foundation - Amazon',
            platform: 'Amazon',
            location: 'USA',
            products: 2,
            status: 'active'
        },
        {
            id: 'heat_mat_amazon',
            name: 'Heat-Resistant Mat - Amazon',
            platform: 'Amazon',
            location: 'USA',
            products: 2,
            status: 'active'
        }
    ];
    
    return res.status(200).json({
        success: true,
        data: suppliers,
        count: suppliers.length,
        timestamp: new Date().toISOString()
    });
}

/**
 * Fornecedores Amazon
 */
async function getAmazonSuppliers(req, res) {
    const amazonSuppliers = {
        phoera_amazon: {
            asin: 'B07SJYX8DV',
            name: 'PHOERA Foundation - Amazon',
            seller: 'PHOERA Cosmetics',
            location: 'USA',
            contact: {
                email: 'amazon@phoera.com',
                phone: '+1 (555) 123-4567',
                address: '123 Beauty Lane, Los Angeles, CA 90210'
            },
            products: [
                'PHOERA Foundation',
                '2 Pack PHOERA Foundation + Combo'
            ],
            shipping: {
                prime: { time: '1-2 days', cost: 0 },
                standard: { time: '3-5 days', cost: 4.99 }
            },
            minOrderValue: 25.00,
            currency: 'USD'
        },
        heat_mat_amazon: {
            asin: 'B07CNSXKZW',
            name: 'Heat-Resistant Mat - Amazon',
            seller: 'Professional Tools Co',
            location: 'USA',
            contact: {
                email: 'sales@protools.com',
                phone: '+1 (555) 987-6543',
                address: '789 Tools Ave, Chicago, IL 60601'
            },
            products: [
                'Heat-Resistant Mat',
                'Professional Silicone Mat'
            ],
            shipping: {
                prime: { time: '1-2 days', cost: 0 },
                standard: { time: '3-5 days', cost: 5.99 }
            },
            minOrderValue: 20.00,
            currency: 'USD'
        }
    };
    
    return res.status(200).json({
        success: true,
        data: amazonSuppliers,
        count: Object.keys(amazonSuppliers).length,
        timestamp: new Date().toISOString()
    });
}

/**
 * Fornecedores AliExpress
 */
async function getAliExpressSuppliers(req, res) {
    const aliexpressSuppliers = {
        phoera_official: {
            storeId: 'PHOERA_STORE_001',
            name: 'PHOERA Official Store',
            sellerId: '123456789',
            location: 'China',
            contact: {
                email: 'orders@phoera.com',
                phone: '+86 123 456 7890',
                address: '123 Beauty Lane, Guangzhou, China'
            },
            products: [
                'PHOERA Foundation',
                '2 Pack PHOERA Foundation + Combo'
            ],
            shipping: {
                standard: { time: '15-25 days', cost: 0 },
                express: { time: '7-15 days', cost: 15.99 }
            },
            minOrderValue: 50.00,
            currency: 'USD'
        },
        hair_tools_pro: {
            storeId: 'HAIR_TOOLS_001',
            name: 'Hair Tools Pro Store',
            sellerId: '987654321',
            location: 'China',
            contact: {
                email: 'sales@hairtoolspro.com',
                phone: '+86 987 654 3210',
                address: '456 Hair Street, Shenzhen, China'
            },
            products: [
                'Alligator Hair Clips',
                'Hair Styling Tools'
            ],
            shipping: {
                standard: { time: '10-20 days', cost: 0 },
                express: { time: '5-10 days', cost: 12.99 }
            },
            minOrderValue: 30.00,
            currency: 'USD'
        }
    };
    
    return res.status(200).json({
        success: true,
        data: aliexpressSuppliers,
        count: Object.keys(aliexpressSuppliers).length,
        timestamp: new Date().toISOString()
    });
}

/**
 * Contato do fornecedor
 */
async function getSupplierContact(req, res) {
    const supplierId = req.query.supplier_id;
    
    if (!supplierId) {
        return res.status(400).json({
            success: false,
            error: 'ID do fornecedor é obrigatório'
        });
    }
    
    // Simular dados de contato
    const contacts = {
        'phoera_official': {
            email: 'orders@phoera.com',
            phone: '+86 123 456 7890',
            address: '123 Beauty Lane, Guangzhou, China',
            contactPerson: 'Maria Rodriguez',
            businessHours: '9:00 AM - 6:00 PM (GMT+8)',
            responseTime: '24-48 horas'
        },
        'hair_tools_pro': {
            email: 'sales@hairtoolspro.com',
            phone: '+86 987 654 3210',
            address: '456 Hair Street, Shenzhen, China',
            contactPerson: 'John Chen',
            businessHours: '8:00 AM - 5:00 PM (GMT+8)',
            responseTime: '12-24 horas'
        },
        'phoera_amazon': {
            email: 'amazon@phoera.com',
            phone: '+1 (555) 123-4567',
            address: '123 Beauty Lane, Los Angeles, CA 90210',
            contactPerson: 'Sarah Johnson',
            businessHours: '9:00 AM - 5:00 PM (PST)',
            responseTime: '2-4 horas'
        },
        'heat_mat_amazon': {
            email: 'sales@protools.com',
            phone: '+1 (555) 987-6543',
            address: '789 Tools Ave, Chicago, IL 60601',
            contactPerson: 'Mike Wilson',
            businessHours: '8:00 AM - 4:00 PM (CST)',
            responseTime: '1-2 horas'
        }
    };
    
    const contact = contacts[supplierId];
    
    if (!contact) {
        return res.status(404).json({
            success: false,
            error: 'Fornecedor não encontrado'
        });
    }
    
    return res.status(200).json({
        success: true,
        data: contact,
        supplierId: supplierId,
        timestamp: new Date().toISOString()
    });
}

/**
 * Produtos do fornecedor
 */
async function getSupplierProducts(req, res) {
    const supplierId = req.query.supplier_id;
    
    if (!supplierId) {
        return res.status(400).json({
            success: false,
            error: 'ID do fornecedor é obrigatório'
        });
    }
    
    // Simular produtos por fornecedor
    const products = {
        'phoera_official': [
            {
                id: 'phoera-foundation',
                name: '2 Pack PHOERA Foundation + Combo',
                price: 39.99,
                currency: 'USD',
                category: 'beauty',
                stock: 'in_stock',
                rating: 4.8
            }
        ],
        'hair_tools_pro': [
            {
                id: 'alligator-clips',
                name: 'Alligator Hair Clips + Combo',
                price: 15.99,
                currency: 'USD',
                category: 'beauty',
                stock: 'in_stock',
                rating: 4.6
            }
        ],
        'phoera_amazon': [
            {
                id: 'phoera-foundation-amazon',
                name: 'PHOERA Foundation - Amazon',
                price: 45.99,
                currency: 'USD',
                category: 'beauty',
                stock: 'in_stock',
                rating: 4.7
            }
        ],
        'heat_mat_amazon': [
            {
                id: 'heat-resistant-mat',
                name: 'Heat-Resistant Mat',
                price: 19.99,
                currency: 'USD',
                category: 'beauty',
                stock: 'in_stock',
                rating: 4.5
            }
        ]
    };
    
    const supplierProducts = products[supplierId];
    
    if (!supplierProducts) {
        return res.status(404).json({
            success: false,
            error: 'Fornecedor não encontrado'
        });
    }
    
    return res.status(200).json({
        success: true,
        data: supplierProducts,
        count: supplierProducts.length,
        supplierId: supplierId,
        timestamp: new Date().toISOString()
    });
}
