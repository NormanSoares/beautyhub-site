// Endpoints OAuth para AliExpress
export function setupOAuthEndpoints(app, oauthManager) {
    // Inicializar OAuth
    app.get('/api/aliexpress/oauth/init', (req, res) => {
        try {
            if (!oauthManager) {
                return res.status(500).json({
                    success: false,
                    error: 'OAuth Manager não inicializado'
                });
            }

            const result = oauthManager.initializeOAuth();
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Trocar código por token
    app.post('/api/aliexpress/oauth/exchange', async (req, res) => {
        try {
            if (!oauthManager) {
                return res.status(500).json({
                    success: false,
                    error: 'OAuth Manager não inicializado'
                });
            }

            const { code } = req.body;
            if (!code) {
                return res.status(400).json({
                    success: false,
                    error: 'Código de autorização é obrigatório'
                });
            }

            const result = await oauthManager.exchangeCodeForToken(code);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Status do OAuth
    app.get('/api/aliexpress/oauth/status', (req, res) => {
        try {
            if (!oauthManager) {
                return res.status(500).json({
                    success: false,
                    error: 'OAuth Manager não inicializado'
                });
            }

            const status = oauthManager.getStatus();
            res.json({
                success: true,
                data: status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Testar token
    app.get('/api/aliexpress/oauth/test', async (req, res) => {
        try {
            if (!oauthManager) {
                return res.status(500).json({
                    success: false,
                    error: 'OAuth Manager não inicializado'
                });
            }

            const result = await oauthManager.testToken();
            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Callback OAuth
    app.get('/oauth/callback', (req, res) => {
        const { code, state, error } = req.query;
        
        if (error) {
            return res.status(400).send(`
                <html>
                    <body>
                        <h1>Erro na Autorização</h1>
                        <p>Erro: ${error}</p>
                        <p>Descrição: ${req.query.error_description || 'Erro desconhecido'}</p>
                        <a href="/dashboard.html">Voltar ao Dashboard</a>
                    </body>
                </html>
            `);
        }

        if (!code) {
            return res.status(400).send(`
                <html>
                    <body>
                        <h1>Código de Autorização Não Encontrado</h1>
                        <p>O código de autorização não foi fornecido.</p>
                        <a href="/dashboard.html">Voltar ao Dashboard</a>
                    </body>
                </html>
            `);
        }

        // Redirecionar para o dashboard com o código
        res.redirect(`/dashboard.html?oauth_code=${code}&state=${state}`);
    });

    console.log('🔐 Endpoints OAuth configurados');
}
