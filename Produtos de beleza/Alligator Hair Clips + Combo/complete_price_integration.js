// Sistema de integração de preços da Oferta Completa - 10pcsTouMing-blue
// Este arquivo deve ser incluído na página de checkout do alligator

// Preços otimizados com margem de lucro real considerando taxas do AliExpress
const COMPLETE_PRICES = {
    "10pcsTouMing-blue": {
        originalPrice: "$4.19",
        profitPrice: "$11.36",
        profitPriceBRL: "R$59.84",
        margin: "15%",
        stock: 10,
        productName: "10pcsTouMing-blue",
        description: "10 peças de grampos transparentes azuis"
    }
};

// Função para atualizar preços da oferta completa na página
function updateCompletePrices() {
    const completePriceData = COMPLETE_PRICES["10pcsTouMing-blue"];
    
    if (completePriceData) {
        // Atualizar preço na oferta completa
        const completePriceElement = document.querySelector('.offer-option[data-option="complete"] .price');
        if (completePriceElement) {
            completePriceElement.textContent = completePriceData.profitPrice;
            console.log(`💰 Preço da oferta completa atualizado: ${completePriceData.profitPrice}`);
        }
        
        // Atualizar preços das ofertas no sistema de conversão
        updateCompleteOffersPrices(completePriceData);
        
        // Atualizar preço no resumo do pedido se a oferta completa estiver selecionada
        updateCompleteOrderSummaryPrice(completePriceData);
        
        // Mostrar informações de estoque
        updateCompleteStockInfo(completePriceData);
    }
}

// Função para atualizar preços das ofertas completas no sistema de conversão
function updateCompleteOffersPrices(priceData) {
    // Verificar se o objeto offers existe
    if (typeof offers !== 'undefined' && offers.complete) {
        const usdPrice = parseFloat(priceData.profitPrice.replace('$', ''));
        
        // Atualizar preços em todas as moedas
        offers.complete.prices = {
            USD: usdPrice,
            BRL: usdPrice * 5.27, // Taxa de conversão USD para BRL
            EUR: usdPrice * 0.92, // Taxa de conversão USD para EUR
            AOA: usdPrice * 920   // Taxa de conversão USD para AOA
        };
        
        console.log('🔄 Preços da oferta completa atualizados:', offers.complete.prices);
        
        // Atualizar display de moeda se necessário
        if (typeof updateCurrencyDisplay === 'function') {
            updateCurrencyDisplay();
        }
    }
}

// Função para atualizar preço no resumo do pedido
function updateCompleteOrderSummaryPrice(priceData) {
    // Verificar se a oferta completa está selecionada
    const completeCheckbox = document.getElementById('offer-complete');
    if (completeCheckbox && completeCheckbox.checked) {
        // Atualizar resumo do pedido usando a função existente
        if (typeof updateOrderSummary === 'function') {
            updateOrderSummary();
            console.log('🔄 Resumo do pedido atualizado com preço completo');
        }
    }
}

// Função para atualizar informações de estoque da oferta completa
function updateCompleteStockInfo(priceData) {
    // Criar ou atualizar elemento de estoque para a oferta completa
    let stockElement = document.querySelector('.offer-option[data-option="complete"] .stock-info');
    if (!stockElement) {
        // Criar elemento de estoque se não existir
        const completeOffer = document.querySelector('.offer-option[data-option="complete"]');
        if (completeOffer) {
            stockElement = document.createElement('div');
            stockElement.className = 'stock-info';
            stockElement.style.cssText = 'font-size: 0.8rem; color: #666; margin-top: 5px;';
            completeOffer.appendChild(stockElement);
        }
    }
    
    if (stockElement) {
        if (priceData.stock > 10) {
            stockElement.textContent = `✅ Em estoque (${priceData.stock} unidades)`;
            stockElement.style.color = '#28a745';
        } else if (priceData.stock > 0) {
            stockElement.textContent = `⚠️ Poucos itens restantes (${priceData.stock} unidades)`;
            stockElement.style.color = '#ffc107';
        } else {
            stockElement.textContent = `❌ Fora de estoque`;
            stockElement.style.color = '#dc3545';
        }
    }
}

// Função para adicionar informações de lucro da oferta completa
function addCompleteProfitInfo() {
    const completePriceData = COMPLETE_PRICES["10pcsTouMing-blue"];
    const profitInfo = document.querySelector('.offer-option[data-option="complete"] .profit-info');
    
    if (profitInfo && completePriceData) {
        profitInfo.innerHTML = `<i class="fas fa-chart-line"></i> Margem: ${completePriceData.margin} | Preço original: ${completePriceData.originalPrice}`;
    }
}

// Função para observar mudanças na seleção da oferta completa
function observeCompleteChanges() {
    const completeCheckbox = document.getElementById('offer-complete');
    
    if (completeCheckbox) {
        completeCheckbox.addEventListener('change', function() {
            console.log('🛍️ Oferta completa alterada:', this.checked);
            setTimeout(() => {
                updateCompletePrices();
                addCompleteProfitInfo();
            }, 100);
        });
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🛍️ Inicializando sistema de preços da Oferta Completa...');
        updateCompletePrices();
        addCompleteProfitInfo();
        observeCompleteChanges();
        
        console.log('✅ Sistema de preços da Oferta Completa integrado com sucesso!');
        console.log('💰 Preços disponíveis:', Object.keys(COMPLETE_PRICES));
    }, 700); // Um pouco depois dos outros sistemas
});

// Exportar para uso global
window.CompletePriceSystem = {
    updatePrices: updateCompletePrices,
    getPriceData: () => COMPLETE_PRICES["10pcsTouMing-blue"],
    getCalculatedPrices: () => COMPLETE_PRICES
};
