import axios from 'axios';
import crypto from 'crypto';

class AliExpressOAuthManager {
    constructor() {
        this.credentials = {
            appKey: '520258',
            appSecret: 'HWUOyFoxVp9U5EoiM1U4febs77IUFDX3',
            trackingId: '520258'
        };
        
        this.oauthConfig = {
            authorizeUrl: 'https://oauth.aliexpress.com/authorize',
            tokenUrl: 'https://oauth.aliexpress.com/token',
            redirectUri: 'https://beautyhub-site.onrender.com/api/aliexpress-callback',
            scopes: ['read', 'write'],
            state: this.generateState()
        };
        
        this.tokens = {
            accessToken: null,
            refreshToken: null,
            expiresAt: null
        };
        
        this.isInitialized = false;
    }

    generateState() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateSignString(params) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}${params[key]}`)
            .join('');
        
        return `${this.credentials.appSecret}${sortedParams}${this.credentials.appSecret}`;
    }

    generateMD5(string) {
        return crypto.createHash('md5').update(string).digest('hex').toUpperCase();
    }

    // Passo 1: Gerar URL de autorização
    generateAuthorizationUrl() {
        const params = {
            response_type: 'code',
            client_id: this.credentials.appKey,
            redirect_uri: this.oauthConfig.redirectUri,
            state: this.oauthConfig.state,
            view: 'web',
            sp: 'ae'
        };

        const queryString = Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        return `${this.oauthConfig.authorizeUrl}?${queryString}`;
    }

    // Passo 2: Trocar código por token
    async exchangeCodeForToken(authorizationCode) {
        try {
            console.log('🔄 Trocando código de autorização por token...');
            
            const params = {
                grant_type: 'authorization_code',
                client_id: this.credentials.appKey,
                client_secret: this.credentials.appSecret,
                code: authorizationCode,
                redirect_uri: this.oauthConfig.redirectUri,
                sp: 'ae'
            };

            const response = await axios.post(this.oauthConfig.tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });

            if (response.data && response.data.access_token) {
                this.tokens = {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
                };

                console.log('✅ Token de acesso obtido com sucesso!');
                console.log(`📅 Expira em: ${this.tokens.expiresAt.toISOString()}`);
                
                return {
                    success: true,
                    accessToken: this.tokens.accessToken,
                    refreshToken: this.tokens.refreshToken,
                    expiresAt: this.tokens.expiresAt
                };
            } else {
                throw new Error('Resposta inválida do servidor OAuth');
            }

        } catch (error) {
            console.error('❌ Erro ao trocar código por token:', error.message);
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    // Passo 3: Renovar token se necessário
    async refreshAccessToken() {
        if (!this.tokens.refreshToken) {
            throw new Error('Refresh token não disponível');
        }

        try {
            console.log('🔄 Renovando token de acesso...');
            
            const params = {
                grant_type: 'refresh_token',
                client_id: this.credentials.appKey,
                client_secret: this.credentials.appSecret,
                refresh_token: this.tokens.refreshToken,
                sp: 'ae'
            };

            const response = await axios.post(this.oauthConfig.tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });

            if (response.data && response.data.access_token) {
                this.tokens = {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token || this.tokens.refreshToken,
                    expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
                };

                console.log('✅ Token renovado com sucesso!');
                return {
                    success: true,
                    accessToken: this.tokens.accessToken,
                    expiresAt: this.tokens.expiresAt
                };
            } else {
                throw new Error('Resposta inválida ao renovar token');
            }

        } catch (error) {
            console.error('❌ Erro ao renovar token:', error.message);
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    // Verificar se token é válido
    isTokenValid() {
        if (!this.tokens.accessToken || !this.tokens.expiresAt) {
            return false;
        }
        
        // Verificar se expira em menos de 5 minutos
        const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000));
        return this.tokens.expiresAt > fiveMinutesFromNow;
    }

    // Obter token válido (renovar se necessário)
    async getValidToken() {
        if (this.isTokenValid()) {
            return this.tokens.accessToken;
        }

        if (this.tokens.refreshToken) {
            const refreshResult = await this.refreshAccessToken();
            if (refreshResult.success) {
                return this.tokens.accessToken;
            }
        }

        throw new Error('Token inválido e não foi possível renovar');
    }

    // Testar token com API
    async testToken() {
        try {
            const token = await this.getValidToken();
            
            const params = {
                app_key: this.credentials.appKey,
                method: 'aliexpress.ds.product.get',
                product_id: '1005009428867608',
                access_token: token,
                format: 'json',
                v: '2.0',
                sign_method: 'md5',
                timestamp: Date.now().toString()
            };

            const signString = this.generateSignString(params);
            params.sign = this.generateMD5(signString);

            const response = await axios.get('https://api-sg.aliexpress.com/sync', {
                params: params,
                timeout: 10000
            });

            return {
                success: !response.data.error_response,
                error: response.data.error_response?.msg || null,
                data: response.data
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Inicializar OAuth (gerar URL de autorização)
    initializeOAuth() {
        const authUrl = this.generateAuthorizationUrl();
        console.log('🔗 URL de autorização gerada:');
        console.log(authUrl);
        
        return {
            success: true,
            authorizationUrl: authUrl,
            state: this.oauthConfig.state,
            instructions: [
                '1. Acesse a URL de autorização acima',
                '2. Faça login no AliExpress',
                '3. Autorize o aplicativo',
                '4. Copie o código de autorização da URL de retorno',
                '5. Use o endpoint /api/aliexpress/oauth/exchange com o código'
            ]
        };
    }

    // Status do OAuth
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasAccessToken: !!this.tokens.accessToken,
            hasRefreshToken: !!this.tokens.refreshToken,
            isTokenValid: this.isTokenValid(),
            expiresAt: this.tokens.expiresAt?.toISOString() || null,
            state: this.oauthConfig.state
        };
    }
}

export default AliExpressOAuthManager;
