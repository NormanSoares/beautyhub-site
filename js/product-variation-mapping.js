/**
 * Sistema de Mapeamento de Variações de Produtos - 67 Beauty Hub
 * 
 * Este sistema mapeia as escolhas dos clientes (cor, tamanho, quantidade, ofertas)
 * com as opções disponíveis no fornecedor (AliExpress), garantindo que os
 * fornecedores recebam as especificações corretas do produto.
 * 
 * @version 1.0.0
 * @author 67 Beauty Hub
 */

// ===== CONFIGURAÇÕES GLOBAIS =====
const MAPPING_CONFIG = {
    // Configurações de mapeamento
    maxSimilarityThreshold: 0.8,
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'BRL', 'AOA'],
    
    // Configurações de fornecedores
    suppliers: {
        aliexpress: {
            name: 'AliExpress',
            currency: 'USD',
            skuPrefix: 'AE-',
            urlPattern: 'https://pt.aliexpress.com/item/{id}.html'
        }
    }
};

// ===== MAPEAMENTOS DE VARIAÇÕES =====
const VARIATION_MAPPINGS = {
    // Mapeamentos de cores
    color: {
        // PHOERA Foundation - 16 cores
        '102_nude': ['102 nude', 'nude 102', 'natural beige', 'beige natural'],
        '103_warm_peach': ['103 warm peach', 'warm peach 103', 'peach warm'],
        '104_buff_beige': ['104 buff beige', 'buff beige 104', 'buff beige'],
        '105_sand': ['105 sand', 'sand 105', 'sand beige'],
        '108_tan': ['108 tan', 'tan 108', 'tan bronze'],
        '109_mocha': ['109 mocha', 'mocha 109', 'mocha brown'],
        'warm_peach': ['warm peach', 'peach warm', 'peach'],
        'buff_beige': ['buff beige', 'beige buff'],
        'sand': ['sand', 'sand beige'],
        'tan': ['tan', 'tan bronze'],
        'mocha': ['mocha', 'mocha brown'],
        'nude': ['nude', 'natural beige'],
        'ivory': ['ivory', 'ivory beige'],
        'porcelain': ['porcelain', 'porcelain beige'],
        'honey': ['honey', 'honey beige'],
        'caramel': ['caramel', 'caramel brown'],
        
        // Alligator Hair Clips - 7 cores
        'nude_pink': ['nude pink', 'pink nude', 'nude'],
        'black': ['black', 'preto', 'ebony'],
        'white': ['white', 'branco', 'ivory'],
        'brown': ['brown', 'marrom', 'tan'],
        'blonde': ['blonde', 'loiro', 'gold'],
        'red': ['red', 'vermelho', 'auburn'],
        'gray': ['gray', 'cinza', 'grey'],
        
        // Heat-Resistant Mat - 13 variações (tamanho + cor)
        'small_pink': ['small pink', 'pequeno rosa', 's pink'],
        'small_blue': ['small blue', 'pequeno azul', 's blue'],
        'small_green': ['small green', 'pequeno verde', 's green'],
        'medium_pink': ['medium pink', 'médio rosa', 'm pink'],
        'medium_blue': ['medium blue', 'médio azul', 'm blue'],
        'medium_green': ['medium green', 'médio verde', 'm green'],
        'large_pink': ['large pink', 'grande rosa', 'l pink'],
        'large_blue': ['large blue', 'grande azul', 'l blue'],
        'large_green': ['large green', 'grande verde', 'l green'],
        'xlarge_pink': ['xlarge pink', 'extra grande rosa', 'xl pink'],
        'xlarge_blue': ['xlarge blue', 'extra grande azul', 'xl blue'],
        'xlarge_green': ['xlarge green', 'extra grande verde', 'xl green'],
        'xxlarge_pink': ['xxlarge pink', 'super grande rosa', 'xxl pink'],
        
        // LAIKOU Golden Sakura - 3 tipos
        'gold_snail': ['gold snail', 'snail gold', 'snail'],
        'sakura': ['sakura', 'cherry blossom', 'cherry'],
        'vitamin_c': ['vitamin c', 'vit c', 'vitamin']
    },
    
    // Mapeamentos de tamanhos
    size: {
        '30ml': ['30ml', '30 ml', '30ml bottle', '30ml tube'],
        '50ml': ['50ml', '50 ml', '50ml bottle', '50ml tube'],
        'small': ['small', 's', 'xs', 'pequeno', 'p'],
        'medium': ['medium', 'm', 'md', 'médio'],
        'large': ['large', 'l', 'lg', 'grande', 'g'],
        'xlarge': ['xlarge', 'xl', 'extra large', 'extra grande'],
        'xxlarge': ['xxlarge', 'xxl', 'super large', 'super grande']
    }
};

