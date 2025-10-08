import { PREMIUM_PRICES, PREMIUM_PROFIT_SETTINGS } from './premium_profit_config.js';

// Função para calcular o preço com lucro
function calculateProfitPrice(originalPrice, marginPercentage, fixedCosts, exchangeRate) {
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

// Exemplo de uso com os dados da oferta premium
console.log("💰 Preços calculados para a Oferta Premium - Towel cloth-pink:");
const calculatedPrices = Object.entries(PREMIUM_PRICES).map(([productKey, data]) => {
    const { originalPrice, margin, stock, productName } = data;
    const { usd, brl } = calculateProfitPrice(
        originalPrice, 
        parseFloat(margin), 
        PREMIUM_PROFIT_SETTINGS.fixedCosts, 
        PREMIUM_PROFIT_SETTINGS.exchangeRate
    );

    return {
        Produto: productName,
        'Preço Original': originalPrice,
        'Preço com Lucro (USD)': usd,
        'Preço com Lucro (BRL)': brl,
        Margem: `${margin}%`,
        Estoque: stock,
        'Desconto AliExpress': `${PREMIUM_PROFIT_SETTINGS.discountApplied}%`
    };
});

console.table(calculatedPrices);

// Análise de lucratividade
console.log("\n📊 Análise de Lucratividade:");
const product = PREMIUM_PRICES["towel-cloth-pink"];
const profitData = calculatedPrices[0];

const originalPriceValue = parseFloat(product.originalPrice.replace('$', ''));
const profitPriceValue = parseFloat(profitData['Preço com Lucro (USD)'].replace('$', ''));
const profitPerUnit = profitPriceValue - originalPriceValue;
const profitPercentage = ((profitPerUnit / originalPriceValue) * 100).toFixed(1);

console.log(`💵 Preço de compra: ${product.originalPrice}`);
console.log(`💸 Preço de venda: ${profitData['Preço com Lucro (USD)']}`);
console.log(`📈 Lucro por unidade: $${profitPerUnit.toFixed(2)}`);
console.log(`📊 Margem de lucro: ${profitPercentage}%`);
console.log(`📦 Estoque disponível: ${product.stock} unidades`);
console.log(`💰 Lucro potencial total: $${(profitPerUnit * product.stock).toFixed(2)}`);

// Exportar dados para uso em outros arquivos
export const PREMIUM_CALCULATED_DATA = {
    productName: product.productName,
    originalPrice: product.originalPrice,
    profitPrice: profitData['Preço com Lucro (USD)'],
    profitPriceBRL: profitData['Preço com Lucro (BRL)'],
    profitPerUnit: profitPerUnit,
    profitPercentage: profitPercentage,
    stock: product.stock,
    totalProfitPotential: profitPerUnit * product.stock
};


