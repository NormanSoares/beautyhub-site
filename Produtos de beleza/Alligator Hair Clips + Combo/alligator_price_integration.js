// Sistema de integração de preços do Alligator com margem de lucro
// Este arquivo deve ser incluído na página de checkout do alligator

// Preços otimizados com margem de lucro real considerando taxas do AliExpress
const ALLIGATOR_PRICES = {
    "nude-pink": {
        profitPrice: "$3.54",
        profitPriceBRL: "R$18.64",
        margin: "15%",
        stock: 6
    },
    "black": {
        profitPrice: "$5.88",
        profitPriceBRL: "R$30.99",
        margin: "15%",
        stock: 4
    },
    "yellow": {
        profitPrice: "$6.35", 
        profitPriceBRL: "R$33.45",
        margin: "15%",
        stock: 15
    },
    "purple": {
        profitPrice: "$6.32",
        profitPriceBRL: "R$33.28", 
        margin: "15%",
        stock: 17
    },
    "green": {
        profitPrice: "$5.73",
        profitPriceBRL: "R$30.22",
        margin: "15%", 
        stock: 12
    },
    "pink": {
        profitPrice: "$6.09",
        profitPriceBRL: "R$32.09",
        margin: "15%",
        stock: 10
    },
    "red": {
        profitPrice: "$5.91",
        profitPriceBRL: "R$31.16",
        margin: "15%",
        stock: 15
    }
};

// Função para atualizar preços na página
function updateAlligatorPrices() {
    // Atualizar preço principal baseado na cor selecionada
    const selectedColorElement = document.querySelector('.color-option.selected');
    if (selectedColorElement) {
        const colorValue = selectedColorElement.getAttribute('data-color');
        const priceData = ALLIGATOR_PRICES[colorValue];
        
        if (priceData) {
            // Atualizar preço principal na oferta básica
            const priceElement = document.querySelector('.offer-option[data-option="basic"] .price');
            if (priceElement) {
                priceElement.textContent = priceData.profitPrice;
                console.log(`💰 Preço atualizado para ${colorValue}: ${priceData.profitPrice}`);
            }
            
            // Atualizar preços das ofertas no sistema de conversão
            updateOffersPrices(priceData);
            
            // Atualizar preço no resumo do pedido
            updateOrderSummaryPrice(priceData);
            
            // Mostrar informações de estoque se disponível
            updateStockInfo(priceData);
            
            // Atualizar preço total
            updateTotalPrice();
        }
    }
}

// Função para atualizar preços das ofertas no sistema de conversão
function updateOffersPrices(priceData) {
    // Verificar se o objeto offers existe
    if (typeof offers !== 'undefined' && offers.basic) {
        const usdPrice = parseFloat(priceData.profitPrice.replace('$', ''));
        
        // Atualizar nome da oferta com a cor selecionada
        const selectedColorElement = document.querySelector('.color-option.selected');
        if (selectedColorElement) {
            const colorValue = selectedColorElement.getAttribute('data-color');
            const colorName = selectedColorElement.querySelector('span').textContent;
            offers.basic.name = `Alligator Hair Clips (${colorName})`;
        }
        
        // Atualizar preços em todas as moedas
        offers.basic.prices = {
            USD: usdPrice,
            BRL: usdPrice * 5.27, // Taxa de conversão USD para BRL
            EUR: usdPrice * 0.92, // Taxa de conversão USD para EUR
            AOA: usdPrice * 920   // Taxa de conversão USD para AOA
        };
        
        console.log('🔄 Preços das ofertas atualizados:', offers.basic.prices);
        console.log('🏷️ Nome da oferta atualizado:', offers.basic.name);
        
        // Atualizar display de moeda se necessário
        if (typeof updateCurrencyDisplay === 'function') {
            updateCurrencyDisplay();
        }
    }
}

// Função para atualizar preço no resumo do pedido
function updateOrderSummaryPrice(priceData) {
    const orderSummaryPrice = document.querySelector('.order-summary .price');
    if (orderSummaryPrice) {
        orderSummaryPrice.textContent = priceData.profitPrice;
    }
    
    // Atualizar resumo do pedido usando a função existente
    if (typeof updateOrderSummary === 'function') {
        updateOrderSummary();
        console.log('🔄 Resumo do pedido atualizado');
    }
    
    // Atualizar total se houver ofertas adicionais
    updateTotalPrice();
}

