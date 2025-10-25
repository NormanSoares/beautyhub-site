/**
 * Sistema de Notificações em Tempo Real - 67 Beauty Hub
 * Notifica sobre novos pedidos e atualizações
 */

class RealTimeNotifications {
    constructor() {
        this.notifications = [];
        this.isEnabled = true;
        this.init();
    }

    init() {
        console.log('🔔 Inicializando sistema de notificações...');
        this.setupEventListeners();
        this.createNotificationContainer();
        console.log('✅ Sistema de notificações ativo!');
    }

    setupEventListeners() {
        // Escutar novos pedidos
        document.addEventListener('orderAdded', (event) => {
            this.showNewOrderNotification(event.detail);
        });

        // Escutar atualizações de status
        document.addEventListener('orderStatusUpdate', (event) => {
            this.showStatusUpdateNotification(event.detail);
        });

        // Escutar pagamentos confirmados
        document.addEventListener('paymentConfirmed', (event) => {
            this.showPaymentNotification(event.detail);
        });
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    showNewOrderNotification(order) {
        if (!this.isEnabled) return;

        const notification = this.createNotification({
            type: 'new_order',
            title: '🆕 Novo Pedido Recebido',
            message: `Pedido #${order.id.split('_')[1]} de ${order.customer.name}`,
            details: {
                customer: order.customer.name,
                email: order.customer.email,
                total: `$${order.total.toFixed(2)}`,
                products: order.products.length
            },
            duration: 8000
        });

        this.addNotification(notification);
        this.playNotificationSound('new_order');
    }

    showStatusUpdateNotification(updateData) {
        if (!this.isEnabled) return;

        const { orderId, status, notes } = updateData;
        const statusText = this.getStatusText(status);
        
        const notification = this.createNotification({
            type: 'status_update',
            title: '🔄 Status Atualizado',
            message: `Pedido #${orderId.split('_')[1]} - ${statusText}`,
            details: {
                orderId: orderId,
                newStatus: statusText,
                notes: notes || ''
            },
            duration: 6000
        });

        this.addNotification(notification);
        this.playNotificationSound('status_update');
    }

    showPaymentNotification(paymentData) {
        if (!this.isEnabled) return;

        const notification = this.createNotification({
            type: 'payment',
            title: '💳 Pagamento Confirmado',
            message: `Pagamento de $${paymentData.amount} confirmado`,
            details: {
                orderId: paymentData.orderId,
                amount: paymentData.amount,
                method: paymentData.method
            },
            duration: 7000
        });

        this.addNotification(notification);
        this.playNotificationSound('payment');
    }

    createNotification(config) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${config.type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(config.type)};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${config.title}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${config.message}</div>
                    ${this.createDetailsHTML(config.details)}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    opacity: 0.7;
                ">&times;</button>
            </div>
            <div class="notification-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255,255,255,0.3);
                width: 100%;
                animation: progress ${config.duration}ms linear;
            "></div>
        `;

        // Adicionar animação de progresso
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
            .notification:hover {
                transform: translateX(-5px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            }
        `;
        document.head.appendChild(style);

        // Auto-remover após duração
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, config.duration);

        return notification;
    }

    createDetailsHTML(details) {
        if (!details) return '';
        
        let html = '<div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">';
        
        for (const [key, value] of Object.entries(details)) {
            if (value) {
                html += `<div><strong>${key}:</strong> ${value}</div>`;
            }
        }
        
        html += '</div>';
        return html;
    }

    getNotificationColor(type) {
        const colors = {
            'new_order': 'linear-gradient(135deg, #28a745, #20c997)',
            'status_update': 'linear-gradient(135deg, #17a2b8, #138496)',
            'payment': 'linear-gradient(135deg, #ffc107, #e0a800)',
            'error': 'linear-gradient(135deg, #dc3545, #c82333)',
            'warning': 'linear-gradient(135deg, #fd7e14, #e55a00)'
        };
        return colors[type] || colors['new_order'];
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'Pendente',
            'processing': 'Processando',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusTexts[status] || status;
    }

    addNotification(notification) {
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            this.notifications.push(notification);
        }
    }

    playNotificationSound(type) {
        // Criar som de notificação (opcional)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Frequências diferentes para tipos diferentes
            const frequencies = {
                'new_order': [800, 1000, 1200],
                'status_update': [600, 800],
                'payment': [1000, 1200, 1400]
            };
            
            const freq = frequencies[type] || [800, 1000];
            
            oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
            oscillator.frequency.setValueAtTime(freq[1], audioContext.currentTime + 0.1);
            if (freq[2]) {
                oscillator.frequency.setValueAtTime(freq[2], audioContext.currentTime + 0.2);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Som de notificação não disponível');
        }
    }

    // Métodos públicos
    enable() {
        this.isEnabled = true;
        console.log('🔔 Notificações ativadas');
    }

    disable() {
        this.isEnabled = false;
        console.log('🔕 Notificações desativadas');
    }

    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
        this.notifications = [];
    }
}

// Inicializar sistema de notificações
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeNotifications = new RealTimeNotifications();
});

export default RealTimeNotifications;

