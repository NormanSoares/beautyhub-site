# 📋 ENDPOINTS DISPONÍVEIS - BeautyHub API

## 🎯 **ENDPOINTS PRINCIPAIS**

### **1. ✅ API BÁSICA (FUNCIONANDO)**
```
GET  /api/                    - Informações da API
POST /api/                    - Operações da API
GET  /api/health              - Status de saúde
```

### **2. ✅ PAGAMENTOS (FUNCIONANDO)**
```
GET  /api/payments            - Listar pagamentos
POST /api/payments            - Criar pagamento
PUT  /api/payments/:id        - Atualizar pagamento
```

### **3. ✅ PEDIDOS (FUNCIONANDO)**
```
GET  /api/orders              - Listar pedidos
POST /api/orders              - Criar pedido
PUT  /api/orders/:id          - Atualizar pedido
```

### **4. ✅ PREÇOS ATIVOS (FUNCIONANDO)**
```
GET  /api/active-prices       - Listar preços ativos
POST /api/active-prices       - Atualizar preços
```

### **5. ✅ SCRAPING (FUNCIONANDO)**
```
GET  /api/scraper             - Listar produtos
POST /api/scraper/scrape      - Scraping de produto
GET  /api/scraper/stock/:id   - Estoque do produto
```

### **6. ✅ AUTENTICAÇÃO (FUNCIONANDO)**
```
POST /api/auth/login          - Login
POST /api/auth/register       - Registro
POST /api/auth/refresh        - Refresh token
```

## 🧪 **TESTES DISPONÍVEIS**

### **A) TESTES BÁSICOS:**
```bash
# Health Check
curl http://localhost:3001/api/health

# API Info
curl http://localhost:3001/api/

# Stats
curl -X POST http://localhost:3001/api/ -d '{"action":"get_stats","data":{}}'
```

### **B) TESTES DE SCRAPING:**
```bash
# Scraping de produto
curl -X POST http://localhost:3001/api/scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://pt.aliexpress.com/item/1005009428867608.html"}'

# Listar produtos
curl http://localhost:3001/api/scraper

# Estoque de produto
curl http://localhost:3001/api/scraper/stock/PRODUCT_ID
```

### **C) TESTES DE PEDIDOS:**
```bash
# Listar pedidos
curl http://localhost:3001/api/orders

# Criar pedido
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"product":"PHOERA Foundation","quantity":1,"customer":"João Silva"}'
```

### **D) TESTES DE PAGAMENTOS:**
```bash
# Listar pagamentos
curl http://localhost:3001/api/payments

# Criar pagamento
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":17.45,"currency":"USD","method":"PayPal"}'
```

## 🔧 **CONFIGURAÇÕES ATUALIZADAS**

### **A) CREDENCIAIS ALIEXPRESS:**
```json
{
  "apiKey": "520258",
  "secretKey": "YUfgyKXrywwJOhUWZ4nDG2QZzXxdRzsF",
  "trackingId": "520258"
}
```

### **B) WEBHOOK CONFIGURADO:**
```
URL: https://beautyhub-site-1.onrender.com/api/aliexpress-callback
Status: ✅ Testado e funcionando
Message Types: ✅ Todos selecionados (5/5)
```

## 🚀 **PRÓXIMOS TESTES**

### **1. 🧪 TESTAR SCRAPING REAL:**
- Verificar se os bloqueios foram resolvidos
- Testar busca de produtos
- Verificar rate limits

### **2. 🧪 TESTAR INTEGRAÇÃO COMPLETA:**
- Criar pedido completo
- Testar webhooks
- Verificar notificações

### **3. 🧪 TESTAR DASHBOARD:**
- Métricas em tempo real
- Alertas de estoque
- Relatórios

## 📊 **STATUS ATUAL**

### **✅ FUNCIONANDO (100%):**
- Servidor Node.js
- API básica
- Health monitoring
- CORS configurado
- Webhook configurado

### **🔄 TESTANDO:**
- Scraping de produtos
- Integração AliExpress
- Rate limits
- Webhooks

### **❓ AGUARDANDO:**
- Resultados dos testes
- Confirmação de funcionamento
- Métricas de performance

---

**Status:** ✅ ENDPOINTS MAPEADOS
**Próximo:** Iniciar testes sistemáticos
**Prioridade:** ALTA - Verificar se bloqueios foram resolvidos