// Função para atualizar informações de estoque
function updateStockInfo(priceData) {
    // Criar ou atualizar elemento de estoque
    let stockElement = document.querySelector('.stock-info');
    if (!stockElement) {
        stockElement = document.createElement('div');
        stockElement.className = 'stock-info';
        stockElement.style.cssText = 'margin-top: 10px; font-size: 0.9rem; color: #666;';
        
        const offerOption = document.querySelector('.offer-option[data-option="basic"]');
        if (offerOption) {
            offerOption.appendChild(stockElement);
        }
    }
    
    if (priceData.stock > 10) {
        stockElement.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i> Em estoque (${priceData.stock} unidades)`;
    } else if (priceData.stock > 0) {
        stockElement.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i> Poucos itens restantes (${priceData.stock} unidades)`;
    } else {
        stockElement.innerHTML = `<i class="fas fa-times-circle" style="color: #dc3545;"></i> Fora de estoque`;
    }
}

// Função para atualizar preço total
function updateTotalPrice() {
    let total = 0;
    
    // Preço base do alligator
    const selectedColorElement = document.querySelector('.color-option.selected');
    if (selectedColorElement) {
        const colorValue = selectedColorElement.getAttribute('data-color');
        const priceData = ALLIGATOR_PRICES[colorValue];
        if (priceData) {
            total += parseFloat(priceData.profitPrice.replace('$', ''));
        }
    }
    
    // Adicionar ofertas premium/completa se selecionadas
    const premiumCheckbox = document.getElementById('offer-premium');
    const completeCheckbox = document.getElementById('offer-complete');
    
    if (premiumCheckbox && premiumCheckbox.checked) {
        total += 2.00; // Preço da oferta premium
    }
    
    if (completeCheckbox && completeCheckbox.checked) {
        total += 2.00; // Preço da oferta completa
    }
    
    // Atualizar total na página
    const totalElement = document.querySelector('.total-price');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Função para adicionar informações de margem de lucro (opcional)
function addProfitInfo() {
    const selectedColorElement = document.querySelector('.color-option.selected');
    if (selectedColorElement) {
        const colorValue = selectedColorElement.getAttribute('data-color');
        const priceData = ALLIGATOR_PRICES[colorValue];
        
        if (priceData) {
            // Criar elemento de informação de margem
            let profitInfo = document.querySelector('.profit-info');
            if (!profitInfo) {
                profitInfo = document.createElement('div');
                profitInfo.className = 'profit-info';
                profitInfo.style.cssText = 'margin-top: 5px; font-size: 0.8rem; color: #28a745; font-weight: 500;';
                
                const offerOption = document.querySelector('.offer-option[data-option="basic"]');
                if (offerOption) {
                    offerOption.appendChild(profitInfo);
                }
            }
            
            profitInfo.innerHTML = `<i class="fas fa-chart-line"></i> Margem: ${priceData.margin}`;
        }
    }
}

// Função para observar mudanças na seleção de cor
function observeColorChanges() {
    // Usar MutationObserver para detectar mudanças na classe 'selected'
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        // Observar mudanças na classe 'selected'
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (option.classList.contains('selected')) {
                        console.log('🎨 Cor selecionada via observer:', option.getAttribute('data-color'));
                        setTimeout(() => {
                            updateAlligatorPrices();
                            addProfitInfo();
                        }, 100);
                    }
                }
            });
        });
        
        observer.observe(option, {
            attributes: true,
            attributeFilter: ['class']
        });
    });
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        console.log('🐊 Inicializando sistema de preços do Alligator...');
        
        // Atualizar preços iniciais
        updateAlligatorPrices();
        addProfitInfo();
        
        // Configurar observação de mudanças de cor
        observeColorChanges();
        
        // Adicionar listeners para ofertas adicionais
        const premiumCheckbox = document.getElementById('offer-premium');
        const completeCheckbox = document.getElementById('offer-complete');
        
        if (premiumCheckbox) {
            premiumCheckbox.addEventListener('change', updateTotalPrice);
        }
        
        if (completeCheckbox) {
            completeCheckbox.addEventListener('change', updateTotalPrice);
        }
        
        console.log('✅ Sistema de preços do Alligator integrado com sucesso!');
        console.log('💰 Preços disponíveis:', Object.keys(ALLIGATOR_PRICES));
    }, 500);
});

// Exportar para uso global
window.AlligatorPriceSystem = {
    updatePrices: updateAlligatorPrices,
    getPriceData: (color) => ALLIGATOR_PRICES[color],
    getAllPrices: () => ALLIGATOR_PRICES
};
