/**
 * AliExpress Dropship API - Implementação 2025
 * Baseado no changelog oficial e documentação atualizada
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addRequiredParams, validateApiResponse } from './aliexpress-signature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar credenciais
let credentials = null;
try {
    const credentialsPath = path.join(__dirname, '../config/api_credentials.json');
    const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
    credentials = JSON.parse(credentialsData);
} catch (error) {
    console.error('Erro ao carregar credenciais:', error);
}

/**
 * Classe para API Dropship AliExpress 2025
 */
class AliExpressDropshipAPI {
    constructor() {
        this.appKey = credentials?.aliexpress?.apiKey || '520258';
        this.appSecret = credentials?.aliexpress?.secretKey || 'HWUOyFoxVp9U5EoiM1U4febs77IUFDX3';
        this.trackingId = credentials?.aliexpress?.trackingId || '520258';
        this.baseUrl = 'https://api.aliexpress.com';
        this.accessToken = null;
        this.sessionKey = null;
    }

    /**
     * Obter token de acesso
     */
    async getAccessToken() {
        try {
            console.log('🔑 Obtendo token de acesso Dropship API...');
            
            // Preparar parâmetros com assinatura
            const baseParams = {
                grant_type: 'client_credentials',
                client_id: this.appKey,
                client_secret: this.appSecret,
                countryCodes: ["US", "GB", "DE", "FR"] // Países permitidos
            };
            
            const signedParams = addRequiredParams(baseParams, this.appKey, this.appSecret);
            
            const response = await fetch(`${this.baseUrl}/oauth/authorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signedParams)
            });

            if (response.ok) {
                const data = await response.json();
                
                // Validar resposta
                if (!validateApiResponse(data)) {
                    throw new Error('Resposta inválida da API - possível restrição geográfica');
                }
                
                this.accessToken = data.access_token;
                console.log('✅ Token Dropship obtido com sucesso');
                return this.accessToken;
            } else {
                throw new Error('Falha na autenticação Dropship API');
            }
        } catch (error) {
            console.error('❌ Erro ao obter token Dropship:', error);
            throw error;
        }
    }

    /**
     * Buscar produto por ID (aliexpress.ds.product.get)
     */
    async getProduct(productId) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            console.log(`🔍 Buscando produto Dropship ${productId}...`);
            
            const response = await fetch(`${this.baseUrl}/product/detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    tracking_id: this.trackingId,
                    remove_personal_benefit: true // Preço sem promoções pessoais
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.formatDropshipProductData(data);
            } else {
                throw new Error('Falha ao buscar produto via Dropship API');
            }
        } catch (error) {
            console.error('❌ Erro na Dropship API:', error);
            throw error;
        }
    }

    /**
     * Buscar produtos por texto (aliexpress.ds.text.search)
     */
    async searchProducts(keywords, options = {}) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            console.log(`🔍 Buscando produtos: "${keywords}"...`);
            
