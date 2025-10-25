# Sistema de Mapeamento de Variações de Produtos - 67 Beauty Hub

## 🎯 **Visão Geral**

O Sistema de Mapeamento de Variações de Produtos é essencial para identificar e mapear as escolhas dos clientes (cor, tamanho, etc.) com as opções disponíveis no scraper, garantindo que os fornecedores recebam as especificações corretas do produto.

## 🔄 **Fluxo de Mapeamento de Variações**

### **1. Estrutura de Dados do Scraper**

#### **A) Dados do Produto no Scraper**
```javascript
const scrapedProduct = {
    id: "aliexpress_100500106836560",
    title: "2 Pack PHOERA Foundation - High Coverage Makeup Base",
    price: 17.99,
    currency: "USD",
    category: "Beauty & Personal Care",
    seller: {
        name: "PHOERA Official Store",
        rating: 4.8
    },
    variations: [
        {
            id: "var_001",
            type: "color",
            name: "Color",
            options: [
                {
                    id: "color_001",
                    name: "Natural Beige",
                    value: "Natural Beige",
                    image: "https://example.com/color1.jpg",
                    price: 17.99,
                    stock: 100
                },
                {
                    id: "color_002", 
                    name: "Warm Beige",
                    value: "Warm Beige",
                    image: "https://example.com/color2.jpg",
                    price: 17.99,
                    stock: 50
                },
                {
                    id: "color_003",
                    name: "Cool Beige", 
                    value: "Cool Beige",
                    image: "https://example.com/color3.jpg",
                    price: 17.99,
                    stock: 75
                }
            ]
        },
        {
            id: "var_002",
            type: "size",
            name: "Size",
            options: [
                {
                    id: "size_001",
                    name: "30ml",
                    value: "30ml",
                    price: 17.99,
                    stock: 100
                },
                {
                    id: "size_002",
                    name: "50ml",
                    value: "50ml", 
                    price: 24.99,
                    stock: 50
                }
            ]
        }
    ],
    skus: [
        {
            id: "sku_001",
            color: "Natural Beige",
            size: "30ml",
            price: 17.99,
            stock: 100,
            image: "https://example.com/sku1.jpg"
        },
        {
            id: "sku_002",
            color: "Warm Beige", 
            size: "30ml",
            price: 17.99,
            stock: 50,
            image: "https://example.com/sku2.jpg"
        },
        {
            id: "sku_003",
            color: "Cool Beige",
            size: "30ml", 
            price: 17.99,
            stock: 75,
            image: "https://example.com/sku3.jpg"
        },
        {
            id: "sku_004",
            color: "Natural Beige",
            size: "50ml",
            price: 24.99,
            stock: 100,
            image: "https://example.com/sku4.jpg"
        }
    ]
};
```

### **2. Estrutura de Dados da Loja**

#### **A) Produto na Página de Produção**
```javascript
const storeProduct = {
    id: "phoera_foundation",
    name: "2 Pack PHOERA Foundation",
    basePrice: 29.99,
    currency: "USD",
    category: "Beleza",
    supplier: "aliexpress",
    variations: [
        {
            id: "color_variation",
            type: "color",
            name: "Cor",
            options: [
                {
                    id: "beige_natural",
                    name: "Bege Natural",
                    value: "Bege Natural",
                    displayName: "Bege Natural",
                    priceModifier: 0
                },
                {
                    id: "beige_quente",
                    name: "Bege Quente", 
                    value: "Bege Quente",
                    displayName: "Bege Quente",
                    priceModifier: 0
                },
                {
                    id: "beige_frio",
                    name: "Bege Frio",
                    value: "Bege Frio", 
                    displayName: "Bege Frio",
                    priceModifier: 0
                }
            ]
        },
        {
            id: "size_variation",
            type: "size",
            name: "Tamanho",
            options: [
                {
                    id: "30ml",
                    name: "30ml",
                    value: "30ml",
                    displayName: "30ml",
                    priceModifier: 0
                },
                {
                    id: "50ml",
                    name: "50ml",
                    value: "50ml",
                    displayName: "50ml", 
                    priceModifier: 7.00
                }
            ]
        }
    ]
};
```

