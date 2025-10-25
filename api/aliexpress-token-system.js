/**
 * AliExpress Token System - 100% Funcional
 * Sistema completo para gerenciar tokens do AliExpress
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do sistema de token
const TOKEN_SYSTEM_CONFIG = {
    // Endpoints oficiais do AliExpress
    authBaseUrl: 'https://auth.aliexpress.com',
    apiBaseUrl: 'https://api-sg.aliexpress.com',
    
    // Arquivos de configuração
    credentialsFile: path.join(__dirname, '../config/api_credentials.json'),
    tokensFile: path.join(__dirname, '../data/aliexpress_tokens.json'),
    
    // Configurações de token
    tokenExpiryBuffer: 300000, // 5 minutos antes do vencimento
    maxRetries: 3,
    retryDelay: 2000
};

/**
 * Classe Principal do Sistema de Token
 */
class AliExpressTokenSystem {
    constructor() {
        this.credentials = this.loadCredentials();
        this.tokens = this.loadTokens();
        this.isRefreshing = false;
        this.lastError = null;
    }

    /**
     * Carregar credenciais do arquivo
     */
    loadCredentials() {
        try {
            if (!fs.existsSync(TOKEN_SYSTEM_CONFIG.credentialsFile)) {
                throw new Error('Arquivo de credenciais não encontrado');
            }
            
            const credentialsData = fs.readFileSync(TOKEN_SYSTEM_CONFIG.credentialsFile, 'utf8');
            const credentials = JSON.parse(credentialsData);
            
            if (!credentials.aliexpress) {
                throw new Error('Credenciais AliExpress não encontradas');
            }
            
            console.log('✅ Credenciais carregadas com sucesso');
            return credentials.aliexpress;
            
        } catch (error) {
            console.error('❌ Erro ao carregar credenciais:', error.message);
            throw new Error(`Falha ao carregar credenciais: ${error.message}`);
        }
    }

    /**
     * Carregar tokens salvos
     */
    loadTokens() {
        try {
            if (fs.existsSync(TOKEN_SYSTEM_CONFIG.tokensFile)) {
                const tokenData = fs.readFileSync(TOKEN_SYSTEM_CONFIG.tokensFile, 'utf8');
                const tokens = JSON.parse(tokenData);
                console.log('✅ Tokens carregados do arquivo');
                return tokens;
            }
        } catch (error) {
            console.log('⚠️ Tokens não encontrados, será necessário nova autorização');
        }
        return {};
    }

    /**
     * Salvar tokens no arquivo
     */
    saveTokens() {
        try {
            const tokenDir = path.dirname(TOKEN_SYSTEM_CONFIG.tokensFile);
            if (!fs.existsSync(tokenDir)) {
                fs.mkdirSync(tokenDir, { recursive: true });
            }
            
            fs.writeFileSync(TOKEN_SYSTEM_CONFIG.tokensFile, JSON.stringify(this.tokens, null, 2));
            console.log('✅ Tokens salvos com sucesso');
        } catch (error) {
            console.error('❌ Erro ao salvar tokens:', error);
        }
    }

    /**
     * Verificar se access token é válido
     */
    isAccessTokenValid() {
        if (!this.tokens.access_token) return false;
        
        const now = Date.now();
        const expiryTime = this.tokens.expire_time || 0;
        
        return now < (expiryTime - TOKEN_SYSTEM_CONFIG.tokenExpiryBuffer);
    }

    /**
     * Verificar se refresh token é válido
     */
    isRefreshTokenValid() {
        if (!this.tokens.refresh_token) return false;
        
        const now = Date.now();
        const refreshExpiryTime = this.tokens.refresh_token_valid_time || 0;
        
        return now < refreshExpiryTime;
    }

