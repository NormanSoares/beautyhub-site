# 🛒 Guia de Integração AliExpress - 67 Beauty Hub

## 📋 Visão Geral

Este sistema permite integração completa com o AliExpress para processamento automático de pedidos, rastreamento em tempo real e notificações de status.

## 🔧 Configuração

### 1. Arquivos Criados

```
📁 api/
  └── aliexpress-callback.php     # Endpoint para receber webhooks
📁 js/
  └── aliexpress-integration.js   # Sistema de integração frontend
📁 config/
  └── aliexpress-config.json      # Configurações do AliExpress
📁 docs/
  └── aliexpress-integration-guide.md # Esta documentação
```

### 2. URL do Callback

```
https://seudominio.com/api/aliexpress-callback.php
```

## 🚀 Como Funciona

### Fluxo de Pedido

1. **Cliente finaliza pedido** no checkout
2. **Sistema envia dados** para AliExpress
3. **AliExpress processa** o pedido
4. **Webhooks notificam** mudanças de status
5. **Cliente recebe atualizações** automáticas

### Eventos Suportados

| Evento | Descrição | Ação |
|--------|-----------|------|
| `order_created` | Pedido criado | Salvar no sistema |
| `order_paid` | Pagamento confirmado | Atualizar status |
| `order_shipped` | Pedido enviado | Enviar código de rastreamento |
| `order_delivered` | Pedido entregue | Solicitar review |
| `order_cancelled` | Pedido cancelado | Processar reembolso |
| `order_refunded` | Pedido reembolsado | Atualizar financeiro |

## 🔐 Segurança

### Validação de IP
```php
// IPs permitidos do AliExpress
$allowedIPs = [
    '47.254.128.0/18',
    '47.254.192.0/19',
    // ... outros IPs oficiais
];
```

### Validação de Assinatura
```php
// Verificar HMAC-SHA256
$signature = $_SERVER['HTTP_X_ALIEXPRESS_SIGNATURE'];
$expected = hash_hmac('sha256', $payload, $secret);
```

## 📱 Interface do Usuário

### Painel de Rastreamento
- **Status em tempo real** do pedido
- **Código de rastreamento** automático
- **Notificações push** de atualizações
- **Histórico completo** de movimentações

### Modal de Confirmação
- **ID do pedido** único
- **Informações do fornecedor**
- **Data estimada** de entrega
- **Próximos passos** para o cliente

## 🛠️ Configuração no AliExpress

### 1. Configurar Webhook

1. Acesse **Seller Center** no AliExpress
2. Vá em **Marketing** > **Webhook Settings**
3. Adicione a URL: `https://seudominio.com/api/aliexpress-callback.php`
4. Configure os eventos desejados
5. Defina a chave secreta

### 2. Configurar Produtos

```json
{
  "stores": {
    "phoera_official": {
      "storeId": "PHOERA_STORE_001",
      "products": [
        "PHOERA Foundation",
        "2 Pack PHOERA Foundation + Combo"
      ]
    }
  }
}
```

## 📊 Monitoramento

### Logs de Sistema
```
📁 api/logs/
  └── aliexpress-callback.log    # Log de todas as requisições
```

### Exemplo de Log
```
[2024-01-15 10:30:45] Processando evento: order_created | Data: {"order_id":"AE_123456","status":"created"}
[2024-01-15 10:31:02] Pedido enviado | Data: {"order_id":"AE_123456","tracking":"TRK789ABC"}
```

## 🧪 Testes

### Teste Manual
```
https://seudominio.com/api/aliexpress-callback.php?test=1
```

### Dados de Teste
```json
{
  "event_type": "order_created",
  "order": {
    "order_id": "TEST_123456",
    "customer": {
      "email": "test@example.com",
      "name": "Cliente Teste"
    },
    "total_amount": 99.99,
    "currency": "BRL"
  }
}
```

## 🔄 Integração com Frontend

### JavaScript
```javascript
// Inicializar integração
const aliExpress = new AliExpressIntegration();

// Escutar atualizações
window.addEventListener('aliExpressOrderUpdate', (event) => {
    console.log('Atualização recebida:', event.detail);
});
```

### CSS para Notificações
```css
@keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
```

## 📈 Métricas e Analytics

### KPIs Importantes
- **Taxa de conversão** de pedidos
- **Tempo médio** de processamento
- **Taxa de cancelamento** por fornecedor
- **Satisfação do cliente** por produto

### Dashboard Sugerido
- **Pedidos por dia/mês**
- **Status de pedidos** em tempo real
- **Performance por fornecedor**
- **Alertas de problemas**

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Webhook não recebe dados
- ✅ Verificar URL do callback
- ✅ Validar configuração no AliExpress
- ✅ Verificar logs de erro

#### 2. Assinatura inválida
- ✅ Verificar chave secreta
- ✅ Confirmar algoritmo HMAC-SHA256
- ✅ Validar headers HTTP

#### 3. IP bloqueado
- ✅ Verificar lista de IPs permitidos
- ✅ Confirmar IPs oficiais do AliExpress
- ✅ Testar com IP de desenvolvimento

## 📞 Suporte

### Contatos
- **Desenvolvedor:** 67 Beauty Hub Team
- **Email:** dev@67beautyhub.com
- **Documentação:** [Link para docs completas]

### Links Úteis
- [AliExpress Developer Portal](https://developers.aliexpress.com/)
- [Webhook Documentation](https://developers.aliexpress.com/en/doc.htm?docId=118)
- [API Reference](https://developers.aliexpress.com/en/doc.htm?docId=118)

---

## 🎯 Próximos Passos

1. **Configurar AliExpress** com URL do callback
2. **Testar webhook** com dados reais
3. **Monitorar logs** por 24-48h
4. **Ajustar configurações** conforme necessário
5. **Treinar equipe** no uso do sistema

---

*Documentação criada em: Janeiro 2024*  
*Versão: 1.0.0*  
*Status: Ativo*



