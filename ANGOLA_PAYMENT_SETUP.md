# 🇦🇴 Configuração de Pagamentos para Angola - 67 Beauty Hub

## 🎯 Opções de Pagamento para Angola

### ✅ **PayPal Business** (RECOMENDADO)
- **Status**: ✅ Funciona perfeitamente em Angola
- **Vantagens**: 
  - Global, aceita clientes de qualquer país
  - Interface em português
  - Suporte a AOA (Kwanza Angolano)
  - Fácil configuração

### ✅ **Flutterwave** (RECOMENDADO PARA ÁFRICA)
- **Status**: ✅ Especializado em África
- **Vantagens**:
  - Suporte nativo ao AOA
  - Múltiplas moedas africanas
  - Integração com bancos locais
  - MPesa, Orange Money, etc.

### ✅ **Paystack** (ALTERNATIVA)
- **Status**: ✅ Popular na África Ocidental
- **Vantagens**:
  - Suporte a AOA
  - Integração com bancos locais
  - Cartões locais e internacionais

### ❌ **PIX** (NÃO DISPONÍVEL)
- **Status**: ❌ Exclusivo do Brasil
- **Alternativa**: MPesa (mais popular em Angola)

## 🚀 **Configuração Recomendada para Angola**

### **Opção 1: PayPal + Flutterwave**
```javascript
// Configuração para Angola
const paymentConfig = {
    // PayPal (Global)
    paypal: {
        clientId: 'SEU_PAYPAL_CLIENT_ID',
        clientSecret: 'SEU_PAYPAL_CLIENT_SECRET',
        currency: 'USD', // PayPal converte automaticamente
        supportedCurrencies: ['USD', 'AOA', 'EUR']
    },
    
    // Flutterwave (África)
    flutterwave: {
        publicKey: 'FLWPUBK_TEST-SEU_PUBLIC_KEY',
        secretKey: 'FLWSECK_TEST-SEU_SECRET_KEY',
        currency: 'AOA',
        country: 'AO'
    },
    
    // MPesa (Angola)
    mpesa: {
        consumerKey: 'SEU_MPESA_CONSUMER_KEY',
        consumerSecret: 'SEU_MPESA_CONSUMER_SECRET',
        shortCode: 'SEU_SHORT_CODE',
        currency: 'AOA'
    }
};
```

## 📋 **Passo a Passo para Angola**

### **1. Configurar PayPal (FÁCIL)**
1. Acesse [paypal.com/ao](https://paypal.com/ao)
2. Crie conta Business
3. Complete verificação (pode usar documentos angolanos)
4. Obtenha credenciais de desenvolvedor
5. Configure webhooks

### **2. Configurar Flutterwave (RECOMENDADO)**
1. Acesse [flutterwave.com](https://flutterwave.com)
2. Crie conta (suporte a Angola)
3. Complete verificação KYC
4. Obtenha chaves de API
5. Configure webhooks

### **3. Configurar MPesa (OPCIONAL)**
1. Entre em contato com operadoras locais
2. Configure integração MPesa
3. Obtenha credenciais de API

## 💰 **Moedas Suportadas**

### **PayPal**
- USD (principal)
- AOA (Kwanza Angolano)
- EUR (Euro)
- Conversão automática

### **Flutterwave**
- AOA (Kwanza Angolano) - nativo
- USD, EUR, GBP
- Moedas africanas

### **MPesa**
- AOA (Kwanza Angolano)
- Pagamentos móveis locais

## 🏦 **Bancos Locais Suportados**

### **Flutterwave**
- Banco de Poupança e Crédito
- Banco BIC
- Banco Millennium Atlântico
- Standard Bank Angola

### **PayPal**
- Qualquer banco com cartão Visa/Mastercard
- Contas bancárias locais

## 🔧 **Implementação Técnica**

### **1. Atualizar Configuração**
```javascript
// config/payment-config-angola.js
const paymentConfig = {
    // PayPal (funciona globalmente)
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        environment: 'live',
        currency: 'USD',
        supportedCurrencies: ['USD', 'AOA', 'EUR']
    },
    
    // Flutterwave (especializado em África)
    flutterwave: {
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
        currency: 'AOA',
        country: 'AO',
        baseUrl: 'https://api.flutterwave.com/v3'
    },
    
    // MPesa (pagamentos móveis)
    mpesa: {
        consumerKey: process.env.MPESA_CONSUMER_KEY,
        consumerSecret: process.env.MPESA_CONSUMER_SECRET,
        shortCode: process.env.MPESA_SHORT_CODE,
        currency: 'AOA'
    }
};
```

### **2. APIs de Pagamento para Angola**
```javascript
// api/payments-angola.js
const express = require('express');
const router = express.Router();

// PayPal (já implementado)
router.post('/paypal/create-order', async (req, res) => {
    // Implementação PayPal (funciona globalmente)
});

// Flutterwave
router.post('/flutterwave/initialize', async (req, res) => {
    const { amount, email, phone, name } = req.body;
    
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tx_ref: `ANG_${Date.now()}`,
            amount: amount,
            currency: 'AOA',
            redirect_url: 'https://67beautyhub.com/payment/success',
            customer: {
                email: email,
                phonenumber: phone,
                name: name
            },
            customizations: {
                title: '67 Beauty Hub',
                description: 'Pagamento de produtos de beleza'
            }
        })
    });
    
    const result = await response.json();
    res.json({
        success: true,
        paymentUrl: result.data.link,
        reference: result.data.reference
    });
});

// MPesa
router.post('/mpesa/stk-push', async (req, res) => {
    const { phone, amount } = req.body;
    
    // Implementar STK Push do MPesa
    // (requer integração com operadora local)
});

module.exports = router;
```

## 🧪 **Testes para Angola**

### **Dados de Teste Flutterwave**
```javascript
// Cartões de teste Flutterwave
const testCards = {
    visa: '4187427415564246',
    mastercard: '5438898014560229',
    verve: '5061460410120223210'
};

// Códigos de teste
const testCodes = {
    cvv: '828',
    expiry: '09/32',
    pin: '3310'
};
```

### **Dados de Teste PayPal**
- Use conta PayPal de teste
- Cartões de teste do PayPal
- Moeda: USD (conversão automática)

## 📞 **Suporte Local**

### **Flutterwave**
- Email: support@flutterwave.com
- WhatsApp: +234 1 700 0000
- Suporte em português

### **PayPal**
- Centro de ajuda em português
- Suporte por chat/email
- Documentação em português

## 🎯 **Recomendação Final**

### **Para 67 Beauty Hub em Angola:**

1. **PayPal** - Para clientes internacionais
2. **Flutterwave** - Para clientes locais (AOA)
3. **MPesa** - Para pagamentos móveis (opcional)

### **Vantagens desta combinação:**
- ✅ Cobertura global (PayPal)
- ✅ Suporte local (Flutterwave)
- ✅ Moeda local (AOA)
- ✅ Bancos locais
- ✅ Pagamentos móveis

## 🚀 **Próximos Passos**

1. **Criar contas**:
   - PayPal Business
   - Flutterwave
   - MPesa (se necessário)

2. **Configurar credenciais**:
   - Obter chaves de API
   - Configurar webhooks
   - Testar integrações

3. **Implementar**:
   - Atualizar código para Flutterwave
   - Manter PayPal
   - Adicionar MPesa (opcional)

**🎉 Resultado**: Sistema de pagamentos completo para Angola!

