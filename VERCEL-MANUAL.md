# 🚀 Deploy Manual no Vercel - 67 Beauty Hub

## 📋 Opção 1: Deploy pelo Site do Vercel

### **1. Acesse o Vercel:**
```
https://vercel.com
```

### **2. Faça Login:**
- Use GitHub, Google ou email
- É **100% gratuito**

### **3. Importar Projeto:**
1. Clique em **"New Project"**
2. Selecione **"Import Git Repository"** ou **"Browse"**
3. Faça upload da pasta do projeto
4. Configure:
   - **Project Name:** `67-beauty-hub`
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`

### **4. Configurações Avançadas:**
```json
{
  "buildCommand": "",
  "outputDirectory": ".",
  "installCommand": ""
}
```

### **5. Deploy:**
- Clique em **"Deploy"**
- Aguarde 2-3 minutos

---

## 📋 Opção 2: Via GitHub (Recomendado)

### **1. Criar Repositório GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - 67 Beauty Hub"
```

### **2. Subir para GitHub:**
- Crie repositório no GitHub
- Conecte com o projeto local

### **3. Deploy no Vercel:**
- Importe do GitHub
- Deploy automático

---

## 🌐 URLs que Você Receberá

### **Domínio Vercel:**
```
https://67-beauty-hub-[ID].vercel.app
```

### **Callback AliExpress:**
```
https://67-beauty-hub-[ID].vercel.app/api/aliexpress-callback.php
```

### **Páginas:**
- **Home:** `https://67-beauty-hub-[ID].vercel.app/`
- **PHOERA Checkout:** `https://67-beauty-hub-[ID].vercel.app/checkout-phoera.html`
- **Alligator Checkout:** `https://67-beauty-hub-[ID].vercel.app/checkout-alligator-clips.html`

---

## ⚙️ Configuração AliExpress

### **Webhook Settings:**
- **URL:** `https://67-beauty-hub-[ID].vercel.app/api/aliexpress-callback.php`
- **Events:** 
  - ✅ `order_created`
  - ✅ `order_paid`
  - ✅ `order_shipped`
  - ✅ `order_delivered`
- **Secret:** `67beautyhub_webhook_secret_2024`

---

## 🧪 Teste do Sistema

### **1. Teste do Callback:**
```
https://67-beauty-hub-[ID].vercel.app/api/aliexpress-callback.php?test=1
```

### **2. Teste do Site:**
```
https://67-beauty-hub-[ID].vercel.app/
```

### **3. Teste do Checkout:**
```
https://67-beauty-hub-[ID].vercel.app/checkout-phoera.html
```

---

## 📱 Próximos Passos

1. ✅ **Deploy no Vercel** (pelo site)
2. ✅ **Copiar URL** gerada
3. ✅ **Configurar AliExpress** com callback URL
4. ✅ **Testar webhook** 
5. ✅ **Monitorar logs**

---

## 🎯 Alternativa: Netlify

Se o Vercel não funcionar, use **Netlify**:

### **1. Acesse:**
```
https://netlify.com
```

### **2. Deploy:**
- Arraste a pasta do projeto
- Deploy automático

### **3. URL:**
```
https://[random-name].netlify.app/api/aliexpress-callback.php
```

---

**🚀 Recomendação: Use o deploy pelo site do Vercel - é mais fácil e rápido!**