            const response = await fetch(`${this.baseUrl}/product/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    keywords: keywords,
                    tracking_id: this.trackingId,
                    page_size: options.pageSize || 20,
                    page_no: options.pageNo || 1,
                    selectionName: options.selectionName || null,
                    remove_personal_benefit: true
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.formatSearchResults(data);
            } else {
                throw new Error('Falha na busca de produtos');
            }
        } catch (error) {
            console.error('❌ Erro na busca Dropship:', error);
            throw error;
        }
    }

    /**
     * Consultar frete (aliexpress.ds.freight.query)
     */
    async queryFreight(productId, quantity = 1, countryCode = 'US') {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            console.log(`🚚 Consultando frete para produto ${productId}...`);
            
            const response = await fetch(`${this.baseUrl}/freight/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    country_code: countryCode,
                    tracking_id: this.trackingId
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.formatFreightData(data);
            } else {
                throw new Error('Falha ao consultar frete');
            }
        } catch (error) {
            console.error('❌ Erro na consulta de frete:', error);
            throw error;
        }
    }

    /**
     * Criar pedido (aliexpress.ds.order.create)
     */
    async createOrder(orderData) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            console.log(`📦 Criando pedido Dropship...`);
            
            const response = await fetch(`${this.baseUrl}/order/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    ...orderData,
                    tracking_id: this.trackingId
                })
            });

            if (response.ok) {
                const data = await response.json();
                return this.formatOrderData(data);
            } else {
                throw new Error('Falha ao criar pedido');
            }
        } catch (error) {
            console.error('❌ Erro ao criar pedido:', error);
            throw error;
        }
    }

    /**
     * Formatar dados do produto Dropship
     */
    formatDropshipProductData(apiData) {
        try {
            const product = apiData.result || apiData.data || apiData;
            
            return {
                product_id: product.product_id || product.id,
                title: product.title || product.name,
                price: product.price || product.offer_sale_price,
                currency: product.currency || 'USD',
                images: product.images || product.imageList || [],
                description: product.description || product.desc || '',
                rating: product.rating || product.ratingValue || '0',
                reviews: product.reviews || product.reviewCount || '0',
                stock: product.stock || product.availability || 'unknown',
                seller: product.seller?.name || product.store?.name || 'AliExpress Store',
                shipping: product.shipping || product.delivery || '7-15 days',
                skus: product.skus || product.variations || [],
                url: product.url || '',
                scraped_at: new Date(),
                source: 'aliexpress_dropship_api_2025',
                availability: product.stock !== 'unknown' ? 'available' : 'unknown',
                // Novos campos 2025
                media_url: product.media_url || null, // Vídeos
                price_include_tax: product.price_include_tax || false,
                wholesale_price_tiers: product.wholesale_price_tiers || [],
                mayHavePFS: product.mayHavePFS || 'N', // Free Shipping
                free_shipping_threshold: product.free_shipping_threshold || null,
                limit_strategy: product.limit_strategy || null,
                buy_amount_limit_set_by_promotion: product.buy_amount_limit_set_by_promotion || null,
                // Dados específicos da API
                api_response: {
                    success: true,
                    timestamp: new Date(),
                    method: 'dropship_api_2025',
                    version: '2025'
                }
            };
        } catch (error) {
            console.error('Erro ao formatar dados Dropship:', error);
            throw error;
        }
    }

    /**
     * Formatar resultados de busca
     */
    formatSearchResults(apiData) {
        try {
            const results = apiData.result || apiData.data || [];
            return results.map(product => this.formatDropshipProductData({ result: product }));
        } catch (error) {
            console.error('Erro ao formatar resultados de busca:', error);
            throw error;
        }
    }

    /**
     * Formatar dados de frete
     */
    formatFreightData(apiData) {
        try {
            const freight = apiData.result || apiData.data || apiData;
            return {
                product_id: freight.product_id,
                quantity: freight.quantity,
                country_code: freight.country_code,
                shipping_methods: freight.shipping_methods || [],
                free_shipping_available: freight.mayHavePFS === 'Y',
                free_shipping_threshold: freight.free_shipping_threshold,
                estimated_delivery: freight.estimated_delivery || '7-15 days',
                source: 'aliexpress_dropship_freight_api'
            };
        } catch (error) {
            console.error('Erro ao formatar dados de frete:', error);
            throw error;
        }
    }

    /**
     * Formatar dados do pedido
     */
    formatOrderData(apiData) {
        try {
            const order = apiData.result || apiData.data || apiData;
            return {
                order_id: order.order_id,
                status: order.status,
                total_amount: order.total_amount,
                currency: order.currency,
                shipping_discount_fee: order.shipping_discount_fee || 0,
                pay_timeout_second: order.pay_timeout_second || 86400,
                created_at: new Date(),
                source: 'aliexpress_dropship_order_api'
            };
        } catch (error) {
            console.error('Erro ao formatar dados do pedido:', error);
            throw error;
        }
    }
}

// Instância global
let globalDropshipAPI = null;

/**
 * Função principal para usar a Dropship API
 */
export async function getProductFromDropshipAPI(url) {
    try {
        if (!globalDropshipAPI) {
            globalDropshipAPI = new AliExpressDropshipAPI();
        }
        
        // Extrair ID do produto da URL
        const productId = extractProductIdFromUrl(url);
        if (!productId) {
            throw new Error('Não foi possível extrair ID do produto da URL');
        }
        
        const result = await globalDropshipAPI.getProduct(productId);
        return {
            success: true,
            data: result,
            source: 'aliexpress_dropship_api_2025'
        };
    } catch (error) {
        console.error('❌ Erro na Dropship API:', error);
        return {
            success: false,
            error: error.message,
            source: 'aliexpress_dropship_api_error'
        };
    }
}

/**
 * Extrair ID do produto da URL
 */
function extractProductIdFromUrl(url) {
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

export default AliExpressDropshipAPI;