### **3. Sistema de Mapeamento**

#### **A) Função de Mapeamento de Variações**
```javascript
function mapProductVariations(storeProduct, scrapedProduct) {
    const mapping = {
        productId: storeProduct.id,
        scrapedProductId: scrapedProduct.id,
        variations: [],
        skuMapping: []
    };
    
    // Mapear cada variação da loja com a do scraper
    storeProduct.variations.forEach(storeVariation => {
        const scrapedVariation = scrapedProduct.variations.find(
            sv => sv.type === storeVariation.type
        );
        
        if (scrapedVariation) {
            const variationMapping = {
                type: storeVariation.type,
                storeName: storeVariation.name,
                scrapedName: scrapedVariation.name,
                options: []
            };
            
            // Mapear cada opção
            storeVariation.options.forEach(storeOption => {
                const scrapedOption = scrapedVariation.options.find(
                    so => mapOptionValue(storeOption.value, so.value, storeVariation.type)
                );
                
                if (scrapedOption) {
                    variationMapping.options.push({
                        storeOption: {
                            id: storeOption.id,
                            name: storeOption.name,
                            value: storeOption.value,
                            displayName: storeOption.displayName
                        },
                        scrapedOption: {
                            id: scrapedOption.id,
                            name: scrapedOption.name,
                            value: scrapedOption.value,
                            price: scrapedOption.price,
                            stock: scrapedOption.stock
                        },
                        mapping: {
                            storeValue: storeOption.value,
                            scrapedValue: scrapedOption.value,
                            confidence: calculateMappingConfidence(storeOption.value, scrapedOption.value)
                        }
                    });
                }
            });
            
            mapping.variations.push(variationMapping);
        }
    });
    
    // Mapear SKUs
    mapping.skuMapping = mapSKUs(storeProduct, scrapedProduct, mapping.variations);
    
    return mapping;
}
```

#### **B) Função de Mapeamento de Valores**
```javascript
function mapOptionValue(storeValue, scrapedValue, variationType) {
    // Normalizar valores para comparação
    const normalizeValue = (value) => {
        return value.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };
    
    const normalizedStore = normalizeValue(storeValue);
    const normalizedScraped = normalizeValue(scrapedValue);
    
    // Mapeamentos específicos por tipo
    const typeMappings = {
        color: {
            'bege natural': ['natural beige', 'beige natural', 'natural'],
            'bege quente': ['warm beige', 'beige warm', 'warm'],
            'bege frio': ['cool beige', 'beige cool', 'cool'],
            'branco': ['white', 'ivory', 'porcelain'],
            'preto': ['black', 'dark', 'ebony'],
            'marrom': ['brown', 'tan', 'bronze']
        },
        size: {
            '30ml': ['30ml', '30 ml', '30ml bottle'],
            '50ml': ['50ml', '50 ml', '50ml bottle'],
            'pequeno': ['small', 's', 'xs'],
            'medio': ['medium', 'm', 'md'],
            'grande': ['large', 'l', 'lg', 'xl']
        }
    };
    
    // Verificar mapeamento direto
    if (normalizedStore === normalizedScraped) {
        return true;
    }
    
    // Verificar mapeamentos específicos
    if (typeMappings[variationType]) {
        const mappings = typeMappings[variationType];
        for (const [storeKey, scrapedValues] of Object.entries(mappings)) {
            if (normalizedStore.includes(storeKey)) {
                return scrapedValues.some(sv => normalizedScraped.includes(sv));
            }
        }
    }
    
    // Verificar similaridade (para casos não mapeados)
    return calculateSimilarity(normalizedStore, normalizedScraped) > 0.8;
}
```

