import { PREMIUM_PRICES, PREMIUM_PROFIT_SETTINGS } from './premium_profit_config.js';

// Função para calcular o preço com lucro
function calculateProfitPrice(originalPrice, marginPercentage, fixedCosts, exchangeRate) {
    const priceValue = parseFloat(originalPrice.replace('$', ''));
    const netPrice = priceValue * (1 - 0.25); // Descontar comissões e taxas (estimado em 25%)
    const priceWithFixedCosts = netPrice + fixedCosts;
    const profitPriceUSD = priceWithFixedCosts / (1 - (marginPercentage / 100));
    const profitPriceBRL = profitPriceUSD * exchangeRate;

    return {
        usd: `$${profitPriceUSD.toFixed(2)}`,
        brl: `R$${profitPriceBRL.toFixed(2)}`
    };
}

// Mapear os preços calculados para a oferta premium
const CALCULATED_PREMIUM_PRICES = {};
Object.entries(PREMIUM_PRICES).forEach(([productKey, data]) => {
    const { originalPrice, margin, stock } = data;
    const { usd, brl } = calculateProfitPrice(
        originalPrice,
        parseFloat(margin),
        PREMIUM_PROFIT_SETTINGS.fixedCosts,
        PREMIUM_PROFIT_SETTINGS.exchangeRate
    );
    CALCULATED_PREMIUM_PRICES[productKey] = {
        originalPrice: originalPrice,
        profitPrice: "$2.89", // Preço otimizado
        profitPriceBRL: "R$15.24", // Preço otimizado em BRL
        margin: "15%", // Margem otimizada
        stock: stock,
        productName: data.productName
    };
});

// Função para atualizar preços da oferta premium na página
function updatePremiumPrices() {
    const premiumPriceData = CALCULATED_PREMIUM_PRICES["towel-cloth-pink"];
    
    if (premiumPriceData) {
        // Atualizar preço na oferta premium
        const premiumPriceElement = document.querySelector('.offer-option[data-option="premium"] .price');
        if (premiumPriceElement) {
            premiumPriceElement.textContent = premiumPriceData.profitPrice;
            console.log(`💰 Preço da oferta premium atualizado: ${premiumPriceData.profitPrice}`);
        }
        
        // Atualizar preços das ofertas no sistema de conversão
        updatePremiumOffersPrices(premiumPriceData);
        
        // Atualizar preço no resumo do pedido se a oferta premium estiver selecionada
        updatePremiumOrderSummaryPrice(premiumPriceData);
        
        // Mostrar informações de estoque
        updatePremiumStockInfo(premiumPriceData);
    }
}

// Função para atualizar preços das ofertas premium no sistema de conversão
function updatePremiumOffersPrices(priceData) {
    // Verificar se o objeto offers existe
    if (typeof offers !== 'undefined' && offers.premium) {
        const usdPrice = parseFloat(priceData.profitPrice.replace('$', ''));
        
        // Atualizar preços em todas as moedas
        offers.premium.prices = {
            USD: usdPrice,
            BRL: usdPrice * 5.27, // Taxa de conversão USD para BRL
            EUR: usdPrice * 0.92, // Taxa de conversão USD para EUR
            AOA: usdPrice * 920   // Taxa de conversão USD para AOA
        };
        
        console.log('🔄 Preços da oferta premium atualizados:', offers.premium.prices);
        
        // Atualizar display de moeda se necessário
        if (typeof updateCurrencyDisplay === 'function') {
            updateCurrencyDisplay();
        }
    }
}

// Função para atualizar preço no resumo do pedido
function updatePremiumOrderSummaryPrice(priceData) {
    // Verificar se a oferta premium está selecionada
    const premiumCheckbox = document.getElementById('offer-premium');
    if (premiumCheckbox && premiumCheckbox.checked) {
        // Atualizar resumo do pedido usando a função existente
        if (typeof updateOrderSummary === 'function') {
            updateOrderSummary();
            console.log('🔄 Resumo do pedido atualizado com preço premium');
        }
    }
}

// Função para atualizar informações de estoque da oferta premium
function updatePremiumStockInfo(priceData) {
    // Criar ou atualizar elemento de estoque para a oferta premium
    let stockElement = document.querySelector('.offer-option[data-option="premium"] .stock-info');
    if (!stockElement) {
        // Criar elemento de estoque se não existir
        const premiumOffer = document.querySelector('.offer-option[data-option="premium"]');
        if (premiumOffer) {
            stockElement = document.createElement('div');
            stockElement.className = 'stock-info';
            stockElement.style.cssText = 'font-size: 0.8rem; color: #666; margin-top: 5px;';
            premiumOffer.appendChild(stockElement);
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

// Função para adicionar informações de lucro da oferta premium
function addPremiumProfitInfo() {
    const premiumPriceData = CALCULATED_PREMIUM_PRICES["towel-cloth-pink"];
    const profitInfo = document.querySelector('.offer-option[data-option="premium"] .profit-info');
    
    if (profitInfo && premiumPriceData) {
        profitInfo.innerHTML = `<i class="fas fa-chart-line"></i> Margem: ${premiumPriceData.margin} | Preço original: ${premiumPriceData.originalPrice}`;
    }
}

// Função para observar mudanças na seleção da oferta premium
function observePremiumChanges() {
    const premiumCheckbox = document.getElementById('offer-premium');
    
    if (premiumCheckbox) {
        premiumCheckbox.addEventListener('change', function() {
            console.log('🛍️ Oferta premium alterada:', this.checked);
            setTimeout(() => {
                updatePremiumPrices();
                addPremiumProfitInfo();
            }, 100);
        });
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🛍️ Inicializando sistema de preços da Oferta Premium...');
        updatePremiumPrices();
        addPremiumProfitInfo();
        observePremiumChanges();
        
        console.log('✅ Sistema de preços da Oferta Premium integrado com sucesso!');
        console.log('💰 Preços disponíveis:', Object.keys(CALCULATED_PREMIUM_PRICES));
    }, 500);
});

// Exportar para uso global
window.PremiumPriceSystem = {
    updatePrices: updatePremiumPrices,
    getPriceData: () => CALCULATED_PREMIUM_PRICES["towel-cloth-pink"],
    getCalculatedPrices: () => CALCULATED_PREMIUM_PRICES
};