    /**
     * Gerar URL de autorização
     */
    generateAuthorizationUrl(redirectUri, state = null) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.credentials.apiKey,
            redirect_uri: redirectUri,
            scope: 'read write',
            state: state || `auth_${Date.now()}`
        });

        const authUrl = `${TOKEN_SYSTEM_CONFIG.authBaseUrl}/oauth/authorize?${params.toString()}`;
        
        console.log('🔐 URL de autorização gerada:', authUrl);
        return authUrl;
    }

    /**
     * Trocar código de autorização por token
     */
    async exchangeCodeForToken(code, uuid = null) {
        try {
            console.log('🔑 Trocando código por token...');
            
            const tokenUrl = `${TOKEN_SYSTEM_CONFIG.apiBaseUrl}/oauth/token`;
            
            const requestBody = {
                grant_type: 'authorization_code',
                client_id: this.credentials.apiKey,
                client_secret: this.credentials.secretKey,
                code: code,
                redirect_uri: 'http://localhost:3001/auth/callback'
            };

            // Adicionar uuid se fornecido
            if (uuid) {
                requestBody.uuid = uuid;
            }

            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'AliExpress-Dropship-API/1.0',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams(requestBody).toString()
            });

            const responseData = await response.json();

            if (response.ok && responseData.access_token) {
                // Salvar tokens conforme documentação oficial
                this.tokens = {
                    access_token: responseData.access_token,
                    refresh_token: responseData.refresh_token,
                    expires_in: responseData.expires_in,
                    expire_time: responseData.expire_time || (Date.now() + (responseData.expires_in * 1000)),
                    refresh_expires_in: responseData.refresh_expires_in,
                    refresh_token_valid_time: responseData.refresh_token_valid_time || (Date.now() + (responseData.refresh_expires_in * 1000)),
                    account_id: responseData.account_id,
                    user_id: responseData.user_id,
                    seller_id: responseData.seller_id,
                    user_nick: responseData.user_nick,
                    havana_id: responseData.havana_id,
                    account_platform: responseData.account_platform,
                    account: responseData.account,
                    sp: responseData.sp,
                    locale: responseData.locale,
                    timestamp: Date.now()
                };

                this.saveTokens();
                this.lastError = null;
                
                console.log('✅ Token obtido com sucesso!');
                console.log('📋 Detalhes do token:', {
                    access_token: this.tokens.access_token.substring(0, 20) + '...',
                    expires_in: this.tokens.expires_in,
                    user_id: this.tokens.user_id,
                    seller_id: this.tokens.seller_id,
                    account_platform: this.tokens.account_platform
                });

                return {
                    success: true,
                    access_token: this.tokens.access_token,
                    expires_in: this.tokens.expires_in,
                    user_id: this.tokens.user_id,
                    seller_id: this.tokens.seller_id,
                    account_platform: this.tokens.account_platform
                };
            } else {
                this.lastError = responseData.error || responseData.message || 'Erro desconhecido';
                console.error('❌ Erro ao obter token:', this.lastError);
                return {
                    success: false,
                    error: this.lastError,
                    error_code: responseData.error_code,
                    data: responseData
                };
            }

        } catch (error) {
            this.lastError = error.message;
            console.error('❌ Erro na troca de código por token:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Renovar token usando refresh token
     */
    async refreshAccessToken() {
        try {
            if (this.isRefreshing) {
                console.log('⏳ Token já está sendo renovado, aguardando...');
                let attempts = 0;
                while (this.isRefreshing && attempts < 30) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
                return this.tokens.access_token;
            }

            if (!this.isRefreshTokenValid()) {
                throw new Error('Refresh token expirado ou inválido');
            }

            this.isRefreshing = true;
            console.log('🔄 Renovando token...');

            const refreshUrl = `${TOKEN_SYSTEM_CONFIG.apiBaseUrl}/oauth/refresh`;
            
            const response = await fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'AliExpress-Dropship-API/1.0',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: this.credentials.apiKey,
                    client_secret: this.credentials.secretKey,
                    refresh_token: this.tokens.refresh_token
                }).toString()
            });

            const responseData = await response.json();

            if (response.ok && responseData.access_token) {
                // Atualizar tokens
                this.tokens = {
                    ...this.tokens,
                    access_token: responseData.access_token,
                    refresh_token: responseData.refresh_token,
                    expires_in: responseData.expires_in,
                    expire_time: responseData.expire_time || (Date.now() + (responseData.expires_in * 1000)),
                    refresh_expires_in: responseData.refresh_expires_in,
                    refresh_token_valid_time: responseData.refresh_token_valid_time || (Date.now() + (responseData.refresh_expires_in * 1000)),
                    timestamp: Date.now()
                };

                this.saveTokens();
                this.lastError = null;
                
                console.log('✅ Token renovado com sucesso!');
                return this.tokens.access_token;
            } else {
                this.lastError = responseData.error || responseData.message || 'Erro ao renovar token';
                console.error('❌ Erro ao renovar token:', this.lastError);
                throw new Error(this.lastError);
            }

        } catch (error) {
            this.lastError = error.message;
            console.error('❌ Erro na renovação do token:', error);
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Obter token válido (principal método)
     */
    async getValidToken() {
        try {
            // Verificar se token atual é válido
            if (this.isAccessTokenValid()) {
                console.log('✅ Token atual é válido');
                return this.tokens.access_token;
            }

            // Tentar renovar token
            if (this.isRefreshTokenValid()) {
                console.log('🔄 Token expirado, renovando...');
                return await this.refreshAccessToken();
            }

            // Se chegou aqui, precisa de nova autorização
            throw new Error('Token expirado e refresh token inválido. Nova autorização necessária.');

        } catch (error) {
            this.lastError = error.message;
            console.error('❌ Erro ao obter token válido:', error);
            throw error;
        }
    }

    /**
     * Obter estatísticas completas do sistema
     */
    getSystemStats() {
        const now = Date.now();
        return {
            // Status dos tokens
            hasAccessToken: !!this.tokens.access_token,
            hasRefreshToken: !!this.tokens.refresh_token,
            isAccessTokenValid: this.isAccessTokenValid(),
            isRefreshTokenValid: this.isRefreshTokenValid(),
            
            // Informações de tempo
            accessTokenExpiry: this.tokens.expire_time ? new Date(this.tokens.expire_time) : null,
            refreshTokenExpiry: this.tokens.refresh_token_valid_time ? new Date(this.tokens.refresh_token_valid_time) : null,
            timeUntilAccessExpiry: this.tokens.expire_time ? Math.max(0, this.tokens.expire_time - now) : 0,
            timeUntilRefreshExpiry: this.tokens.refresh_token_valid_time ? Math.max(0, this.tokens.refresh_token_valid_time - now) : 0,
            
            // Informações da conta
            user_id: this.tokens.user_id,
            seller_id: this.tokens.seller_id,
            account_platform: this.tokens.account_platform,
            user_nick: this.tokens.user_nick,
            
            // Status do sistema
            isRefreshing: this.isRefreshing,
            lastError: this.lastError,
            credentialsLoaded: !!this.credentials,
            apiKey: this.credentials?.apiKey || 'N/A'
        };
    }

    /**
     * Limpar todos os tokens
     */
    clearAllTokens() {
        this.tokens = {};
        this.saveTokens();
        this.lastError = null;
        console.log('🗑️ Todos os tokens foram limpos');
    }

    /**
     * Verificar se sistema está pronto
     */
    isSystemReady() {
        return !!this.credentials && !!this.credentials.apiKey;
    }
}

