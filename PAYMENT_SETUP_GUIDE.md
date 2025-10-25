# Guia de Configuração de Pagamentos - 67 Beauty Hub

## 🚀 Implementação para Pedidos Reais - FASE 1: PAGAMENTOS

Este guia contém todas as instruções para configurar pagamentos reais com PayPal, Stripe e PIX.

## 📋 Pré-requisitos

- Conta PayPal Business
- Conta Stripe
- Conta bancária para PIX (Banco do Brasil, Itaú ou Bradesco)
- Certificados digitais (para PIX)
- Domínio com HTTPS

## 🔧 Configuração PayPal Business

### 1. Criar Conta PayPal Business
1. Acesse [developer.paypal.com](https://developer.paypal.com)
2. Crie uma conta Business
3. Complete a verificação de identidade
4. Configure informações da empresa

### 2. Obter Credenciais
1. Acesse o Dashboard do PayPal Developer
2. Crie uma nova aplicação
3. Copie o **Client ID** e **Client Secret**
4. Configure URLs de retorno:
   - Return URL: `https://67beautyhub.com/payment/success`
   - Cancel URL: `https://67beautyhub.com/payment/cancel`

### 3. Configurar Webhooks
1. No dashboard PayPal, vá para Webhooks
2. Adicione endpoint: `https://67beautyhub.com/api/payments/paypal/webhook`
3. Selecione eventos: `PAYMENT.CAPTURE.COMPLETED`
4. Copie o **Webhook ID**

### 4. Atualizar Configuração
Edite o arquivo `config/payment-config.js`:

```javascript
paypal: {
    clientId: 'SEU_PAYPAL_CLIENT_ID',
    clientSecret: 'SEU_PAYPAL_CLIENT_SECRET',
    environment: 'live', // Para produção
    webhookId: 'SEU_PAYPAL_WEBHOOK_ID'
}
```

## 💳 Configuração Stripe

### 1. Criar Conta Stripe
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta
3. Complete a verificação de identidade
4. Ative sua conta

### 2. Obter Chaves de Produção
1. No dashboard Stripe, vá para Developers > API Keys
2. Copie a **Publishable Key** (use pk_test_ em desenvolvimento)
3. Copie a **Secret Key** (use sk_test_ em desenvolvimento)

### 3. Configurar Webhooks
1. Vá para Developers > Webhooks
2. Adicione endpoint: `https://67beautyhub.com/api/payments/stripe/webhook`
3. Selecione eventos: `payment_intent.succeeded`
4. Copie o **Webhook Secret** (whsec_...)

### 4. Atualizar Configuração
Edite o arquivo `config/payment-config.js`:

```javascript
stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: 'whsec_SEU_WEBHOOK_SECRET'
}
```

## 🏦 Configuração PIX Real

### Opção 1: Banco do Brasil

#### 1. Obter Credenciais
1. Acesse o portal do desenvolvedor do BB
2. Registre sua aplicação
3. Obtenha **Client ID** e **Client Secret**
4. Baixe o certificado digital (.p12)

#### 2. Configurar Certificado
1. Coloque o certificado em `certs/bb-cert.p12`
2. Anote a senha do certificado

#### 3. Atualizar Configuração
```javascript
pix: {
    bancoBrasil: {
        clientId: 'SEU_BB_CLIENT_ID',
        clientSecret: 'SEU_BB_CLIENT_SECRET',
        certificatePath: './certs/bb-cert.p12',
        certificatePassword: 'SENHA_DO_CERTIFICADO'
    }
}
```

### Opção 2: Itaú

#### 1. Obter Credenciais
1. Acesse o portal do desenvolvedor do Itaú
2. Registre sua aplicação
3. Obtenha **Client ID** e **Client Secret**
4. Baixe o certificado digital (.p12)

#### 2. Configurar Certificado
1. Coloque o certificado em `certs/itau-cert.p12`
2. Anote a senha do certificado

#### 3. Atualizar Configuração
```javascript
pix: {
    itau: {
        clientId: 'SEU_ITAU_CLIENT_ID',
        clientSecret: 'SEU_ITAU_CLIENT_SECRET',
        certificatePath: './certs/itau-cert.p12',
        certificatePassword: 'SENHA_DO_CERTIFICADO'
    }
}
```

### Opção 3: Bradesco

#### 1. Obter Credenciais
1. Acesse o portal do desenvolvedor do Bradesco
2. Registre sua aplicação
3. Obtenha **Client ID** e **Client Secret**
4. Baixe o certificado digital (.p12)

#### 2. Configurar Certificado
1. Coloque o certificado em `certs/bradesco-cert.p12`
2. Anote a senha do certificado

#### 3. Atualizar Configuração
```javascript
pix: {
    bradesco: {
        clientId: 'SEU_BRADESCO_CLIENT_ID',
        clientSecret: 'SEU_BRADESCO_CLIENT_SECRET',
        certificatePath: './certs/bradesco-cert.p12',
        certificatePassword: 'SENHA_DO_CERTIFICADO'
    }
}
```

## 🔐 Configuração de Segurança

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# PayPal
PAYPAL_CLIENT_ID=seu_paypal_client_id
PAYPAL_CLIENT_SECRET=seu_paypal_client_secret
PAYPAL_WEBHOOK_ID=seu_paypal_webhook_id

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# PIX
BB_CLIENT_ID=seu_bb_client_id
BB_CLIENT_SECRET=seu_bb_client_secret
BB_CERTIFICATE_PASSWORD=sua_senha_certificado

# Ambiente
NODE_ENV=production
```

### 2. Certificados Digitais
Crie a pasta `certs/` e coloque os certificados:
```
certs/
├── bb-cert.p12
├── itau-cert.p12
└── bradesco-cert.p12
```

## 🧪 Testes de Pagamento

### 1. Teste PayPal
1. Acesse `https://67beautyhub.com/payment-test.html`
2. Clique em "Testar PayPal"
3. Use dados de teste do PayPal
4. Verifique se o pagamento é processado

### 2. Teste Stripe
1. Use cartões de teste do Stripe:
   - Visa: 4242424242424242
   - Mastercard: 5555555555554444
   - Data: qualquer data futura
   - CVC: qualquer 3 dígitos

### 3. Teste PIX
1. Gere um PIX de teste
2. Use um app bancário para pagar
3. Verifique se o pagamento é confirmado

## 📊 Monitoramento

### 1. Logs de Pagamento
- PayPal: Dashboard PayPal Developer
- Stripe: Dashboard Stripe
- PIX: Logs do banco escolhido

### 2. Webhooks
Verifique se os webhooks estão funcionando:
- PayPal: `https://67beautyhub.com/api/payments/paypal/webhook`
- Stripe: `https://67beautyhub.com/api/payments/stripe/webhook`

## 🚨 Troubleshooting

### Problemas Comuns

#### PayPal
- **Erro 401**: Verifique Client ID e Secret
- **Erro 400**: Verifique URLs de retorno
- **Webhook não funciona**: Verifique URL e eventos

#### Stripe
- **Erro de chave**: Verifique se está usando chaves de produção
- **Webhook não funciona**: Verifique URL e eventos
- **Pagamento falha**: Verifique dados do cartão

#### PIX
- **Erro de certificado**: Verifique caminho e senha
- **Erro de autenticação**: Verifique Client ID e Secret
- **QR Code não gera**: Verifique configuração da chave PIX

## 📞 Suporte

### PayPal
- [Documentação PayPal](https://developer.paypal.com/docs/)
- [Suporte PayPal](https://www.paypal.com/br/smarthelp/contact-us)

### Stripe
- [Documentação Stripe](https://stripe.com/docs)
- [Suporte Stripe](https://support.stripe.com/)

### PIX
- **Banco do Brasil**: [Portal BB](https://developers.bb.com.br/)
- **Itaú**: [Portal Itaú](https://dev.itau.com.br/)
- **Bradesco**: [Portal Bradesco](https://developers.bradesco.com.br/)

## ✅ Checklist de Implementação

- [ ] Conta PayPal Business criada
- [ ] Credenciais PayPal configuradas
- [ ] Webhook PayPal funcionando
- [ ] Conta Stripe criada
- [ ] Chaves Stripe configuradas
- [ ] Webhook Stripe funcionando
- [ ] Conta bancária para PIX
- [ ] Certificado digital obtido
- [ ] PIX configurado
- [ ] Testes executados
- [ ] Monitoramento ativo

## 🎯 Próximos Passos

Após configurar os pagamentos:

1. **FASE 2**: Implementar sistema de pedidos
2. **FASE 3**: Integração com fornecedores
3. **FASE 4**: Sistema de estoque
4. **FASE 5**: Dashboard administrativo

---

**Importante**: Sempre teste em ambiente de desenvolvimento antes de colocar em produção!

