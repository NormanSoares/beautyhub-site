/**
 * Gateway de Pagamentos Unificado - 67 Beauty Hub
 * Integração com PayPal, Stripe e PIX Real
 */

import paymentConfig from '../config/payment-config.js';

class PaymentGateway {
    constructor() {
        this.config = paymentConfig;
        this.activeProviders = new Set();
        this.initializeProviders();
    }

    /**
     * Inicializa provedores de pagamento
     */
    initializeProviders() {
        // PayPal
        if (this.config.paypal.clientId && this.config.paypal.clientId !== 'YOUR_PAYPAL_CLIENT_ID') {
            this.activeProviders.add('paypal');
            this.initializePayPal();
        }

        // Stripe
        if (this.config.stripe.publishableKey && this.config.stripe.publishableKey !== 'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY') {
            this.activeProviders.add('stripe');
            this.initializeStripe();
        }

        // PIX
        this.activeProviders.add('pix');
        this.initializePIX();
    }

    /**
     * Inicializa PayPal SDK
     */
    initializePayPal() {
        if (typeof window !== 'undefined') {
            // Carregar PayPal SDK
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.paypal.clientId}&currency=USD&intent=capture`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                console.log('✅ PayPal SDK carregado');
                this.paypalLoaded = true;
            };
        }
    }

    /**
     * Inicializa Stripe
     */
    initializeStripe() {
        if (typeof window !== 'undefined') {
            // Carregar Stripe SDK
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                console.log('✅ Stripe SDK carregado');
                this.stripe = Stripe(this.config.stripe.publishableKey);
                this.stripeLoaded = true;
            };
        }
    }

    /**
     * Inicializa PIX
     */
    initializePIX() {
        console.log('✅ PIX inicializado');
        this.pixLoaded = true;
    }

    /**
     * Processa pagamento com método selecionado
     */
    async processPayment(paymentData) {
        const { method, orderData, customerData } = paymentData;
        
        console.log(`💳 Processando pagamento via ${method.toUpperCase()}`);
        
        try {
            switch (method.toLowerCase()) {
                case 'paypal':
                    return await this.processPayPalPayment(orderData, customerData);
                
                case 'stripe':
                    return await this.processStripePayment(orderData, customerData);
                
                case 'pix':
                    return await this.processPIXPayment(orderData, customerData);
                
                default:
                    throw new Error(`Método de pagamento não suportado: ${method}`);
            }
        } catch (error) {
            console.error(`❌ Erro no pagamento ${method}:`, error);
            throw error;
        }
    }

    /**
     * Processa pagamento via PayPal
     */
    async processPayPalPayment(orderData, customerData) {
        if (!this.paypalLoaded) {
            throw new Error('PayPal SDK não carregado');
        }

        return new Promise((resolve, reject) => {
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                currency_code: 'USD',
                                value: orderData.total.toFixed(2)
                            },
                            description: `Pedido ${orderData.id} - 67 Beauty Hub`,
                            custom_id: orderData.id
                        }],
                        application_context: {
                            brand_name: '67 Beauty Hub',
                            landing_page: 'NO_PREFERENCE',
                            user_action: 'PAY_NOW',
                            return_url: this.config.paypal.returnUrl,
                            cancel_url: this.config.paypal.cancelUrl
                        }
                    });
                },
                onApprove: async (data, actions) => {
                    try {
                        const order = await actions.order.capture();
                        console.log('✅ PayPal pagamento aprovado:', order);
                        
                        // Enviar confirmação para backend
                        const confirmation = await this.confirmPayment('paypal', {
                            orderId: orderData.id,
                            transactionId: order.id,
                            amount: orderData.total,
                            status: 'completed',
                            paypalData: order
                        });
                        
                        resolve(confirmation);
                    } catch (error) {
                        console.error('❌ Erro ao capturar pagamento PayPal:', error);
                        reject(error);
                    }
                },
                onError: (error) => {
                    console.error('❌ Erro PayPal:', error);
                    reject(error);
                },
                onCancel: (data) => {
                    console.log('⚠️ PayPal pagamento cancelado');
                    reject(new Error('Pagamento cancelado pelo usuário'));
                }
            }).render('#paypal-button-container');
        });
    }

    /**
     * Processa pagamento via Stripe
     */
    async processStripePayment(orderData, customerData) {
        if (!this.stripeLoaded) {
            throw new Error('Stripe SDK não carregado');
        }

        try {
            // Criar Payment Intent no backend
            const response = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: Math.round(orderData.total * 100), // Stripe usa centavos
                    currency: 'usd',
                    orderId: orderData.id,
                    customerEmail: customerData.email
                })
            });

            const { clientSecret } = await response.json();

            // Confirmar pagamento
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: customerData.cardElement,
                    billing_details: {
                        name: customerData.name,
                        email: customerData.email
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            console.log('✅ Stripe pagamento aprovado:', result.paymentIntent);
            
            // Enviar confirmação para backend
            const confirmation = await this.confirmPayment('stripe', {
                orderId: orderData.id,
                transactionId: result.paymentIntent.id,
                amount: orderData.total,
                status: 'completed',
                stripeData: result.paymentIntent
            });

            return confirmation;
        } catch (error) {
            console.error('❌ Erro Stripe:', error);
            throw error;
        }
    }

    /**
     * Processa pagamento via PIX
     */
    async processPIXPayment(orderData, customerData) {
        try {
            // Gerar PIX usando API bancária real
            const pixResponse = await fetch('/api/pix/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: orderData.total,
                    orderId: orderData.id,
                    description: `Pedido ${orderData.id} - 67 Beauty Hub`,
                    customerEmail: customerData.email
                })
            });

            const pixData = await pixResponse.json();

            if (!pixData.success) {
                throw new Error(pixData.error || 'Erro ao gerar PIX');
            }

            console.log('✅ PIX gerado:', pixData);
            
            // Iniciar monitoramento de pagamento
            this.startPIXMonitoring(pixData.orderId, pixData.transactionId);

            return {
                success: true,
                method: 'pix',
                pixData: pixData,
                orderId: orderData.id
            };
        } catch (error) {
            console.error('❌ Erro PIX:', error);
            throw error;
        }
    }

    /**
     * Inicia monitoramento de PIX
     */
    startPIXMonitoring(orderId, transactionId) {
        const checkInterval = this.config.pix.merchant.checkIntervalSeconds * 1000;
        const maxAttempts = (this.config.pix.merchant.expirationMinutes * 60) / this.config.pix.merchant.checkIntervalSeconds;
        let attempts = 0;

        const checkPayment = async () => {
            attempts++;
            
            if (attempts > maxAttempts) {
                console.log('⏰ PIX expirado');
                this.onPIXExpired(transactionId);
                return;
            }

            try {
                const response = await fetch(`/api/pix/check-payment/${transactionId}`);
                const result = await response.json();

                if (result.paid) {
                    console.log('✅ PIX pago confirmado');
                    this.onPIXPaid(orderId, transactionId, result);
                } else {
                    setTimeout(checkPayment, checkInterval);
                }
            } catch (error) {
                console.error('❌ Erro ao verificar PIX:', error);
                setTimeout(checkPayment, checkInterval);
            }
        };

        setTimeout(checkPayment, checkInterval);
    }

    /**
     * Callback quando PIX é pago
     */
    onPIXPaid(orderId, transactionId, paymentData) {
        // Confirmar pagamento no backend
        this.confirmPayment('pix', {
            orderId: orderId,
            transactionId: transactionId,
            amount: paymentData.amount,
            status: 'completed',
            pixData: paymentData
        });

        // Atualizar interface
        this.updatePaymentStatus('completed', 'PIX pago com sucesso!');
    }

    /**
     * Callback quando PIX expira
     */
    onPIXExpired(transactionId) {
        this.updatePaymentStatus('expired', 'PIX expirado. Gere um novo.');
    }

    /**
     * Confirma pagamento no backend
     */
    async confirmPayment(method, paymentData) {
        try {
            const response = await fetch('/api/payments/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: method,
                    ...paymentData
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Erro ao confirmar pagamento:', error);
            throw error;
        }
    }

    /**
     * Atualiza status do pagamento na interface
     */
    updatePaymentStatus(status, message) {
        const statusElement = document.querySelector('.payment-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="status-${status}">
                    <i class="fas fa-${status === 'completed' ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
        }
    }

    /**
     * Obtém métodos de pagamento disponíveis
     */
    getAvailableMethods() {
        const methods = [];
        
        if (this.activeProviders.has('paypal')) {
            methods.push({
                id: 'paypal',
                name: 'PayPal',
                icon: 'fab fa-paypal',
                description: 'Pague com PayPal'
            });
        }
        
        if (this.activeProviders.has('stripe')) {
            methods.push({
                id: 'stripe',
                name: 'Cartão de Crédito',
                icon: 'fas fa-credit-card',
                description: 'Visa, Mastercard, American Express'
            });
        }
        
        if (this.activeProviders.has('pix')) {
            methods.push({
                id: 'pix',
                name: 'PIX',
                icon: 'fas fa-qrcode',
                description: 'Pagamento instantâneo'
            });
        }
        
        return methods;
    }

    /**
     * Renderiza interface de pagamento
     */
    renderPaymentInterface(containerId, orderData, customerData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const methods = this.getAvailableMethods();
        
        container.innerHTML = `
            <div class="payment-methods">
                <h3>Escolha a forma de pagamento</h3>
                <div class="payment-options">
                    ${methods.map(method => `
                        <div class="payment-option" data-method="${method.id}">
                            <i class="${method.icon}"></i>
                            <div class="method-info">
                                <h4>${method.name}</h4>
                                <p>${method.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="payment-container">
                    <div id="paypal-button-container" style="display: none;"></div>
                    <div id="stripe-container" style="display: none;"></div>
                    <div id="pix-container" style="display: none;"></div>
                </div>
                
                <div class="payment-status"></div>
            </div>
        `;

        // Adicionar event listeners
        this.addPaymentListeners(orderData, customerData);
        this.addPaymentStyles();
    }

    /**
     * Adiciona event listeners para métodos de pagamento
     */
    addPaymentListeners(orderData, customerData) {
        const options = document.querySelectorAll('.payment-option');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remover seleção anterior
                options.forEach(opt => opt.classList.remove('selected'));
                
                // Selecionar método atual
                option.classList.add('selected');
                
                const method = option.dataset.method;
                this.showPaymentMethod(method, orderData, customerData);
            });
        });
    }

    /**
     * Mostra interface do método de pagamento selecionado
     */
    showPaymentMethod(method, orderData, customerData) {
        // Esconder todos os containers
        document.getElementById('paypal-button-container').style.display = 'none';
        document.getElementById('stripe-container').style.display = 'none';
        document.getElementById('pix-container').style.display = 'none';

        // Mostrar container do método selecionado
        switch (method) {
            case 'paypal':
                document.getElementById('paypal-button-container').style.display = 'block';
                this.processPayment({ method: 'paypal', orderData, customerData });
                break;
                
            case 'stripe':
                document.getElementById('stripe-container').style.display = 'block';
                this.renderStripeForm(orderData, customerData);
                break;
                
            case 'pix':
                document.getElementById('pix-container').style.display = 'block';
                this.processPayment({ method: 'pix', orderData, customerData });
                break;
        }
    }

    /**
     * Renderiza formulário Stripe
     */
    renderStripeForm(orderData, customerData) {
        const container = document.getElementById('stripe-container');
        
        container.innerHTML = `
            <div class="stripe-form">
                <h4>Dados do Cartão</h4>
                <form id="stripe-form">
                    <div class="form-group">
                        <label>Nome no Cartão</label>
                        <input type="text" id="cardholder-name" required>
                    </div>
                    <div class="form-group">
                        <label>Dados do Cartão</label>
                        <div id="card-element"></div>
                        <div id="card-errors"></div>
                    </div>
                    <button type="submit" class="stripe-pay-btn">
                        <i class="fas fa-credit-card"></i>
                        Pagar $${orderData.total.toFixed(2)}
                    </button>
                </form>
            </div>
        `;

        // Inicializar Stripe Elements
        this.initializeStripeElements(orderData, customerData);
    }

    /**
     * Inicializa Stripe Elements
     */
    initializeStripeElements(orderData, customerData) {
        if (!this.stripe) return;

        const elements = this.stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');

        const form = document.getElementById('stripe-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const { error } = await this.stripe.confirmCardPayment(
                await this.createPaymentIntent(orderData),
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: document.getElementById('cardholder-name').value
                        }
                    }
                }
            );

            if (error) {
                document.getElementById('card-errors').textContent = error.message;
            } else {
                this.updatePaymentStatus('completed', 'Pagamento aprovado!');
            }
        });
    }

    /**
     * Cria Payment Intent para Stripe
     */
    async createPaymentIntent(orderData) {
        const response = await fetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Math.round(orderData.total * 100),
                currency: 'usd',
                orderId: orderData.id
            })
        });
        
        const { clientSecret } = await response.json();
        return clientSecret;
    }

    /**
     * Adiciona estilos CSS
     */
    addPaymentStyles() {
        if (document.getElementById('payment-gateway-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'payment-gateway-styles';
        styles.textContent = `
            .payment-methods {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }

            .payment-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }

            .payment-option {
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .payment-option:hover {
                border-color: #d4af37;
                transform: translateY(-2px);
            }

            .payment-option.selected {
                border-color: #d4af37;
                background: #f8f9fa;
            }

            .payment-option i {
                font-size: 2rem;
                color: #d4af37;
            }

            .method-info h4 {
                margin: 0 0 5px 0;
                color: #333;
            }

            .method-info p {
                margin: 0;
                color: #666;
                font-size: 0.9rem;
            }

            .payment-container {
                margin: 30px 0;
                min-height: 200px;
            }

            .stripe-form {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }

            .form-group {
                margin: 15px 0;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #333;
            }

            .form-group input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
            }

            #card-element {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: white;
            }

            #card-errors {
                color: #dc3545;
                margin-top: 5px;
                font-size: 0.9rem;
            }

            .stripe-pay-btn {
                width: 100%;
                background: #d4af37;
                color: white;
                border: none;
                padding: 15px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s;
            }

            .stripe-pay-btn:hover {
                background: #b8941f;
            }

            .payment-status {
                margin-top: 20px;
                text-align: center;
            }

            .status-completed {
                color: #28a745;
                font-weight: bold;
            }

            .status-expired {
                color: #dc3545;
                font-weight: bold;
            }
        `;

        document.head.appendChild(styles);
    }
}

// Exportar para uso global
window.PaymentGateway = PaymentGateway;

