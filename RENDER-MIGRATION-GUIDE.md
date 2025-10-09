# 🚀 Guia de Migração para Render

## 📋 **Passos para Migrar do Vercel para o Render:**

### **1. Criar Conta no Render:**
- Acesse [render.com](https://render.com)
- Faça login com sua conta GitHub
- Conecte seu repositório `NormanSoares/beautyhub-site`

### **2. Criar Web Service:**
- Clique em **"New"** → **"Web Service"**
- Conecte o repositório GitHub
- Configure:
  - **Name:** `beautyhub-site`
  - **Environment:** `Node`
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`
  - **Plan:** `Free`

### **3. Configurar Variáveis de Ambiente:**
- Vá em **"Environment"**
- Adicione as variáveis:
  ```
  NODE_ENV=production
  MONGODB_URI=mongodb+srv://BATMANRICH_db_user:password1234567@cluster0.pdopfr2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  ROCKETDB_URI=mongodb+srv://BATMANRICH_db_user:password1234567@cluster0.pdopfr2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  NORMANDB_URI=mongodb+srv://BATMANRICH_db_user:password1234567@cluster0.pdopfr2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  WEBHOOK_SECRET=67beautyhub_webhook_secret_2024
  ALIEXPRESS_WEBHOOK_SECRET=67beautyhub_aliexpress_secret_2024
  ALLOWED_ORIGINS=https://beautyhub-site.onrender.com
  ```

### **4. Configurar Health Check:**
- **Health Check Path:** `/api/health`
- **Auto Deploy:** `Yes`

### **5. Deploy:**
- Clique em **"Create Web Service"**
- Aguarde o build e deploy
- Teste os endpoints

## 🎯 **URLs do Render:**

### **Webhook AliExpress:**
```
https://beautyhub-site.onrender.com/api/aliexpress-callback
```

### **Health Check:**
```
https://beautyhub-site.onrender.com/api/health
```

### **Site Principal:**
```
https://beautyhub-site.onrender.com/
```

## ✅ **Vantagens do Render:**

- ✅ **Deploy automático** - GitHub integration
- ✅ **Variáveis estáveis** - Sem problemas de cache
- ✅ **Logs em tempo real** - Debugging fácil
- ✅ **SSL automático** - HTTPS nativo
- ✅ **Free tier generoso** - 750 horas/mês
- ✅ **Persistent storage** - Sem limitações
- ✅ **Custom domains** - Domínio próprio

## 🔧 **Configuração no AliExpress:**

### **Atualizar Webhook URL:**
- **URL:** `https://beautyhub-site.onrender.com/api/aliexpress-callback`
- **Método:** `POST`
- **Secret:** `67beautyhub_aliexpress_secret_2024`

## 🎉 **Resultado:**

**Sistema 100% estável e confiável no Render!** 🚀
