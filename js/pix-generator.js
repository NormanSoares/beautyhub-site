/**
 * Sistema PIX Completo - 67 Beauty Hub
 * Geração de QR Code, Copia e Cola, e validação automática
 */

class PIXGenerator {
    constructor() {
        this.pixKey = 'contato@67beautyhub.com';
        this.merchantName = '67 Beauty Hub';
        this.merchantCity = 'Luanda';
        this.pixExpiration = 30; // minutos
        this.checkInterval = 10; // segundos
    }

    /**
     * Gera PIX Copia e Cola com valor específico
     */
    generatePixCopyPaste(amount, orderId, description = '', originalCurrency = 'USD') {
        console.log('💰 PIX Generator - Amount:', amount, 'Order ID:', orderId, 'Original Currency:', originalCurrency);
        
        // Convert USD to BRL for PIX (Brazilian payment system)
        let pixAmount = amount;
        if (originalCurrency === 'USD') {
            // USD to BRL conversion rate (approximate)
            const usdToBrlRate = 5.2; // You can update this rate
            pixAmount = amount * usdToBrlRate;
            console.log('🔄 Converting USD to BRL:', amount, 'USD →', pixAmount, 'BRL');
        }
        
        const pixData = {
            pixKey: this.pixKey,
            amount: pixAmount,
            merchantName: this.merchantName,
            merchantCity: this.merchantCity,
            orderId: orderId,
            description: description || `Pedido ${orderId} - 67 Beauty Hub`
        };

        // Gerar código PIX EMV
        const pixCode = this.generateEMVCode(pixData);
        
        console.log('✅ PIX Generated:', {
            originalAmount: amount,
            pixAmount: pixAmount,
            orderId: orderId,
            pixKey: this.pixKey
        });
        
        return {
            copyPaste: pixCode,
            qrCode: this.generateQRCode(pixCode),
            expiration: new Date(Date.now() + (this.pixExpiration * 60 * 1000)),
            orderId: orderId,
            amount: pixAmount,
            originalAmount: amount,
            originalCurrency: originalCurrency
        };
    }

    /**
     * Gera código EMV para PIX
     */
    generateEMVCode(data) {
        const emvData = [
            `00020126`, // Payload Format Indicator
            `0102`, // Point of Initiation Method
            `52040000`, // Merchant Account Information
            `5303986`, // Transaction Currency (BRL)
            `54${data.amount.toFixed(2).length.toString().padStart(2, '0')}${data.amount.toFixed(2)}`, // Transaction Amount
            `5802BR`, // Country Code
            `59${data.merchantName.length.toString().padStart(2, '0')}${data.merchantName}`, // Merchant Name
            `60${data.merchantCity.length.toString().padStart(2, '0')}${data.merchantCity}`, // Merchant City
            `62070503***`, // Additional Data Field Template
            `6304` // CRC16
        ].join('');

        // Adicionar chave PIX
        const pixKeyData = `01${data.pixKey.length.toString().padStart(2, '0')}${data.pixKey}`;
        const emvWithKey = emvData.replace('52040000', `5204${pixKeyData.length.toString().padStart(2, '0')}${pixKeyData}`);

        // Calcular CRC16
        const crc = this.calculateCRC16(emvWithKey);
        return emvWithKey + crc;
    }

