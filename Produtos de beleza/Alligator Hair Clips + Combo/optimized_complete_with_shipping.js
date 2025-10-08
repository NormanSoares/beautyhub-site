// Cálculo do preço otimizado para a Oferta Completa considerando o frete de $2.04
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

// Dados da oferta completa com frete
const COMPLETE_DATA_WITH_SHIPPING = {
    productCost: 4.19, // Preço de compra do produto
    shippingCost: 2.04, // Custo de frete
    totalCost: 4.19 + 2.04, // Custo total (produto + frete)
    stock: 10,
    productName: "10pcsTouMing-blue"
};

// Função para calcular preço mínimo lucrativo considerando frete
function calculateMinimumProfitablePriceWithShipping(productCost, shippingCost, targetMargin = 0.15) {
    const totalCost = productCost + shippingCost;
    
    // Calcular custos fixos (taxas + custos fixos)
    const fixedCosts = ALIEXPRESS_FEES.fixedCosts + 0.30; // $0.30 da taxa de pagamento
    
    // Calcular preço mínimo considerando todas as taxas
    const totalTaxRate = ALIEXPRESS_FEES.commissionRate + 
                        ALIEXPRESS_FEES.paymentProcessing + 
                        ALIEXPRESS_FEES.currencyExchange + 
                        ALIEXPRESS_FEES.withdrawalFee + 
                        ALIEXPRESS_FEES.marketingFee;
    
    const minimumPrice = (totalCost + fixedCosts) / (1 - totalTaxRate - targetMargin);
    
    return {
        minimum: minimumPrice,
        recommended: minimumPrice * 1.1, // 10% a mais para margem de segurança
        totalCost: totalCost
    };
}

console.log("🛍️ CÁLCULO DE PREÇO OTIMIZADO - OFERTA COMPLETA COM FRETE");
console.log("=" .repeat(70));

const priceCalc = calculateMinimumProfitablePriceWithShipping(
    COMPLETE_DATA_WITH_SHIPPING.productCost, 
    COMPLETE_DATA_WITH_SHIPPING.shippingCost
);

console.log(`\n${COMPLETE_DATA_WITH_SHIPPING.productName.toUpperCase()}:`);
console.log(`  💵 Custo do produto: $${COMPLETE_DATA_WITH_SHIPPING.productCost.toFixed(2)}`);
console.log(`  🚚 Custo do frete: $${COMPLETE_DATA_WITH_SHIPPING.shippingCost.toFixed(2)}`);
console.log(`  💰 Custo total: $${priceCalc.totalCost.toFixed(2)}`);
console.log(`  ⚠️  Preço mínimo: $${priceCalc.minimum.toFixed(2)}`);
console.log(`  ✅ Preço recomendado: $${priceCalc.recommended.toFixed(2)}`);
console.log(`  📈 Margem: 15%`);
console.log(`  📦 Estoque: ${COMPLETE_DATA_WITH_SHIPPING.stock} unidades`);

// Análise de lucratividade com preço recomendado
console.log("\n💰 ANÁLISE DE LUCRATIVIDADE COM PREÇO RECOMENDADO:");
console.log("=" .repeat(70));

const sellingPrice = priceCalc.recommended;
const totalCost = priceCalc.totalCost;

// Calcular taxas
const commissionFee = sellingPrice * ALIEXPRESS_FEES.commissionRate;
const paymentFee = (sellingPrice * ALIEXPRESS_FEES.paymentProcessing) + 0.30;
const exchangeFee = sellingPrice * ALIEXPRESS_FEES.currencyExchange;
const withdrawalFee = sellingPrice * ALIEXPRESS_FEES.withdrawalFee;
const marketingFee = sellingPrice * ALIEXPRESS_FEES.marketingFee;

const totalFees = commissionFee + paymentFee + exchangeFee + withdrawalFee + marketingFee;
const totalCosts = totalCost + totalFees + ALIEXPRESS_FEES.fixedCosts;
const netProfit = sellingPrice - totalCosts;
const profitMargin = (netProfit / sellingPrice) * 100;

console.log(`\n${COMPLETE_DATA_WITH_SHIPPING.productName.toUpperCase()}:`);
console.log(`  💰 Lucro líquido: $${netProfit.toFixed(2)}`);
console.log(`  📊 Margem real: ${profitMargin.toFixed(2)}%`);
console.log(`  💸 Total taxas: $${totalFees.toFixed(2)}`);
console.log(`  📦 Lucro total potencial: $${(netProfit * COMPLETE_DATA_WITH_SHIPPING.stock).toFixed(2)}`);

