/**
 * Teste Simples do Callback
 * Endpoint: /api/test-callback
 */

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        console.log('Teste callback - método:', req.method);
        
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                message: 'Teste callback funcionando',
                method: req.method,
                timestamp: new Date().toISOString()
            });
        }
        
        if (req.method === 'POST') {
            return res.status(200).json({
                success: true,
                message: 'POST funcionando',
                body: req.body,
                timestamp: new Date().toISOString()
            });
        }
        
        return res.status(405).json({
            error: 'Method not allowed',
            allowed: ['GET', 'POST', 'OPTIONS']
        });
        
    } catch (error) {
        console.error('Erro no teste callback:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