    /**
     * Calcula CRC16 para PIX
     */
    calculateCRC16(data) {
        const polynomial = 0x1021;
        let crc = 0xFFFF;
        
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc <<= 1;
                }
            }
        }
        
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }

    /**
     * Gera QR Code usando API externa
     */
    generateQRCode(pixCode) {
        const qrSize = 300;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(pixCode)}`;
        return qrUrl;
    }

    /**
     * Valida se PIX foi pago (simulação)
     */
    async validatePIXPayment(orderId) {
        try {
            // Simulação de validação - em produção seria integração com banco
            const response = await fetch('/api/validate-pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            });

            if (response.ok) {
                const result = await response.json();
                return result.paid;
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao validar PIX:', error);
            return false;
        }
    }

    /**
     * Inicia monitoramento de pagamento PIX
     */
    startPIXMonitoring(orderId, onPaid, onExpired) {
        const startTime = Date.now();
        const expirationTime = this.pixExpiration * 60 * 1000;

        const checkPayment = async () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed >= expirationTime) {
                onExpired();
                return;
            }

            const isPaid = await this.validatePIXPayment(orderId);
            if (isPaid) {
                onPaid();
                return;
            }

            // Continuar verificando
            setTimeout(checkPayment, this.checkInterval * 1000);
        };

        // Iniciar verificação
        setTimeout(checkPayment, this.checkInterval * 1000);
    }

    /**
     * Gera instruções de pagamento PIX
     */
    generatePIXInstructions(pixData) {
        return {
            title: 'Instruções de Pagamento PIX',
            steps: [
                '1. Abra o aplicativo do seu banco',
                '2. Escaneie o QR Code ou copie o código PIX',
                '3. Confirme o valor e os dados',
                '4. Complete o pagamento',
                '5. Aguarde a confirmação automática'
            ],
            pixKey: this.pixKey,
            amount: pixData.amount,
            orderId: pixData.orderId,
            expiration: pixData.expiration
        };
    }
}

/**
 * Interface PIX para checkout
 */
class PIXCheckout {
    constructor() {
        this.pixGenerator = new PIXGenerator();
        this.currentOrder = null;
        this.monitoring = false;
    }

    /**
     * Inicializa PIX para um pedido
     */
    initializePIX(orderData) {
        console.log('🚀 PIX Checkout - Initializing with order data:', orderData);
        
        if (!orderData || !orderData.total) {
            console.error('❌ Invalid order data for PIX:', orderData);
            return;
        }
        
        this.currentOrder = orderData;
        
        console.log('💰 PIX using total from order:', orderData.total, orderData.currency);
        
        const pixData = this.pixGenerator.generatePixCopyPaste(
            orderData.total,
            orderData.id,
            orderData.description,
            orderData.currency
        );

        this.displayPIXInterface(pixData);
        this.startPaymentMonitoring(pixData);
        
        return pixData;
    }

    /**
     * Exibe interface PIX
     */
    displayPIXInterface(pixData) {
        const pixContainer = document.getElementById('pix-payment-info');
        if (!pixContainer) return;

        const instructions = this.pixGenerator.generatePIXInstructions(pixData);
        
        pixContainer.innerHTML = `
            <div class="pix-payment-container">
                <div class="pix-header">
                    <h4><i class="fas fa-qrcode"></i> Pagamento PIX</h4>
                    <div class="pix-amount">
                        <span class="amount-label">Valor:</span>
                        <span class="amount-value">R$ ${pixData.amount.toFixed(2).replace('.', ',')}</span>
                        ${pixData.originalAmount ? `<small style="color: #666; display: block; margin-top: 5px;">Original: ${pixData.originalCurrency} ${pixData.originalAmount.toFixed(2)}</small>` : ''}
                    </div>
                </div>

                <div class="pix-content">
                    <!-- QR Code -->
                    <div class="qr-section">
                        <h5>Escaneie o QR Code:</h5>
                        <div class="qr-container">
                            <img src="${pixData.qrCode}" alt="QR Code PIX" class="qr-image">
                        </div>
                    </div>

                    <!-- Copia e Cola -->
                    <div class="copy-paste-section">
                        <h5>Copia e Cola:</h5>
                        <div class="copy-container">
                            <textarea readonly class="pix-code" id="pixCode">${pixData.copyPaste}</textarea>
                            <button class="copy-btn" onclick="copyPIXCode()">
                                <i class="fas fa-copy"></i> Copiar
                            </button>
                        </div>
                    </div>

                    <!-- Instruções -->
                    <div class="instructions-section">
                        <h5>Como pagar:</h5>
                        <ol class="pix-steps">
                            ${instructions.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>

                    <!-- Status -->
                    <div class="pix-status">
                        <div class="status-indicator">
                            <i class="fas fa-clock"></i>
                            <span>Aguardando pagamento...</span>
                        </div>
                        <div class="expiration">
                            <small>Expira em: ${this.formatTime(pixData.expiration)}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos
        this.addPIXStyles();
    }

    /**
     * Inicia monitoramento de pagamento
     */
    startPaymentMonitoring(pixData) {
        if (this.monitoring) return;
        
        this.monitoring = true;
        this.startCountdown(pixData.expiration);
        
        this.pixGenerator.startPIXMonitoring(
            pixData.orderId,
            () => this.onPaymentConfirmed(),
            () => this.onPaymentExpired()
        );
    }
    
    /**
     * Inicia contagem regressiva
     */
    startCountdown(expirationDate) {
        const updateCountdown = () => {
            const now = new Date();
            const diff = expirationDate - now;
            
            if (diff <= 0) {
                this.onPaymentExpired();
                return;
            }
            
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update countdown display
            const expirationElement = document.querySelector('.expiration small');
            if (expirationElement) {
                expirationElement.textContent = `Expira em: ${timeString}`;
            }
            
            // Continue countdown
            this.countdownTimer = setTimeout(updateCountdown, 1000);
        };
        
        updateCountdown();
    }
    
    /**
     * Callback quando pagamento é confirmado
     */
    onPaymentConfirmed() {
        this.monitoring = false;
        
        // Clear countdown timer
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
        }
        
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.innerHTML = '<i class="fas fa-check"></i><span>Pagamento confirmado!</span>';
            statusIndicator.style.color = '#28a745';
        }
        
        const expirationElement = document.querySelector('.expiration small');
        if (expirationElement) {
            expirationElement.textContent = 'Pagamento confirmado com sucesso!';
        }
        
        // Hide PIX interface and show success message
        setTimeout(() => {
            const pixContainer = document.getElementById('pix-payment-container');
            if (pixContainer) {
                pixContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #28a745;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h3>Pagamento Confirmado!</h3>
                        <p>Seu pedido foi processado com sucesso.</p>
                    </div>
                `;
            }
        }, 2000);
    }
    
    /**
     * Callback quando pagamento expira
     */
    onPaymentExpired() {
        this.monitoring = false;
        
        // Clear countdown timer
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
        }
        
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.innerHTML = '<i class="fas fa-times"></i><span>Pagamento expirado</span>';
            statusIndicator.style.color = '#dc3545';
        }
        
        const expirationElement = document.querySelector('.expiration small');
        if (expirationElement) {
            expirationElement.textContent = 'PIX expirado - gere um novo';
        }
        
        this.addRenewButton();
    }
    
    /**
     * Adiciona botão para renovar PIX
     */
    addRenewButton() {
        const pixContainer = document.getElementById('pix-payment-container');
        if (!pixContainer) return;

        const renewButton = document.createElement('button');
        renewButton.className = 'renew-pix-btn';
        renewButton.innerHTML = '<i class="fas fa-refresh"></i> Gerar Novo PIX';
        renewButton.onclick = () => this.initializePIX(this.currentOrder);
        
        pixContainer.appendChild(renewButton);
    }

    /**
     * Callback quando pagamento é confirmado
     */
    onPaymentConfirmed() {
        this.monitoring = false;
        
        // Atualizar interface
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i><span>Pagamento confirmado!</span>';
        }

        // Processar checkout
        if (typeof processCheckout === 'function') {
            processCheckout();
        }
    }

    /**
     * Callback quando pagamento expira
     */
    onPaymentExpired() {
        this.monitoring = false;
        
        // Atualizar interface
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.innerHTML = '<i class="fas fa-times-circle" style="color: #dc3545;"></i><span>PIX expirado. Gere um novo.</span>';
        }

        // Mostrar opção de renovar
        this.showRenewOption();
    }

    /**
     * Mostra opção de renovar PIX
     */
    showRenewOption() {
        const pixContainer = document.getElementById('pix-payment-info');
        if (!pixContainer) return;

        const renewButton = document.createElement('button');
        renewButton.className = 'renew-pix-btn';
        renewButton.innerHTML = '<i class="fas fa-refresh"></i> Gerar Novo PIX';
        renewButton.onclick = () => this.initializePIX(this.currentOrder);
        
        pixContainer.appendChild(renewButton);
    }

    /**
     * Formata tempo de expiração
     */
    formatTime(expirationDate) {
        const now = new Date();
        const diff = expirationDate - now;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Adiciona estilos CSS para PIX
     */
    addPIXStyles() {
        if (document.getElementById('pix-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'pix-styles';
        styles.textContent = `
            .pix-payment-container {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 15px;
                border: 2px solid #d4af37;
                text-align: center;
                max-width: 500px;
                margin: 0 auto;
            }

            .pix-header {
                margin-bottom: 20px;
            }

            .pix-header h4 {
                color: #d4af37;
                margin-bottom: 10px;
            }

            .pix-amount {
                background: white;
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #ddd;
                font-size: 18px;
                font-weight: bold;
            }

            .amount-label {
                color: #666;
            }

            .amount-value {
                color: #28a745;
                margin-left: 10px;
            }

            .qr-section, .copy-paste-section, .instructions-section {
                margin: 20px 0;
                text-align: left;
            }

            .qr-container {
                text-align: center;
                margin: 15px 0;
            }

            .qr-image {
                max-width: 200px;
                border: 1px solid #ddd;
                border-radius: 10px;
            }

            .copy-container {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .pix-code {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                resize: none;
                height: 60px;
            }

            .copy-btn {
                background: #d4af37;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s;
            }

            .copy-btn:hover {
                background: #b8941f;
            }

            .pix-steps {
                margin: 10px 0;
                padding-left: 20px;
            }

            .pix-steps li {
                margin: 5px 0;
                color: #666;
            }

            .pix-status {
                margin-top: 20px;
                padding: 15px;
                background: white;
                border-radius: 10px;
                border: 1px solid #ddd;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 10px;
            }

            .expiration {
                color: #666;
                font-size: 14px;
            }

            .renew-pix-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
                transition: background 0.3s;
            }

            .renew-pix-btn:hover {
                background: #c82333;
            }
        `;

        document.head.appendChild(styles);
    }
}

// Função global para copiar código PIX
function copyPIXCode() {
    const pixCode = document.getElementById('pixCode');
    if (pixCode) {
        pixCode.select();
        document.execCommand('copy');
        
        // Feedback visual
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#d4af37';
        }, 2000);
    }
}

// Exportar para uso global
window.PIXGenerator = PIXGenerator;
window.PIXCheckout = PIXCheckout;
