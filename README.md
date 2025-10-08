# 67 Beauty Hub - Site Editável com Beleza e Conforto

## 📋 Descrição do Projeto

Este projeto é um site editável para a 67 Beauty Hub, focado em produtos de beleza e conforto. O site inclui:

- **Frontend**: Interface moderna e responsiva
- **Sistema de Produtos**: Catálogo de produtos de beleza
- **AliExpress Scraper**: Sistema automatizado para coleta de dados de produtos
- **Checkout**: Sistema de finalização de compras

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js
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

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- PM2 (para gerenciamento de processos)

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

### Sistema de Scraping
- ✅ Navegação automatizada com Puppeteer
- ✅ Extração de dados de múltiplas fontes
- ✅ Fallback para elementos HTML
- ✅ Sanitização robusta de JSON
- ✅ Agendamento automático

### Sistema de Produtos
- ✅ Catálogo de produtos de beleza
- ✅ Páginas de checkout
- ✅ Interface responsiva

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

## 📞 Suporte

Para suporte ou dúvidas sobre o projeto, entre em contato através dos issues do GitHub.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para a 67 Beauty Hub**
