// Configuração de preços e margens para a Oferta Premium - Towel cloth-pink
export const PREMIUM_PRICES = {
    "towel-cloth-pink": {
        originalPrice: "$0.99", // Preço atual no AliExpress
        originalPriceFull: "$6.34", // Preço original sem desconto
        margin: "15%", // Margem de lucro otimizada
        stock: 42, // Estoque disponível
        productName: "Towel cloth-pink",
        description: "Toalha de cabelo em tecido rosa"
    }
};

export const PREMIUM_PROFIT_SETTINGS = {
    fixedCosts: 0.50, // Custo fixo por item em USD
    exchangeRate: 5.27, // Taxa de câmbio USD para BRL
    shippingCost: 1.99, // Custo de envio em USD
    discountApplied: 84.4 // Desconto aplicado no AliExpress (84.4%)
};

// Função para calcular o preço com lucro para a oferta premium
export function calculatePremiumProfitPrice(originalPrice, marginPercentage, fixedCosts, exchangeRate) {
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
export const CALCULATED_PREMIUM_PRICES = {};
Object.entries(PREMIUM_PRICES).forEach(([productKey, data]) => {
    const { originalPrice, margin, stock } = data;
    const { usd, brl } = calculatePremiumProfitPrice(
        originalPrice,
        parseFloat(margin),
        PREMIUM_PROFIT_SETTINGS.fixedCosts,
        PREMIUM_PROFIT_SETTINGS.exchangeRate
    );
    
    CALCULATED_PREMIUM_PRICES[productKey] = {
        originalPrice: originalPrice,
        profitPrice: usd,
        profitPriceBRL: brl,
        margin: margin,
        stock: stock,
        productName: data.productName,
        description: data.description
    };
});

console.log("💰 Preços calculados para a Oferta Premium:");
console.table(Object.entries(CALCULATED_PREMIUM_PRICES).map(([key, data]) => ({
    Produto: data.productName,
    'Preço Original': data.originalPrice,
    'Preço com Lucro (USD)': data.profitPrice,
    'Preço com Lucro (BRL)': data.profitPriceBRL,
    Margem: `${data.margin}%`,
    Estoque: data.stock
})));
