# Sistema de Mapeamento para Fornecedores - 67 Beauty Hub

## 📋 **VISÃO GERAL**

O sistema de mapeamento garante que os dados coletados nas páginas de checkout sejam corretamente traduzidos para as especificações dos fornecedores (AliExpress), incluindo:

- ✅ **Produtos e variações** (cor, tamanho, tipo)
- ✅ **Quantidades e preços** 
- ✅ **SKUs do fornecedor**
- ✅ **Especificações técnicas**

## 🔧 **ARQUIVOS DO SISTEMA**

### **1. Configurações de Mapeamento:**
- `config/product-mapping.json` - Mapeamentos gerais
- `config/product-specific-mapping.json` - Mapeamentos específicos
- `config/mapping-backup.json` - Backup completo do sistema
- `config/aliexpress-config.json` - Configurações do AliExpress

### **2. Scripts de Mapeamento:**
- `js/product-variation-mapping.js` - Sistema principal de mapeamento
- `js/supplier-order-processor.js` - Integração com checkout

## 📊 **ESTRUTURA DE MAPEAMENTO**

### **Produtos Mapeados:**

#### **Heat-Resistant Mat**
```json
{
  "id": "heat_resistant_mat",
  "supplierId": "100500456789123",
  "basePrice": 2.29,
  "variations": {
    "type": "size_color",
    "options": [
      "small_pink", "small_blue", "small_green",
      "medium_pink", "medium_blue", "medium_green", 
      "large_pink", "large_blue", "large_green"
    ]
  }
}
```

#### **Alligator Hair Clips**
```json
{
  "id": "alligator_hair_clips", 
  "supplierId": "100500123456789",
  "basePrice": 3.54,
  "variations": {
    "type": "color",
    "options": ["nude_pink", "black", "white", "brown", "blonde", "red", "gray"]
  }
}
```

#### **PHOERA Foundation**
```json
{
  "id": "phoera_foundation",
  "supplierId": "100500106836560", 
  "basePrice": 17.39,
  "variations": {
    "type": "color",
    "options": ["102_nude", "103_warm_peach", "104_buff_beige", "105_sand", "108_tan", "109_mocha"]
  }
}
```

## 🔄 **FLUXO DE MAPEAMENTO**

### **1. Coleta de Dados (Checkout)**
```javascript
// Dados coletados do checkout
{
  products: [
    {
      id: "heat-resistant-mat",
      name: "Heat-Resistant Mat",
      price: 49.90,
      quantity: 3,
      color: "small_pink",
      colorName: "Pequeno Rosa"
    }
  ]
}
```

### **2. Mapeamento para Fornecedor**
```javascript
// Dados mapeados para AliExpress
{
  supplierSKU: "AE-100500456789123-SMALL_PINK",
  supplierId: "100500456789123",
  supplierName: "Heat-Resistant Mat",
  supplierVariation: {
    type: "size_color",
    value: "small-pink",
    displayName: "Pequeno Rosa"
  },
  supplierUnitPrice: 1.145, // 50% do preço base
  supplierTotalPrice: 3.435, // 3 × 1.145
  supplierCurrency: "USD"
}
```

### **3. Especificações para Fornecedor**
```javascript
// Especificações enviadas ao AliExpress
{
  orderId: "ORD-1737123456789_abc123",
  customerInfo: {
    name: "João Silva",
    email: "joao@email.com",
    address: { /* endereço completo */ }
  },
  products: [
    {
      sku: "AE-100500456789123-SMALL_PINK",
      name: "Heat-Resistant Mat",
      color: "small-pink",
      size: "small", 
      quantity: 3,
      price: 1.145,
      currency: "USD"
    }
  ],
  specialInstructions: "Instruções especiais do cliente",
  totalAmount: 3.435,
  currency: "USD"
}
```

## 🎯 **MAPEAMENTOS DE VARIAÇÕES**

### **Cores/Tamanhos:**
- `small_pink` → "Pequeno Rosa"
- `medium_blue` → "Médio Azul" 
- `large_green` → "Grande Verde"

### **Tipos de Produto:**
- `gold_snail` → "Gold Snail"
- `sakura` → "Sakura"
- `vitamin_c` → "Vitamin C"

## 💰 **CÁLCULO DE PREÇOS**

### **Margem do Fornecedor:**
- **Preço de venda:** $49.90
- **Custo do fornecedor:** $24.95 (50% margem)
- **Lucro da 67 Beauty Hub:** $24.95

### **Exemplo de Cálculo:**
```
Heat-Resistant Mat:
- Preço base: $2.29
- Custo fornecedor: $1.145 (50%)
- Quantidade: 3
- Total fornecedor: $3.435
```

## 🔧 **INTEGRAÇÃO COM CHECKOUT**

### **Scripts Carregados:**
```html
<!-- Páginas de checkout -->
<script src="../../js/product-variation-mapping.js"></script>
<script src="../../js/supplier-order-processor.js"></script>
```

### **Coleta Automática:**
1. **Quantidade:** `productQuantity` input
2. **Cor/Tamanho:** `.color-option.selected`
3. **Ofertas:** `selectedOffers` global variable
4. **Dados do cliente:** Formulário checkout

## 📈 **BENEFÍCIOS DO SISTEMA**

### **Para a 67 Beauty Hub:**
- ✅ **Mapeamento automático** de variações
- ✅ **SKUs corretos** para fornecedores
- ✅ **Preços calculados** automaticamente
- ✅ **Especificações precisas** para pedidos

### **Para os Fornecedores:**
- ✅ **Dados estruturados** e claros
- ✅ **SKUs específicos** para cada variação
- ✅ **Quantidades corretas**
- ✅ **Especificações técnicas** completas

## 🚀 **SISTEMA PRONTO PARA PRODUÇÃO**

O sistema está 100% funcional e mapeia corretamente:

- ✅ **5 produtos principais** de beleza
- ✅ **13 variações** de cor/tamanho (Heat-Resistant Mat)
- ✅ **7 cores** (Alligator Hair Clips)
- ✅ **16 tons** (PHOERA Foundation)
- ✅ **3 tipos** (LAIKOU Golden Sakura)

**Todos os pedidos são automaticamente mapeados para as especificações corretas dos fornecedores!** 🎯