// ===== MAPEAMENTOS DE PRODUTOS =====
const PRODUCT_MAPPINGS = {
    // PHOERA Foundation + Combo
    'phoera_foundation': {
        name: '2 Pack PHOERA Foundation',
        supplierId: 'aliexpress_100500106836560',
        supplierUrl: 'https://pt.aliexpress.com/item/100500106836560.html',
        basePrice: 17.39,
        variations: {
            type: 'color',
            options: Object.keys(VARIATION_MAPPINGS.color).filter(key => 
                ['102_nude', '103_warm_peach', '104_buff_beige', '105_sand', '108_tan', '109_mocha', 
                 'warm_peach', 'buff_beige', 'sand', 'tan', 'mocha', 'nude', 'ivory', 'porcelain', 'honey', 'caramel'].includes(key)
            )
        },
        offers: {
            basic: { name: '2 Pack PHOERA Foundation', price: 17.39 },
            premium: { name: '8pcs Makeup Brush Kit', price: 2.50 },
            complete: { name: '2 Pack PHOERA Primer', price: 11.64 }
        }
    },
    
    // Alligator Hair Clips + Combo
    'alligator_hair_clips': {
        name: 'Alligator Hair Clips',
        supplierId: 'aliexpress_100500123456789',
        supplierUrl: 'https://pt.aliexpress.com/item/100500123456789.html',
        basePrice: 3.54,
        variations: {
            type: 'color',
            options: Object.keys(VARIATION_MAPPINGS.color).filter(key => 
                ['nude_pink', 'black', 'white', 'brown', 'blonde', 'red', 'gray'].includes(key)
            )
        },
        offers: {
            basic: { name: 'Alligator Hair Clips', price: 3.54 },
            premium: { name: 'Hair Accessories Kit', price: 2.89 },
            complete: { name: 'Complete Hair Styling Set', price: 11.36 }
        }
    },
    
    // Wrinkle Reducer + Combo
    'wrinkle_reducer': {
        name: 'Vara de Skincare - Wrinkle Reducer',
        supplierId: 'aliexpress_100500987654321',
        supplierUrl: 'https://pt.aliexpress.com/item/100500987654321.html',
        basePrice: 17.45,
        variations: null, // Sem variações
        quantity: { min: 1, max: 10 },
        offers: {
            basic: { name: 'Vara de Skincare - Wrinkle Reducer', price: 17.45, quantityMultiplier: true },
            premium: { name: 'Face Mask Therapy', price: 35.36, quantityMultiplier: false }
        }
    },
    
    // Heat-Resistant Mat
    'heat_resistant_mat': {
        name: 'Heat-Resistant Mat',
        supplierId: 'aliexpress_100500456789123',
        supplierUrl: 'https://pt.aliexpress.com/item/100500456789123.html',
        basePrice: 2.29,
        variations: {
            type: 'size_color',
            options: Object.keys(VARIATION_MAPPINGS.color).filter(key => 
                key.includes('small_') || key.includes('medium_') || key.includes('large_') || 
                key.includes('xlarge_') || key.includes('xxlarge_')
            )
        },
        quantity: { min: 1, max: 10 }
    },
    
    // LAIKOU Golden Sakura
    'laikou_golden_sakura': {
        name: 'LAIKOU Vitamin C 24K Golden Sakura',
        supplierId: 'aliexpress_100500789123456',
        supplierUrl: 'https://pt.aliexpress.com/item/100500789123456.html',
        basePrice: 24.99,
        variations: {
            type: 'type',
            options: ['gold_snail', 'sakura', 'vitamin_c']
        }
    },
    
    // SNOOZE BUNDLE
    'snooze_bundle': {
        name: 'SNOOZE BUNDLE',
        supplierId: 'aliexpress_100500321654987',
        supplierUrl: 'https://pt.aliexpress.com/item/100500321654987.html',
        basePrice: 149.99,
        variations: null, // Sem variações
        quantity: { min: 1, max: 3 }
    },
    
    // Human Dog Bed
    'human_dog_bed': {
        name: 'Human Dog Bed',
        supplierId: 'aliexpress_human_dog_bed_001',
        supplierUrl: 'https://pt.aliexpress.com/item/human_dog_bed_001.html',
        basePrice: 79.99,
        variations: null, // Sem variações
        quantity: { min: 1, max: 2 }
    },
    
    // Detachable Sofa Cover Bean Bag Cover
    'detachable_sofa_cover': {
        name: 'Detachable Sofa Cover Bean Bag Cover',
        supplierId: 'aliexpress_detachable_sofa_cover_001',
        supplierUrl: 'https://pt.aliexpress.com/item/detachable_sofa_cover_001.html',
        basePrice: 34.99,
        variations: {
            type: 'size',
            options: ['S', 'M', 'L', 'XL']
        },
        quantity: { min: 1, max: 5 }
    }
};

