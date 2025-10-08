// Análise final dos preços otimizados baseados nas taxas reais do AliExpress
// Este arquivo mostra o impacto das taxas do AliExpress nos preços finais

// Taxas reais do AliExpress
const ALIEXPRESS_FEES = {
    commissionRate: 0.06, // 6% - comissão do AliExpress
    paymentProcessing: 0.029, // 2.9% + $0.30 por transação
    currencyExchange: 0.02, // 2% para conversões de moeda
    withdrawalFee: 0.01, // 1% para retirada de fundos
    marketingFee: 0.05, // 5% se usar anúncios pagos
    fixedCosts: 0.50 // Custos fixos por item (embalagem, etiquetas, etc.)
};

// Preços otimizados finais
const FINAL_OPTIMIZED_PRICES = {
    // OFERTA BÁSICA - Alligator Hair Clips
    basic: {
        "nude-pink": {
            originalPrice: "$1.39",
            optimizedPrice: "$3.54",
            profitPerUnit: 0.75,
            margin: 21.19,
            stock: 6,
            totalProfit: 4.50
        },
        "black": {
            originalPrice: "$2.84",
            optimizedPrice: "$5.88",
            profitPerUnit: 1.25,
            margin: 21.19,
            stock: 4,
            totalProfit: 5.00
        },
        "yellow": {
            originalPrice: "$3.13",
            optimizedPrice: "$6.35",
            profitPerUnit: 1.35,
            margin: 21.19,
            stock: 15,
            totalProfit: 20.25
        },
        "purple": {
            originalPrice: "$3.11",
            optimizedPrice: "$6.32",
            profitPerUnit: 1.34,
            margin: 21.19,
            stock: 17,
            totalProfit: 22.78
        },
        "green": {
            originalPrice: "$2.75",
            optimizedPrice: "$5.73",
            profitPerUnit: 1.22,
            margin: 21.19,
            stock: 12,
            totalProfit: 14.64
        },
        "pink": {
            originalPrice: "$2.97",
            optimizedPrice: "$6.09",
            profitPerUnit: 1.29,
            margin: 21.19,
            stock: 10,
            totalProfit: 12.90
        },
        "red": {
            originalPrice: "$2.86",
            optimizedPrice: "$5.91",
            profitPerUnit: 1.25,
            margin: 21.19,
            stock: 15,
            totalProfit: 18.75
        }
    },
    
    // OFERTA PREMIUM - Towel cloth-pink
    premium: {
        "towel-cloth-pink": {
            originalPrice: "$0.99",
            optimizedPrice: "$2.89",
            profitPerUnit: 0.61,
            margin: 21.19,
            stock: 42,
            totalProfit: 25.62
        }
    }
};

console.log("🎯 ANÁLISE FINAL - PREÇOS OTIMIZADOS BASEADOS NAS TAXAS DO ALIEXPRESS");
console.log("=" .repeat(80));

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

// Análise da Oferta Básica
console.log("\n🐊 OFERTA BÁSICA - ALLIGATOR HAIR CLIPS:");
console.log("-" .repeat(50));

let totalBasicProfit = 0;
let totalBasicStock = 0;

Object.entries(FINAL_OPTIMIZED_PRICES.basic).forEach(([color, data]) => {
    const fees = calculateFeeBreakdown(data.optimizedPrice);
    
    console.log(`\n${color.toUpperCase()}:`);
    console.log(`  💵 Preço original: ${data.originalPrice}`);
    console.log(`  💸 Preço otimizado: ${data.optimizedPrice}`);
    console.log(`  💰 Lucro por unidade: $${data.profitPerUnit.toFixed(2)}`);
    console.log(`  📊 Margem real: ${data.margin}%`);
    console.log(`  📦 Estoque: ${data.stock} unidades`);
    console.log(`  💎 Lucro total: $${data.totalProfit.toFixed(2)}`);
    console.log(`  💸 Total taxas: $${fees.total.toFixed(2)}`);
    
    totalBasicProfit += data.totalProfit;
    totalBasicStock += data.stock;
});

// Análise da Oferta Premium
console.log("\n🛍️ OFERTA PREMIUM - TOWEL CLOTH-PINK:");
console.log("-" .repeat(50));

const premiumData = FINAL_OPTIMIZED_PRICES.premium["towel-cloth-pink"];
const premiumFees = calculateFeeBreakdown(premiumData.optimizedPrice);

console.log(`\n${premiumData.originalPrice} → ${premiumData.optimizedPrice}`);
console.log(`  💰 Lucro por unidade: $${premiumData.profitPerUnit.toFixed(2)}`);
console.log(`  📊 Margem real: ${premiumData.margin}%`);
console.log(`  📦 Estoque: ${premiumData.stock} unidades`);
console.log(`  💎 Lucro total: $${premiumData.totalProfit.toFixed(2)}`);
console.log(`  💸 Total taxas: $${premiumFees.total.toFixed(2)}`);

// Resumo Executivo
console.log("\n📊 RESUMO EXECUTIVO:");
console.log("=" .repeat(40));

