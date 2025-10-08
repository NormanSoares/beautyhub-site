// Cálculo de preços otimizados para todas as cores da oferta básica
// Considerando taxas do AliExpress para garantir lucratividade

// Taxas do AliExpress
const ALIEXPRESS_FEES = {
    commissionRate: 0.06, // 6% - comissão do AliExpress
    paymentProcessing: 0.029, // 2.9% + $0.30 por transação
    currencyExchange: 0.02, // 2% para conversões de moeda
    withdrawalFee: 0.01, // 1% para retirada de fundos
    marketingFee: 0.05, // 5% se usar anúncios pagos
    fixedCosts: 0.50 // Custos fixos por item
};

// Preços originais de cada cor (do AliExpress)
const ORIGINAL_COLOR_PRICES = {
    "nude-pink": "$1.39",
    "black": "$2.84", 
    "yellow": "$3.13",
    "purple": "$3.11",
    "green": "$2.75",
    "pink": "$2.97",
    "red": "$2.86"
};

// Função para calcular preço mínimo lucrativo
function calculateMinimumProfitablePrice(originalPrice, targetMargin = 0.15) {
    const originalPriceValue = parseFloat(originalPrice.replace('$', ''));
    
    // Calcular custos fixos (taxas + custos fixos)
    const fixedCosts = ALIEXPRESS_FEES.fixedCosts + 0.30; // $0.30 da taxa de pagamento
    
    // Calcular preço mínimo considerando todas as taxas
    // Fórmula: (Custo + Custos Fixos) / (1 - Taxas - Margem)
    const totalTaxRate = ALIEXPRESS_FEES.commissionRate + 
                        ALIEXPRESS_FEES.paymentProcessing + 
                        ALIEXPRESS_FEES.currencyExchange + 
                        ALIEXPRESS_FEES.withdrawalFee + 
                        ALIEXPRESS_FEES.marketingFee;
    
    const minimumPrice = (originalPriceValue + fixedCosts) / (1 - totalTaxRate - targetMargin);
    
    return {
        minimum: minimumPrice,
        recommended: minimumPrice * 1.1, // 10% a mais para margem de segurança
        original: originalPriceValue
    };
}

// Calcular preços otimizados para cada cor
const OPTIMIZED_PRICES = {};

console.log("🎨 CÁLCULO DE PREÇOS OTIMIZADOS - OFERTA BÁSICA");
console.log("=" .repeat(60));

Object.entries(ORIGINAL_COLOR_PRICES).forEach(([color, originalPrice]) => {
    const priceCalc = calculateMinimumProfitablePrice(originalPrice);
    
    OPTIMIZED_PRICES[color] = {
        originalPrice: originalPrice,
        minimumPrice: `$${priceCalc.minimum.toFixed(2)}`,
        recommendedPrice: `$${priceCalc.recommended.toFixed(2)}`,
        originalValue: priceCalc.original,
        minimumValue: priceCalc.minimum,
        recommendedValue: priceCalc.recommended,
        margin: 0.15 // 15% de margem mínima
    };
    
    console.log(`\n${color.toUpperCase()}:`);
    console.log(`  💵 Preço original: ${originalPrice}`);
    console.log(`  ⚠️  Preço mínimo: ${OPTIMIZED_PRICES[color].minimumPrice}`);
    console.log(`  ✅ Preço recomendado: ${OPTIMIZED_PRICES[color].recommendedPrice}`);
    console.log(`  📈 Margem: 15%`);
});

// Criar tabela comparativa
console.log("\n📊 TABELA COMPARATIVA DE PREÇOS:");
console.log("=" .repeat(80));

const comparisonTable = Object.entries(OPTIMIZED_PRICES).map(([color, data]) => ({
    Cor: color.charAt(0).toUpperCase() + color.slice(1),
    'Preço Original': data.originalPrice,
    'Preço Mínimo': data.minimumPrice,
    'Preço Recomendado': data.recommendedPrice,
    'Aumento %': `${(((data.recommendedValue - data.originalValue) / data.originalValue) * 100).toFixed(1)}%`
}));

console.table(comparisonTable);

// Análise de lucratividade com preços recomendados
console.log("\n💰 ANÁLISE DE LUCRATIVIDADE COM PREÇOS RECOMENDADOS:");
console.log("=" .repeat(60));

Object.entries(OPTIMIZED_PRICES).forEach(([color, data]) => {
    const sellingPrice = data.recommendedValue;
    const originalPrice = data.originalValue;
    
    // Calcular taxas
    const commissionFee = sellingPrice * ALIEXPRESS_FEES.commissionRate;
    const paymentFee = (sellingPrice * ALIEXPRESS_FEES.paymentProcessing) + 0.30;
    const exchangeFee = sellingPrice * ALIEXPRESS_FEES.currencyExchange;
    const withdrawalFee = sellingPrice * ALIEXPRESS_FEES.withdrawalFee;
    const marketingFee = sellingPrice * ALIEXPRESS_FEES.marketingFee;
    
    const totalFees = commissionFee + paymentFee + exchangeFee + withdrawalFee + marketingFee;
    const totalCosts = originalPrice + totalFees + ALIEXPRESS_FEES.fixedCosts;
    const netProfit = sellingPrice - totalCosts;
    const profitMargin = (netProfit / sellingPrice) * 100;
    
    console.log(`\n${color.toUpperCase()}:`);
    console.log(`  💰 Lucro líquido: $${netProfit.toFixed(2)}`);
    console.log(`  📊 Margem real: ${profitMargin.toFixed(2)}%`);
    console.log(`  💸 Total taxas: $${totalFees.toFixed(2)}`);
});

// Preços finais recomendados para implementação
console.log("\n🎯 PREÇOS FINAIS RECOMENDADOS PARA IMPLEMENTAÇÃO:");
console.log("=" .repeat(60));

const FINAL_PRICES = {};
Object.entries(OPTIMIZED_PRICES).forEach(([color, data]) => {
    FINAL_PRICES[color] = {
        originalPrice: data.originalPrice,
        profitPrice: data.recommendedPrice,
        profitPriceBRL: `R$${(data.recommendedValue * 5.27).toFixed(2)}`,
        margin: "15%",
        stock: color === "nude-pink" ? 6 : 
               color === "black" ? 4 :
               color === "yellow" ? 15 :
               color === "purple" ? 17 :
               color === "green" ? 12 :
               color === "pink" ? 10 : 15 // red
    };
    
    console.log(`${color}: ${data.recommendedPrice} (${FINAL_PRICES[color].profitPriceBRL})`);
});

// Exportar dados para uso em outros arquivos
export const OPTIMIZED_BASIC_PRICES = FINAL_PRICES;

console.log("\n✅ Preços otimizados calculados com sucesso!");
console.log("💡 Todos os preços garantem margem mínima de 15%");
console.log("🎯 Preços são acessíveis e lucrativos");