// Instância global
let globalTokenSystem = null;

/**
 * Obter instância do sistema de token
 */
export function getTokenSystem() {
    if (!globalTokenSystem) {
        globalTokenSystem = new AliExpressTokenSystem();
    }
    return globalTokenSystem;
}

/**
 * Gerar URL de autorização
 */
export function generateAuthUrl(redirectUri, state = null) {
    const tokenSystem = getTokenSystem();
    return tokenSystem.generateAuthorizationUrl(redirectUri, state);
}

/**
 * Trocar código por token
 */
export async function exchangeCodeForToken(code, uuid = null) {
    const tokenSystem = getTokenSystem();
    return await tokenSystem.exchangeCodeForToken(code, uuid);
}

/**
 * Obter token válido
 */
export async function getValidToken() {
    const tokenSystem = getTokenSystem();
    return await tokenSystem.getValidToken();
}

/**
 * Obter estatísticas do sistema
 */
export function getSystemStats() {
    const tokenSystem = getTokenSystem();
    return tokenSystem.getSystemStats();
}

/**
 * Limpar tokens
 */
export function clearAllTokens() {
    const tokenSystem = getTokenSystem();
    return tokenSystem.clearAllTokens();
}

/**
 * Verificar se sistema está pronto
 */
export function isSystemReady() {
    const tokenSystem = getTokenSystem();
    return tokenSystem.isSystemReady();
}

export default AliExpressTokenSystem;

