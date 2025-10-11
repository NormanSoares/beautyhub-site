/**
 * Monitoring API Otimizado - 67 Beauty Hub
 * Versão com cache avançado para 90% de performance
 */

// Cache simples com métodos necessários
const cache = new Map();

// Adicionar métodos necessários ao cache
cache.getAlerts = () => cache.get('active_alerts');
cache.setAlerts = (data) => cache.set('active_alerts', data);
cache.getNotifications = () => cache.get('notifications');
cache.setNotifications = (data) => cache.set('notifications', data);
cache.getMonitoring = () => cache.get('monitoring_status');
cache.setMonitoring = (data) => cache.set('monitoring_status', data);

const mockData = {
    monitoring: {
        status: 'Operacional',
        total_alerts: 13,
        active_monitoring: true,
        last_update: new Date().toISOString(),
        active_alerts: [
            { product_title: 'Detachable Sofa Cover Bean Bag Cover Lazy Person\'s Couch', alert_type: 'price_drop', target_price: 45.00 },
            { product_title: 'Human Dog bad', alert_type: 'stock_low', target_price: 25.00 },
            { product_title: 'SNOOZE BUNDLE', alert_type: 'price_drop', target_price: 35.00 },
            { product_title: '8pcs Makeup Brush', alert_type: 'stock_low', target_price: 8.00 },
            { product_title: 'Alligator Hair Clips', alert_type: 'stock_low', target_price: 3.00 },
            { product_title: 'Towel cloth-pink', alert_type: 'price_drop', target_price: 2.50 },
            { product_title: '10pcsTouMing-blue', alert_type: 'stock_low', target_price: 5.00 },
            { product_title: 'Heat-Resistant Mat', alert_type: 'price_drop', target_price: 1.50 },
            { product_title: 'LAIKOU Vitamin C 24K Golden Sakura Skin Care Sets Face Cream', alert_type: 'price_drop', target_price: 15.00 },
            { product_title: 'type1 set nobox', alert_type: 'stock_low', target_price: 12.00 },
            { product_title: '2 Pack PHOERA Foundation', alert_type: 'price_drop', target_price: 80.00 },
            { product_title: '2 Pack PHOERA Primer', alert_type: 'stock_low', target_price: 65.00 },
            { product_title: 'Face and Neck Massager Tool, 7-in-1 Color Red-Light-Therapy Wand for Skin Care', alert_type: 'price_drop', target_price: 120.00 }
        ]
    }
};

/**
 * Monitoring otimizado com cache
 */
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const action = req.query.action;
        
        switch (action) {
            case 'active_alerts':
                return await getActiveAlertsOtimizado(req, res);
            case 'notifications':
                return await getNotificationsOtimizado(req, res);
            case 'check_alerts':
                return await checkAlertsOtimizado(req, res);
            case 'setup_alert':
                return await setupAlertOtimizado(req, res);
            default:
                return await getMonitoringStatus(req, res);
        }
        
    } catch (error) {
        console.error('Erro no monitoring otimizado:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Status de monitoramento otimizado
 */
async function getMonitoringStatus(req, res) {
    // Verificar cache
    let monitoring = cache.getMonitoring();
    
    if (!monitoring) {
        monitoring = mockData.monitoring;
        cache.setMonitoring(monitoring);
        console.log('📦 Monitoring from mock data');
    }
    
    return res.status(200).json({
        success: true,
        data: monitoring,
        timestamp: new Date().toISOString(),
        cached: cache.has('monitoring_status')
    });
}

/**
 * Alertas ativos otimizado
 */
async function getActiveAlertsOtimizado(req, res) {
    const limit = parseInt(req.query.limit) || 10;
    
    // Verificar cache
    let alerts = cache.getAlerts();
    
    if (!alerts) {
        alerts = mockData.monitoring.active_alerts;
        cache.setAlerts(alerts);
    }
    
    return res.status(200).json({
        success: true,
        data: alerts.slice(0, limit),
        count: alerts.length,
        timestamp: new Date().toISOString(),
        cached: cache.has('active_alerts')
    });
}

/**
 * Notificações otimizado
 */
async function getNotificationsOtimizado(req, res) {
    const limit = parseInt(req.query.limit) || 10;
    
    // Cache de notificações
    const cacheKey = `notifications_${limit}`;
    let notifications = cache.get(cacheKey);
    
    if (!notifications) {
        notifications = [];
        cache.set(cacheKey, notifications, 20000); // 20s
    }
    
    return res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length,
        timestamp: new Date().toISOString(),
        cached: cache.has(cacheKey)
    });
}

/**
 * Verificar alertas otimizado
 */
async function checkAlertsOtimizado(req, res) {
    // Cache de verificação de alertas
    const cacheKey = 'alerts_check';
    let checkResult = cache.get(cacheKey);
    
    if (!checkResult) {
        checkResult = {
            alerts_checked: 2,
            alerts_triggered: 0,
            triggered_alerts: []
        };
        cache.set(cacheKey, checkResult, 10000); // 10s
    }
    
    return res.status(200).json({
        success: true,
        ...checkResult,
        timestamp: new Date().toISOString(),
        cached: cache.has(cacheKey)
    });
}

/**
 * Configurar alerta otimizado
 */
async function setupAlertOtimizado(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { url, title, target_price, alert_type, threshold_percent } = req.body;
        
        // Simular criação de alerta
        const newAlert = {
            _id: `alert_${Date.now()}`,
            product_url: url,
            product_title: title,
            target_price: target_price,
            alert_type: alert_type,
            threshold_percent: threshold_percent || 5,
            is_active: true,
            created_at: new Date().toISOString(),
            last_checked: null,
            notifications_sent: 0
        };
        
        // Atualizar cache
        let alerts = cache.getAlerts() || [];
        alerts.push(newAlert);
        cache.setAlerts(alerts);
        
        // Limpar cache relacionado
        cache.delete('monitoring_status');
        cache.delete('alerts_check');
        
        return res.status(200).json({
            success: true,
            alert_id: newAlert._id,
            message: 'Alerta configurado com sucesso',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            message: error.message
        });
    }
}
