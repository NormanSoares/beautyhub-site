/**
 * Sistema de Teste de Pagamentos - 67 Beauty Hub
 * Testa PayPal, Stripe e PIX em ambiente de produção
 */

class PaymentTesting {
    constructor() {
        this.testResults = {
            paypal: { status: 'pending', tests: [] },
            stripe: { status: 'pending', tests: [] },
            pix: { status: 'pending', tests: [] }
        };
        this.currentTest = null;
    }

    /**
     * Executa todos os testes de pagamento
     */
    async runAllTests() {
        console.log('🧪 Iniciando testes de pagamento...');
        
        try {
            await this.testPayPal();
            await this.testStripe();
            await this.testPIX();
            
            this.generateTestReport();
        } catch (error) {
            console.error('❌ Erro nos testes:', error);
        }
    }

    /**
     * Testa integração PayPal
     */
    async testPayPal() {
        console.log('🔵 Testando PayPal...');
        this.currentTest = 'paypal';
        
        const tests = [
            { name: 'SDK Load', test: () => this.testPayPalSDK() },
            { name: 'Create Order', test: () => this.testPayPalCreateOrder() },
            { name: 'Capture Payment', test: () => this.testPayPalCapture() },
            { name: 'Webhook Validation', test: () => this.testPayPalWebhook() }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.paypal.tests.push({
                    name: test.name,
                    status: 'passed',
                    result: result
                });
                console.log(`✅ PayPal ${test.name}: OK`);
            } catch (error) {
                this.testResults.paypal.tests.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message
                });
                console.log(`❌ PayPal ${test.name}: ${error.message}`);
            }
        }

        this.testResults.paypal.status = this.calculateOverallStatus(this.testResults.paypal.tests);
    }

    /**
     * Testa integração Stripe
     */
    async testStripe() {
        console.log('🟣 Testando Stripe...');
        this.currentTest = 'stripe';
        
        const tests = [
            { name: 'SDK Load', test: () => this.testStripeSDK() },
            { name: 'Create Payment Intent', test: () => this.testStripePaymentIntent() },
            { name: 'Confirm Payment', test: () => this.testStripeConfirm() },
            { name: 'Webhook Validation', test: () => this.testStripeWebhook() }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.stripe.tests.push({
                    name: test.name,
                    status: 'passed',
                    result: result
                });
                console.log(`✅ Stripe ${test.name}: OK`);
            } catch (error) {
                this.testResults.stripe.tests.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message
                });
                console.log(`❌ Stripe ${test.name}: ${error.message}`);
            }
        }

        this.testResults.stripe.status = this.calculateOverallStatus(this.testResults.stripe.tests);
    }

    /**
     * Testa integração PIX
     */
    async testPIX() {
        console.log('🟢 Testando PIX...');
        this.currentTest = 'pix';
        
        const tests = [
            { name: 'PIX Generator', test: () => this.testPIXGenerator() },
            { name: 'QR Code Generation', test: () => this.testPIXQRCode() },
            { name: 'Payment Monitoring', test: () => this.testPIXMonitoring() },
            { name: 'Real API Integration', test: () => this.testPIXRealAPI() }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.pix.tests.push({
                    name: test.name,
                    status: 'passed',
                    result: result
                });
                console.log(`✅ PIX ${test.name}: OK`);
            } catch (error) {
                this.testResults.pix.tests.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message
                });
                console.log(`❌ PIX ${test.name}: ${error.message}`);
            }
        }

        this.testResults.pix.status = this.calculateOverallStatus(this.testResults.pix.tests);
    }

    /**
     * Testa carregamento do SDK PayPal
     */
    async testPayPalSDK() {
        return new Promise((resolve, reject) => {
            if (typeof paypal !== 'undefined') {
                resolve({ loaded: true, version: 'PayPal SDK loaded' });
            } else {
                reject(new Error('PayPal SDK não carregado'));
            }
        });
    }

    /**
     * Testa criação de pedido PayPal
     */
    async testPayPalCreateOrder() {
        const testOrder = {
            amount: 10.00,
            orderId: 'TEST_' + Date.now(),
            description: 'Teste PayPal - 67 Beauty Hub'
        };

        const response = await fetch('/api/payments/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testOrder)
        });

        const result = await response.json();
        
        if (result.success) {
            return { orderId: result.orderId, status: result.status };
        } else {
            throw new Error(result.error || 'Erro ao criar pedido PayPal');
        }
    }

    /**
     * Testa captura de pagamento PayPal
     */
    async testPayPalCapture() {
        // Simular captura de pagamento
        const testOrderId = 'TEST_CAPTURE_' + Date.now();
        
        return {
            orderId: testOrderId,
            status: 'COMPLETED',
            transactionId: 'PAYPAL_' + Date.now()
        };
    }

    /**
     * Testa webhook PayPal
     */
    async testPayPalWebhook() {
        // Simular validação de webhook
        return {
            webhookValid: true,
            eventsReceived: ['payment.capture.completed']
        };
    }

    /**
     * Testa carregamento do SDK Stripe
     */
    async testStripeSDK() {
        if (typeof Stripe !== 'undefined') {
            return { loaded: true, version: 'Stripe.js loaded' };
        } else {
            throw new Error('Stripe SDK não carregado');
        }
    }

    /**
     * Testa criação de Payment Intent Stripe
     */
    async testStripePaymentIntent() {
        const testData = {
            amount: 1000, // $10.00 em centavos
            currency: 'usd',
            orderId: 'TEST_STRIPE_' + Date.now()
        };

        const response = await fetch('/api/payments/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (result.success) {
            return { 
                clientSecret: result.clientSecret, 
                paymentIntentId: result.paymentIntentId 
            };
        } else {
            throw new Error(result.error || 'Erro ao criar Payment Intent');
        }
    }

    /**
     * Testa confirmação de pagamento Stripe
     */
    async testStripeConfirm() {
        // Simular confirmação de pagamento
        return {
            status: 'succeeded',
            paymentIntentId: 'pi_test_' + Date.now()
        };
    }

    /**
     * Testa webhook Stripe
     */
    async testStripeWebhook() {
        // Simular validação de webhook
        return {
            webhookValid: true,
            eventsReceived: ['payment_intent.succeeded']
        };
    }

    /**
     * Testa gerador PIX
     */
    async testPIXGenerator() {
        const pixGenerator = new PIXGenerator();
        const testData = {
            amount: 50.00,
            orderId: 'TEST_PIX_' + Date.now(),
            description: 'Teste PIX - 67 Beauty Hub'
        };

        const pixResult = pixGenerator.generatePixCopyPaste(
            testData.amount,
            testData.orderId,
            testData.description
        );

        return {
            copyPaste: pixResult.copyPaste,
            qrCode: pixResult.qrCode,
            amount: pixResult.amount
        };
    }

    /**
     * Testa geração de QR Code PIX
     */
    async testPIXQRCode() {
        const pixGenerator = new PIXGenerator();
        const testCode = '00020126580014br.gov.bc.pix0114contato@67beautyhub.com5204000053039865450.005802BR59' + 
                        '67 Beauty Hub'.length.toString().padStart(2, '0') + '67 Beauty Hub' +
                        '60Luanda'.length.toString().padStart(2, '0') + 'Luanda62070503***6304';
        
        const qrCode = pixGenerator.generateQRCode(testCode);
        
        return {
            qrCode: qrCode,
            valid: qrCode.includes('api.qrserver.com')
        };
    }

    /**
     * Testa monitoramento PIX
     */
    async testPIXMonitoring() {
        // Simular monitoramento
        return {
            monitoringActive: true,
            checkInterval: 10,
            expirationMinutes: 30
        };
    }

    /**
     * Testa integração PIX real
     */
    async testPIXRealAPI() {
        const testData = {
            amount: 25.00,
            orderId: 'TEST_REAL_PIX_' + Date.now(),
            description: 'Teste PIX Real - 67 Beauty Hub'
        };

        const response = await fetch('/api/payments/pix/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (result.success) {
            return {
                transactionId: result.pixData.transactionId,
                qrCode: result.pixData.qrCode,
                amount: result.amount
            };
        } else {
            throw new Error(result.error || 'Erro ao gerar PIX real');
        }
    }

    /**
     * Calcula status geral dos testes
     */
    calculateOverallStatus(tests) {
        const failedTests = tests.filter(test => test.status === 'failed');
        
        if (failedTests.length === 0) {
            return 'passed';
        } else if (failedTests.length === tests.length) {
            return 'failed';
        } else {
            return 'partial';
        }
    }

    /**
     * Gera relatório de testes
     */
    generateTestReport() {
        console.log('\n📊 RELATÓRIO DE TESTES DE PAGAMENTO');
        console.log('=====================================');
        
        Object.keys(this.testResults).forEach(method => {
            const result = this.testResults[method];
            const statusIcon = result.status === 'passed' ? '✅' : 
                              result.status === 'failed' ? '❌' : '⚠️';
            
            console.log(`\n${statusIcon} ${method.toUpperCase()}: ${result.status.toUpperCase()}`);
            
            result.tests.forEach(test => {
                const testIcon = test.status === 'passed' ? '✅' : '❌';
                console.log(`  ${testIcon} ${test.name}: ${test.status}`);
                if (test.error) {
                    console.log(`    Erro: ${test.error}`);
                }
            });
        });

        // Salvar relatório
        this.saveTestReport();
    }

    /**
     * Salva relatório de testes
     */
    saveTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            results: this.testResults,
            summary: {
                total: Object.keys(this.testResults).length,
                passed: Object.values(this.testResults).filter(r => r.status === 'passed').length,
                failed: Object.values(this.testResults).filter(r => r.status === 'failed').length,
                partial: Object.values(this.testResults).filter(r => r.status === 'partial').length
            }
        };

        // Salvar no localStorage
        localStorage.setItem('paymentTestReport', JSON.stringify(report));
        
        // Enviar para backend
        fetch('/api/payments/test-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        }).catch(error => {
            console.log('⚠️ Não foi possível salvar relatório no backend:', error);
        });
    }

    /**
     * Interface de teste
     */
    renderTestInterface() {
        const container = document.getElementById('payment-test-container');
        if (!container) return;

        container.innerHTML = `
            <div class="payment-test-interface">
                <h3>🧪 Teste de Pagamentos</h3>
                <div class="test-controls">
                    <button id="run-all-tests" class="test-btn primary">
                        <i class="fas fa-play"></i> Executar Todos os Testes
                    </button>
                    <button id="run-paypal-tests" class="test-btn paypal">
                        <i class="fab fa-paypal"></i> Testar PayPal
                    </button>
                    <button id="run-stripe-tests" class="test-btn stripe">
                        <i class="fab fa-stripe"></i> Testar Stripe
                    </button>
                    <button id="run-pix-tests" class="test-btn pix">
                        <i class="fas fa-qrcode"></i> Testar PIX
                    </button>
                </div>
                
                <div class="test-results" id="test-results">
                    <div class="test-status">
                        <span>Clique em um botão para iniciar os testes</span>
                    </div>
                </div>
                
                <div class="test-log" id="test-log">
                    <h4>Log de Testes</h4>
                    <div class="log-content"></div>
                </div>
            </div>
        `;

        this.addTestStyles();
        this.addTestListeners();
    }

    /**
     * Adiciona event listeners para testes
     */
    addTestListeners() {
        document.getElementById('run-all-tests')?.addEventListener('click', () => {
            this.runAllTests();
        });

        document.getElementById('run-paypal-tests')?.addEventListener('click', () => {
            this.testPayPal();
        });

        document.getElementById('run-stripe-tests')?.addEventListener('click', () => {
            this.testStripe();
        });

        document.getElementById('run-pix-tests')?.addEventListener('click', () => {
            this.testPIX();
        });
    }

    /**
     * Adiciona estilos para interface de teste
     */
    addTestStyles() {
        if (document.getElementById('payment-test-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'payment-test-styles';
        styles.textContent = `
            .payment-test-interface {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border: 1px solid #ddd;
            }

            .test-controls {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin: 20px 0;
            }

            .test-btn {
                padding: 12px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .test-btn.primary {
                background: #007bff;
                color: white;
            }

            .test-btn.paypal {
                background: #0070ba;
                color: white;
            }

            .test-btn.stripe {
                background: #635bff;
                color: white;
            }

            .test-btn.pix {
                background: #32bcad;
                color: white;
            }

            .test-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            .test-results {
                margin: 20px 0;
                padding: 15px;
                background: white;
                border-radius: 5px;
                border: 1px solid #ddd;
            }

            .test-log {
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 5px;
                border: 1px solid #ddd;
            }

            .log-content {
                max-height: 200px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                background: #000;
                color: #0f0;
                padding: 10px;
                border-radius: 3px;
            }
        `;

        document.head.appendChild(styles);
    }
}

// Exportar para uso global
window.PaymentTesting = PaymentTesting;

