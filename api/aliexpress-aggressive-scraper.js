/**
 * Scraper Agressivo do AliExpress
 * Focado em obter dados REAIS, especialmente preços
 */

import puppeteer from 'puppeteer';

/**
 * Scraper agressivo para dados reais
 */
export async function scrapeAggressiveAliExpress(url) {
    let browser = null;
    
    try {
        console.log(`🚀 Scraping AGRESSIVO de: ${url}`);
        
        // Configurações mais agressivas
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
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
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ],
            defaultViewport: {
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1
            }
        });

        const page = await browser.newPage();
        
        // Configurar interceptação
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Headers realistas
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        });

        // Navegar com retry agressivo
        let retries = 5;
        while (retries > 0) {
            try {
                console.log(`🌐 Tentativa ${6 - retries}/5 - Navegando...`);
                
                // Delay aleatório
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
                
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 60000
                });
                
                // Aguardar carregamento
                await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
                
                // Verificar se carregou
                const title = await page.title();
                if (title && !title.includes('Error') && !title.includes('404')) {
                    console.log('✅ Página carregada');
                    break;
                } else {
                    throw new Error('Página não carregou corretamente');
                }
                
            } catch (error) {
                retries--;
                if (retries === 0) throw error;
                console.log(`⚠️ Tentativa falhou, aguardando...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        // Extrair dados REAIS
        const productData = await page.evaluate(() => {
            console.log('🔍 Extraindo dados reais...');
            
            // Função para extrair preço real
            const extractRealPrice = () => {
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
                    '.price-current .price-current-single .notranslate',
                    '.price-current .price-current-single .price-current',
                    '.price-current .price-current-single .price-current .notranslate',
                    '.price-current .price-current-single .price-current .price-current',
                    '.price-current .price-current-single .price-current .price-current .notranslate'
                ];
                
                for (const selector of priceSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        const text = element.textContent.trim();
                        console.log(`💰 Preço encontrado: ${text}`);
                        
                        // Extrair número do preço
                        const priceMatch = text.match(/[\d,]+\.?\d*/);
                        if (priceMatch) {
                            return {
                                price: priceMatch[0],
                                currency: text.replace(/[\d,\.]/g, '').trim() || 'USD',
                                fullText: text
                            };
                        }
                    }
                }
                return null;
            };
            
            // Extrair título real
            const extractRealTitle = () => {
                const titleSelectors = [
                    '[data-pl="product-title"]',
                    'h1',
                    '.product-title',
                    '.product-name',
                    '.product-info h1',
                    '.product-info .product-title'
                ];
                
                for (const selector of titleSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        return element.textContent.trim();
                    }
                }
                return 'Produto AliExpress';
            };
            
            // Extrair rating real
            const extractRealRating = () => {
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
                
                for (const selector of ratingSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        return element.textContent.trim();
                    }
                }
                return '0';
            };
            
            // Extrair reviews reais
            const extractRealReviews = () => {
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
                
                for (const selector of reviewSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        return element.textContent.trim();
                    }
                }
                return '0';
            };
            
            // Extrair imagens reais
            const extractRealImages = () => {
                const images = [];
                const imageElements = document.querySelectorAll('img[data-src], img[src]');
                
                for (const img of imageElements) {
                    const src = img.src || img.dataset.src;
                    if (src && src.includes('alicdn')) {
                        images.push(src);
                        if (images.length >= 5) break;
                    }
                }
                return images;
            };
            
            // Executar extrações
            const priceData = extractRealPrice();
            const title = extractRealTitle();
            const rating = extractRealRating();
            const reviews = extractRealReviews();
            const images = extractRealImages();
            
            console.log('📊 Dados extraídos:', {
                title: title.substring(0, 50) + '...',
                price: priceData?.price || 'N/A',
                currency: priceData?.currency || 'N/A',
                rating: rating,
                reviews: reviews,
                images: images.length
            });
            
            return {
                product_id: 'AGGRESSIVE_' + Date.now(),
                title: title,
                price: priceData?.price || '0.00',
                currency: priceData?.currency || 'USD',
                images: images,
                description: 'Produto extraído com scraper agressivo',
                store: { name: 'AliExpress Store' },
                skus: [],
                url: window.location.href,
                scraped_at: new Date(),
                source: 'aliexpress_aggressive_scraper',
                rating: rating,
                reviews: reviews,
                stock: 'unknown',
                availability: 'unknown',
                shipping: {},
                seller_info: {}
            };
        });
        
        if (productData && productData.price !== '0.00') {
            console.log(`✅ Dados REAIS extraídos: ${productData.title} - Preço: ${productData.price} ${productData.currency}`);
            return { success: true, data: productData };
        } else {
            console.log('❌ Falha ao extrair dados reais');
            return { success: false, error: 'Não foi possível extrair dados reais' };
        }
        
    } catch (error) {
        console.error('❌ Erro no scraping agressivo:', error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export default scrapeAggressiveAliExpress;