// Comparação com preço anterior
const oldPrice = 8.06; // Preço anterior
const oldProfit = -0.33; // Lucro anterior (prejuízo)
const improvement = netProfit - oldProfit;

console.log("\n📊 COMPARAÇÃO COM PREÇO ANTERIOR:");
console.log("=" .repeat(50));
console.log(`  💵 Preço anterior: $${oldPrice.toFixed(2)}`);
console.log(`  💰 Lucro anterior: $${oldProfit.toFixed(2)} (PREJUÍZO!)`);
console.log(`  📈 Melhoria: +$${improvement.toFixed(2)}`);
console.log(`  📊 Melhoria %: +${((improvement / Math.abs(oldProfit)) * 100).toFixed(1)}%`);

// Preço final recomendado
const FINAL_COMPLETE_PRICE_WITH_SHIPPING = {
    productCost: COMPLETE_DATA_WITH_SHIPPING.productCost,
    shippingCost: COMPLETE_DATA_WITH_SHIPPING.shippingCost,
    totalCost: priceCalc.totalCost,
    profitPrice: `$${priceCalc.recommended.toFixed(2)}`,
    profitPriceBRL: `R$${(priceCalc.recommended * 5.27).toFixed(2)}`,
    margin: "15%",
    stock: COMPLETE_DATA_WITH_SHIPPING.stock,
    productName: COMPLETE_DATA_WITH_SHIPPING.productName,
    netProfit: netProfit,
    profitMargin: profitMargin,
    totalPotentialProfit: netProfit * COMPLETE_DATA_WITH_SHIPPING.stock
};

console.log("\n🎯 PREÇO FINAL RECOMENDADO PARA IMPLEMENTAÇÃO:");
console.log("=" .repeat(70));
console.log(`💰 Preço otimizado: ${FINAL_COMPLETE_PRICE_WITH_SHIPPING.profitPrice}`);
console.log(`💎 Preço em BRL: ${FINAL_COMPLETE_PRICE_WITH_SHIPPING.profitPriceBRL}`);
console.log(`📊 Margem real: ${FINAL_COMPLETE_PRICE_WITH_SHIPPING.profitMargin.toFixed(2)}%`);
console.log(`💵 Lucro por unidade: $${FINAL_COMPLETE_PRICE_WITH_SHIPPING.netProfit.toFixed(2)}`);
console.log(`🎯 Lucro total potencial: $${FINAL_COMPLETE_PRICE_WITH_SHIPPING.totalPotentialProfit.toFixed(2)}`);

// Breakdown detalhado
console.log("\n💸 BREAKDOWN DETALHADO:");
console.log("-" .repeat(40));
console.log(`💵 Custo produto: $${COMPLETE_DATA_WITH_SHIPPING.productCost.toFixed(2)}`);
console.log(`🚚 Custo frete: $${COMPLETE_DATA_WITH_SHIPPING.shippingCost.toFixed(2)}`);
console.log(`💰 Custo total: $${priceCalc.totalCost.toFixed(2)}`);
console.log(`🏪 Comissão AliExpress (6%): $${commissionFee.toFixed(3)}`);
console.log(`💳 Processamento pagamento (2.9% + $0.30): $${paymentFee.toFixed(3)}`);
console.log(`💱 Taxa de câmbio (2%): $${exchangeFee.toFixed(3)}`);
console.log(`💰 Taxa de retirada (1%): $${withdrawalFee.toFixed(3)}`);
console.log(`📢 Marketing/PPC (5%): $${marketingFee.toFixed(3)}`);
console.log(`📦 Custos fixos: $${ALIEXPRESS_FEES.fixedCosts.toFixed(2)}`);
console.log(`💸 TOTAL TAXAS: $${totalFees.toFixed(2)}`);
console.log(`💸 TOTAL CUSTOS: $${totalCosts.toFixed(2)}`);
console.log(`💸 PREÇO VENDA: $${sellingPrice.toFixed(2)}`);
console.log(`💰 LUCRO LÍQUIDO: $${netProfit.toFixed(2)}`);

// Exportar dados
export const OPTIMIZED_COMPLETE_PRICE_WITH_SHIPPING = FINAL_COMPLETE_PRICE_WITH_SHIPPING;

console.log("\n✅ Preço completo otimizado com frete calculado com sucesso!");
console.log("💡 Preço garante margem mínima de 15% considerando frete");
console.log("🎯 Preço é acessível e lucrativo");


