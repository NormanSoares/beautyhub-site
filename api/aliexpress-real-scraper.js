/**
 * Scraper Real do AliExpress 2025
 * Baseado na documentação oficial e melhores práticas
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do AliExpress
const ALIEXPRESS_CONFIG = {
    baseUrl: 'https://www.aliexpress.com',
    apiUrl: 'https://api.aliexpress.com',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    timeout: 30000,
    retries: 3,
    delay: 2000
};

/**
 * Classe principal do scraper real do AliExpress
 */
class AliExpressRealScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa o browser com configurações otimizadas
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🚀 Inicializando scraper real do AliExpress...');
            
            this.browser = await puppeteer.launch({
                headless: 'new', // Usar novo modo headless
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-field-trial-config',
                '--disable-ipc-flooding-protection',
                '--disable-hang-monitor',
                '--disable-prompt-on-repost',
                '--disable-sync',
                '--disable-translate',
                '--disable-logging',
                '--ignore-certificate-errors',
                '--ignore-ssl-errors',
                '--window-size=1920,1080',
                '--user-agent=' + ALIEXPRESS_CONFIG.userAgent
                ],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                    deviceScaleFactor: 1
                }
            });

            this.page = await this.browser.newPage();
            
            // Configurar interceptação de requisições
            await this.setupRequestInterception();
            
            // Configurar user agent e headers
            await this.page.setUserAgent(ALIEXPRESS_CONFIG.userAgent);
            await this.page.setExtraHTTPHeaders({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            });

            this.isInitialized = true;
            console.log('✅ Scraper real inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar scraper:', error);
            throw error;
        }
    }

    /**
     * Configura interceptação de requisições para otimizar performance
     */
    async setupRequestInterception() {
        await this.page.setRequestInterception(true);
        
        this.page.on('request', (request) => {
            const resourceType = request.resourceType();
            
            // Bloquear recursos desnecessários para otimizar velocidade
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });
    }

    /**
     * Scraping real de um produto do AliExpress
     */
    async scrapeProduct(url) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log(`🔍 Iniciando scraping real de: ${url}`);
            
            // Navegar para a página com retry
            await this.navigateWithRetry(url);
            
        // Aguardar carregamento completo
        await this.waitForPageLoad();
        
        // Delay anti-bloqueio
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            
            // Extrair dados reais
            const productData = await this.extractRealProductData();
            
            if (productData) {
                console.log('✅ Dados reais extraídos com sucesso');
                return { success: true, data: productData };
            } else {
                console.log('❌ Falha ao extrair dados reais');
                return { success: false, error: 'Não foi possível extrair dados' };
            }
            
        } catch (error) {
            console.error('❌ Erro no scraping real:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Navega para a URL com retry agressivo e tratamento de erros
     */
    async navigateWithRetry(url, maxRetries = 5) {
        let retries = maxRetries;
        
        while (retries > 0) {
            try {
                console.log(`🌐 Navegando para: ${url} (tentativa ${maxRetries - retries + 1}/${maxRetries})`);
                
                // Delay aleatório antes da navegação
                const randomDelay = 1000 + Math.random() * 2000;
                await new Promise(resolve => setTimeout(resolve, randomDelay));
                
                await this.page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 60000 // Aumentar timeout para 60s
                });
                
                // Aguardar mais tempo para carregamento
                await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
                
                // Verificar se a página carregou corretamente
                const title = await this.page.title();
                const urlCheck = this.page.url();
                
                if (title && !title.includes('Error') && !title.includes('404') && 
                    !title.includes('Access Denied') && !title.includes('Blocked') &&
                    urlCheck.includes('aliexpress.com')) {
                    console.log('✅ Página carregada com sucesso');
                    return;
                } else {
                    throw new Error(`Página não carregou corretamente. Título: ${title}, URL: ${urlCheck}`);
                }
                
            } catch (error) {
                retries--;
                console.log(`⚠️ Tentativa falhou: ${error.message}`);
                
                if (retries === 0) {
                    console.log('❌ Todas as tentativas de navegação falharam');
                    throw error;
                }
                
                // Backoff exponencial com jitter
                const delay = Math.min(5000 * Math.pow(2, maxRetries - retries), 30000) + Math.random() * 2000;
                console.log(`⏳ Aguardando ${Math.round(delay/1000)}s antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Tentar recarregar a página se necessário
                try {
                    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
                } catch (reloadError) {
                    console.log('⚠️ Erro ao recarregar página, continuando...');
                }
            }
        }
    }

    /**
     * Aguarda o carregamento completo da página
     */
    async waitForPageLoad() {
        try {
            // Aguardar elementos específicos do AliExpress
            await this.page.waitForSelector('[data-pl="product-title"]', { timeout: 10000 });
            await this.page.waitForSelector('.price-current', { timeout: 10000 });
            
            // Aguardar um pouco mais para garantir que tudo carregou
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.log('⚠️ Alguns elementos não carregaram, continuando...');
        }
    }

    /**
     * Extrai dados reais do produto
     */
    async extractRealProductData() {
        try {
            console.log('🔍 Extraindo dados reais do produto...');
            
            // Executar script no contexto da página para extrair dados
            const productData = await this.page.evaluate(() => {
                // Função para extrair dados do DOM
                const extractData = () => {
                    const data = {};
                    
                    // Título do produto
                    const titleElement = document.querySelector('[data-pl="product-title"]') || 
                                       document.querySelector('h1') ||
                                       document.querySelector('.product-title');
                    data.title = titleElement ? titleElement.textContent.trim() : 'Produto AliExpress';
                    
                    // Preço atual - múltiplos seletores
                    const priceSelectors = [
                        '.price-current',
                        '.notranslate',
                        '[data-pl="price-current"]',
                        '.product-price-value',
                        '.price',
                        '.current-price',
                        '.price-current-single',
                        '.price-current-single .notranslate',
                        '.price-current-single .price-current',
                        '[data-pl="price"]',
                        '.price-current .notranslate',
                        '.price-current .price-current',
                        '.price-current .price-current-single',
                        '.price-current .price-current-single .notranslate'
                    ];
                    
                    let priceElement = null;
                    for (const selector of priceSelectors) {
                        priceElement = document.querySelector(selector);
                        if (priceElement && priceElement.textContent.trim()) {
                            break;
                        }
                    }
                    
                    // Extrair preço do texto
                    if (priceElement) {
                        const priceText = priceElement.textContent.trim();
                        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                        data.price = priceMatch ? priceMatch[0] : '0.00';
                    } else {
                        data.price = '0.00';
                    }
                    
                    // Moeda
                    const currencyElement = document.querySelector('.currency') ||
                                          document.querySelector('.price-currency');
                    data.currency = currencyElement ? currencyElement.textContent.trim() : 'USD';
                    
                    // Imagens
                    const imageElements = document.querySelectorAll('img[data-src], img[src]');
                    data.images = Array.from(imageElements)
                        .map(img => img.src || img.dataset.src)
                        .filter(src => src && src.includes('alicdn'))
                        .slice(0, 5);
                    
                    // Descrição
                    const descElement = document.querySelector('.product-description') ||
                                      document.querySelector('[data-pl="product-description"]');
                    data.description = descElement ? descElement.textContent.trim() : '';
                    
                    // Avaliações - múltiplos seletores
                    const ratingSelectors = [
                        '.rating-value',
                        '.overview-rating-average',
                        '.rating-average',
                        '.product-rating',
                        '.rating',
                        '[data-pl="rating"]',
                        '.rating-value .rating-average',
                        '.overview-rating .rating-average'
                    ];
                    
                    let ratingElement = null;
                    for (const selector of ratingSelectors) {
                        ratingElement = document.querySelector(selector);
                        if (ratingElement && ratingElement.textContent.trim()) {
                            break;
                        }
                    }
                    data.rating = ratingElement ? ratingElement.textContent.trim() : '0';
                    
                    const reviewSelectors = [
                        '.review-count',
                        '.overview-rating-count',
                        '.rating-count',
                        '.product-reviews',
                        '.reviews-count',
                        '[data-pl="reviews"]',
                        '.rating-count .review-count',
                        '.overview-rating .rating-count'
                    ];
                    
                    let reviewsElement = null;
                    for (const selector of reviewSelectors) {
                        reviewsElement = document.querySelector(selector);
                        if (reviewsElement && reviewsElement.textContent.trim()) {
                            break;
                        }
                    }
                    data.reviews = reviewsElement ? reviewsElement.textContent.trim() : '0';
                    
                    // Estoque - múltiplos seletores
                    const stockSelectors = [
                        '.stock-info',
                        '[data-pl="stock-info"]',
                        '.stock-status',
                        '.availability',
                        '.product-stock',
                        '.stock-count',
                        '.quantity-available',
                        '.in-stock',
                        '.stock-available',
                        '[data-pl="availability"]'
                    ];
                    
                    let stockElement = null;
                    for (const selector of stockSelectors) {
                        stockElement = document.querySelector(selector);
                        if (stockElement && stockElement.textContent.trim()) {
                            break;
                        }
                    }
                    data.stock = stockElement ? stockElement.textContent.trim() : 'unknown';
                    
                    // Vendedor
                    const sellerElement = document.querySelector('.store-name') ||
                                        document.querySelector('[data-pl="store-name"]');
                    data.seller = sellerElement ? sellerElement.textContent.trim() : 'AliExpress Store';
                    
                    // Envio
                    const shippingElement = document.querySelector('.shipping-info') ||
                                          document.querySelector('[data-pl="shipping-info"]');
                    data.shipping = shippingElement ? shippingElement.textContent.trim() : '7-15 days';
                    
                    return data;
                };
                
                // Tentar extrair dados do JSON embutido (mais confiável)
                try {
                    const scripts = document.querySelectorAll('script');
                    for (const script of scripts) {
                        const content = script.textContent;
                        
                        // Padrões de JSON do AliExpress
                        const jsonPatterns = [
                            /window\.runParams\s*=\s*(\{[\s\S]*?\});/,
                            /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
                            /window\.itemInfo\s*=\s*(\{[\s\S]*?\});/,
                            /window\.skuBase\s*=\s*(\{[\s\S]*?\});/
                        ];
                        
                        for (const pattern of jsonPatterns) {
                            const match = content.match(pattern);
                            if (match) {
                                try {
                                    const jsonData = JSON.parse(match[1]);
                                    
                                    // Extrair dados do produto
                                    const itemInfo = jsonData?.item?.itemInfo || jsonData?.itemInfo || jsonData;
                                    const priceInfo = jsonData?.item?.price || jsonData?.price;
                                    const skuBase = jsonData?.item?.skuBase || jsonData?.skuBase;
                                    
                                    if (itemInfo) {
                                        return {
                                            title: itemInfo.title || itemInfo.name || 'Produto AliExpress',
                                            price: itemInfo.price?.price?.text || itemInfo.price || priceInfo?.text || '0.00',
                                            currency: itemInfo.price?.price?.currency || itemInfo.currency || priceInfo?.currency || 'USD',
                                            images: itemInfo.images || itemInfo.imageList || [],
                                            description: itemInfo.description || itemInfo.desc || '',
                                            rating: itemInfo.rating || itemInfo.ratingValue || '0',
                                            reviews: itemInfo.reviews || itemInfo.reviewCount || '0',
                                            stock: itemInfo.stock || itemInfo.availability || 'unknown',
                                            seller: itemInfo.store?.name || itemInfo.seller?.name || 'AliExpress Store',
                                            shipping: itemInfo.shipping || itemInfo.delivery || '7-15 days',
                                            skus: skuBase?.skuProps || itemInfo.skus || [],
                                            source: 'aliexpress_json'
                                        };
                                    }
                                } catch (parseError) {
                                    console.log('Erro ao parsear JSON:', parseError.message);
                                    continue;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log('Erro ao extrair JSON, usando DOM');
                }
                
                // Fallback para extração do DOM
                return extractData();
            });
            
            // Adicionar metadados
            productData.product_id = 'REAL_' + Date.now();
            productData.url = this.page.url();
            productData.scraped_at = new Date();
            productData.source = 'aliexpress_real_scraper';
            productData.availability = productData.stock !== 'unknown' ? 'available' : 'unknown';
            
            return productData;
            
        } catch (error) {
            console.error('❌ Erro ao extrair dados:', error);
            return null;
        }
    }

    /**
     * Fecha o browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isInitialized = false;
            console.log('🔒 Browser fechado');
        }
    }
}

// Instância global do scraper
let globalScraper = null;

/**
 * Função principal para scraping real
 */
export async function scrapeRealAliExpress(url) {
    try {
        if (!globalScraper) {
            globalScraper = new AliExpressRealScraper();
        }
        
        const result = await globalScraper.scrapeProduct(url);
        return result;
        
    } catch (error) {
        console.error('❌ Erro no scraping real:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Limpa recursos
 */
export async function cleanupScraper() {
    if (globalScraper) {
        await globalScraper.close();
        globalScraper = null;
    }
}

export default AliExpressRealScraper;
