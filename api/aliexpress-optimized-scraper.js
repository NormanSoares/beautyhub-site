/**
 * AliExpress Optimized Scraper - Máxima Eficiência 2025
 * Sistema anti-detecção avançado com cache inteligente
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações otimizadas
const OPTIMIZED_CONFIG = {
    baseUrl: 'https://www.aliexpress.com',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    timeout: 120000, // 2 minutos
    retries: 8,      // Mais tentativas
    delay: 3000,     // Delay base
    maxDelay: 15000, // Delay máximo
    cacheFile: path.join(__dirname, '../data/optimized_cache.json'),
    successRate: 0.85 // 85% de sucesso esperado
};

/**
 * Classe para Scraping Otimizado
 */
class AliExpressOptimizedScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        this.cache = this.loadCache();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            cacheHits: 0
        };
    }

    /**
     * Carregar cache inteligente
     */
    loadCache() {
        try {
            if (fs.existsSync(OPTIMIZED_CONFIG.cacheFile)) {
                const cacheData = fs.readFileSync(OPTIMIZED_CONFIG.cacheFile, 'utf8');
                return JSON.parse(cacheData);
            }
        } catch (error) {
            console.log('⚠️ Cache não encontrado, criando novo...');
        }
        return {};
    }

    /**
     * Salvar cache inteligente
     */
    saveCache() {
        try {
            const cacheDir = path.dirname(OPTIMIZED_CONFIG.cacheFile);
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }
            fs.writeFileSync(OPTIMIZED_CONFIG.cacheFile, JSON.stringify(this.cache, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar cache:', error);
        }
    }

    /**
     * Verificar cache antes de scraping
     */
    checkCache(url) {
        const cacheKey = this.generateCacheKey(url);
        const cached = this.cache[cacheKey];
        
        if (cached && this.isCacheValid(cached)) {
            this.stats.cacheHits++;
            console.log('🎯 Cache hit para:', url);
            return cached.data;
        }
        
        return null;
    }

    /**
     * Gerar chave de cache
     */
    generateCacheKey(url) {
        const productId = this.extractProductId(url);
        return `product_${productId}`;
    }

    /**
     * Verificar se cache é válido (24 horas)
     */
    isCacheValid(cached) {
        const now = Date.now();
        const cacheTime = cached.timestamp || 0;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        return (now - cacheTime) < maxAge;
    }

    /**
     * Extrair ID do produto
     */
    extractProductId(url) {
        const patterns = [
            /\/item\/(\d+)\.html/,
            /\/item\/(\d+)/,
            /productId=(\d+)/,
            /id=(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Inicializar browser otimizado
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🚀 Inicializando scraper OTIMIZADO...');

            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    // Anti-detecção avançada
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
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=VizDisplayCompositor',
                    '--window-size=1920,1080',
                    '--user-agent=' + OPTIMIZED_CONFIG.userAgent
                ],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                    deviceScaleFactor: 1
                }
            });

            this.page = await this.browser.newPage();
            await this.setupAdvancedAntiDetection();
            this.isInitialized = true;
            console.log('✅ Scraper OTIMIZADO inicializado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao inicializar scraper otimizado:', error);
            throw error;
        }
    }

    /**
     * Configurar anti-detecção avançada
     */
    async setupAdvancedAntiDetection() {
        // User agent personalizado
        await this.page.setUserAgent(OPTIMIZED_CONFIG.userAgent);
        
        // Headers realistas
        await this.page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        });

        // Interceptar requests
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['image', 'stylesheet', 'font', 'media', 'websocket'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Executar scripts anti-detecção
        await this.page.evaluateOnNewDocument(() => {
            // Remover propriedades de automação
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });

            // Simular comportamento humano
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });

            // Simular permissões
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });
    }

    /**
     * Scraping otimizado com cache
     */
    async scrapeProduct(url) {
        try {
            this.stats.totalRequests++;

            // Verificar cache primeiro
            const cachedData = this.checkCache(url);
            if (cachedData) {
                return { success: true, data: cachedData, source: 'optimized_cache' };
            }

            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log(`🔍 Scraping OTIMIZADO de: ${url}`);

            // Navegar com retry inteligente
            await this.navigateWithSmartRetry(url);
            
            // Aguardar carregamento otimizado
            await this.waitForOptimizedLoad();
            
            // Delay humano
            await this.humanDelay();

            // Extrair dados otimizados
            const productData = await this.extractOptimizedData();

            if (productData && this.validateData(productData)) {
                // Salvar no cache
                const cacheKey = this.generateCacheKey(url);
                this.cache[cacheKey] = {
                    data: productData,
                    timestamp: Date.now()
                };
                this.saveCache();

                this.stats.successfulRequests++;
                console.log('✅ Dados REAIS obtidos com scraper OTIMIZADO');
                return { success: true, data: productData, source: 'optimized_scraper' };
            } else {
                this.stats.failedRequests++;
                console.log('❌ Dados inválidos obtidos');
                return { success: false, error: 'Dados inválidos' };
            }

        } catch (error) {
            this.stats.failedRequests++;
            console.error('❌ Erro no scraping otimizado:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Navegação com retry inteligente
     */
    async navigateWithSmartRetry(url, maxRetries = OPTIMIZED_CONFIG.retries) {
        let retries = maxRetries;

        while (retries > 0) {
            try {
                console.log(`🌐 Navegando (tentativa ${maxRetries - retries + 1}/${maxRetries})...`);
                
                // Delay humano antes da navegação
                await this.humanDelay();

                await this.page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: OPTIMIZED_CONFIG.timeout
                });

                // Verificar se a página carregou corretamente
                const title = await this.page.title();
                const currentUrl = this.page.url();

                if (this.isValidPage(title, currentUrl)) {
                    console.log('✅ Página carregada com sucesso');
                    return;
                } else {
                    throw new Error(`Página inválida: ${title}`);
                }

            } catch (error) {
                retries--;
                console.log(`⚠️ Tentativa falhou: ${error.message}`);

                if (retries === 0) {
                    throw new Error(`Todas as tentativas falharam: ${error.message}`);
                }

                // Delay exponencial com jitter
                const delay = Math.min(
                    OPTIMIZED_CONFIG.delay * Math.pow(2, maxRetries - retries) + Math.random() * 2000,
                    OPTIMIZED_CONFIG.maxDelay
                );
                console.log(`⏳ Aguardando ${Math.round(delay/1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Verificar se página é válida
     */
    isValidPage(title, url) {
        return title && 
               !title.includes('Error') && 
               !title.includes('404') &&
               !title.includes('Access Denied') && 
               !title.includes('Blocked') &&
               url.includes('aliexpress.com') &&
               !url.includes('captcha');
    }

    /**
     * Aguardar carregamento otimizado
     */
    async waitForOptimizedLoad() {
        try {
            // Aguardar elementos essenciais
            await Promise.all([
                this.page.waitForSelector('[data-pl="product-title"], h1, .product-title', { timeout: 15000 }),
                this.page.waitForSelector('.price-current, .notranslate, [data-pl="price-current"]', { timeout: 15000 })
            ]);

            // Aguardar um pouco mais para garantir carregamento completo
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        } catch (error) {
            console.log('⚠️ Alguns elementos não carregaram, continuando...');
        }
    }

    /**
     * Delay humano otimizado
     */
    async humanDelay() {
        const baseDelay = OPTIMIZED_CONFIG.delay;
        const randomDelay = Math.random() * 2000;
        const totalDelay = baseDelay + randomDelay;
        await new Promise(resolve => setTimeout(resolve, totalDelay));
    }

    /**
     * Extrair dados otimizados
     */
    async extractOptimizedData() {
        try {
            console.log('🔍 Extraindo dados otimizados...');

            const productData = await this.page.evaluate(() => {
                const extractData = () => {
                    const data = {};
                    
                    // Título
                    const titleElement = document.querySelector('[data-pl="product-title"]') ||
                                       document.querySelector('h1') ||
                                       document.querySelector('.product-title');
                    data.title = titleElement ? titleElement.textContent.trim() : 'Produto AliExpress';

                    // Preço
                    const priceSelectors = [
                        '.price-current', '.notranslate', '[data-pl="price-current"]',
                        '.product-price-value', '.price', '.current-price',
                        '.price-current-single', '.price-current-single .notranslate'
                    ];
                    let priceElement = null;
                    for (const selector of priceSelectors) {
                        priceElement = document.querySelector(selector);
                        if (priceElement && priceElement.textContent.trim()) {
                            break;
                        }
                    }
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

                    // Rating
                    const ratingElement = document.querySelector('.rating-value') ||
                                        document.querySelector('.overview-rating-average');
                    data.rating = ratingElement ? ratingElement.textContent.trim() : '0';

                    // Reviews
                    const reviewsElement = document.querySelector('.review-count') ||
                                         document.querySelector('.overview-rating-count');
                    data.reviews = reviewsElement ? reviewsElement.textContent.trim() : '0';

                    // Stock
                    const stockElement = document.querySelector('.stock-info') ||
                                       document.querySelector('[data-pl="stock-info"]');
                    data.stock = stockElement ? stockElement.textContent.trim() : 'unknown';

                    // Seller
                    const sellerElement = document.querySelector('.store-name') ||
                                        document.querySelector('[data-pl="store-name"]');
                    data.seller = sellerElement ? sellerElement.textContent.trim() : 'AliExpress Store';

                    // Shipping
                    const shippingElement = document.querySelector('.shipping-info') ||
                                         document.querySelector('[data-pl="shipping-info"]');
                    data.shipping = shippingElement ? shippingElement.textContent.trim() : '7-15 days';

                    return data;
                };

                // Tentar extrair dados JSON primeiro
                try {
                    const scripts = document.querySelectorAll('script');
                    for (const script of scripts) {
                        const content = script.textContent;
                        const jsonPatterns = [
                            /window\.runParams\s*=\s*(\{[\s\S]*?\});/,
                            /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
                            /window\.itemInfo\s*=\s*(\{[\s\S]*?\});/
                        ];

                        for (const pattern of jsonPatterns) {
                            const match = content.match(pattern);
                            if (match) {
                                try {
                                    const jsonData = JSON.parse(match[1]);
                                    const itemInfo = jsonData?.item?.itemInfo || jsonData?.itemInfo || jsonData;
                                    
                                    if (itemInfo) {
                                        return {
                                            title: itemInfo.title || itemInfo.name || 'Produto AliExpress',
                                            price: itemInfo.price?.price?.text || itemInfo.price || '0.00',
                                            currency: itemInfo.price?.price?.currency || itemInfo.currency || 'USD',
                                            images: itemInfo.images || itemInfo.imageList || [],
                                            description: itemInfo.description || itemInfo.desc || '',
                                            rating: itemInfo.rating || itemInfo.ratingValue || '0',
                                            reviews: itemInfo.reviews || itemInfo.reviewCount || '0',
                                            stock: itemInfo.stock || itemInfo.availability || 'unknown',
                                            seller: itemInfo.store?.name || itemInfo.seller?.name || 'AliExpress Store',
                                            shipping: itemInfo.shipping || itemInfo.delivery || '7-15 days',
                                            source: 'optimized_json_extraction'
                                        };
                                    }
                                } catch (parseError) {
                                    continue;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log('Erro ao extrair JSON, usando DOM');
                }

                return extractData();
            });

            // Adicionar metadados
            productData.product_id = 'OPTIMIZED_' + Date.now();
            productData.url = this.page.url();
            productData.scraped_at = new Date();
            productData.source = 'optimized_scraper';
            productData.availability = productData.stock !== 'unknown' ? 'available' : 'unknown';

            return productData;

        } catch (error) {
            console.error('❌ Erro ao extrair dados otimizados:', error);
            return null;
        }
    }

    /**
     * Validar dados extraídos
     */
    validateData(data) {
        return data && 
               data.title && 
               data.title !== 'Produto AliExpress' &&
               data.price && 
               data.price !== '0.00' &&
               data.price !== '29.99' &&
               data.price !== '8.99' &&
               data.price !== '12.50';
    }

    /**
     * Obter estatísticas
     */
    getStats() {
        const successRate = this.stats.totalRequests > 0 ? 
            (this.stats.successfulRequests / this.stats.totalRequests) * 100 : 0;
        
        return {
            ...this.stats,
            successRate: Math.round(successRate * 100) / 100,
            cacheHitRate: this.stats.totalRequests > 0 ? 
                (this.stats.cacheHits / this.stats.totalRequests) * 100 : 0
        };
    }

    /**
     * Fechar browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isInitialized = false;
            console.log('🔒 Browser otimizado fechado');
        }
    }
}

// Instância global
let globalOptimizedScraper = null;

/**
 * Função principal para scraping otimizado
 */
export async function scrapeOptimizedAliExpress(url) {
    try {
        if (!globalOptimizedScraper) {
            globalOptimizedScraper = new AliExpressOptimizedScraper();
        }

        const result = await globalOptimizedScraper.scrapeProduct(url);
        return result;

    } catch (error) {
        console.error('❌ Erro no scraping otimizado:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obter estatísticas do scraper
 */
export function getOptimizedScraperStats() {
    return globalOptimizedScraper ? globalOptimizedScraper.getStats() : null;
}

/**
 * Limpar cache
 */
export function clearOptimizedCache() {
    if (globalOptimizedScraper) {
        globalOptimizedScraper.cache = {};
        globalOptimizedScraper.saveCache();
    }
}

export default AliExpressOptimizedScraper;

