# Sistema de Reviews com Upload de Imagens - 67 Beauty Hub

## 📋 Visão Geral

O sistema de reviews permite que usuários logados avaliem produtos com estrelas, comentários e upload de imagens. Apenas usuários autenticados podem fazer reviews.

## 🔐 Autenticação Necessária

- **Login Obrigatório**: Apenas usuários logados podem fazer reviews
- **Verificação Automática**: O sistema verifica se o usuário está logado antes de permitir avaliações
- **Prompt de Login**: Se não estiver logado, o usuário é direcionado para fazer login

## ⭐ Funcionalidades

### 1. **Avaliação por Estrelas**
- Sistema de 1 a 5 estrelas
- Interface visual intuitiva
- Seleção obrigatória da avaliação

### 2. **Comentários Detalhados**
- Título da avaliação (obrigatório)
- Comentário detalhado (obrigatório)
- Validação de tamanho mínimo e máximo

### 3. **Upload de Imagens**
- Upload opcional de fotos do produto
- Formatos aceitos: JPG, PNG, GIF
- Tamanho máximo: 5MB
- Preview da imagem antes do envio

### 4. **Exibição de Reviews**
- Lista todas as avaliações do produto
- Mostra foto do usuário (avatar)
- Exibe estrelas, comentário e data
- Design responsivo e atrativo

## 📁 Arquivos Criados

### **JavaScript**
- `js/review-system.js` - Sistema principal de reviews

### **PHP**
- `php/process-review.php` - Processamento de reviews e upload

### **Páginas Atualizadas**
- Todas as páginas de checkout agora incluem o sistema de reviews

## 🚀 Como Usar

### **Para Usuários:**

1. **Fazer Login**
   - Clique em "Entrar" no menu superior
   - Complete o processo de login

2. **Fazer uma Review**
   - Vá para qualquer página de checkout de produto
   - Role até a seção "Avaliações dos Clientes"
   - Clique em "Escrever Avaliação"
   - Preencha o formulário:
     - Selecione as estrelas (1-5)
     - Digite um título
     - Escreva seu comentário
     - (Opcional) Faça upload de uma foto
   - Clique em "Enviar Avaliação"

3. **Ver Reviews**
   - As reviews aparecem automaticamente na seção
   - Filtradas por produto
   - Ordenadas por data (mais recentes primeiro)

### **Para Desenvolvedores:**

1. **Adicionar a Páginas Novas**
   ```html
   <!-- Incluir o script -->
   <script src="js/review-system.js"></script>
   
   <!-- Adicionar seção de reviews -->
   <div id="reviewSection">
       <script>
           document.addEventListener('DOMContentLoaded', function() {
               if (typeof reviewSystem !== 'undefined') {
                   const reviewSection = reviewSystem.createReviewSection('product-id', 'Product Name');
                   document.body.insertAdjacentHTML('beforeend', reviewSection);
                   reviewSystem.loadExistingReviews();
               }
           });
       </script>
   </div>
   ```

2. **Configurar Produto**
   - Substitua `'product-id'` pelo ID único do produto
   - Substitua `'Product Name'` pelo nome do produto

## 🔧 Configurações

### **Validações**
- **Rating**: Obrigatório, entre 1-5 estrelas
- **Título**: 3-100 caracteres
- **Comentário**: 10-500 caracteres
- **Imagem**: Opcional, máx 5MB, formatos JPG/PNG/GIF

### **Armazenamento**
- **LocalStorage**: Para simulação (desenvolvimento)
- **JSON File**: Para persistência (produção)
- **Upload Directory**: `uploads/reviews/`

### **Segurança**
- Verificação de tipo de arquivo
- Validação de tamanho de imagem
- Sanitização de dados
- Verificação de login

## 📱 Interface

### **Modal de Review**
- Design moderno e responsivo
- Formulário intuitivo
- Preview de imagem
- Validação em tempo real

### **Exibição de Reviews**
- Cards elegantes
- Avatar do usuário
- Estrelas coloridas
- Data formatada
- Imagens dos produtos

### **Responsividade**
- Funciona em desktop e mobile
- Layout adaptativo
- Touch-friendly

## 🎨 Estilos CSS

O sistema inclui estilos CSS completos:
- Modal responsivo
- Sistema de estrelas interativo
- Upload de imagem estilizado
- Cards de review atrativos
- Animações suaves

## 🔄 Fluxo de Funcionamento

1. **Usuário clica em "Escrever Avaliação"**
2. **Sistema verifica se está logado**
3. **Se não estiver, mostra prompt de login**
4. **Se estiver logado, abre modal de review**
5. **Usuário preenche formulário**
6. **Sistema valida dados**
7. **Processa upload de imagem (se houver)**
8. **Salva review no sistema**
9. **Atualiza exibição de reviews**
10. **Mostra mensagem de sucesso**

## 📊 Dados Armazenados

Cada review contém:
```json
{
  "id": "REVIEW_20241201120000_1234",
  "productId": "phoera-foundation",
  "productName": "2 Pack PHOERA Foundation + Combo",
  "userId": "user@email.com",
  "userName": "Nome do Usuário",
  "rating": 5,
  "title": "Produto excelente!",
  "comment": "Muito satisfeita com a compra...",
  "imagePath": "REVIEW_20241201120000_1234.jpg",
  "created_at": "2024-12-01T12:00:00.000Z",
  "status": "approved",
  "ip": "192.168.1.1"
}
```

## 🚨 Notas Importantes

1. **Login Obrigatório**: Apenas usuários logados podem fazer reviews
2. **Validação Rigorosa**: Todos os campos são validados
3. **Upload Seguro**: Imagens são validadas e processadas com segurança
4. **Responsivo**: Funciona em todos os dispositivos
5. **Performance**: Sistema otimizado para carregamento rápido

## 🔮 Próximas Melhorias

- Sistema de moderacao de reviews
- Filtros por rating
- Ordenação por relevância
- Sistema de "útil/não útil"
- Respostas da loja às reviews
- Integração com sistema de email
- Analytics de reviews

---

**Sistema desenvolvido para 67 Beauty Hub** 🎨✨









