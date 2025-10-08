// Análise atualizada da Oferta Completa considerando o frete de $2.04
// Baseado nas taxas do AliExpress

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
    originalPrice: "$4.19", // Preço de compra no AliExpress
    shippingCost: "$2.04", // Custo de frete
    totalCost: 4.19 + 2.04, // Custo total (produto + frete)
    stock: 10,
    productName: "10pcsTouMing-blue",
    sellingPrice: "$8.06" // Preço otimizado calculado anteriormente
};

console.log("🛍️ ANÁLISE ATUALIZADA - OFERTA COMPLETA COM FRETE");
console.log("=" .repeat(60));

// Função para calcular breakdown das taxas
function calculateFeeBreakdown(sellingPrice) {
    const price = parseFloat(sellingPrice.replace('$', ''));
    
    return {
        commission: price * ALIEXPRESS_FEES.commissionRate,
        payment: (price * ALIEXPRESS_FEES.paymentProcessing) + 0.30,
        exchange: price * ALIEXPRESS_FEES.currencyExchange,
        withdrawal: price * ALIEXPRESS_FEES.withdrawalFee,
        marketing: price * ALIEXPRESS_FEES.marketingFee,
        fixed: ALIEXPRESS_FEES.fixedCosts,
        total: (price * (ALIEXPRESS_FEES.commissionRate + ALIEXPRESS_FEES.paymentProcessing + ALIEXPRESS_FEES.currencyExchange + ALIEXPRESS_FEES.withdrawalFee + ALIEXPRESS_FEES.marketingFee)) + 0.30 + ALIEXPRESS_FEES.fixedCosts
    };
}

// Análise com frete incluído
console.log("\n📦 BREAKDOWN DE CUSTOS - OFERTA COMPLETA:");
console.log("-" .repeat(50));

const productCost = parseFloat(COMPLETE_DATA_WITH_SHIPPING.originalPrice.replace('$', ''));
const shippingCost = parseFloat(COMPLETE_DATA_WITH_SHIPPING.shippingCost.replace('$', ''));
const totalCost = productCost + shippingCost;
const sellingPrice = parseFloat(COMPLETE_DATA_WITH_SHIPPING.sellingPrice.replace('$', ''));

console.log(`💵 Preço do produto: $${productCost.toFixed(2)}`);
console.log(`🚚 Custo do frete: $${shippingCost.toFixed(2)}`);
console.log(`💰 Custo total: $${totalCost.toFixed(2)}`);
console.log(`💸 Preço de venda: $${sellingPrice.toFixed(2)}`);

// Calcular taxas
const fees = calculateFeeBreakdown(COMPLETE_DATA_WITH_SHIPPING.sellingPrice);
console.log(`💸 Total taxas AliExpress: $${fees.total.toFixed(2)}`);

// Calcular lucro real
const totalCosts = totalCost + fees.total;
const netProfit = sellingPrice - totalCosts;
const profitMargin = (netProfit / sellingPrice) * 100;

console.log(`💸 Total custos (produto + frete + taxas): $${totalCosts.toFixed(2)}`);
console.log(`💰 Lucro líquido: $${netProfit.toFixed(2)}`);
console.log(`📊 Margem real: ${profitMargin.toFixed(2)}%`);

// Análise de rentabilidade
console.log("\n📊 ANÁLISE DE RENTABILIDADE:");
console.log("-" .repeat(40));

const totalPotentialProfit = netProfit * COMPLETE_DATA_WITH_SHIPPING.stock;
const profitPerUnit = netProfit;

console.log(`💵 Lucro por unidade: $${profitPerUnit.toFixed(2)}`);
console.log(`📦 Estoque disponível: ${COMPLETE_DATA_WITH_SHIPPING.stock} unidades`);
console.log(`🎯 Lucro total potencial: $${totalPotentialProfit.toFixed(2)}`);

// Comparação com análise anterior (sem considerar frete separadamente)
console.log("\n📈 COMPARAÇÃO COM ANÁLISE ANTERIOR:");
console.log("-" .repeat(50));

