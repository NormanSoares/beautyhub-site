/**
 * Scraper AliExpress integrado com MongoDB
 * Salva dados coletados diretamente no banco
 */

import { MongoClient } from 'mongodb';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.ROCKETDB_URI || process.env.NORMANDB_URI || 'mongodb://localhost:27017/beautyhub';

// Cliente MongoDB com connection pooling
let mongoClient = null;
let isConnecting = false;

/**
 * Conecta ao MongoDB com retry e connection pooling
 */
async function connectToMongoDB() {
    // Se já está conectado e funcionando, retorna
    if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
        return mongoClient;
    }
    
    // Se já está tentando conectar, aguarda
    if (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return connectToMongoDB();
    }
    
    isConnecting = true;
    
    try {
        // Fecha conexão anterior se existir
        if (mongoClient) {
            try {
                await mongoClient.close();
            } catch (e) {
                console.log('Erro ao fechar conexão anterior:', e.message);
            }
        }
        
        mongoClient = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            retryReads: true,
        });
        
        await mongoClient.connect();
        console.log('Conectado ao MongoDB com connection pooling');
        return mongoClient;
    } catch (error) {
        console.error('Erro ao conectar MongoDB:', error);
        mongoClient = null;
        throw error;
    } finally {
        isConnecting = false;
    }
}

/**
 * Salva dados do produto no MongoDB
 */
async function saveProductToMongoDB(productData, retryCount = 0) {
    const maxRetries = 3;
    
    try {
        const client = await connectToMongoDB();
        const db = client.db('beautyhub');
        
        // Preparar dados para salvar
        const productRecord = {
            ...productData,
            scraped_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };
        
        // Salvar ou atualizar produto
        const result = await db.collection('scraped_products').updateOne(
            { product_id: productData.product_id },
            { 
                $set: productRecord,
                $setOnInsert: { created_at: new Date() }
            },
            { upsert: true }
        );
        
        console.log(`Produto salvo/atualizado: ${productData.product_id}`, result);
        return result;
    } catch (error) {
        console.error('Erro ao salvar produto no MongoDB:', error);
        
        // Retry se não excedeu o limite
        if (retryCount < maxRetries) {
            console.log(`Tentando novamente (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Backoff exponencial
            return saveProductToMongoDB(productData, retryCount + 1);
        }
        
        throw error;
    }
}

/**
 * Extrai dados do produto do HTML
 */
function extractProductData(html, url) {
    try {
        // Padrões de extração
        const patterns = [
            {
                name: '__INITIAL_STATE__',
                regex: /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
                clean: (text) => text.replace(/;\s*$/, "")
            },
            {
                name: 'runParams',
                regex: /window\.runParams\s*=\s*(\{[\s\S]*?\});/,
                clean: (text) => text.replace(/;\s*$/, "")
            }
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern.regex);
            if (match) {
                try {
                    const cleanedJson = pattern.clean(match[1]);
                    const data = JSON.parse(cleanedJson);
                    
                    // Extrair informações do produto
                    const itemInfo = data?.item?.itemInfo || data?.itemInfo;
                    const skuBase = data?.item?.skuBase || data?.skuBase;
                    
                    if (itemInfo && skuBase) {
                        return {
                            product_id: itemInfo.itemId || 'unknown',
                            title: itemInfo.title || 'Sem título',
                            price: itemInfo.price?.price?.text || '0',
                            currency: itemInfo.price?.price?.currency || 'USD',
                            images: itemInfo.images || [],
                            description: itemInfo.description || '',
                            store: itemInfo.store || {},
                            skus: skuBase.skuProps || [],
                            url: url,
                            scraped_at: new Date(),
                            source: 'aliexpress_scraper'
                        };
                    }
                } catch (parseError) {
                    console.log(`Erro ao parsear JSON do padrão ${pattern.name}:`, parseError.message);
                    continue;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao extrair dados do produto:', error);
        return null;
    }
}

/**
 * Executa o scraping de um produto
 */
async function scrapeProduct(url) {
    let browser = null;
    
    try {
        console.log(`🚀 Iniciando scraping de: ${url}`);
        
        // Configurar Puppeteer
        browser = await puppeteer.launch({
            headless: true,
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
        
        const page = await browser.newPage();
        
        // Configurar user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navegar para a página
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Aguardar carregamento
        await page.waitForTimeout(3000);
        
        // Obter HTML
        const html = await page.content();
        
        // Extrair dados
        const productData = extractProductData(html, url);
        
        if (productData) {
            // Salvar no MongoDB
            await saveProductToMongoDB(productData);
            console.log(`✅ Produto processado: ${productData.title}`);
            return { success: true, data: productData };
        } else {
            console.log('❌ Não foi possível extrair dados do produto');
            return { success: false, error: 'Não foi possível extrair dados' };
        }
        
    } catch (error) {
        console.error('Erro no scraping:', error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Handler da API
 */
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Endpoint de teste
        if (req.method === 'GET' && req.query.test === '1') {
            return res.status(200).json({
                success: true,
                message: 'Scraper MongoDB funcionando!',
                timestamp: new Date().toISOString(),
                mongodb_uri: MONGODB_URI ? 'configurado' : 'não configurado'
            });
        }
        
        // Executar scraping
        if (req.method === 'POST') {
            const { url } = req.body;
            
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL é obrigatória'
                });
            }
            
            const result = await scrapeProduct(url);
            
            return res.status(200).json({
                success: result.success,
                message: result.success ? 'Scraping executado com sucesso' : 'Erro no scraping',
                data: result.data,
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
        
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowed: ['GET', 'POST', 'OPTIONS']
        });
        
    } catch (error) {
        console.error('Erro no handler do scraper:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