// ===== SISTEMA DE MAPEAMENTO =====
class ProductVariationMapper {
    constructor() {
        this.mappings = PRODUCT_MAPPINGS;
        this.variationMappings = VARIATION_MAPPINGS;
    }
    
    /**
     * Mapeia um pedido completo com todas as variações
     * @param {Object} orderData - Dados do pedido
     * @returns {Object} Pedido mapeado para o fornecedor
     */
    mapOrder(orderData) {
        try {
            console.log('🔄 Iniciando mapeamento de pedido:', orderData);
            
            const mappedOrder = {
                ...orderData,
                supplierOrder: {
                    supplierId: 'aliexpress',
                    items: [],
                    total: 0,
                    currency: MAPPING_CONFIG.defaultCurrency
                }
            };
            
            // Mapear cada item do pedido
            orderData.items.forEach((item, index) => {
                console.log(`📦 Mapeando item ${index + 1}:`, item);
                const mappedItem = this.mapOrderItem(item);
                if (mappedItem) {
                    console.log(`✅ Item ${index + 1} mapeado com sucesso:`, mappedItem);
                    mappedOrder.supplierOrder.items.push(mappedItem);
                    mappedOrder.supplierOrder.total += mappedItem.totalPrice;
                } else {
                    console.warn(`❌ Falha ao mapear item ${index + 1}:`, item);
                }
            });
            
            console.log('🎯 Pedido mapeado completamente:', mappedOrder);
            return mappedOrder;
            
        } catch (error) {
            console.error('❌ Erro ao mapear pedido:', error);
            return null;
        }
    }
    
    /**
     * Mapeia um item individual do pedido
     * @param {Object} item - Item do pedido
     * @returns {Object} Item mapeado
     */
    mapOrderItem(item) {
        try {
            console.log('🔍 Mapeando item individual:', item);
            
            const productMapping = this.getProductMapping(item.productId);
            if (!productMapping) {
                console.warn(`❌ Mapeamento não encontrado para produto: ${item.productId}`);
                return null;
            }
            
            console.log('✅ Mapeamento do produto encontrado:', productMapping);
            console.log('🔗 URL do fornecedor:', productMapping.supplierUrl);
            
            // Mapear variações se existirem
            let supplierVariation = null;
            if (item.variation && productMapping.variations) {
                console.log('🎨 Mapeando variação:', item.variation);
                supplierVariation = this.mapVariation(item.variation, productMapping.variations.type);
                console.log('✅ Variação mapeada:', supplierVariation);
            } else {
                console.log('ℹ️ Sem variações para mapear');
            }
            
            // Gerar SKU do fornecedor
            const supplierSKU = this.generateSupplierSKU(productMapping.supplierId, supplierVariation);
            console.log('🏷️ SKU do fornecedor gerado:', supplierSKU);
            
            // Calcular preços
            const supplierUnitPrice = this.calculateSupplierPrice(productMapping, item.variation);
            const supplierTotalPrice = supplierUnitPrice * item.quantity;
            console.log('💰 Preços calculados:', { supplierUnitPrice, supplierTotalPrice });
            
            const mappedItem = {
                supplierSKU: supplierSKU,
                productName: productMapping.name,
                supplierUrl: productMapping.supplierUrl,
                variation: supplierVariation,
                quantity: item.quantity,
                unitPrice: supplierUnitPrice,
                totalPrice: supplierTotalPrice,
                currency: MAPPING_CONFIG.defaultCurrency
            };
            
            console.log('🎯 Item mapeado final:', mappedItem);
            return mappedItem;
            
        } catch (error) {
            console.error('❌ Erro ao mapear item:', error);
            return null;
        }
    }
    
    /**
     * Mapeia uma variação específica
     * @param {Object} variation - Variação do cliente
     * @param {string} variationType - Tipo de variação
     * @returns {Object} Variação mapeada para o fornecedor
     */
    mapVariation(variation, variationType) {
        if (!variation || !variationType) return null;
        
        const mappingKey = this.findVariationMapping(variation, variationType);
        if (!mappingKey) {
            console.warn(`Mapeamento não encontrado para variação: ${JSON.stringify(variation)}`);
            return null;
        }
        
        return {
            type: variationType,
            value: mappingKey,
            displayName: variation.displayName || variation.value || mappingKey
        };
    }
    
