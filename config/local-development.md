# 🚀 Configuração para Desenvolvimento Local

## 📋 Opções para Testar o Callback AliExpress

### 1. 🆓 **ngrok (Recomendado para Testes)**

#### Instalação:
```bash
# Download do ngrok
# https://ngrok.com/download

# Executar localmente
php -S localhost:8000

# Em outro terminal
ngrok http 8000
```

#### URL Gerada:
```
https://abc123.ngrok.io/api/aliexpress-callback.php
```

### 2. 🌐 **Serviços Gratuitos**

#### **Heroku (Gratuito):**
```bash
# Instalar Heroku CLI
npm install -g heroku

# Deploy
git init
heroku create seu-app-67beauty
git push heroku main
```

**URL:** `https://seu-app-67beauty.herokuapp.com/api/aliexpress-callback.php`

#### **Netlify:**
```bash
# Deploy direto
netlify deploy --prod --dir=.
```

**URL:** `https://seu-site.netlify.app/api/aliexpress-callback.php`

#### **Vercel:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**URL:** `https://seu-projeto.vercel.app/api/aliexpress-callback.php`

### 3. 💻 **Servidor Local com PHP**

#### **XAMPP/WAMP/MAMP:**
```
URL Local: http://localhost/67-beauty-hub/api/aliexpress-callback.php
```

#### **PHP Built-in Server:**
```bash
# Na pasta do projeto
php -S localhost:8000

# URL: http://localhost:8000/api/aliexpress-callback.php
```

## 🔧 **Configuração no AliExpress**

### Para Testes:
1. **Acesse:** AliExpress Seller Center
2. **Vá em:** Marketing > Webhook Settings
3. **Adicione URL:** `https://sua-url-gratuita.com/api/aliexpress-callback.php`
4. **Configure eventos:** order_created, order_paid, order_shipped
5. **Defina chave secreta:** `test_secret_key_123`

### Para Produção:
1. **Registre domínio:** `67beautyhub.com`
2. **Configure SSL:** Certificado HTTPS
3. **Deploy em servidor:** VPS ou Cloud
4. **URL final:** `https://67beautyhub.com/api/aliexpress-callback.php`

## 🧪 **Teste Manual**

### URL de Teste:
```
https://sua-url.com/api/aliexpress-callback.php?test=1
```

### Dados de Teste:
```json
{
  "event_type": "order_created",
  "order": {
    "order_id": "TEST_123456",
    "customer": {
      "email": "teste@67beautyhub.com",
      "name": "Cliente Teste"
    },
    "total_amount": 99.99,
    "currency": "BRL",
    "items": [
      {
        "product_id": "PHOERA_FOUNDATION",
        "quantity": 1,
        "price": 99.99
      }
    ]
  }
}
```

## 📱 **Configuração no Frontend**

### Atualizar URL no JavaScript:
```javascript
// Em js/aliexpress-integration.js
this.apiEndpoint = 'https://sua-url-real.com/api/aliexpress-callback.php';
```

### Atualizar Configuração:
```json
// Em config/aliexpress-config.json
{
  "webhook": {
    "endpoint": "https://sua-url-real.com/api/aliexpress-callback.php"
  }
}
```

## 🚨 **Importante para Produção**

### 1. **SSL/HTTPS Obrigatório:**
- AliExpress só aceita URLs HTTPS
- Configure certificado SSL válido

### 2. **IPs Permitidos:**
- Configure firewall adequadamente
- Mantenha lista de IPs do AliExpress atualizada

### 3. **Logs e Monitoramento:**
- Configure alertas para falhas
- Monitore performance do webhook
- Mantenha backups dos dados

## 💡 **Recomendação Imediata**

Para começar a testar **agora mesmo**:

1. **Use ngrok** para expor localhost
2. **Configure URL temporária** no AliExpress
3. **Teste com pedidos reais**
4. **Depois migre** para domínio próprio

### Comando ngrok:
```bash
# Terminal 1: Servidor PHP
php -S localhost:8000

# Terminal 2: ngrok
ngrok http 8000

# Use a URL gerada: https://abc123.ngrok.io
```



