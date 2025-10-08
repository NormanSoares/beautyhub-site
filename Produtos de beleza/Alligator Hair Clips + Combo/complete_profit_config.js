// Configuração de preços e margens para a Oferta Completa - 10pcsTouMing-blue
export const COMPLETE_PRICES = {
    "10pcsTouMing-blue": {
        originalPrice: "$4.19", // Preço atual no AliExpress
        originalPriceFull: "$4.80", // Preço original sem desconto (estimado)
        margin: "15%", // Margem de lucro otimizada
        stock: 10, // Estoque disponível
        productName: "10pcsTouMing-blue",
        description: "10 peças de grampos transparentes azuis"
    }
};

export const COMPLETE_PROFIT_SETTINGS = {
    fixedCosts: 0.50, // Custo fixo por item em USD
    exchangeRate: 5.27, // Taxa de câmbio USD para BRL
    shippingCost: 1.99, // Custo de envio em USD
    discountApplied: 12.7 // Desconto aplicado no AliExpress (estimado)
};

// Função para calcular o preço com lucro para a oferta completa
export function calculateCompleteProfitPrice(originalPrice, marginPercentage, fixedCosts, exchangeRate) {
    // Remover o símbolo de moeda e converter para número
    const priceValue = parseFloat(originalPrice.replace('$', ''));

    // Descontar comissões e taxas (estimado em 25%)
    const netPrice = priceValue * (1 - 0.25);

    // Adicionar custos fixos
    const priceWithFixedCosts = netPrice + fixedCosts;

    // Aplicar margem de lucro
    const profitPriceUSD = priceWithFixedCosts / (1 - (marginPercentage / 100));

    // Converter para BRL
    const profitPriceBRL = profitPriceUSD * exchangeRate;

    return {
        usd: `$${profitPriceUSD.toFixed(2)}`,
        brl: `R$${profitPriceBRL.toFixed(2)}`
    };
}

// Calcular preços com margem de lucro
export const CALCULATED_COMPLETE_PRICES = {};
Object.entries(COMPLETE_PRICES).forEach(([productKey, data]) => {
    const { originalPrice, margin, stock } = data;
    const { usd, brl } = calculateCompleteProfitPrice(
        originalPrice,
        parseFloat(margin),
        COMPLETE_PROFIT_SETTINGS.fixedCosts,
        COMPLETE_PROFIT_SETTINGS.exchangeRate
    );
    
    CALCULATED_COMPLETE_PRICES[productKey] = {
        originalPrice: originalPrice,
        profitPrice: usd,
        profitPriceBRL: brl,
        margin: margin,
        stock: stock,
        productName: data.productName,
        description: data.description
    };
});

console.log("💰 Preços calculados para a Oferta Completa:");
console.table(Object.entries(CALCULATED_COMPLETE_PRICES).map(([key, data]) => ({
    Produto: data.productName,
    'Preço Original': data.originalPrice,
    'Preço com Lucro (USD)': data.profitPrice,
    'Preço com Lucro (BRL)': data.profitPriceBRL,
    Margem: `${data.margin}%`,
    Estoque: data.stock
})));


