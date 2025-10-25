/**
 * Configuração de Pagamentos - 67 Beauty Hub
 * Credenciais reais para produção
 */

const paymentConfig = {
    // PayPal Business Configuration
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || 'Ab2ftZVJCplquKWOY1cWgvWMivADwMhbUs-OhehwO4hVh_VW9IS87qLkRUVD39yEeoh7YGXzBeuq1Dlh',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'EPBgdag8qrkw_q6mmVQo3HaAxDyvzcAhm5qr7Y2JojxmUaw-F9ZoTfn-pmEwDEGSC-UAx7UXeGPtEUYS',
        environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
        webhookId: process.env.PAYPAL_WEBHOOK_ID || 'YOUR_PAYPAL_WEBHOOK_ID',
        returnUrl: process.env.PAYPAL_RETURN_URL || 'https://beautyhub-site.onrender.com/payment/success',
        cancelUrl: process.env.PAYPAL_CANCEL_URL || 'https://beautyhub-site.onrender.com/payment/cancel'
    },

    // Stripe Configuration
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_YOUR_STRIPE_PUBLISHABLE_KEY',
        secretKey: process.env.STRIPE_SECRET_KEY || 'sk_live_YOUR_STRIPE_SECRET_KEY',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_STRIPE_WEBHOOK_SECRET',
        successUrl: process.env.STRIPE_SUCCESS_URL || 'https://67beautyhub.com/payment/success',
        cancelUrl: process.env.STRIPE_CANCEL_URL || 'https://67beautyhub.com/payment/cancel'
    },

    // PIX Real Configuration
    pix: {
        // Banco do Brasil PIX
        bancoBrasil: {
            clientId: process.env.BB_CLIENT_ID || 'YOUR_BB_CLIENT_ID',
            clientSecret: process.env.BB_CLIENT_SECRET || 'YOUR_BB_CLIENT_SECRET',
            certificatePath: process.env.BB_CERTIFICATE_PATH || './certs/bb-cert.p12',
            certificatePassword: process.env.BB_CERTIFICATE_PASSWORD || 'YOUR_CERT_PASSWORD',
            baseUrl: 'https://api.bb.com.br/pix/v1',
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        },

        // Itaú PIX
        itau: {
            clientId: process.env.ITAU_CLIENT_ID || 'YOUR_ITAU_CLIENT_ID',
            clientSecret: process.env.ITAU_CLIENT_SECRET || 'YOUR_ITAU_CLIENT_SECRET',
            certificatePath: process.env.ITAU_CERTIFICATE_PATH || './certs/itau-cert.p12',
            certificatePassword: process.env.ITAU_CERTIFICATE_PASSWORD || 'YOUR_CERT_PASSWORD',
            baseUrl: 'https://api.itau.com.br/pix/v1',
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        },

        // Bradesco PIX
        bradesco: {
            clientId: process.env.BRADESCO_CLIENT_ID || 'YOUR_BRADESCO_CLIENT_ID',
            clientSecret: process.env.BRADESCO_CLIENT_SECRET || 'YOUR_BRADESCO_CLIENT_SECRET',
            certificatePath: process.env.BRADESCO_CERTIFICATE_PATH || './certs/bradesco-cert.p12',
            certificatePassword: process.env.BRADESCO_CERTIFICATE_PASSWORD || 'YOUR_CERT_PASSWORD',
            baseUrl: 'https://api.bradesco.com.br/pix/v1',
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        },

        // Configurações gerais PIX
        merchant: {
            name: '67 Beauty Hub',
            city: 'Luanda',
            pixKey: 'contato@67beautyhub.com',
            expirationMinutes: 30,
            checkIntervalSeconds: 10
        }
    },

    // Configurações gerais
    general: {
        currency: 'USD',
        defaultCurrency: 'BRL',
        supportedCurrencies: ['USD', 'BRL', 'EUR', 'AOA'],
        webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'https://67beautyhub.com/api/webhooks',
        timeout: 30000, // 30 segundos
        retryAttempts: 3
    }
};

export default paymentConfig;
