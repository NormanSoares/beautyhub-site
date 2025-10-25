/**
 * Exemplo de Configuração de Ambiente - 67 Beauty Hub
 * Copie este arquivo para config/env.js e preencha com suas credenciais reais
 */

module.exports = {
    // PayPal Business
    paypal: {
        clientId: 'your_paypal_client_id_here',
        clientSecret: 'your_paypal_client_secret_here',
        webhookId: 'your_paypal_webhook_id_here',
        returnUrl: 'https://67beautyhub.com/payment/success',
        cancelUrl: 'https://67beautyhub.com/payment/cancel'
    },

    // Stripe
    stripe: {
        publishableKey: 'pk_live_your_stripe_publishable_key_here',
        secretKey: 'sk_live_your_stripe_secret_key_here',
        webhookSecret: 'whsec_your_stripe_webhook_secret_here',
        successUrl: 'https://67beautyhub.com/payment/success',
        cancelUrl: 'https://67beautyhub.com/payment/cancel'
    },

    // PIX - Banco do Brasil
    bancoBrasil: {
        clientId: 'your_bb_client_id_here',
        clientSecret: 'your_bb_client_secret_here',
        certificatePath: './certs/bb-cert.p12',
        certificatePassword: 'your_bb_certificate_password_here'
    },

    // PIX - Itaú
    itau: {
        clientId: 'your_itau_client_id_here',
        clientSecret: 'your_itau_client_secret_here',
        certificatePath: './certs/itau-cert.p12',
        certificatePassword: 'your_itau_certificate_password_here'
    },

    // PIX - Bradesco
    bradesco: {
        clientId: 'your_bradesco_client_id_here',
        clientSecret: 'your_bradesco_client_secret_here',
        certificatePath: './certs/bradesco-cert.p12',
        certificatePassword: 'your_bradesco_certificate_password_here'
    },

    // Configurações Gerais
    general: {
        nodeEnv: 'production',
        webhookBaseUrl: 'https://67beautyhub.com/api/webhooks',
        mongodbUri: 'mongodb://localhost:27017/beautyhub',
        mongodbDatabase: 'beautyhub'
    },

    // Email
    email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'contato@67beautyhub.com',
        smtpPass: 'your_email_password_here'
    }
};