    /**
     * Encontra o mapeamento correto para uma variação
     * @param {Object} variation - Variação do cliente
     * @param {string} variationType - Tipo de variação
     * @returns {string} Chave do mapeamento
     */
    findVariationMapping(variation, variationType) {
        const mappings = this.variationMappings[variationType];
        if (!mappings) return null;
        
        const searchValue = (variation.value || variation.displayName || '').toLowerCase();
        
        // Buscar mapeamento direto
        for (const [key, values] of Object.entries(mappings)) {
            if (values.some(value => value.toLowerCase() === searchValue)) {
                return key;
            }
        }
        
        // Buscar por similaridade
        for (const [key, values] of Object.entries(mappings)) {
            if (values.some(value => this.calculateSimilarity(searchValue, value.toLowerCase()) > MAPPING_CONFIG.maxSimilarityThreshold)) {
                return key;
            }
        }
        
        return null;
    }
    
    /**
     * Gera SKU do fornecedor
     * @param {string} supplierId - ID do fornecedor
     * @param {Object} variation - Variação mapeada
     * @returns {string} SKU do fornecedor
     */
    generateSupplierSKU(supplierId, variation) {
        let sku = MAPPING_CONFIG.suppliers.aliexpress.skuPrefix + supplierId;
        
        if (variation) {
            sku += '-' + variation.value.toUpperCase();
        }
        
        return sku;
    }
    
    /**
     * Calcula preço do fornecedor
     * @param {Object} productMapping - Mapeamento do produto
     * @param {Object} variation - Variação do cliente
     * @returns {number} Preço unitário do fornecedor
     */
    calculateSupplierPrice(productMapping, variation) {
        // Por enquanto, usar preço base com margem de 50%
        // Em produção, isso viria de uma API ou banco de dados
        return productMapping.basePrice * 0.5;
    }
    
    /**
     * Obtém mapeamento de um produto
     * @param {string} productId - ID do produto
     * @returns {Object} Mapeamento do produto
     */
    getProductMapping(productId) {
        return this.mappings[productId];
    }
    
    /**
     * Calcula similaridade entre duas strings
     * @param {string} str1 - Primeira string
     * @param {string} str2 - Segunda string
     * @returns {number} Similaridade (0-1)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    
    /**
     * Calcula distância de Levenshtein
     * @param {string} str1 - Primeira string
     * @param {string} str2 - Segunda string
     * @returns {number} Distância
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * Valida se um pedido pode ser mapeado
     * @param {Object} orderData - Dados do pedido
     * @returns {Object} Resultado da validação
     */
    validateOrder(orderData) {
        const errors = [];
        const warnings = [];
        
        if (!orderData.items || orderData.items.length === 0) {
            errors.push('Pedido deve ter pelo menos um item');
        }
        
        orderData.items.forEach((item, index) => {
            const productMapping = this.getProductMapping(item.productId);
            if (!productMapping) {
                errors.push(`Produto não encontrado: ${item.productId}`);
                return;
            }
            
            // Validar quantidade
            if (productMapping.quantity) {
                if (item.quantity < productMapping.quantity.min) {
                    errors.push(`Quantidade mínima para ${item.productId}: ${productMapping.quantity.min}`);
                }
                if (item.quantity > productMapping.quantity.max) {
                    errors.push(`Quantidade máxima para ${item.productId}: ${productMapping.quantity.max}`);
                }
            }
            
            // Validar variações
            if (item.variation && productMapping.variations) {
                const mapping = this.findVariationMapping(item.variation, productMapping.variations.type);
                if (!mapping) {
                    warnings.push(`Variação não mapeada para ${item.productId}: ${JSON.stringify(item.variation)}`);
                }
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }
}

// ===== INSTÂNCIA GLOBAL =====
const ProductMapper = new ProductVariationMapper();

// ===== FUNÇÕES GLOBAIS =====
window.mapProductOrder = (orderData) => ProductMapper.mapOrder(orderData);
window.validateProductOrder = (orderData) => ProductMapper.validateOrder(orderData);
window.getProductMapping = (productId) => ProductMapper.getProductMapping(productId);

// ===== EXPORTAÇÃO PARA MÓDULOS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProductVariationMapper,
        ProductMapper,
        MAPPING_CONFIG,
        VARIATION_MAPPINGS,
        PRODUCT_MAPPINGS
    };
}
