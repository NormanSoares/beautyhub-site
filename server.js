/**
 * Servidor Express para Render
 * Serve arquivos estáticos e APIs
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Importar handlers das APIs
import aliexpressCallback from './api/aliexpress-callback.js';
import callback from './api/callback.js';
import health from './api/health.js';

// Rotas da API
app.all('/api/aliexpress-callback', aliexpressCallback.default || aliexpressCallback);
app.all('/api/callback', callback.default || callback);
app.all('/api/health', health.default || health);

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para arquivos estáticos
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    
    // Verificar se o arquivo existe
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // Se não existir, servir index.html (SPA)
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, encerrando servidor...');
    process.exit(0);
});
