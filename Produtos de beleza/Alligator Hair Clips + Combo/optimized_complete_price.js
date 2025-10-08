// Cálculo do preço otimizado para a Oferta Completa - 10pcsTouMing-blue
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

// Dados da oferta completa
const COMPLETE_DATA = {
    originalPrice: "$4.19", // Preço de compra no AliExpress
    originalPriceFull: "$4.80", // Preço original sem desconto
    stock: 10,
    productName: "10pcsTouMing-blue"
};

// Função para calcular preço mínimo lucrativo
function calculateMinimumProfitablePrice(originalPrice, targetMargin = 0.15) {
    const originalPriceValue = parseFloat(originalPrice.replace('$', ''));
    
    // Calcular custos fixos (taxas + custos fixos)
    const fixedCosts = ALIEXPRESS_FEES.fixedCosts + 0.30; // $0.30 da taxa de pagamento
    
    // Calcular preço mínimo considerando todas as taxas
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

console.log("🛍️ CÁLCULO DE PREÇO OTIMIZADO - OFERTA COMPLETA");
console.log("=" .repeat(60));

const priceCalc = calculateMinimumProfitablePrice(COMPLETE_DATA.originalPrice);

console.log(`\n${COMPLETE_DATA.productName.toUpperCase()}:`);
console.log(`  💵 Preço original: ${COMPLETE_DATA.originalPrice}`);
console.log(`  💸 Preço original completo: ${COMPLETE_DATA.originalPriceFull}`);
console.log(`  ⚠️  Preço mínimo: $${priceCalc.minimum.toFixed(2)}`);
console.log(`  ✅ Preço recomendado: $${priceCalc.recommended.toFixed(2)}`);
console.log(`  📈 Margem: 15%`);
console.log(`  📦 Estoque: ${COMPLETE_DATA.stock} unidades`);

// Análise de lucratividade com preço recomendado
console.log("\n💰 ANÁLISE DE LUCRATIVIDADE COM PREÇO RECOMENDADO:");
console.log("=" .repeat(60));

const sellingPrice = priceCalc.recommended;
const originalPrice = priceCalc.original;

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

console.log(`\n${COMPLETE_DATA.productName.toUpperCase()}:`);
console.log(`  💰 Lucro líquido: $${netProfit.toFixed(2)}`);
console.log(`  📊 Margem real: ${profitMargin.toFixed(2)}%`);
console.log(`  💸 Total taxas: $${totalFees.toFixed(2)}`);
console.log(`  📦 Lucro total potencial: $${(netProfit * COMPLETE_DATA.stock).toFixed(2)}`);

// Comparação com preço anterior
const oldPrice = 4.29; // Preço anterior calculado
const oldProfit = oldPrice - originalPrice - totalFees - ALIEXPRESS_FEES.fixedCosts;
const improvement = netProfit - oldProfit;

console.log("\n📊 COMPARAÇÃO COM PREÇO ANTERIOR:");
console.log("=" .repeat(40));
console.log(`  💵 Preço anterior: $${oldPrice.toFixed(2)}`);
console.log(`  💰 Lucro anterior: $${oldProfit.toFixed(2)}`);
console.log(`  📈 Melhoria: +$${improvement.toFixed(2)}`);
console.log(`  📊 Melhoria %: +${((improvement / oldProfit) * 100).toFixed(1)}%`);

// Preço final recomendado
const FINAL_COMPLETE_PRICE = {
    originalPrice: COMPLETE_DATA.originalPrice,
    profitPrice: `$${priceCalc.recommended.toFixed(2)}`,
    profitPriceBRL: `R$${(priceCalc.recommended * 5.27).toFixed(2)}`,
    margin: "15%",
    stock: COMPLETE_DATA.stock,
    productName: COMPLETE_DATA.productName,
    netProfit: netProfit,
    profitMargin: profitMargin,
    totalPotentialProfit: netProfit * COMPLETE_DATA.stock
};

console.log("\n🎯 PREÇO FINAL RECOMENDADO PARA IMPLEMENTAÇÃO:");
console.log("=" .repeat(60));
console.log(`💰 Preço otimizado: ${FINAL_COMPLETE_PRICE.profitPrice}`);
console.log(`💎 Preço em BRL: ${FINAL_COMPLETE_PRICE.profitPriceBRL}`);
console.log(`📊 Margem real: ${FINAL_COMPLETE_PRICE.profitMargin.toFixed(2)}%`);
console.log(`💵 Lucro por unidade: $${FINAL_COMPLETE_PRICE.netProfit.toFixed(2)}`);
console.log(`🎯 Lucro total potencial: $${FINAL_COMPLETE_PRICE.totalPotentialProfit.toFixed(2)}`);

// Exportar dados
export const OPTIMIZED_COMPLETE_PRICE = FINAL_COMPLETE_PRICE;

console.log("\n✅ Preço completo otimizado calculado com sucesso!");
console.log("💡 Preço garante margem mínima de 15%");
console.log("🎯 Preço é acessível e lucrativo");


