# API Callback Endpoint - Guia Completo

## 📋 Visão Geral

O endpoint `/api/callback` foi criado para receber webhooks e callbacks de diferentes serviços, incluindo AliExpress, sistemas de pagamento e outros integradores. É totalmente compatível com Vercel e MongoDB.

## 🚀 Características

- ✅ **Compatível com Vercel** - Serverless functions
- ✅ **Integração com MongoDB** - Armazenamento de dados
- ✅ **Múltiplos tipos de callback** - Orders, payments, webhooks
- ✅ **Validação de segurança** - Assinaturas e CORS
- ✅ **Logs detalhados** - Monitoramento completo
- ✅ **Testes automatizados** - Scripts de teste incluídos

## 📁 Estrutura de Arquivos

```
api/
├── callback.js              # Endpoint principal
├── aliexpress-callback.php  # Endpoint PHP (legado)

config/
├── mongodb-config.js        # Configurações MongoDB

scripts/
├── test-callback.js         # Script de testes

docs/
├── api-callback-guide.md    # Este guia
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no Vercel:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/beautyhub

# Segurança
WEBHOOK_SECRET=seu_webhook_secret_aqui
ALIEXPRESS_WEBHOOK_SECRET=seu_aliexpress_secret_aqui

# CORS
ALLOWED_ORIGINS=https://seudominio.com,https://app.seudominio.com
```

### 2. Instalação de Dependências

```bash
npm install mongodb express
```

### 3. Deploy no Vercel

```bash
vercel --prod
```

## 📡 Endpoints Disponíveis

### POST /api/callback

Recebe webhooks e callbacks de diferentes serviços.

**Headers:**
```
Content-Type: application/json
X-Webhook-Signature: sha256=... (opcional)
X-AliExpress-Signature: sha256=... (opcional)
```

**Exemplo de Payload:**

```json
{
  "type": "order_created",
  "order_id": "ORDER_123456",
  "customer": {
    "email": "cliente@example.com",
    "name": "João Silva"
  },
  "total_amount": 199.99,
  "currency": "BRL",
  "items": [
    {
      "product_id": "PHOERA_FOUNDATION",
      "quantity": 1,
      "price": 199.99
    }
  ]
}
```

### GET /api/callback?test=1

Endpoint de teste que processa dados de exemplo.

## 🗄️ Tipos de Callback Suportados

### 1. Eventos de Pedidos
- `order_created` - Novo pedido criado
- `order_paid` - Pagamento confirmado
- `order_shipped` - Pedido enviado
- `order_delivered` - Pedido entregue
- `order_cancelled` - Pedido cancelado
- `order_refunded` - Pedido reembolsado

### 2. Webhooks de Pagamento
- `payment_webhook` - Notificações de pagamento

### 3. AliExpress
- `aliexpress_webhook` - Webhooks do AliExpress

### 4. Usuários
- `user_registration` - Registro de usuário

### 5. Produtos
- `product_update` - Atualização de produto

## 🗃️ Estrutura do MongoDB

### Collections Criadas

1. **orders** - Pedidos
2. **payments** - Pagamentos
3. **users** - Usuários
4. **products** - Produtos
5. **aliexpress_orders** - Pedidos do AliExpress
6. **webhooks** - Logs de webhooks
7. **logs** - Logs gerais

### Exemplo de Documento

```json
{
  "_id": ObjectId("..."),
  "orderId": "ORDER_123456",
  "status": "order_created",
  "customerEmail": "cliente@example.com",
  "totalAmount": 199.99,
  "currency": "BRL",
  "items": [...],
  "timestamp": ISODate("2024-01-01T00:00:00Z"),
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "metadata": {...}
}
```

## 🧪 Testando o Endpoint

### 1. Teste Local

```bash
# Instalar dependências
npm install

# Executar servidor local
node api/callback.js

# Em outro terminal, executar testes
node scripts/test-callback.js
```

### 2. Teste no Vercel

```bash
# Deploy
vercel --prod

# Testar endpoint
curl -X GET "https://seu-projeto.vercel.app/api/callback?test=1"
```

### 3. Teste com Dados Reais

```bash
curl -X POST "https://seu-projeto.vercel.app/api/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order_created",
    "order_id": "TEST_123",
    "customer": {
      "email": "test@example.com"
    },
    "total_amount": 99.99
  }'
```

## 🔒 Segurança

### 1. Validação de Assinatura

```javascript
// Exemplo de validação
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const isValid = validateSignature(payload, signature, WEBHOOK_SECRET);
```

### 2. CORS

```javascript
// Configuração CORS
res.setHeader('Access-Control-Allow-Origin', origin);
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
```

### 3. Validação de IP (Opcional)

```javascript
// Lista de IPs permitidos
const allowedIPs = [
  '47.254.128.0/18',
  '47.254.192.0/19'
];
```

## 📊 Monitoramento

### 1. Logs do Vercel

```bash
vercel logs
```

### 2. Logs do MongoDB

Os logs são salvos automaticamente na collection `logs`:

```javascript
{
  "level": "info",
  "message": "Callback processado com sucesso",
  "source": "api/callback",
  "data": {...},
  "timestamp": ISODate("...")
}
```

### 3. Métricas

- Total de callbacks processados
- Taxa de sucesso/erro
- Tempo de resposta
- Tipos de callback mais comuns

## 🚨 Troubleshooting

### Erro: "MongoDB connection failed"

1. Verifique a `MONGODB_URI`
2. Confirme se o cluster está ativo
3. Verifique as permissões de acesso

### Erro: "Invalid signature"

1. Verifique o `WEBHOOK_SECRET`
2. Confirme se a assinatura está sendo enviada corretamente
3. Verifique o algoritmo de hash (SHA256)

### Erro: "CORS policy"

1. Configure `ALLOWED_ORIGINS`
2. Verifique se o domínio está na lista
3. Confirme se os headers estão corretos

## 📈 Próximos Passos

1. **Implementar retry logic** para falhas temporárias
2. **Adicionar rate limiting** para prevenir spam
3. **Criar dashboard** para monitoramento
4. **Implementar webhooks de saída** para notificar outros sistemas
5. **Adicionar cache** para melhorar performance

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do Vercel
2. Consulte a documentação do MongoDB
3. Teste com o script incluído
4. Abra uma issue no repositório

---

**Desenvolvido para 67 Beauty Hub** 🎨✨
