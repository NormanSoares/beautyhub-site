# 67 Beauty Hub - Sistema Completo de Dropshipping

## 📋 Descrição do Projeto

Este projeto é um **sistema completo de dropshipping** para a 67 Beauty Hub, focado em produtos de beleza e conforto. O sistema inclui:

- **Frontend**: 5 páginas de beleza + páginas de conforto com checkout completo
- **Backend**: API Node.js com MongoDB para processamento de pedidos
- **Dashboard**: Sistema de revisão e métricas financeiras em tempo real
- **Integração**: AliExpress e outros fornecedores para processamento automático
- **Pagamentos**: PayPal, PIX e cartão com detecção automática de moeda
- **Sistema de Capital**: Controle total de receita, lucro e margens

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Render
- **Scraping**: Puppeteer
- **Process Management**: PM2
- **Agendamento**: node-cron

## 📁 Estrutura do Projeto

```
├── index.html                 # Página principal
├── Produtos de beleza/        # Catálogo de produtos
│   └── 2 Pack PHOERA Foundation + Combo/
│       └── checkout-phoera.html
├── Aliexpress Scraper/        # Sistema de scraping
│   ├── index.js              # Controlador principal
│   ├── aliexpress_scraper_improved.js  # Scraper principal
│   ├── extractor.js          # Extrator de dados
│   ├── package.json          # Dependências
│   └── ecosystem.config.js   # Configuração PM2
└── github/                   # Configurações do GitHub
```

## 🚀 Deployment no Render

Este projeto está configurado para deploy automático no Render. Veja o guia completo em [RENDER-MIGRATION-GUIDE.md](RENDER-MIGRATION-GUIDE.md).

### URLs de Produção:
- **Site Principal**: `https://beautyhub-site.onrender.com/`
- **Webhook AliExpress**: `https://beautyhub-site.onrender.com/api/aliexpress-callback`
- **Health Check**: `https://beautyhub-site.onrender.com/api/health`

## 🛠️ Instalação e Configuração Local

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- MongoDB Atlas (para banco de dados)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/67-beauty-hub.git
cd 67-beauty-hub
```

2. Instale as dependências:
```bash
cd "Aliexpress Scraper"
npm install
```

3. Configure o PM2:
```bash
pm2 start ecosystem.config.js
```

## 🔧 Configuração do AliExpress Scraper

O sistema de scraping está configurado para:
- Coletar dados de produtos do AliExpress
- Extrair informações como título, preço, loja, imagens
- Salvar dados em formato JSON e CSV
- Executar automaticamente a cada 12 horas

### Configurações Principais

- **URL do Produto**: Configurada em `index.js`
- **Timeout**: 90 segundos para carregamento de páginas
- **Agendamento**: Execução a cada 12 horas via cron
- **Logs**: Gerenciados pelo PM2

## 📊 Funcionalidades

### Sistema de Checkout Completo
- ✅ **5 Páginas de Beleza** com layout lateral correto
- ✅ **Páginas de Conforto** com sistema integrado
- ✅ **Formulários completos** com validação
- ✅ **Sistema de pagamentos** PayPal + PIX + cartão
- ✅ **Detecção automática de moeda** baseada no navegador

### Sistema de Processamento de Pedidos
- ✅ **Captura automática** de dados do checkout
- ✅ **Cálculo automático** de métricas financeiras
- ✅ **Revisão manual** no dashboard
- ✅ **Aprovação seletiva** de pedidos
- ✅ **Integração AliExpress** para processamento

### Dashboard de Capital
- ✅ **Métricas em tempo real** (receita, lucro, margem)
- ✅ **Gráficos interativos** de performance
- ✅ **Sistema de revisão** de pedidos
- ✅ **Acompanhamento de status** automático
- ✅ **Relatórios financeiros** automáticos

### Sistema de Integração
- ✅ **Mapeamento de produtos** para fornecedores
- ✅ **Envio automático** para AliExpress
- ✅ **Atualização de status** em tempo real
- ✅ **Sistema de backup** com localStorage
- ✅ **APIs preparadas** para escalabilidade

## 🚀 Deploy

### GitHub Pages
1. Configure o repositório no GitHub
2. Ative o GitHub Pages nas configurações
3. O site será disponibilizado em: `https://seu-usuario.github.io/67-beauty-hub`

### Deploy Manual
1. Faça upload dos arquivos para seu servidor
2. Configure o PM2 no servidor
3. Configure o domínio e SSL

## 📝 Logs e Monitoramento

- **Logs do PM2**: `pm2 logs aliexpress-scraper`
- **Status**: `pm2 status`
- **Restart**: `pm2 restart aliexpress-scraper`

## 🔒 Segurança

- Headers de segurança configurados
- User-Agent rotativo para evitar bloqueios
- Timeouts configurados para evitar travamentos
- Interceptação de recursos para otimização

## 📚 Documentação Completa

### **Documentos Principais:**
- **[FLUXO_COMPLETO_PROCESSAMENTO_PEDIDOS.md](FLUXO_COMPLETO_PROCESSAMENTO_PEDIDOS.md)** - Documento principal do sistema
- **[SISTEMA_RECEBIMENTO_PEDIDOS.md](SISTEMA_RECEBIMENTO_PEDIDOS.md)** - Sistema de recebimento e revisão
- **[CHECKOUT_DROPSHIPPING_DASHBOARD.md](CHECKOUT_DROPSHIPPING_DASHBOARD.md)** - Função do checkout no dashboard
- **[SISTEMA_MAPEAMENTO_VARIACOES.md](SISTEMA_MAPEAMENTO_VARIACOES.md)** - Sistema de mapeamento de produtos

### **Documentos Técnicos:**
- **[SISTEMAS_DASHBOARD.md](SISTEMAS_DASHBOARD.md)** - Arquitetura do dashboard
- **[SISTEMA_CHECKOUT.md](SISTEMA_CHECKOUT.md)** - Sistema de checkout
- **[SISTEMA_PIX_COMPLETO.md](SISTEMA_PIX_COMPLETO.md)** - Sistema de pagamentos PIX
- **[SISTEMA_TRADUCAO_EXPERIENCIA_USUARIO.md](SISTEMA_TRADUCAO_EXPERIENCIA_USUARIO.md)** - Sistema de tradução

## 🎯 **Status do Sistema (Dezembro 2024)**

### **✅ IMPLEMENTADO E FUNCIONANDO:**
- **5 Páginas de Beleza** com checkout completo
- **Páginas de Conforto** com sistema integrado
- **API Backend** com Node.js e MongoDB
- **Dashboard Completo** com métricas em tempo real
- **Integração AliExpress** para processamento automático
- **Sistema de Pagamentos** PayPal + PIX + cartão
- **Métricas Financeiras** com gráficos interativos

### **🔄 FLUXO COMPLETO:**
1. **Cliente** → Checkout nas páginas de produto
2. **Sistema** → Coleta dados e calcula métricas
3. **Dashboard** → Recebe pedido para revisão
4. **Aprovação** → Pedido aprovado para processamento
5. **Fornecedor** → Dados enviados para AliExpress
6. **Acompanhamento** → Status atualizado automaticamente
7. **Métricas** → Gráficos atualizados em tempo real

## 📞 Suporte

Para suporte ou dúvidas sobre o projeto, entre em contato através dos issues do GitHub.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Sistema 100% funcional e documentado!** ✅

**Desenvolvido com ❤️ para a 67 Beauty Hub**