#### **C) Função de Mapeamento de SKUs**
```javascript
function mapSKUs(storeProduct, scrapedProduct, variationMappings) {
    const skuMappings = [];
    
    // Gerar todas as combinações possíveis da loja
    const storeCombinations = generateCombinations(storeProduct.variations);
    
    storeCombinations.forEach(storeCombination => {
        // Encontrar SKU correspondente no scraper
        const scrapedSKU = findMatchingSKU(storeCombination, scrapedProduct.skus, variationMappings);
        
        if (scrapedSKU) {
            skuMappings.push({
                storeCombination: storeCombination,
                scrapedSKU: scrapedSKU,
                mapping: {
                    storeSKU: generateStoreSKU(storeProduct.id, storeCombination),
                    scrapedSKU: scrapedSKU.id,
                    price: scrapedSKU.price,
                    stock: scrapedSKU.stock,
                    available: scrapedSKU.stock > 0
                }
            });
        }
    });
    
    return skuMappings;
}
```

### **4. Interface de Mapeamento no Dashboard**

#### **A) Modal de Mapeamento de Variações**
```javascript
function showVariationMappingModal(productId) {
    const storeProduct = getStoreProduct(productId);
    const scrapedProduct = getScrapedProduct(productId);
    const mapping = mapProductVariations(storeProduct, scrapedProduct);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content variation-mapping-modal">
            <div class="modal-header">
                <h3><i class="fas fa-link"></i> Mapeamento de Variações</h3>
                <button onclick="closeModal()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="mapping-info">
                    <h4>${storeProduct.name}</h4>
                    <p>Mapeando variações da loja com o scraper</p>
                </div>
                
                <div class="variations-mapping">
                    ${mapping.variations.map(variation => `
                        <div class="variation-section">
                            <h5>${variation.storeName} → ${variation.scrapedName}</h5>
                            <div class="options-mapping">
                                ${variation.options.map(option => `
                                    <div class="option-mapping ${option.mapping.confidence > 0.8 ? 'high-confidence' : 'low-confidence'}">
                                        <div class="store-option">
                                            <strong>Loja:</strong> ${option.storeOption.displayName}
                                        </div>
                                        <div class="mapping-arrow">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                        <div class="scraped-option">
                                            <strong>Scraper:</strong> ${option.scrapedOption.name}
                                            <small>Preço: $${option.scrapedOption.price} | Estoque: ${option.scrapedOption.stock}</small>
                                        </div>
                                        <div class="confidence-score">
                                            <span class="confidence-badge ${option.mapping.confidence > 0.8 ? 'high' : 'medium'}">
                                                ${Math.round(option.mapping.confidence * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="sku-mapping">
                    <h5>Mapeamento de SKUs</h5>
                    <div class="sku-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Combinação da Loja</th>
                                    <th>SKU do Scraper</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mapping.skuMapping.map(sku => `
                                    <tr>
                                        <td>${formatStoreCombination(sku.storeCombination)}</td>
                                        <td>${sku.scrapedSKU.id}</td>
                                        <td>$${sku.scrapedSKU.price}</td>
                                        <td>${sku.scrapedSKU.stock}</td>
                                        <td>
                                            <span class="status-badge ${sku.mapping.available ? 'available' : 'out-of-stock'}">
                                                ${sku.mapping.available ? 'Disponível' : 'Sem Estoque'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="saveVariationMapping('${productId}')" class="btn btn-success">
                    <i class="fas fa-save"></i> Salvar Mapeamento
                </button>
                <button onclick="closeModal()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
```

### **5. Processamento de Pedidos com Variações**

#### **A) Captura de Variações no Checkout**
```javascript
function processCheckoutWithVariations(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        paymentMethod: formData.get("payment")
    };
    
    // Capturar variações selecionadas
    const selectedVariations = {};
    const variationInputs = e.target.querySelectorAll('[data-variation]');
    
    variationInputs.forEach(input => {
        const variationType = input.getAttribute('data-variation');
        const variationValue = input.value;
        selectedVariations[variationType] = variationValue;
    });
    
    // Dados do produto com variações
    const productData = {
        id: "phoera_foundation",
        name: "2 Pack PHOERA Foundation",
        basePrice: 29.99,
        selectedVariations: selectedVariations,
        finalPrice: calculateFinalPrice(29.99, selectedVariations)
    };
    
    // Mapear variações com o scraper
    const variationMapping = mapSelectedVariations(productData, selectedVariations);
    
    // Criar dados completos do pedido
    const orderData = {
        id: "order_" + Date.now(),
        customer: customerData,
        product: productData,
        variations: {
            selected: selectedVariations,
            mapping: variationMapping,
            scrapedSKU: variationMapping.scrapedSKU
        },
        financial: {
            totalRevenue: productData.finalPrice,
            costOfGoods: variationMapping.scrapedSKU.price,
            grossProfit: productData.finalPrice - variationMapping.scrapedSKU.price,
            marginPercentage: ((productData.finalPrice - variationMapping.scrapedSKU.price) / productData.finalPrice) * 100
        },
        status: "pending_review",
        orderDate: new Date().toISOString()
    };
    
    // Salvar no sistema
    saveOrderToDashboard(orderData);
}
```

#### **B) Função de Mapeamento de Variações Selecionadas**
```javascript
function mapSelectedVariations(productData, selectedVariations) {
    const storeProduct = getStoreProduct(productData.id);
    const scrapedProduct = getScrapedProduct(productData.id);
    const mapping = mapProductVariations(storeProduct, scrapedProduct);
    
    // Encontrar SKU correspondente
    const matchingSKU = mapping.skuMapping.find(sku => {
        return Object.keys(selectedVariations).every(variationType => {
            const selectedValue = selectedVariations[variationType];
            const skuValue = sku.storeCombination[variationType];
            return selectedValue === skuValue;
        });
    });
    
    if (matchingSKU) {
        return {
            success: true,
            scrapedSKU: matchingSKU.scrapedSKU,
            mapping: matchingSKU.mapping,
            confidence: calculateOverallConfidence(matchingSKU)
        };
    } else {
        return {
            success: false,
            error: "Variações não mapeadas encontradas",
            selectedVariations: selectedVariations,
            availableMappings: mapping.skuMapping
        };
    }
}
```

### **6. Interface de Seleção de Variações**

#### **A) Formulário de Checkout com Variações**
```html
<form class="checkout-form" onsubmit="processCheckoutWithVariations(event)">
    <!-- Dados do cliente -->
    <div class="form-group">
        <label for="name">Nome Completo</label>
        <input type="text" id="name" name="name" required>
    </div>
    
    <!-- Variações do produto -->
    <div class="product-variations">
        <h4>Selecione as opções:</h4>
        
        <!-- Variação de Cor -->
        <div class="variation-group">
            <label>Cor:</label>
            <div class="variation-options">
                <label class="variation-option">
                    <input type="radio" name="color" value="Bege Natural" data-variation="color" required>
                    <span class="option-display">
                        <div class="color-swatch" style="background-color: #f5deb3;"></div>
                        Bege Natural
                    </span>
                </label>
                <label class="variation-option">
                    <input type="radio" name="color" value="Bege Quente" data-variation="color" required>
                    <span class="option-display">
                        <div class="color-swatch" style="background-color: #d2b48c;"></div>
                        Bege Quente
                    </span>
                </label>
                <label class="variation-option">
                    <input type="radio" name="color" value="Bege Frio" data-variation="color" required>
                    <span class="option-display">
                        <div class="color-swatch" style="background-color: #f0e68c;"></div>
                        Bege Frio
                    </span>
                </label>
            </div>
        </div>
        
        <!-- Variação de Tamanho -->
        <div class="variation-group">
            <label>Tamanho:</label>
            <div class="variation-options">
                <label class="variation-option">
                    <input type="radio" name="size" value="30ml" data-variation="size" required>
                    <span class="option-display">30ml</span>
                </label>
                <label class="variation-option">
                    <input type="radio" name="size" value="50ml" data-variation="size" required>
                    <span class="option-display">50ml (+$7.00)</span>
                </label>
            </div>
        </div>
    </div>
    
    <!-- Resumo do pedido -->
    <div class="order-summary">
        <h4>Resumo do Pedido:</h4>
        <div class="summary-item">
            <span>Produto:</span>
            <span id="product-name">2 Pack PHOERA Foundation</span>
        </div>
        <div class="summary-item">
            <span>Variações:</span>
            <span id="selected-variations">-</span>
        </div>
        <div class="summary-item total">
            <span>Total:</span>
            <span id="final-price">$29.99</span>
        </div>
    </div>
    
    <button type="submit" class="checkout-btn">
        <i class="fas fa-check"></i> Finalizar Pedido
    </button>
</form>
```

### **7. Validação e Confirmação**

#### **A) Validação de Variações**
```javascript
function validateVariations(selectedVariations, productId) {
    const storeProduct = getStoreProduct(productId);
    const errors = [];
    
    // Verificar se todas as variações obrigatórias foram selecionadas
    storeProduct.variations.forEach(variation => {
        if (!selectedVariations[variation.type]) {
            errors.push(`Variação "${variation.name}" é obrigatória`);
        }
    });
    
    // Verificar se as variações selecionadas existem
    Object.keys(selectedVariations).forEach(variationType => {
        const variation = storeProduct.variations.find(v => v.type === variationType);
        if (variation) {
            const option = variation.options.find(o => o.value === selectedVariations[variationType]);
            if (!option) {
                errors.push(`Opção "${selectedVariations[variationType]}" não existe para "${variation.name}"`);
            }
        }
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
```

#### **B) Confirmação de Mapeamento**
```javascript
function confirmVariationMapping(orderData) {
    const mapping = orderData.variations.mapping;
    
    if (!mapping.success) {
        showMessage('Erro: Variações não puderam ser mapeadas com o fornecedor', 'error');
        return false;
    }
    
    if (mapping.confidence < 0.8) {
        const confirmed = confirm(
            `Atenção: Mapeamento com confiança baixa (${Math.round(mapping.confidence * 100)}%)\n\n` +
            `Variações selecionadas: ${JSON.stringify(orderData.variations.selected)}\n` +
            `SKU do fornecedor: ${mapping.scrapedSKU.id}\n\n` +
            `Deseja continuar mesmo assim?`
        );
        
        if (!confirmed) {
            return false;
        }
    }
    
    return true;
}
```

## 🚀 **Benefícios do Sistema**

### **1. Precisão**
- **Mapeamento Automático**: Identifica automaticamente as variações correspondentes
- **Validação**: Verifica se as variações selecionadas existem no fornecedor
- **Confiança**: Calcula nível de confiança do mapeamento

### **2. Flexibilidade**
- **Múltiplos Tipos**: Suporta cor, tamanho, material, etc.
- **Mapeamentos Customizados**: Permite mapeamentos específicos por produto
- **Fallbacks**: Sistema de fallback para casos não mapeados

### **3. Integração**
- **Checkout Integrado**: Captura variações durante o checkout
- **Dashboard Integrado**: Mostra mapeamentos no dashboard
- **Fornecedor Integrado**: Envia especificações corretas para o fornecedor

### **4. Escalabilidade**
- **Novos Produtos**: Fácil adição de novos produtos e variações
- **Novos Fornecedores**: Suporte a múltiplos fornecedores
- **Novos Tipos**: Fácil adição de novos tipos de variação

## 🏁 **Conclusão**

O Sistema de Mapeamento de Variações de Produtos oferece:

1. **✅ Mapeamento Automático**: Identifica variações entre loja e scraper
2. **✅ Interface Intuitiva**: Seleção fácil de variações no checkout
3. **✅ Validação Robusta**: Verifica disponibilidade e mapeamento
4. **✅ Confiança Calculada**: Nível de confiança do mapeamento
5. **✅ Integração Completa**: Fluxo completo até o fornecedor
6. **✅ Escalabilidade**: Suporte a novos produtos e variações
7. **✅ Fallbacks**: Sistema de fallback para casos não mapeados

O sistema garante que os fornecedores recebam as especificações exatas dos produtos, evitando erros de pedido e melhorando a satisfação do cliente! 🚀
