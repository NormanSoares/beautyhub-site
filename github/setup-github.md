# Configuração do Repositório GitHub

## Passos para Configurar o Repositório

### 1. Instalar Git (se não estiver instalado)
- Baixe o Git em: https://git-scm.com/download/win
- Instale com as configurações padrão

### 2. Configurar Git
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 3. Inicializar o Repositório
```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit: 67 Beauty Hub project"
```

### 4. Criar Repositório no GitHub
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `67-beauty-hub`
4. Descrição: "Site editável para 67 Beauty Hub com sistema de scraping"
5. Marque como "Public" ou "Private"
6. **NÃO** marque "Initialize with README" (já temos um)
7. Clique em "Create repository"

### 5. Conectar Repositório Local ao GitHub
```bash
git remote add origin https://github.com/SEU-USUARIO/67-beauty-hub.git
git branch -M main
git push -u origin main
```

### 6. Configurar GitHub Pages
1. Vá para Settings do repositório
2. Role até "Pages" no menu lateral
3. Em "Source", selecione "GitHub Actions"
4. O workflow já está configurado em `.github/workflows/pages.yml`

### 7. Configurar Secrets (se necessário)
Se precisar de variáveis de ambiente:
1. Vá para Settings > Secrets and variables > Actions
2. Adicione secrets necessários

## Estrutura de Arquivos Criados

```
├── README.md                    # Documentação principal
├── .gitignore                   # Arquivos a serem ignorados
├── LICENSE                      # Licença MIT
├── github/
│   ├── .github/
│   │   └── workflows/
│   │       ├── deploy.yml       # Deploy automático
│   │       └── pages.yml        # GitHub Pages
│   └── CONTRIBUTING.md          # Guia de contribuição
└── setup-github.md             # Este arquivo
```

## Comandos Úteis

### Git Básico
```bash
# Ver status
git status

# Adicionar arquivos
git add .
git add arquivo-especifico.js

# Commit
git commit -m "Mensagem descritiva"

# Push
git push origin main

# Pull
git pull origin main
```

### PM2 (para o scraper)
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs aliexpress-scraper

# Restart
pm2 restart aliexpress-scraper

# Stop
pm2 stop aliexpress-scraper
```

## Deploy Automático

O projeto está configurado para deploy automático:
- **GitHub Pages**: Site estático
- **GitHub Actions**: CI/CD automático
- **PM2**: Gerenciamento de processos do scraper

## URLs do Projeto

Após o deploy:
- **Site**: https://SEU-USUARIO.github.io/67-beauty-hub
- **Repositório**: https://github.com/SEU-USUARIO/67-beauty-hub

## Próximos Passos

1. ✅ Configurar repositório GitHub
2. ✅ Configurar GitHub Pages
3. ✅ Configurar CI/CD
4. 🔄 Fazer primeiro push
5. 🔄 Testar deploy
6. 🔄 Configurar domínio personalizado (opcional)

## Suporte

Para dúvidas sobre a configuração:
- Consulte a documentação do GitHub
- Abra uma issue no repositório
- Entre em contato com os mantenedores
