/**
 * AliExpress Migration Helper
 * Prepara o sistema para migração para conta de afiliado
 */

class AliExpressMigrationHelper {
    constructor() {
        this.currentConfig = null;
        this.newConfig = null;
        this.migrationStatus = 'preparing';
    }

    /**
     * Carrega configuração atual
     */
    async loadCurrentConfig() {
        try {
            // Em vez de ler arquivo sensível, obter status via API segura
            const response = await fetch('/api/auth/status');
            const status = await response.json();
            this.currentConfig = { aliexpress: { configured: !!status?.system_ready } };
            console.log('✅ Status atual carregado:', this.currentConfig);
            return this.currentConfig;
        } catch (error) {
            console.error('❌ Erro ao carregar status atual:', error);
            throw error;
        }
    }

    /**
     * Prepara nova configuração para conta de afiliado
     */
    prepareNewConfig(newCredentials) {
        this.newConfig = {
            aliexpress: {
                apiKey: newCredentials.apiKey,
                secretKey: newCredentials.secretKey,
                trackingId: newCredentials.trackingId,
                baseUrl: 'https://api-sg.aliexpress.com',
                rateLimit: '1000 requests/hour',
                ipWhitelist: true
            },
            mongodb: {
                ...this.currentConfig.mongodb,
                timeouts: {
                    serverSelection: 2000, // Reduzido de 5000
                    socket: 10000 // Reduzido de 45000
                }
            },
            webhooks: {
                endpoint: '/api/aliexpress-callback',
                secret: newCredentials.webhookSecret,
                events: [
                    'order_created',
                    'order_paid', 
                    'order_shipped',
                    'order_delivered',
                    'order_cancelled'
                ]
            }
        };
        
        console.log('✅ Nova configuração preparada:', this.newConfig);
        return this.newConfig;
    }

    /**
     * Testa conectividade com nova API
     */
    async testNewAPI() {
        const tests = {
            authentication: false,
            products: false,
            orders: false,
            webhooks: false
        };

        try {
            // Teste 1: Autenticação
            console.log('🔐 Testando autenticação...');
            const authResult = await this.testAuthentication();
            tests.authentication = authResult.success;

            // Teste 2: Produtos
            console.log('📦 Testando produtos...');
            const productsResult = await this.testProducts();
            tests.products = productsResult.success;

            // Teste 3: Pedidos
            console.log('🛒 Testando pedidos...');
            const ordersResult = await this.testOrders();
            tests.orders = ordersResult.success;

            // Teste 4: Webhooks
            console.log('🔗 Testando webhooks...');
            const webhooksResult = await this.testWebhooks();
            tests.webhooks = webhooksResult.success;

            console.log('📊 Resultados dos testes:', tests);
            return tests;

        } catch (error) {
            console.error('❌ Erro nos testes:', error);
            return { ...tests, error: error.message };
        }
    }

    /**
     * Testa autenticação com nova API
     */
    async testAuthentication() {
        try {
            const response = await fetch('/api/aliexpress-auth-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: this.newConfig.aliexpress.apiKey,
                    secretKey: this.newConfig.aliexpress.secretKey
                })
            });

            const result = await response.json();
            return {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Testa busca de produtos
     */
    async testProducts() {
        try {
            const response = await fetch('/api/aliexpress-products-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    limit: 5,
                    test: true
                })
            });

            const result = await response.json();
            return {
                success: result.success,
                productsFound: result.products?.length || 0,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Testa criação de pedidos
     */
    async testOrders() {
        try {
            const response = await fetch('/api/aliexpress-orders-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test: true,
                    dryRun: true
                })
            });

            const result = await response.json();
            return {
                success: result.success,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Testa configuração de webhooks
     */
    async testWebhooks() {
        try {
            const response = await fetch('/api/aliexpress-webhooks-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: this.newConfig.webhooks.endpoint,
                    secret: this.newConfig.webhooks.secret,
                    events: this.newConfig.webhooks.events
                })
            });

            const result = await response.json();
            return {
                success: result.success,
                message: result.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Executa migração completa
     */
    async executeMigration() {
        console.log('🚀 Iniciando migração para conta de afiliado...');
        
        try {
            // 1. Backup da configuração atual
            await this.backupCurrentConfig();
            
            // 2. Testar nova API
            const testResults = await this.testNewAPI();
            
            // 3. Se todos os testes passaram, aplicar nova configuração
            if (this.allTestsPassed(testResults)) {
                await this.applyNewConfig();
                console.log('✅ Migração concluída com sucesso!');
                return { success: true, message: 'Migração concluída' };
            } else {
                console.log('❌ Alguns testes falharam, migração cancelada');
                return { success: false, message: 'Testes falharam', details: testResults };
            }
            
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica se todos os testes passaram
     */
    allTestsPassed(testResults) {
        return testResults.authentication && 
               testResults.products && 
               testResults.orders && 
               testResults.webhooks;
    }

    /**
     * Faz backup da configuração atual
     */
    async backupCurrentConfig() {
        const backup = {
            timestamp: new Date().toISOString(),
            config: this.currentConfig,
            migration: 'to_affiliate_account'
        };
        
        // Salvar backup localmente
        localStorage.setItem('aliexpress_config_backup', JSON.stringify(backup));
        console.log('✅ Backup da configuração atual salvo');
    }

    /**
     * Aplica nova configuração
     */
    async applyNewConfig() {
        try {
            // Atualizar arquivo de configuração
            const response = await fetch('/api/update-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.newConfig)
            });

            if (response.ok) {
                console.log('✅ Nova configuração aplicada');
                this.migrationStatus = 'completed';
            } else {
                throw new Error('Falha ao aplicar nova configuração');
            }
        } catch (error) {
            console.error('❌ Erro ao aplicar nova configuração:', error);
            throw error;
        }
    }

    /**
     * Monitora status da migração
     */
    getMigrationStatus() {
        return {
            status: this.migrationStatus,
            currentConfig: this.currentConfig,
            newConfig: this.newConfig,
            timestamp: new Date().toISOString()
        };
    }
}

// Exportar para uso global
window.AliExpressMigrationHelper = AliExpressMigrationHelper;

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.aliExpressMigrationHelper = new AliExpressMigrationHelper();
    console.log('🔄 AliExpress Migration Helper inicializado');
});

