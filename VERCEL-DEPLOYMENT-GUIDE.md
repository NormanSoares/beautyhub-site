# 🚀 Guia de Deploy - 67 Beauty Hub no Vercel

## 📋 Pré-requisitos

- ✅ Conta no Vercel
- ✅ Conta no MongoDB Atlas (recomendado) ou MongoDB local
- ✅ Vercel CLI instalado (`npm install -g vercel`)

## 🔧 Configuração das Variáveis de Ambiente

### 1. Acesse o Dashboard do Vercel
- Vá para: https://vercel.com/dashboard
- Encontre seu projeto: **67-beauty-hub**
- Clique em **Settings** → **Environment Variables**

### 2. Adicione as Variáveis Obrigatórias

| Nome da Variável | Valor | Ambiente | Descrição |
|------------------|-------|----------|-----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/beautyhub` | Production | String de conexão MongoDB |
| `WEBHOOK_SECRET` | `67beautyhub_webhook_secret_2024` | Production | Secret para webhooks gerais |
| `ALIEXPRESS_WEBHOOK_SECRET` | `67beautyhub_aliexpress_secret_2024` | Production | Secret para AliExpress |
| `ALLOWED_ORIGINS` | `https://67-beauty-hub.vercel.app` | Production | Origens permitidas (CORS) |
| `NODE_ENV` | `production` | Production | Ambiente de execução |

### 3. Configuração do MongoDB Atlas

```bash
# Exemplo de MONGODB_URI para Atlas:
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/beautyhub?retryWrites=true&w=majority

# Exemplo para MongoDB local:
mongodb://localhost:27017/beautyhub
```

## 🎯 Endpoints Configurados

### ✅ Endpoints Funcionais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/callback` | POST, GET | Webhook geral para callbacks |
| `/api/aliexpress-callback` | POST, GET | Webhook específico do AliExpress |
| `/api/` | GET, POST | API principal com status |

### 🔗 URLs de Webhook para AliExpress

```
https://67-beauty-hub.vercel.app/api/aliexpress-callback
https://67-beauty-hub.vercel.app/api/callback
```

## 🚀 Deploy

### 1. Deploy via CLI
```bash
# Deploy para produção
vercel --prod --yes

# Deploy para preview
vercel
```

### 2. Deploy via Dashboard
- Push para o repositório GitHub
- O Vercel fará deploy automático

## 🧪 Testando os Endpoints

### 1. Teste da API Principal
```bash
curl https://67-beauty-hub.vercel.app/api/
```

### 2. Teste do Callback
```bash
curl -X POST https://67-beauty-hub.vercel.app/api/callback \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 3. Teste do AliExpress Callback
```bash
curl -X POST https://67-beauty-hub.vercel.app/api/aliexpress-callback \
  -H "Content-Type: application/json" \
  -d '{"orderId": "12345", "status": "paid"}'
```

## 🔍 Troubleshooting

### ❌ Erro: FUNCTION_INVOCATION_FAILED
**Causa:** Variáveis de ambiente não configuradas
**Solução:** Verificar se todas as variáveis estão no dashboard do Vercel

### ❌ Erro: Invalid scheme, expected mongodb://
**Causa:** MONGODB_URI malformada
**Solução:** Verificar formato da string de conexão

### ❌ Erro: 404 NOT_FOUND
**Causa:** Rota não encontrada
**Solução:** Verificar se o arquivo está na pasta `api/`

## 📊 Monitoramento

### 1. Logs do Vercel
```bash
# Ver logs em tempo real
vercel logs https://67-beauty-hub.vercel.app

# Inspecionar deployment
vercel inspect https://67-beauty-hub.vercel.app
```

### 2. Dashboard do Vercel
- Acesse: https://vercel.com/dashboard
- Clique no projeto → **Functions** para ver logs das APIs

## 🔐 Segurança

### ✅ Configurações Aplicadas
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Validação de webhooks
- ✅ Timeout de 30 segundos
- ✅ Runtime Node.js 18.x

### 🛡️ Recomendações
- Use secrets fortes para webhooks
- Configure ALLOWED_ORIGINS específicas
- Monitore logs regularmente
- Use HTTPS sempre

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] MongoDB conectado e testado
- [ ] Deploy realizado com sucesso
- [ ] Endpoints testados
- [ ] Logs verificados
- [ ] Webhooks do AliExpress configurados

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `vercel logs`
2. Teste localmente: `npm start`
3. Verifique variáveis: `vercel env ls`
4. Consulte a documentação do Vercel

---

**🎉 Parabéns! Seu 67 Beauty Hub está online!**
