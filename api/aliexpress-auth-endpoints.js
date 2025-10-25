/**
 * AliExpress Authentication Endpoints
 * Endpoints para gerenciar autenticação e tokens
 */

import express from 'express';
import { 
    getTokenSystem, 
    generateAuthUrl, 
    exchangeCodeForToken, 
    getValidToken, 
    getSystemStats, 
    clearAllTokens, 
    isSystemReady 
} from './aliexpress-token-system.js';

const router = express.Router();

/**
 * Middleware de logging
 */
router.use((req, res, next) => {
    console.log(`🔐 ${req.method} ${req.path}`, {
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    next();
});

/**
 * GET /api/auth/status
 * Verificar status do sistema de token
 */
router.get('/status', (req, res) => {
    try {
        const stats = getSystemStats();
        
        res.json({
            success: true,
            system_ready: isSystemReady(),
            stats: stats,
            message: stats.isAccessTokenValid ? 'Sistema pronto com token válido' : 'Token expirado ou sistema não autorizado'
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/authorize
 * Gerar URL de autorização
 */
router.get('/authorize', (req, res) => {
    try {
        if (!isSystemReady()) {
            return res.status(400).json({
                success: false,
                error: 'Sistema não está pronto. Verifique as credenciais.'
            });
        }

        const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
        const authUrl = generateAuthUrl(redirectUri);
        
        console.log('🔐 URL de autorização gerada:', authUrl);
        
        res.json({
            success: true,
            auth_url: authUrl,
            redirect_uri: redirectUri,
            message: 'Acesse a URL de autorização para obter o código',
            instructions: [
                '1. Clique no link auth_url',
                '2. Faça login na sua conta AliExpress',
                '3. Autorize o aplicativo',
                '4. Copie o código da URL de retorno',
                '5. Use o endpoint /api/auth/callback com o código'
            ]
        });
        
    } catch (error) {
        console.error('❌ Erro ao gerar URL de autorização:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/callback
 * Processar callback de autorização
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        console.log('🔄 Callback recebido:', { 
            code: code ? 'presente' : 'ausente', 
            state, 
            error 
        });
        
        if (error) {
            console.error('❌ Erro na autorização:', error);
            return res.status(400).json({
                success: false,
                error: 'Erro na autorização',
                details: error
            });
        }
        
        if (!code) {
            console.error('❌ Código não fornecido');
            return res.status(400).json({
                success: false,
                error: 'Código de autorização não fornecido',
                message: 'Certifique-se de que a URL de callback contém o parâmetro "code"'
            });
        }
        
        console.log('🔑 Trocando código por token...');
        const result = await exchangeCodeForToken(code);
        
        if (result.success) {
            console.log('✅ Token obtido com sucesso!');
            res.json({
                success: true,
                message: 'Autorização concluída com sucesso!',
                token_info: {
                    expires_in: result.expires_in,
                    user_id: result.user_id,
                    seller_id: result.seller_id,
                    account_platform: result.account_platform
                },
                next_steps: [
                    'Token salvo automaticamente',
                    'Sistema pronto para usar APIs',
                    'Use /api/auth/status para verificar status',
                    'Use /api/auth/test para testar APIs'
                ]
            });
        } else {
            console.error('❌ Erro ao obter token:', result.error);
            res.status(400).json({
                success: false,
                error: result.error,
                error_code: result.error_code,
                details: result.data,
                troubleshooting: [
                    'Verifique se o código não expirou (válido por 3 minutos)',
                    'Certifique-se de que o código não foi usado antes',
                    'Verifique se as credenciais estão corretas',
                    'Tente gerar uma nova URL de autorização'
                ]
            });
        }
        
    } catch (error) {
        console.error('❌ Erro no callback:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/refresh
 * Renovar token manualmente
 */
router.post('/refresh', async (req, res) => {
    try {
        console.log('🔄 Renovando token manualmente...');
        
        const tokenSystem = getTokenSystem();
        const newToken = await tokenSystem.refreshAccessToken();
        
        res.json({
            success: true,
            message: 'Token renovado com sucesso',
            access_token: newToken.substring(0, 20) + '...',
            stats: getSystemStats()
        });
        
    } catch (error) {
        console.error('❌ Erro ao renovar token:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            message: 'Não foi possível renovar o token. Nova autorização pode ser necessária.'
        });
    }
});

/**
 * GET /api/auth/test
 * Testar token com uma API simples
 */
router.get('/test', async (req, res) => {
    try {
        console.log('🧪 Testando token com API...');
        
        const token = await getValidToken();
        const stats = getSystemStats();
        
        res.json({
            success: true,
            message: 'Token válido e funcionando',
            token_preview: token.substring(0, 20) + '...',
            stats: stats,
            test_results: {
                token_obtained: true,
                token_valid: stats.isAccessTokenValid,
                system_ready: isSystemReady()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no teste do token:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            message: 'Token inválido ou expirado. Nova autorização necessária.',
            next_steps: [
                'Use /api/auth/authorize para obter nova autorização',
                'Use /api/auth/status para verificar status atual'
            ]
        });
    }
});

/**
 * DELETE /api/auth/clear
 * Limpar todos os tokens
 */
router.delete('/clear', (req, res) => {
    try {
        clearAllTokens();
        
        res.json({
            success: true,
            message: 'Todos os tokens foram limpos',
            next_steps: [
                'Use /api/auth/authorize para obter nova autorização',
                'Sistema retornará ao estado inicial'
            ]
        });
        
    } catch (error) {
        console.error('❌ Erro ao limpar tokens:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/help
 * Ajuda e documentação
 */
router.get('/help', (req, res) => {
    res.json({
        success: true,
        title: 'AliExpress Token System - Ajuda',
        endpoints: {
            'GET /api/auth/status': 'Verificar status do sistema',
            'GET /api/auth/authorize': 'Gerar URL de autorização',
            'GET /api/auth/callback': 'Processar callback (automático)',
            'POST /api/auth/refresh': 'Renovar token manualmente',
            'GET /api/auth/test': 'Testar token',
            'DELETE /api/auth/clear': 'Limpar todos os tokens',
            'GET /api/auth/help': 'Esta ajuda'
        },
        workflow: [
            '1. GET /api/auth/status - Verificar se sistema está pronto',
            '2. GET /api/auth/authorize - Obter URL de autorização',
            '3. Acessar URL e autorizar aplicativo',
            '4. GET /api/auth/callback - Processar código automaticamente',
            '5. GET /api/auth/test - Testar se token funciona',
            '6. Sistema pronto para usar APIs!'
        ],
        troubleshooting: {
            'Token expirado': 'Use POST /api/auth/refresh ou GET /api/auth/authorize',
            'Código inválido': 'Gere nova URL com GET /api/auth/authorize',
            'Sistema não pronto': 'Defina ALIEXPRESS_API_KEY e ALIEXPRESS_SECRET_KEY nas variáveis de ambiente',
            'Erro de autorização': 'Verifique se app está ativo no portal AliExpress'
        }
    });
});

export default router;

