# Estrutura dos Produtos de Conforto - 67 Beauty Hub

## Visão Geral
Este documento detalha a estrutura dos produtos de conforto que ainda não foram integrados com o sistema de mapeamento de variações.

## Produtos Identificados

### 1. Human Dog Bed
**Arquivo:** `Produtos de conforto/Human Dog bad/checkout-human-dog-bed.html`

#### Estrutura do Produto:
- **Nome:** Human Dog Bed
- **Preço:** $79.99 (desconto de 38% de $129.99)
- **Sistema de Variações:** ❌ Nenhuma variação
- **Sistema de Quantidade:** ✅ Sim (1-2 unidades)
- **Sistema de Ofertas Combo:** ❌ Não

#### Características Técnicas:
```javascript
// Estrutura do pedido
const orderData = {
    id: 'ORDER_' + Date.now(),
    product: {
        name: 'Human Dog Bed',
        price: 79.99,
        quantity: quantity, // 1-2
        // Sem variações
    },
    customer: { /* dados do cliente */ },
    total: (79.99 * quantity).toFixed(2),
    status: 'pending'
};
```

#### Mapeamento Necessário:
- **Product ID:** `human_dog_bed`
- **Variações:** Nenhuma
- **SKU Base:** `HDB-001`
- **Quantidade:** 1-2 unidades

---

### 2. Detachable Sofa Cover Bean Bag Cover
**Arquivo:** `Produtos de conforto/Detachable Sofa Cover Bean Bag Cover Lazy Person's Couch/checkout-sofa-cover.html`

#### Estrutura do Produto:
- **Nome:** Detachable Sofa Cover Bean Bag Cover
- **Preço:** $34.99 (desconto de 42% de $59.99)
- **Sistema de Variações:** ✅ Tamanhos (S, M, L, XL)
- **Sistema de Quantidade:** ✅ Sim (1-5 unidades)
- **Sistema de Ofertas Combo:** ❌ Não

#### Características Técnicas:
```javascript
// Estrutura do pedido
const orderData = {
    id: 'ORDER_' + Date.now(),
    product: {
        name: 'Detachable Sofa Cover (Tamanho ' + selectedSizeValue + ')',
        price: 34.99,
        quantity: quantity, // 1-5
        size: selectedSizeValue // S, M, L, XL
    },
    customer: { /* dados do cliente */ },
    total: (34.99 * quantity).toFixed(2),
    status: 'pending'
};
```

#### Mapeamento Necessário:
- **Product ID:** `detachable_sofa_cover`
- **Variações:** Tamanho (S, M, L, XL)
- **SKU Base:** `DSC-001`
- **Quantidade:** 1-5 unidades

---

## Estrutura de Variações por Produto

### Human Dog Bed
```javascript
const variations = {
    type: null, // Sem variações
    options: []
};
```

### Detachable Sofa Cover
```javascript
const variations = {
    type: 'size',
    options: [
        { value: 'S', displayName: 'Pequeno', sku: 'DSC-001-S' },
        { value: 'M', displayName: 'Médio', sku: 'DSC-001-M' },
        { value: 'L', displayName: 'Grande', sku: 'DSC-001-L' },
        { value: 'XL', displayName: 'Extra Grande', sku: 'DSC-001-XL' }
    ]
};
```

## Sistema de Salvamento Atual

### Human Dog Bed
```javascript
// Salva em duas localizações
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
orders.push(orderData);
localStorage.setItem('orders', JSON.stringify(orders));

let dashboardData = JSON.parse(localStorage.getItem('dashboardData') || '{}');
if (!dashboardData.orders) dashboardData.orders = [];
dashboardData.orders.push(orderData);
localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
```

### Detachable Sofa Cover
```javascript
// Salva em duas localizações
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
orders.push(orderData);
localStorage.setItem('orders', JSON.stringify(orders));

let dashboardData = JSON.parse(localStorage.getItem('dashboardData') || '{}');
if (!dashboardData.orders) dashboardData.orders = [];
dashboardData.orders.push(orderData);
localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
```

## Integração com Sistema de Mapeamento

### Estrutura de Mapeamento Necessária:

#### Human Dog Bed
```javascript
const mappingData = {
    productId: 'human_dog_bed',
    name: 'Human Dog Bed',
    variation: null, // Sem variações
    quantity: quantity,
    unitPrice: 79.99,
    totalPrice: 79.99 * quantity
};
```

#### Detachable Sofa Cover
```javascript
const mappingData = {
    productId: 'detachable_sofa_cover',
    name: 'Detachable Sofa Cover',
    variation: {
        type: 'size',
        value: selectedSizeValue, // S, M, L, XL
        displayName: selectedSizeValue
    },
    quantity: quantity,
    unitPrice: 34.99,
    totalPrice: 34.99 * quantity
};
```

### 3. Memory Foam Neck Pillow
**Arquivo:** `Produtos de conforto/Memory Foam Neck Pillow Cervical Vertebra Travel Portable Noon Break Aircraft U Type Of Pillow Sleep Camping Pillow Carry Bag/checkout-memory-foam-pillow.html`

#### Estrutura do Produto:
- **Nome:** Memory Foam Neck Pillow
- **Preço:** $42.70 (desconto de 47% de $80.57)
- **Sistema de Variações:** ✅ Cores (Brown, Black, Gray, White)
- **Sistema de Quantidade:** ✅ Sim (1-3 unidades)
- **Sistema de Ofertas Combo:** ❌ Não

#### Características Técnicas:
```javascript
// Estrutura do pedido
const orderData = {
    id: 'ORDER_' + Date.now(),
    product: {
        name: 'Memory Foam Neck Pillow (' + selectedColor + ')',
        price: 42.70,
        quantity: quantity, // 1-3
        color: selectedColor
    },
    customer: { /* dados do cliente */ },
    total: (42.70 * quantity).toFixed(2),
    status: 'pending'
};
```

#### Mapeamento Necessário:
- **Product ID:** `memory_foam_neck_pillow`
- **Variações:** Cor (Brown, Black, Gray, White)
- **SKU Base:** `MFP-001`
- **Quantidade:** 1-3 unidades

---

## Próximos Passos

1. ✅ **Documentação Completa** - Estrutura identificada e documentada
2. ✅ **Integração do Sistema de Mapeamento** - Script de mapeamento adicionado
3. ✅ **Atualização das Funções de Checkout** - Função `processOrder` implementada
4. ✅ **Teste de Integração** - Funcionamento completo verificado

## Observações Técnicas

- Ambos os produtos já salvam em `localStorage.dashboardData.orders`
- Human Dog Bed não possui variações, apenas quantidade
- Detachable Sofa Cover possui variação de tamanho + quantidade
- Ambos precisam do script `product-variation-mapping.js`
- Estrutura de dados compatível com sistema existente

## Status de Integração

| Produto | Script Mapeamento | Função processOrder | Teste | Status |
|---------|------------------|-------------------|-------|--------|
| Human Dog Bed | ✅ | ✅ | ✅ | Completo |
| Detachable Sofa Cover | ✅ | ✅ | ✅ | Completo |
| Memory Foam Neck Pillow | ✅ | ✅ | ✅ | Completo |

---

**Data de Criação:** $(date)
**Última Atualização:** $(date)
**Versão:** 1.0

