import axios from 'axios';
import * as cheerio from 'cheerio';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

class AdvancedAliExpressScraper {
    constructor() {
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
        ];
        
        this.proxies = [
            // Adicionar proxies aqui se necessário
            // 'http://proxy1:port',
            // 'socks5://proxy2:port'
        ];
        
        this.retryAttempts = 3;
        this.delayBetweenRequests = 2000; // 2 segundos
    }

    async scrapeProductAdvanced(productId, productUrl) {
        console.log(`🔍 Scraping avançado para produto ${productId}...`);
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`📡 Tentativa ${attempt}/${this.retryAttempts}`);
                
                // Tentar diferentes estratégias
                const strategies = [
                    () => this.scrapeWithDirectRequest(productUrl),
                    () => this.scrapeWithProxy(productUrl),
                    () => this.scrapeWithMobileUserAgent(productUrl),
                    () => this.scrapeWithDelayedRequest(productUrl)
                ];

                for (const strategy of strategies) {
                    try {
                        const result = await strategy();
                        if (result && result.title) {
                            console.log(`✅ Sucesso com estratégia ${strategies.indexOf(strategy) + 1}`);
                            return {
                                ...result,
                                id: productId,
                                url: productUrl,
                                scrapedAt: new Date().toISOString(),
                                method: 'advanced_scraping',
                                attempt: attempt
                            };
                        }
                    } catch (strategyError) {
                        console.log(`⚠️ Estratégia ${strategies.indexOf(strategy) + 1} falhou: ${strategyError.message}`);
                    }
                }

                // Aguardar antes da próxima tentativa
                if (attempt < this.retryAttempts) {
                    const delay = this.delayBetweenRequests * attempt;
                    console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

            } catch (error) {
                console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
                if (attempt === this.retryAttempts) {
                    throw error;
                }
            }
        }

        throw new Error(`Falha após ${this.retryAttempts} tentativas`);
    }

    async scrapeWithDirectRequest(url) {
        const userAgent = this.getRandomUserAgent();
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            timeout: 15000,
            maxRedirects: 5,
            validateStatus: (status) => status < 400
        });

        return this.parseProductData(response.data, url);
    }

    async scrapeWithProxy(url) {
        if (this.proxies.length === 0) {
            throw new Error('Nenhum proxy configurado');
        }

        const proxy = this.proxies[Math.floor(Math.random() * this.proxies.length)];
        const agent = proxy.startsWith('socks') 
            ? new SocksProxyAgent(proxy)
            : new HttpsProxyAgent(proxy);

        const response = await axios.get(url, {
            httpsAgent: agent,
            headers: {
                'User-Agent': this.getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 20000
        });

        return this.parseProductData(response.data, url);
    }

    async scrapeWithMobileUserAgent(url) {
        const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': mobileUserAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
            },
            timeout: 15000
        });

        return this.parseProductData(response.data, url);
    }

    async scrapeWithDelayedRequest(url) {
        // Aguardar um tempo aleatório antes da requisição
        const delay = Math.random() * 3000 + 1000; // 1-4 segundos
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.scrapeWithDirectRequest(url);
    }

    parseProductData(html, url) {
        const $ = cheerio.load(html);
        
        // Múltiplos seletores para cada campo
        const title = this.extractTitle($);
        const price = this.extractPrice($);
        const rating = this.extractRating($);
        const reviews = this.extractReviews($);
        const image = this.extractImage($);
        const seller = this.extractSeller($);
        const stock = this.extractStock($);

        return {
            title: title || 'Produto AliExpress',
            price: price || 'N/A',
            currency: 'USD',
            rating: rating || 'N/A',
            reviews: reviews || 'N/A',
            image: image || this.generatePlaceholderImage(title),
            seller: { name: seller || 'Loja AliExpress' },
            stock: stock || 'Em Estoque',
            skus: this.generateSKU(url)
        };
    }

    extractTitle($) {
        const selectors = [
            // Seletores 2025 atualizados
            'h1[data-pl="product-title"]',
            '.product-title-text',
            'h1.product-title',
            '.pdp-product-name',
            '.product-title',
            '.product-name',
            'h1[class*="title"]',
            'h1[class*="name"]',
            '.title',
            'h1',
            'title'
        ];

        for (const selector of selectors) {
            const title = $(selector).first().text().trim();
            if (title && title.length > 5 && !title.includes('AliExpress')) {
                return title;
            }
        }
        
        // Fallback: extrair do JSON-LD
        const jsonLd = $('script[type="application/ld+json"]').html();
        if (jsonLd) {
            try {
                const data = JSON.parse(jsonLd);
                if (data.name) return data.name;
            } catch (e) {}
        }
        
        return null;
    }

    extractPrice($) {
        const selectors = [
            // Seletores 2025 para preços
            '.notranslate',
            '.product-price-value',
            '.price-current',
            '.pdp-price',
            '[data-pl="price"]',
            '.price-current',
            '.price-value',
            '.current-price',
            '.sale-price',
            '.price',
            '[class*="price"]'
        ];

        for (const selector of selectors) {
            const priceText = $(selector).first().text().trim();
            const price = this.parsePrice(priceText);
            if (price && price !== '0') {
                return price;
            }
        }
        
        // Fallback: extrair do JSON-LD
        const jsonLd = $('script[type="application/ld+json"]').html();
        if (jsonLd) {
            try {
                const data = JSON.parse(jsonLd);
                if (data.offers && data.offers.price) {
                    return data.offers.price.toString();
                }
            } catch (e) {}
        }
        
        return null;
    }

    extractRating($) {
        const selectors = [
            // Seletores 2025 para ratings
            '.overview-rating-average',
            '.rating-average',
            '.product-rating',
            '[data-pl="rating"]',
            '.rating-value',
            '.star-rating',
            '.rating-score',
            '[class*="rating"]',
            '[class*="star"]'
        ];

        for (const selector of selectors) {
            const rating = $(selector).first().text().trim();
            const ratingNum = this.parseRating(rating);
            if (ratingNum && ratingNum > 0) {
                return ratingNum.toString();
            }
        }
        
        // Fallback: extrair do JSON-LD
        const jsonLd = $('script[type="application/ld+json"]').html();
        if (jsonLd) {
            try {
                const data = JSON.parse(jsonLd);
                if (data.aggregateRating && data.aggregateRating.ratingValue) {
                    return data.aggregateRating.ratingValue.toString();
                }
            } catch (e) {}
        }
        
        return null;
    }

    extractReviews($) {
        const selectors = [
            '.product-reviewer-reviews',
            '.review-count',
            '.rating-reviews',
            '[data-pl="reviews"]'
        ];

        for (const selector of selectors) {
            const reviews = $(selector).first().text().trim();
            const count = this.parseNumber(reviews);
            if (count) {
                return count.toString();
            }
        }
        return null;
    }

    extractImage($) {
        const selectors = [
            '.images-view-item img',
            '.product-image img',
            '.pdp-image img',
            'img[data-pl="product-image"]'
        ];

        for (const selector of selectors) {
            const img = $(selector).first();
            const src = img.attr('src') || img.attr('data-src');
            if (src && src.startsWith('http')) {
                return src;
            }
        }
        return null;
    }

    extractSeller($) {
        const selectors = [
            '.shop-name',
            '.seller-name',
            '.store-name',
            '[data-pl="seller"]'
        ];

        for (const selector of selectors) {
            const seller = $(selector).first().text().trim();
            if (seller) {
                return seller;
            }
        }
        return null;
    }

    extractStock($) {
        const selectors = [
            '.product-quantity',
            '.stock-info',
            '.availability',
            '[data-pl="stock"]'
        ];

        for (const selector of selectors) {
            const stock = $(selector).first().text().trim();
            if (stock) {
                return stock;
            }
        }
        return null;
    }

    parsePrice(priceText) {
        const match = priceText.match(/[\d,]+\.?\d*/);
        return match ? match[0].replace(',', '') : null;
    }

    parseNumber(text) {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }

    parseRating(ratingText) {
        // Extrair rating de texto como "4.5", "4.5/5", "4.5 stars", etc.
        const match = ratingText.match(/(\d+\.?\d*)/);
        if (match) {
            const rating = parseFloat(match[1]);
            return rating <= 5 ? rating : null; // AliExpress usa escala de 5
        }
        return null;
    }

    generateSKU(url) {
        const match = url.match(/\/(\d+)\.html/);
        return match ? `AE-${match[1]}` : 'AE-UNKNOWN';
    }

    generatePlaceholderImage(title) {
        const encodedTitle = encodeURIComponent(title || 'Produto');
        return `data:image/svg+xml;base64,${Buffer.from(`
            <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="300" fill="#f8f9fa"/>
                <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6c757d" text-anchor="middle" dy=".3em">
                    ${encodedTitle}
                </text>
            </svg>
        `).toString('base64')}`;
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async testConnectivity() {
        const testUrls = [
            'https://pt.aliexpress.com',
            'https://www.aliexpress.com',
            'https://m.aliexpress.com'
        ];

        const results = [];
        
        for (const url of testUrls) {
            try {
                const response = await axios.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': this.getRandomUserAgent()
                    }
                });
                
                results.push({
                    url: url,
                    accessible: true,
                    status: response.status,
                    responseTime: response.headers['x-response-time'] || 'N/A'
                });
                
            } catch (error) {
                results.push({
                    url: url,
                    accessible: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}

export default AdvancedAliExpressScraper;