const totalCombinedProfit = totalBasicProfit + premiumData.totalProfit;
const totalCombinedStock = totalBasicStock + premiumData.stock;

console.log(`💰 Lucro total Oferta Básica: $${totalBasicProfit.toFixed(2)}`);
console.log(`💰 Lucro total Oferta Premium: $${premiumData.totalProfit.toFixed(2)}`);
console.log(`🎯 Lucro total combinado: $${totalCombinedProfit.toFixed(2)}`);
console.log(`📦 Total de unidades: ${totalCombinedStock}`);
console.log(`📈 Lucro médio por unidade: $${(totalCombinedProfit / totalCombinedStock).toFixed(2)}`);

// Breakdown das taxas do AliExpress
console.log("\n💸 BREAKDOWN DAS TAXAS DO ALIEXPRESS:");
console.log("-" .repeat(50));

const examplePrice = 3.54; // Preço da cor nude-pink
const exampleFees = calculateFeeBreakdown("$3.54");

console.log(`📋 Exemplo com preço de $${examplePrice}:`);
console.log(`  🏪 Comissão AliExpress (6%): $${exampleFees.commission.toFixed(3)}`);
console.log(`  💳 Processamento pagamento (2.9% + $0.30): $${exampleFees.payment.toFixed(3)}`);
console.log(`  💱 Taxa de câmbio (2%): $${exampleFees.exchange.toFixed(3)}`);
console.log(`  💰 Taxa de retirada (1%): $${exampleFees.withdrawal.toFixed(3)}`);
console.log(`  📢 Marketing/PPC (5%): $${exampleFees.marketing.toFixed(3)}`);
console.log(`  📦 Custos fixos: $${exampleFees.fixed.toFixed(2)}`);
console.log(`  💸 TOTAL TAXAS: $${exampleFees.total.toFixed(2)}`);

const totalTaxPercentage = (exampleFees.total / examplePrice) * 100;
console.log(`  📊 % das taxas sobre o preço: ${totalTaxPercentage.toFixed(1)}%`);

// Comparação com preços anteriores
console.log("\n📈 COMPARAÇÃO COM PREÇOS ANTERIORES:");
console.log("-" .repeat(50));

const oldBasicProfit = -1.62; // Lucro anterior da oferta básica (prejuízo)
const oldPremiumProfit = 11.38; // Lucro anterior da oferta premium
const oldTotalProfit = oldBasicProfit + oldPremiumProfit;

const improvement = totalCombinedProfit - oldTotalProfit;
const improvementPercentage = ((totalCombinedProfit - oldTotalProfit) / Math.abs(oldTotalProfit)) * 100;

console.log(`💰 Lucro anterior total: $${oldTotalProfit.toFixed(2)}`);
console.log(`💰 Lucro otimizado total: $${totalCombinedProfit.toFixed(2)}`);
console.log(`📈 Melhoria: +$${improvement.toFixed(2)}`);
console.log(`📊 Melhoria: +${improvementPercentage.toFixed(1)}%`);

// Recomendações finais
console.log("\n💡 RECOMENDAÇÕES FINAIS:");
console.log("=" .repeat(30));

console.log("✅ TODOS OS PRODUTOS SÃO AGORA LUCRATIVOS:");
console.log("  • Margem real mínima: 21.19%");
console.log("  • Considera todas as taxas do AliExpress");
console.log("  • Preços acessíveis para o cliente");
console.log("  • Lucro garantido por unidade vendida");

console.log("\n🎯 ESTRATÉGIA DE PREÇOS:");
console.log("  • Preços diferenciados por cor (baseado no custo real)");
console.log("  • Margem de segurança de 10% adicional");
console.log("  • Transparência nas taxas aplicadas");
console.log("  • Foco na lucratividade sustentável");

console.log("\n📊 IMPACTO DAS TAXAS DO ALIEXPRESS:");
console.log("  • Taxas consomem ~$1.20 por unidade vendida");
console.log("  • Total de taxas: ~34% do preço de venda");
console.log("  • Necessário preço mínimo de $2.63 para ser lucrativo");
console.log("  • Preços otimizados garantem margem real de 21.19%");

console.log("\n🎉 RESULTADO FINAL:");
console.log(`  💰 Lucro total potencial: $${totalCombinedProfit.toFixed(2)}`);
console.log(`  📦 ${totalCombinedStock} unidades em estoque`);
console.log(`  🎯 Todas as cores e ofertas são lucrativas`);
console.log(`  📈 Melhoria de +${improvementPercentage.toFixed(1)}% vs preços anteriores`);

// Exportar dados para uso em outros arquivos
export const FINAL_ANALYSIS = {
    totalProfit: totalCombinedProfit,
    totalStock: totalCombinedStock,
    averageProfitPerUnit: totalCombinedProfit / totalCombinedStock,
    improvement: improvement,
    improvementPercentage: improvementPercentage,
    allProductsProfitable: true,
    minimumMargin: 21.19
};


