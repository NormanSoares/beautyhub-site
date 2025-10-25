# Verificação da Estrutura do Fornecedor - Produtos de Conforto

## 🎯 **Objetivo**
Verificar a estrutura real dos produtos no AliExpress para corrigir o mapeamento de variações.

## 📋 **Links dos Fornecedores**

### 1. Detachable Sofa Cover Bean Bag Cover
**Link:** https://pt.aliexpress.com/item/1005009428867608.html
**ID do Produto:** `1005009428867608`

### 2. Human Dog Bed
**Link:** https://pt.aliexpress.com/item/1005009545669602.html
**ID do Produto:** `1005009545669602`

### 3. SNOOZE BUNDLE
**Link:** https://pt.aliexpress.com/item/1005006357291776.html
**ID do Produto:** `1005006357291776`

---

## 🔍 **Checklist de Verificação**

### **Para cada produto, verificar:**

#### **A) Variações Disponíveis**
- [ ] **Cores:** Quais cores estão disponíveis?
- [ ] **Tamanhos:** Quais tamanhos estão disponíveis?
- [ ] **Tipos:** Existem diferentes tipos/variantes?
- [ ] **Materiais:** Diferentes materiais disponíveis?

#### **B) Sistema de Quantidade**
- [ ] **Quantidade mínima:** Qual é o mínimo?
- [ ] **Quantidade máxima:** Qual é o máximo?
- [ ] **Incrementos:** Como funciona (1, 2, 5, 10)?

#### **C) Preços e Ofertas**
- [ ] **Preço base:** Qual é o preço atual?
- [ ] **Descontos:** Existem descontos por quantidade?
- [ ] **Ofertas combo:** Existem ofertas especiais?

#### **D) Informações Técnicas**
- [ ] **SKU do fornecedor:** Qual é o SKU real?
- [ ] **Título exato:** Como está escrito o título?
- [ ] **Descrição:** Principais características

---

## 📝 **Formulário de Verificação**

### **Detachable Sofa Cover Bean Bag Cover**
```
ID: 1005009428867608
Título: ________________________________
Preço: ________________________________
Cores disponíveis: ____________________
Tamanhos disponíveis: _________________
Quantidade mínima: ___________________
Quantidade máxima: ___________________
SKU do fornecedor: ___________________
Observações: _________________________
```

### **Human Dog Bed**
```
ID: 1005009545669602
Título: ________________________________
Preço: ________________________________
Cores disponíveis: ____________________
Tamanhos disponíveis: _________________
Quantidade mínima: ___________________
Quantidade máxima: ___________________
SKU do fornecedor: ___________________
Observações: _________________________
```

### **SNOOZE BUNDLE**
```
ID: 1005006357291776
Título: ________________________________
Preço: ________________________________
Cores disponíveis: ____________________
Tamanhos disponíveis: _________________
Quantidade mínima: ___________________
Quantidade máxima: ___________________
SKU do fornecedor: ___________________
Observações: _________________________
```

---

## 🔧 **Próximos Passos**

1. **Acessar as páginas** dos fornecedores
2. **Preencher o formulário** com as informações reais
3. **Comparar** com o mapeamento atual
4. **Corrigir** o sistema de mapeamento
5. **Testar** as correções

---

## 📊 **Mapeamento Atual (Para Comparação)**

### **Detachable Sofa Cover**
```javascript
'detachable_sofa_cover': {
    name: 'Detachable Sofa Cover Bean Bag Cover',
    supplierId: 'aliexpress_detachable_sofa_cover_001', // ❌ INCORRETO
    basePrice: 34.99, // ❌ VERIFICAR
    variations: {
        type: 'size',
        options: ['S', 'M', 'L', 'XL'] // ❌ VERIFICAR
    },
    quantity: { min: 1, max: 5 } // ❌ VERIFICAR
}
```

### **Human Dog Bed**
```javascript
'human_dog_bed': {
    name: 'Human Dog Bed',
    supplierId: 'aliexpress_human_dog_bed_001', // ❌ INCORRETO
    basePrice: 79.99, // ❌ VERIFICAR
    variations: null, // ❌ VERIFICAR
    quantity: { min: 1, max: 2 } // ❌ VERIFICAR
}
```

### **SNOOZE BUNDLE**
```javascript
'snooze_bundle': {
    name: 'SNOOZE BUNDLE',
    supplierId: 'aliexpress_100500321654987', // ❌ INCORRETO
    basePrice: 149.99, // ❌ VERIFICAR
    variations: null, // ❌ VERIFICAR
    quantity: { min: 1, max: 3 } // ❌ VERIFICAR
}
```

---

**Data de Criação:** $(date)
**Status:** 🔄 Aguardando Verificação



