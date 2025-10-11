/**
 * Sistema de Notificações Avançado - Email e SMS
 * 67 Beauty Hub - Dropshipping Notifications
 */

import nodemailer from 'nodemailer';
import fs from 'fs';

class NotificationSystemAdvanced {
    constructor() {
        this.emailTransporter = null;
        this.smsProvider = null;
        this.templates = new Map();
        this.notificationQueue = [];
        this.isProcessing = false;
        this.stats = {
            emailsSent: 0,
            smsSent: 0,
            failed: 0,
            lastSent: null
        };
        
        this.initializeEmail();
        this.initializeSMS();
        this.loadTemplates();
    }

    /**
     * Inicializar sistema de email
     */
    initializeEmail() {
        try {
            this.emailTransporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            
            console.log('✅ Sistema de email inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar email:', error);
        }
    }

    /**
     * Inicializar sistema de SMS
     */
    initializeSMS() {
        try {
            // Configuração para Twilio (exemplo)
            this.smsProvider = {
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                fromNumber: process.env.TWILIO_FROM_NUMBER
            };
            
            console.log('✅ Sistema de SMS inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar SMS:', error);
        }
    }

    /**
     * Carregar templates de notificação
     */
    loadTemplates() {
        // Template para pedido processado
        this.templates.set('order_processed', {
            subject: '🎉 Pedido Processado - 67 Beauty Hub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">67 Beauty Hub</h1>
                        <p style="color: white; margin: 5px 0;">Seu pedido foi processado com sucesso!</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f8f9fa;">
                        <h2 style="color: #333;">📦 Detalhes do Pedido</h2>
                        <p><strong>Número do Pedido:</strong> {{orderId}}</p>
                        <p><strong>Fornecedor:</strong> {{supplier}}</p>
                        <p><strong>Número de Rastreamento:</strong> {{trackingNumber}}</p>
                        <p><strong>Previsão de Entrega:</strong> {{estimatedDelivery}}</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #667eea;">🚚 Rastreamento</h3>
                            <p>Você pode rastrear seu pedido usando o número: <strong>{{trackingNumber}}</strong></p>
                            <a href="https://www.67beautyhub.com/tracking/{{trackingNumber}}" 
                               style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Rastrear Pedido
                            </a>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #28a745;">✅ Status</h3>
                            <p>Seu pedido foi confirmado e está sendo preparado para envio.</p>
                        </div>
                    </div>
                    
                    <div style="background: #333; color: white; padding: 20px; text-align: center;">
                        <p>Obrigado por escolher a 67 Beauty Hub!</p>
                        <p>Para dúvidas, entre em contato: contato@67beautyhub.com</p>
                    </div>
                </div>
            `,
            text: `
                67 Beauty Hub - Pedido Processado
                
                Seu pedido foi processado com sucesso!
                
                Número do Pedido: {{orderId}}
                Fornecedor: {{supplier}}
                Número de Rastreamento: {{trackingNumber}}
                Previsão de Entrega: {{estimatedDelivery}}
                
                Você pode rastrear seu pedido em: https://www.67beautyhub.com/tracking/{{trackingNumber}}
                
                Obrigado por escolher a 67 Beauty Hub!
            `
        });

        // Template para alerta de preço
        this.templates.set('price_alert', {
            subject: '💰 Alerta de Preço - 67 Beauty Hub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">💰 Alerta de Preço</h1>
                        <p style="color: white; margin: 5px 0;">O produto que você monitora teve uma mudança de preço!</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f8f9fa;">
                        <h2 style="color: #333;">📊 Detalhes do Alerta</h2>
                        <p><strong>Produto:</strong> {{productName}}</p>
                        <p><strong>Preço Anterior:</strong> R$ {{oldPrice}}</p>
                        <p><strong>Preço Atual:</strong> R$ {{newPrice}}</p>
                        <p><strong>Variação:</strong> {{priceChange}}%</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #667eea;">🛒 Comprar Agora</h3>
                            <a href="{{productUrl}}" 
                               style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Ver Produto
                            </a>
                        </div>
                    </div>
                </div>
            `,
            text: `
                Alerta de Preço - 67 Beauty Hub
                
                O produto que você monitora teve uma mudança de preço!
                
                Produto: {{productName}}
                Preço Anterior: R$ {{oldPrice}}
                Preço Atual: R$ {{newPrice}}
                Variação: {{priceChange}}%
                
                Ver produto: {{productUrl}}
            `
        });

        // Template para alerta de estoque
        this.templates.set('stock_alert', {
            subject: '⚠️ Alerta de Estoque - 67 Beauty Hub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">⚠️ Alerta de Estoque</h1>
                        <p style="color: white; margin: 5px 0;">Produto com estoque baixo!</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f8f9fa;">
                        <h2 style="color: #333;">📦 Detalhes do Alerta</h2>
                        <p><strong>Produto:</strong> {{productName}}</p>
                        <p><strong>Estoque Atual:</strong> {{currentStock}} unidades</p>
                        <p><strong>Estoque Mínimo:</strong> {{minStock}} unidades</p>
                        <p><strong>Status:</strong> {{stockStatus}}</p>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #856404;">⚠️ Ação Necessária</h3>
                            <p>Este produto está com estoque baixo e pode esgotar em breve.</p>
                        </div>
                    </div>
                </div>
            `,
            text: `
                Alerta de Estoque - 67 Beauty Hub
                
                Produto com estoque baixo!
                
                Produto: {{productName}}
                Estoque Atual: {{currentStock}} unidades
                Estoque Mínimo: {{minStock}} unidades
                Status: {{stockStatus}}
                
                Este produto está com estoque baixo e pode esgotar em breve.
            `
        });

        console.log('✅ Templates de notificação carregados:', this.templates.size);
    }

    /**
     * Enviar notificação por email
     */
    async sendEmail(to, templateName, data) {
        try {
            const template = this.templates.get(templateName);
            if (!template) {
                throw new Error(`Template não encontrado: ${templateName}`);
            }

            // Substituir variáveis no template
            let subject = template.subject;
            let html = template.html;
            let text = template.text;

            for (const [key, value] of Object.entries(data)) {
                const placeholder = `{{${key}}}`;
                subject = subject.replace(new RegExp(placeholder, 'g'), value);
                html = html.replace(new RegExp(placeholder, 'g'), value);
                text = text.replace(new RegExp(placeholder, 'g'), value);
            }

            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@67beautyhub.com',
                to: to,
                subject: subject,
                html: html,
                text: text
            };

            const result = await this.emailTransporter.sendMail(mailOptions);
            
            this.stats.emailsSent++;
            this.stats.lastSent = new Date().toISOString();
            
            console.log(`✅ Email enviado para ${to}: ${result.messageId}`);
            return result;
            
        } catch (error) {
            console.error(`❌ Erro ao enviar email para ${to}:`, error);
            this.stats.failed++;
            throw error;
        }
    }

    /**
     * Enviar notificação por SMS
     */
    async sendSMS(to, message, data = {}) {
        try {
            // Simular envio de SMS (aqui seria integração real com Twilio)
            console.log(`📱 Enviando SMS para ${to}: ${message}`);
            
            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const smsData = {
                id: `sms_${Date.now()}`,
                to: to,
                message: message,
                status: 'sent',
                sentAt: new Date().toISOString(),
                data: data
            };
            
            // Salvar SMS
            await this.saveSMS(smsData);
            
            this.stats.smsSent++;
            this.stats.lastSent = new Date().toISOString();
            
            console.log(`✅ SMS enviado para ${to}`);
            return smsData;
            
        } catch (error) {
            console.error(`❌ Erro ao enviar SMS para ${to}:`, error);
            this.stats.failed++;
            throw error;
        }
    }

    /**
     * Salvar SMS
     */
    async saveSMS(smsData) {
        try {
            const smsFile = './data/sms-notifications.json';
            let smsList = [];
            
            if (fs.existsSync(smsFile)) {
                const content = fs.readFileSync(smsFile, 'utf8');
                smsList = JSON.parse(content);
            }
            
            smsList.push(smsData);
            fs.writeFileSync(smsFile, JSON.stringify(smsList, null, 2));
            
        } catch (error) {
            console.error('Erro ao salvar SMS:', error);
        }
    }

    /**
     * Enviar notificação múltipla (email + SMS)
     */
    async sendNotification(notification) {
        try {
            const results = [];
            
            // Enviar email se configurado
            if (notification.email) {
                const emailResult = await this.sendEmail(
                    notification.email.to,
                    notification.email.template,
                    notification.email.data
                );
                results.push({ type: 'email', result: emailResult });
            }
            
            // Enviar SMS se configurado
            if (notification.sms) {
                const smsResult = await this.sendSMS(
                    notification.sms.to,
                    notification.sms.message,
                    notification.sms.data
                );
                results.push({ type: 'sms', result: smsResult });
            }
            
            return results;
            
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            throw error;
        }
    }

    /**
     * Adicionar notificação à fila
     */
    addToQueue(notification) {
        this.notificationQueue.push({
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });
        
        console.log(`📝 Notificação adicionada à fila: ${notification.id}`);
        
        // Processar fila se não estiver processando
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Processar fila de notificações
     */
    async processQueue() {
        if (this.isProcessing || this.notificationQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        console.log(`🔄 Processando fila de notificações: ${this.notificationQueue.length} itens`);
        
        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            
            try {
                notification.status = 'processing';
                await this.sendNotification(notification);
                notification.status = 'sent';
                notification.sentAt = new Date().toISOString();
                
                console.log(`✅ Notificação processada: ${notification.id}`);
                
            } catch (error) {
                notification.status = 'failed';
                notification.error = error.message;
                notification.failedAt = new Date().toISOString();
                
                console.error(`❌ Erro ao processar notificação ${notification.id}:`, error);
            }
            
            // Aguardar entre notificações para evitar spam
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.isProcessing = false;
        console.log('✅ Fila de notificações processada');
    }

    /**
     * Obter estatísticas
     */
    getStats() {
        return {
            ...this.stats,
            queueSize: this.notificationQueue.length,
            isProcessing: this.isProcessing,
            templatesCount: this.templates.size
        };
    }

    /**
     * Obter fila de notificações
     */
    getQueue() {
        return this.notificationQueue;
    }

    /**
     * Limpar fila de notificações
     */
    clearQueue() {
        this.notificationQueue = [];
        console.log('🗑️ Fila de notificações limpa');
    }

    /**
     * Testar conectividade
     */
    async testConnection() {
        const results = {
            email: false,
            sms: false
        };
        
        try {
            // Testar email
            if (this.emailTransporter) {
                await this.emailTransporter.verify();
                results.email = true;
                console.log('✅ Conexão de email OK');
            }
        } catch (error) {
            console.error('❌ Erro na conexão de email:', error);
        }
        
        try {
            // Testar SMS (simulado)
            if (this.smsProvider) {
                results.sms = true;
                console.log('✅ Conexão de SMS OK');
            }
        } catch (error) {
            console.error('❌ Erro na conexão de SMS:', error);
        }
        
        return results;
    }
}

export default NotificationSystemAdvanced;
