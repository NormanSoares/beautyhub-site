import axios from 'axios';
import crypto from 'crypto';

class AliExpressCredentialsValidator {
    constructor() {
        this.credentials = {
            appKey: '520258',
            appSecret: 'HWUOyFoxVp9U5EoiM1U4febs77IUFDX3',
            trackingId: '520258'
        };
        this.baseUrl = 'https://api-sg.aliexpress.com/sync';
        this.oauthUrl = 'https://oauth.aliexpress.com';
    }

    async validateCredentials() {
        console.log('🔍 Validando credenciais AliExpress...');
        
        try {
            // Teste 1: Verificar se as credenciais são válidas
            const testResponse = await this.testBasicConnection();
            console.log('✅ Conexão básica:', testResponse);
            
            // Teste 2: Verificar método específico
            const methodResponse = await this.testSpecificMethod();
            console.log('✅ Método específico:', methodResponse);
            
            return {
                valid: true,
                tests: {
                    basic: testResponse,
                    method: methodResponse
                }
            };
            
        } catch (error) {
            console.error('❌ Erro na validação:', error.message);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    async testBasicConnection() {
        // Primeiro, vamos testar se as credenciais são válidas via OAuth
        try {
            const oauthTest = await this.testOAuthCredentials();
            if (oauthTest.valid) {
                console.log('✅ Credenciais OAuth válidas, testando API...');
            }
        } catch (error) {
            console.log('⚠️ OAuth não disponível, testando API diretamente...');
        }

        // Endpoint correto para dropshipping baseado no console AliExpress
        const params = {
            app_key: this.credentials.appKey,
            method: 'aliexpress.ds.product.get',
            product_id: '1005009428867608',
            access_token: 'test_token', // Token temporário para teste
            format: 'json',
            v: '2.0',
            sign_method: 'md5',
            timestamp: Date.now().toString()
        };

        // Gerar assinatura correta para 2025
        const signString = this.generateSignString(params);
        params.sign = this.generateMD5(signString);

        // Usar endpoint correto da documentação oficial 2025
        const apiUrl = 'https://api-sg.aliexpress.com/sync';
        
        const response = await axios.get(apiUrl, {
            params: params,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return {
            status: response.status,
            hasError: !!response.data.error_response,
            error: response.data.error_response || null,
            success: !!response.data.aliexpress_affiliate_product_detail_get_response,
            rawResponse: response.data
        };
    }

    async testOAuthCredentials() {
        // Testar se as credenciais são válidas via OAuth
        const oauthUrl = `${this.oauthUrl}/authorize`;
        const params = {
            response_type: 'code',
            client_id: this.credentials.appKey,
            redirect_uri: 'http://localhost:3001/callback',
            state: 'test_state',
            view: 'web',
            sp: 'ae'
        };

        try {
            const response = await axios.get(oauthUrl, {
                params: params,
                timeout: 10000,
                validateStatus: () => true // Aceitar qualquer status
            });

            return {
                valid: response.status === 200 || response.status === 302,
                status: response.status,
                url: response.request?.res?.responseUrl || oauthUrl
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    async testSpecificMethod() {
        // Testar diferentes métodos da API
        const methods = [
            'aliexpress.ds.order.create',              // Create dropshipping order
            'aliexpress.ds.category.get',              // Fetch AE Category
            'aliexpress.ds.freight.query',             // Delivery/Freight API
            'aliexpress.ds.order.tracking.get',        // Order tracking
            'aliexpress.ds.feed.itemids.get',          // Feed item IDs
            'aliexpress.logistics.buyer.freight.calculate', // Freight calculation
            'aliexpress.ds.image.searchV2',            // Image search for dropshipping
            'aliexpress.trade.ds.order.get',           // Trade order get
            'aliexpress.ds.member.benefit.get',        // Member benefits
            'aliexpress.ds.product.specialinfo.get',   // Product special info
            'aliexpress.ds.product.wholesale.get',     // Product wholesale
            'aliexpress.ds.product.get',               // Product info query for ds
            'aliexpress.ds.search.event.report',       // Search event report
            'aliexpress.ds.text.search'                // Text search for ds
        ];

        const results = [];
        
        for (const method of methods) {
            try {
                const params = {
                    app_key: this.credentials.appKey,
                    method: method,
                    format: 'json',
                    v: '2.0',
                    sign_method: 'md5',
                    timestamp: Date.now().toString()
                };

                // Adicionar parâmetros específicos para cada método
                if (method === 'aliexpress.ds.product.get') {
                    params.product_id = '1005009428867608';
                    params.access_token = 'test_token'; // Token temporário para teste
                } else if (method === 'aliexpress.ds.text.search') {
                    params.keywords = 'beauty products';
                    params.page_size = '10';
                    params.countryCode = 'BR'; // Parâmetro obrigatório
                } else if (method === 'aliexpress.ds.image.searchV2') {
                    params.image_url = 'https://via.placeholder.com/300x300';
                    params.access_token = 'test_token'; // Token temporário para teste
                } else if (method === 'aliexpress.ds.category.get') {
                    params.parent_category_id = '0';
                    params.countryCode = 'BR'; // Parâmetro obrigatório
                } else if (method === 'aliexpress.ds.freight.query') {
                    params.product_id = '1005009428867608';
                    params.country_code = 'BR';
                    params.access_token = 'test_token'; // Token temporário para teste
                }

                const signString = this.generateSignString(params);
                params.sign = this.generateMD5(signString);

                const response = await axios.get(this.baseUrl, {
                    params: params,
                    timeout: 5000
                });

                results.push({
                    method: method,
                    success: !!response.data[method.replace('aliexpress.affiliate.', '').replace('.', '_') + '_response'],
                    error: response.data.error_response?.msg || null
                });

            } catch (error) {
                results.push({
                    method: method,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    generateSignString(params) {
        // Ordenar parâmetros e criar string de assinatura
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}${params[key]}`)
            .join('');
        
        return `${this.credentials.appSecret}${sortedParams}${this.credentials.appSecret}`;
    }

    generateMD5(string) {
        return crypto.createHash('md5').update(string).digest('hex').toUpperCase();
    }

    async getAlternativeEndpoints() {
        const endpoints = [
            'https://api-sg.aliexpress.com/sync',
            'https://api.aliexpress.com/sync',
            'https://api-us.aliexpress.com/sync',
            'https://api-eu.aliexpress.com/sync'
        ];

        const results = [];
        
        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(endpoint, {
                    params: {
                        app_key: this.credentials.appKey,
                        method: 'aliexpress.affiliate.product.detail.get',
                        product_id: '1005009428867608',
                        tracking_id: this.credentials.trackingId
                    },
                    timeout: 5000
                });

                results.push({
                    endpoint: endpoint,
                    status: response.status,
                    accessible: true,
                    error: null
                });

            } catch (error) {
                results.push({
                    endpoint: endpoint,
                    status: error.response?.status || 'timeout',
                    accessible: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}

export default AliExpressCredentialsValidator;
