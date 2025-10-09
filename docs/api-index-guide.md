# API Index - Guia do Endpoint Principal

## 📋 Visão Geral

O endpoint `/api/` é o ponto de entrada principal da API do 67 Beauty Hub. Ele fornece informações sobre a API, estatísticas do sistema, status de saúde e permite operações administrativas.

## 🚀 Características

- ✅ **Informações da API** - Versão, status, documentação
- ✅ **Estatísticas do Sistema** - Contadores de collections MongoDB
- ✅ **Status de Saúde** - Verificação de conectividade com banco
- ✅ **Lista de Endpoints** - Documentação automática dos endpoints
- ✅ **Operações Administrativas** - Testes de conexão e diagnósticos
- ✅ **CORS Configurado** - Suporte a requisições cross-origin

## 📡 Endpoints Disponíveis

### GET /api/

Retorna informações completas da API.

**Resposta:**
```json
{
  "api": {
    "name": "67 Beauty Hub API",
    "version": "1.0.0",
    "status": "active",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "health": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "stats": {
    "orders": 150,
    "payments": 120,
    "users": 45,
    "products": 25,
    "aliexpress_orders": 80,
    "webhooks": 200,
    "logs": 500
  },
  "endpoints": [
    {
      "path": "/api/",
      "methods": ["GET", "POST", "OPTIONS"],
      "description": "API principal - informações e estatísticas"
    },
    {
      "path": "/api/callback",
      "methods": ["POST", "GET"],
      "description": "Webhook callback - recebe notificações de serviços externos"
    }
  ],
  "documentation": {
    "github": "https://github.com/SEU-USUARIO/67-beauty-hub",
    "docs": "/docs/api-callback-guide.md"
  }
}
```

### POST /api/

Executa operações administrativas na API.

**Body:**
```json
{
  "action": "get_stats",
  "data": {}
}
```

**Ações Disponíveis:**

#### 1. `get_stats`
Retorna estatísticas detalhadas do sistema.

```json
{
  "action": "get_stats",
  "data": {}
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "result": {
    "orders": 150,
    "payments": 120,
    "users": 45,
    "products": 25,
    "aliexpress_orders": 80,
    "webhooks": 200,
    "logs": 500
  }
}
```

#### 2. `get_health`
Verifica o status de saúde da API e banco de dados.

```json
{
  "action": "get_health",
  "data": {}
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "result": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. `get_endpoints`
Lista todos os endpoints disponíveis na API.

```json
{
  "action": "get_endpoints",
  "data": {}
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "result": {
    "endpoints": [
      {
        "path": "/api/",
        "methods": ["GET", "POST", "OPTIONS"],
        "description": "API principal - informações e estatísticas"
      },
      {
        "path": "/api/callback",
        "methods": ["POST", "GET"],
        "description": "Webhook callback - recebe notificações de serviços externos"
      }
    ]
  }
}
```

#### 4. `test_connection`
Testa a conexão com o MongoDB.

```json
{
  "action": "test_connection",
  "data": {}
}
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "result": {
    "success": true,
    "message": "Conexão com MongoDB estabelecida",
    "result": {
      "ok": 1
    }
  }
}
```

### OPTIONS /api/

Resposta para requisições CORS preflight.

**Headers de Resposta:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🧪 Testando o Endpoint

### 1. Teste Local

```bash
# Instalar dependências
npm install

# Executar servidor local
node api/index.js

# Em outro terminal, executar testes
node scripts/test-api-index.js
```

### 2. Teste com cURL

```bash
# Teste GET
curl -X GET "http://localhost:3001/api/"

# Teste POST - Estatísticas
curl -X POST "http://localhost:3001/api/" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats", "data": {}}'

# Teste POST - Saúde
curl -X POST "http://localhost:3001/api/" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_health", "data": {}}'

# Teste OPTIONS
curl -X OPTIONS "http://localhost:3001/api/"
```

### 3. Teste no Vercel

```bash
# Deploy
vercel --prod

# Testar endpoint
curl -X GET "https://seu-projeto.vercel.app/api/"
```

## 📊 Monitoramento

### 1. Métricas Disponíveis

- **Contadores de Collections**: Orders, payments, users, products, etc.
- **Status de Saúde**: Conectividade com MongoDB
- **Tempo de Resposta**: Timestamp de cada requisição
- **Logs de Erro**: Erros capturados e logados

### 2. Logs

```javascript
// Logs automáticos
console.log(`${req.method} /api/`, {
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
});
```

### 3. Alertas

Configure alertas para:
- Status de saúde = "unhealthy"
- Falhas de conexão com MongoDB
- Tempo de resposta > 5 segundos

## 🔒 Segurança

### 1. CORS
- Configurado para aceitar requisições de qualquer origem
- Headers de segurança configurados
- Métodos permitidos: GET, POST, OPTIONS

### 2. Validação
- Validação de body em requisições POST
- Tratamento de erros com mensagens seguras
- Logs de segurança para auditoria

### 3. Rate Limiting
- Implementar rate limiting se necessário
- Monitorar uso excessivo do endpoint

## 🚨 Troubleshooting

### Erro: "MongoDB connection failed"

1. Verifique a variável `MONGODB_URI`
2. Confirme se o cluster está ativo
3. Verifique as permissões de acesso

### Erro: "Action not recognized"

1. Verifique se a ação está na lista de ações permitidas
2. Confirme o formato do JSON
3. Verifique se o body não está vazio

### Erro: "Method not allowed"

1. Use apenas GET, POST ou OPTIONS
2. Verifique se está enviando o Content-Type correto
3. Confirme se não há redirecionamentos

## 📈 Próximos Passos

1. **Implementar autenticação** para operações administrativas
2. **Adicionar cache** para estatísticas frequentes
3. **Criar dashboard** para visualização de métricas
4. **Implementar rate limiting** para prevenir abuso
5. **Adicionar mais operações** administrativas

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do Vercel
2. Teste com o script incluído
3. Consulte a documentação do MongoDB
4. Abra uma issue no repositório

---

**Desenvolvido para 67 Beauty Hub** 🎨✨