const previousAnalysis = {
    productCost: 4.19,
    sellingPrice: 8.06,
    profit: 1.71,
    totalProfit: 17.08
};

const currentAnalysis = {
    productCost: 4.19,
    shippingCost: 2.04,
    totalCost: 6.23,
    sellingPrice: 8.06,
    profit: netProfit,
    totalProfit: totalPotentialProfit
};

console.log("ANÁLISE ANTERIOR (sem frete separado):");
console.log(`  💵 Custo produto: $${previousAnalysis.productCost}`);
console.log(`  💸 Preço venda: $${previousAnalysis.sellingPrice}`);
console.log(`  💰 Lucro/unidade: $${previousAnalysis.profit}`);
console.log(`  🎯 Lucro total: $${previousAnalysis.totalProfit}`);

console.log("\nANÁLISE ATUAL (com frete separado):");
console.log(`  💵 Custo produto: $${currentAnalysis.productCost}`);
console.log(`  🚚 Custo frete: $${currentAnalysis.shippingCost}`);
console.log(`  💰 Custo total: $${currentAnalysis.totalCost}`);
console.log(`  💸 Preço venda: $${currentAnalysis.sellingPrice}`);
console.log(`  💰 Lucro/unidade: $${currentAnalysis.profit.toFixed(2)}`);
console.log(`  🎯 Lucro total: $${currentAnalysis.totalProfit.toFixed(2)}`);

const difference = currentAnalysis.profit - previousAnalysis.profit;
console.log(`\n📊 Diferença: $${difference.toFixed(2)} por unidade`);

// Recomendações
console.log("\n💡 RECOMENDAÇÕES:");
console.log("=" .repeat(20));

if (netProfit > 0) {
    console.log("✅ Oferta completa é lucrativa mesmo com frete separado!");
    console.log(`💰 Lucro por unidade: $${netProfit.toFixed(2)}`);
    console.log(`📈 Margem real: ${profitMargin.toFixed(2)}%`);
    
    if (profitMargin < 15) {
        console.log("⚠️  Margem baixa - considere ajustar preço se necessário");
    } else if (profitMargin > 20) {
        console.log("🎯 Margem excelente - produto muito lucrativo!");
    } else {
        console.log("👍 Margem saudável - produto bem posicionado");
    }
} else {
    console.log("❌ Oferta não é lucrativa com frete separado");
    console.log("💡 Considere aumentar o preço ou incluir frete no preço do produto");
}

// Breakdown detalhado das taxas
console.log("\n💸 BREAKDOWN DETALHADO DAS TAXAS:");
console.log("-" .repeat(40));

console.log(`🏪 Comissão AliExpress (6%): $${fees.commission.toFixed(3)}`);
console.log(`💳 Processamento pagamento (2.9% + $0.30): $${fees.payment.toFixed(3)}`);
console.log(`💱 Taxa de câmbio (2%): $${fees.exchange.toFixed(3)}`);
console.log(`💰 Taxa de retirada (1%): $${fees.withdrawal.toFixed(3)}`);
console.log(`📢 Marketing/PPC (5%): $${fees.marketing.toFixed(3)}`);
console.log(`📦 Custos fixos: $${fees.fixed.toFixed(2)}`);
console.log(`💸 TOTAL TAXAS: $${fees.total.toFixed(2)}`);

const totalTaxPercentage = (fees.total / sellingPrice) * 100;
console.log(`📊 % das taxas sobre o preço: ${totalTaxPercentage.toFixed(1)}%`);

// Exportar dados atualizados
export const UPDATED_COMPLETE_ANALYSIS = {
    productCost: productCost,
    shippingCost: shippingCost,
    totalCost: totalCost,
    sellingPrice: sellingPrice,
    fees: fees,
    netProfit: netProfit,
    profitMargin: profitMargin,
    totalPotentialProfit: totalPotentialProfit,
    stock: COMPLETE_DATA_WITH_SHIPPING.stock,
    isProfitable: netProfit > 0
};

console.log("\n✅ Análise atualizada concluída!");
console.log("💡 Frete de $2.04 foi considerado na análise de rentabilidade");


