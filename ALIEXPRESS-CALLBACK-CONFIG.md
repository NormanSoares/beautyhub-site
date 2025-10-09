# 🛒 Configuração do Callback no AliExpress App Console

## 📋 Informações do Endpoint

### **URL do Callback:**
```
https://67-beauty-hub.vercel.app/api/aliexpress-callback
```

### **Métodos Aceitos:**
- ✅ **POST** (Recomendado para webhooks)
- ✅ **GET** (Para testes)
- ✅ **OPTIONS** (Para CORS)

### **Headers Aceitos:**
- `Content-Type: application/json`
- `Authorization`
- `X-AliExpress-Signature`

## 🔧 Configuração no AliExpress App Console

### **1. Acesse o AliExpress App Console**
- URL: https://developers.aliexpress.com/
- Faça login com sua conta AliExpress

### **2. Navegue para Webhook Settings**
- Vá para: **My Apps** → **Seu App** → **Webhook Settings**
- Ou: **API Management** → **Webhook Configuration**

### **3. Configure o Webhook**

#### **Webhook URL:**
```
https://67-beauty-hub.vercel.app/api/aliexpress-callback
```

#### **HTTP Method:**
```
POST
```

#### **Events to Subscribe:**
Selecione os eventos que deseja receber:
- ✅ `order.created` - Pedido criado
- ✅ `order.paid` - Pedido pago
- ✅ `order.shipped` - Pedido enviado
- ✅ `order.delivered` - Pedido entregue
- ✅ `order.cancelled` - Pedido cancelado
- ✅ `order.refunded` - Pedido reembolsado

#### **Webhook Secret:**
```
67beautyhub_aliexpress_secret_2024
```

### **4. Configurações Adicionais**

#### **Retry Policy:**
- **Max Retries:** 3
- **Retry Interval:** 5 minutes

#### **Timeout:**
- **Request Timeout:** 30 seconds

#### **Security:**
- ✅ **Enable Signature Verification**
- ✅ **Enable IP Whitelist** (se disponível)

## 🧪 Teste da Configuração

### **1. Teste Manual (GET):**
```
https://67-beauty-hub.vercel.app/api/aliexpress-callback?test=1
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Test completed",
  "test_data": {
    "event_type": "order_created",
    "order": {
      "order_id": "TEST_1760012980666",
      "customer": {
        "email": "test@example.com",
        "name": "Cliente Teste"
      },
      "total_amount": 99.99,
      "currency": "BRL"
    }
  }
}
```

### **2. Teste de Webhook (POST):**
```bash
curl -X POST https://67-beauty-hub.vercel.app/api/aliexpress-callback \
  -H "Content-Type: application/json" \
  -H "X-AliExpress-Signature: your_signature_here" \
  -d '{
    "event_type": "order.created",
    "order": {
      "order_id": "123456789",
      "status": "paid",
      "total_amount": 99.99,
      "currency": "USD"
    }
  }'
```

## 📊 Monitoramento

### **1. Logs do Vercel:**
```bash
vercel logs https://67-beauty-hub.vercel.app
```

### **2. Dashboard do AliExpress:**
- Vá para: **Webhook Logs**
- Verifique o status das notificações
- Analise erros e tentativas de retry

### **3. MongoDB:**
- Verifique a coleção `aliexpress_orders`
- Confirme se os dados estão sendo salvos

## 🔐 Segurança

### **Validação de Assinatura:**
O endpoint valida automaticamente a assinatura do AliExpress usando:
```javascript
const signature = req.headers['x-aliexpress-signature'];
const isValid = validateSignature(payload, signature, WEBHOOK_SECRET);
```

### **IP Whitelist:**
O endpoint aceita IPs do AliExpress:
- `47.254.128.0/18`
- `47.254.192.0/19`
- `47.254.224.0/19`
- E outros IPs oficiais do AliExpress

## 🚨 Troubleshooting

### **Erro: Method not allowed**
- ✅ Use método **POST** para webhooks
- ✅ Use método **GET** apenas para testes

### **Erro: Signature verification failed**
- ✅ Verifique se o `WEBHOOK_SECRET` está correto
- ✅ Confirme se o header `X-AliExpress-Signature` está sendo enviado

### **Erro: Failed to save order**
- ✅ Verifique se `MONGODB_URI` está configurado
- ✅ Confirme se o MongoDB está acessível

### **Webhook não recebido**
- ✅ Verifique se o URL está correto
- ✅ Confirme se o app está ativo no AliExpress
- ✅ Verifique os logs do AliExpress App Console

## 📝 Checklist de Configuração

- [ ] URL do webhook configurado
- [ ] Método POST selecionado
- [ ] Eventos selecionados
- [ ] Webhook secret configurado
- [ ] Teste manual realizado
- [ ] Logs verificados
- [ ] MongoDB conectado
- [ ] Assinatura validada

## 🎯 Próximos Passos

1. **Configure no AliExpress App Console**
2. **Teste com pedido real**
3. **Monitore os logs**
4. **Verifique dados no MongoDB**
5. **Configure notificações por email** (opcional)

---

**🎉 Seu callback está pronto para receber notificações do AliExpress!**
