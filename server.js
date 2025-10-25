/**
 * Servidor Express Simples
 * Serve arquivos estáticos e APIs básicas
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Middleware
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Limitação de taxa básica para API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', apiLimiter);

// Servir estáticos apenas de diretórios seguros
const staticDirs = ['css', 'js', 'Imagens', 'templates'];
for (const dir of staticDirs) {
    const target = path.join(__dirname, dir);
    if (fs.existsSync(target)) {
        app.use(`/${dir}`, express.static(target, { index: false, dotfiles: 'ignore' }));
    }
}

// CORS com allowlist
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '';
    if (allowOrigin) {
        res.header('Access-Control-Allow-Origin', allowOrigin);
        res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// Rota básica da API
app.all('/api/', (req, res) => {
    res.json({
        success: true,
        message: 'API básica funcionando',
        timestamp: new Date().toISOString(),
        endpoints: ['/api/', '/api/health']
    });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Importar rotas de pagamento
import paymentsRouter from './api/payments.js';
import paymentsSimpleRouter from './api/payments-simple.js';
app.use('/api/payments', paymentsRouter);
app.use('/api/payments-simple', paymentsSimpleRouter);
console.log('✅ Payments router carregado');
console.log('✅ Payments Simple router carregado');

// Importar rotas de pedidos
import ordersRouter from './api/orders.js';
app.use('/api/orders', ordersRouter);

// Importar rotas de preços ativos
import activePricesRouter from './api/active-prices.js';
app.use('/api/active-prices', activePricesRouter);

// Importar rotas de web scraping
import scraperRouter from './api/scraper-mongodb.js';
import scraperSimpleRouter from './api/scraper-simple.js';
import authRouter from './api/aliexpress-auth-endpoints.js';
import testRouter from './api/test-simple.js';
import aliexpressTestRouter from './api/aliexpress-test.js';
import aliexpressProductsRouter from './api/aliexpress-products.js';
import aliexpressOfficialRouter from './api/aliexpress-official-real-api.js';
import aliexpressDropshipRouter from './api/aliexpress-dropship-api.js';
import aliexpressBatchRouter from './api/aliexpress-batch.js';
import aliexpressRealDataRouter from './api/aliexpress-real-data.js';
import amazonProductsRouter from './api/amazon-products.js';
app.use('/api/scraper', scraperRouter);
app.use('/api/scraper-simple', scraperSimpleRouter);
app.use('/api/auth', authRouter);
app.use('/api/test-simple', testRouter);
app.use('/api/aliexpress-test', aliexpressTestRouter);
app.use('/api/aliexpress-products', aliexpressProductsRouter);
app.use('/api/aliexpress-official', aliexpressOfficialRouter);
app.use('/api/aliexpress-dropship', aliexpressDropshipRouter);
app.use('/api/aliexpress-batch', aliexpressBatchRouter);
app.use('/api/aliexpress-real-data', aliexpressRealDataRouter);
app.use('/api/amazon-products', amazonProductsRouter);
console.log('✅ Scraper router carregado');
console.log('✅ Scraper Simple router carregado');
console.log('✅ Auth router carregado');
console.log('✅ Test router carregado');
console.log('✅ AliExpress Test router carregado');
console.log('✅ AliExpress Products router carregado');
console.log('✅ AliExpress Official router carregado');
console.log('✅ AliExpress Dropship router carregado');
console.log('✅ AliExpress Batch router carregado');
console.log('✅ AliExpress Real Data router carregado');
console.log('✅ Amazon Products router carregado');

// ROTAS AUSENTES QUE ESTÃO CAUSANDO 404s
// Rota para dropshipping alerts
app.get('/api/dropshipping/alerts', (req, res) => {
    res.json({
        success: true,
        data: {
            alerts: [],
            count: 0,
            timestamp: new Date().toISOString()
        }
    });
});

// Rota para dropshipping status
app.get('/api/dropshipping/status', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'active',
            lastUpdate: new Date().toISOString(),
            ordersProcessed: 0
        }
    });
});

// Rota para dropshipping inventory
app.get('/api/dropshipping/inventory', (req, res) => {
    res.json({
        success: true,
        data: {
            products: [],
            count: 0,
            lastSync: new Date().toISOString()
        }
    });
});

// Rota para aliexpress scraper data
app.get('/api/aliexpress-scraper/data', (req, res) => {
    res.json({
        success: true,
        data: {
            products: [],
            count: 0,
            lastScrape: new Date().toISOString()
        }
    });
});

// Rota para analytics performance
app.get('/api/analytics', (req, res) => {
    const action = req.query.action || 'performance';
    res.json({
        success: true,
        data: {
            performance: {
                loadTime: '1.2s',
                uptime: '99.9%',
                lastCheck: new Date().toISOString()
            },
            action: action
        }
    });
});

// Rota para dashboard stats
app.get('/api/dashboard', (req, res) => {
    const action = req.query.action || 'stats';
    res.json({
        success: true,
        data: {
            stats: {
                totalOrders: 0,
                totalRevenue: 0,
                lastUpdate: new Date().toISOString()
            },
            action: action
        }
    });
});

console.log('✅ Rotas ausentes adicionadas');

// Rota para arquivos estáticos do dashboard
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rotas explícitas para ativos na raiz
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});
app.get('/Logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'Logo.png'));
});
app.get('/background-video.mp4', (req, res) => {
    res.sendFile(path.join(__dirname, 'background-video.mp4'));
});

// Tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro no servidor:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Página inicial: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
});
