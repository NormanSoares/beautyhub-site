# Solução para o Erro "Failed to load resource: net::ERR_FILE_NOT_FOUND"

## 🔍 **Diagnóstico do Problema**

O erro `net::ERR_FILE_NOT_FOUND` geralmente ocorre quando você abre o arquivo HTML diretamente no navegador (protocolo `file://`) em vez de usar um servidor local.

## ✅ **Soluções Recomendadas**

### **Opção 1: Usar Live Server (VS Code)**
1. Instale a extensão "Live Server" no VS Code
2. Clique com o botão direito no arquivo `index.html`
3. Selecione "Open with Live Server"
4. O site será aberto em `http://localhost:5500`

### **Opção 2: Usar Python (se instalado)**
```bash
# No diretório do projeto
python -m http.server 8000
```
Depois acesse: `http://localhost:8000`

### **Opção 3: Usar Node.js (se instalado)**
```bash
# Instalar servidor globalmente
npm install -g http-server

# No diretório do projeto
http-server
```

### **Opção 4: Usar PHP (se instalado)**
```bash
# No diretório do projeto
php -S localhost:8000
```

## 🚨 **Por que isso acontece?**

- **Protocolo file://**: O navegador tem restrições de segurança para arquivos locais
- **CORS**: Políticas de segurança impedem carregamento de recursos
- **Caminhos relativos**: Podem não funcionar corretamente com file://

## 🔧 **Verificações Adicionais**

1. **Verifique se todos os arquivos existem:**
   - ✅ `styles.css` - Existe
   - ✅ `script.js` - Existe  
   - ✅ `background-video.mp4` - Existe
   - ✅ `Logo.png` - Existe
   - ✅ Todas as imagens dos produtos - Existem

2. **Verifique o console do navegador:**
   - Pressione F12
   - Vá para a aba "Console"
   - Procure por erros específicos

3. **Teste com arquivo simples:**
   - Use o arquivo `test-resources.html` criado
   - Abra com Live Server para testar

## 📝 **Arquivo de Teste Criado**

Foi criado o arquivo `test-resources.html` para testar se os recursos estão carregando corretamente.

## 🎯 **Recomendação Final**

**Use sempre um servidor local** para desenvolvimento web. O protocolo `file://` não é adequado para sites com recursos externos, JavaScript complexo ou funcionalidades de carrinho.

