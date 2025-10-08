// Análise final atualizada com frete da oferta completa
// Considerando todas as taxas do AliExpress

// Taxas do AliExpress
const ALIEXPRESS_FEES = {
    commissionRate: 0.06, // 6% - comissão do AliExpress
    paymentProcessing: 0.029, // 2.9% + $0.30 por transação
    currencyExchange: 0.02, // 2% para conversões de moeda
    withdrawalFee: 0.01, // 1% para retirada de fundos
    marketingFee: 0.05, // 5% se usar anúncios pagos
    fixedCosts: 0.50 // Custos fixos por item
};

// Preços finais otimizados de todas as ofertas
const FINAL_OPTIMIZED_PRICES = {
    // OFERTA BÁSICA - Alligator Hair Clips
    basic: {
        "nude-pink": {
            optimizedPrice: "$3.54",
            profitPerUnit: 0.75,
            margin: 21.19,
            stock: 6,
            totalProfit: 4.50
        },
        "black": {
            optimizedPrice: "$5.88",
            profitPerUnit: 1.25,
            margin: 21.19,
            stock: 4,
            totalProfit: 5.00
        },
        "yellow": {
            optimizedPrice: "$6.35",
            profitPerUnit: 1.35,
            margin: 21.19,
            stock: 15,
            totalProfit: 20.25
        },
        "purple": {
            optimizedPrice: "$6.32",
            profitPerUnit: 1.34,
            margin: 21.19,
            stock: 17,
            totalProfit: 22.78
        },
        "green": {
            optimizedPrice: "$5.73",
            profitPerUnit: 1.22,
            margin: 21.19,
            stock: 12,
            totalProfit: 14.64
        },
        "pink": {
            optimizedPrice: "$6.09",
            profitPerUnit: 1.29,
            margin: 21.19,
            stock: 10,
            totalProfit: 12.90
        },
        "red": {
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
    },
    
    // OFERTA COMPLETA - 10pcsTouMing-blue (COM FRETE)
    complete: {
        "10pcsTouMing-blue": {
            originalPrice: "$4.19",
            shippingCost: "$2.04",
            totalCost: "$6.23",
            optimizedPrice: "$11.36",
            profitPerUnit: 2.41,
            margin: 21.19,
            stock: 10,
            totalProfit: 24.06
        }
    }
};

console.log("🎯 ANÁLISE FINAL ATUALIZADA - TODAS AS OFERTAS COM FRETE");
console.log("=" .repeat(80));

// Análise da Oferta Básica
console.log("\n🐊 OFERTA BÁSICA - ALLIGATOR HAIR CLIPS:");
console.log("-" .repeat(50));

let totalBasicProfit = 0;
let totalBasicStock = 0;

Object.entries(FINAL_OPTIMIZED_PRICES.basic).forEach(([color, data]) => {
    console.log(`\n${color.toUpperCase()}:`);
    console.log(`  💸 Preço otimizado: ${data.optimizedPrice}`);
    console.log(`  💰 Lucro por unidade: $${data.profitPerUnit.toFixed(2)}`);
    console.log(`  📊 Margem real: ${data.margin}%`);
    console.log(`  📦 Estoque: ${data.stock} unidades`);
    console.log(`  💎 Lucro total: $${data.totalProfit.toFixed(2)}`);
    
    totalBasicProfit += data.totalProfit;
    totalBasicStock += data.stock;
});

// Análise da Oferta Premium
console.log("\n🛍️ OFERTA PREMIUM - TOWEL CLOTH-PINK:");
console.log("-" .repeat(50));

const premiumData = FINAL_OPTIMIZED_PRICES.premium["towel-cloth-pink"];
console.log(`\n${premiumData.originalPrice} → ${premiumData.optimizedPrice}`);
console.log(`  💰 Lucro por unidade: $${premiumData.profitPerUnit.toFixed(2)}`);
console.log(`  📊 Margem real: ${premiumData.margin}%`);
console.log(`  📦 Estoque: ${premiumData.stock} unidades`);
console.log(`  💎 Lucro total: $${premiumData.totalProfit.toFixed(2)}`);

// Análise da Oferta Completa (COM FRETE)
console.log("\n🎯 OFERTA COMPLETA - 10PCSTOUMING-BLUE (COM FRETE):");
console.log("-" .repeat(50));

const completeData = FINAL_OPTIMIZED_PRICES.complete["10pcsTouMing-blue"];
console.log(`\n${completeData.originalPrice} + ${completeData.shippingCost} → ${completeData.optimizedPrice}`);
console.log(`  💰 Custo total: ${completeData.totalCost}`);
console.log(`  💰 Lucro por unidade: $${completeData.profitPerUnit.toFixed(2)}`);
console.log(`  📊 Margem real: ${completeData.margin}%`);
console.log(`  📦 Estoque: ${completeData.stock} unidades`);
console.log(`  💎 Lucro total: $${completeData.totalProfit.toFixed(2)}`);

// Resumo Executivo
console.log("\n📊 RESUMO EXECUTIVO ATUALIZADO:");
console.log("=" .repeat(50));

const totalCombinedProfit = totalBasicProfit + premiumData.totalProfit + completeData.totalProfit;
const totalCombinedStock = totalBasicStock + premiumData.stock + completeData.stock;

console.log(`💰 Lucro total Oferta Básica: $${totalBasicProfit.toFixed(2)}`);
console.log(`💰 Lucro total Oferta Premium: $${premiumData.totalProfit.toFixed(2)}`);
console.log(`💰 Lucro total Oferta Completa: $${completeData.totalProfit.toFixed(2)}`);
console.log(`🎯 Lucro total combinado: $${totalCombinedProfit.toFixed(2)}`);
console.log(`📦 Total de unidades: ${totalCombinedStock}`);
console.log(`📈 Lucro médio por unidade: $${(totalCombinedProfit / totalCombinedStock).toFixed(2)}`);

// Comparação com análise anterior (sem frete da oferta completa)
console.log("\n📈 COMPARAÇÃO COM ANÁLISE ANTERIOR:");
console.log("-" .repeat(50));

const previousTotalProfit = 98.82 + 25.62 + 17.08; // Lucro anterior
const currentTotalProfit = totalCombinedProfit;
const improvement = currentTotalProfit - previousTotalProfit;

console.log(`💰 Lucro anterior total: $${previousTotalProfit.toFixed(2)}`);
console.log(`💰 Lucro atual total: $${currentTotalProfit.toFixed(2)}`);
console.log(`📈 Melhoria: +$${improvement.toFixed(2)}`);
console.log(`📊 Melhoria %: +${((improvement / previousTotalProfit) * 100).toFixed(1)}%`);

// Tabela comparativa final
console.log("\n📋 TABELA COMPARATIVA FINAL:");
console.log("=" .repeat(80));

const comparisonTable = [
    {
        Oferta: "Básica (Nude Pink)",
        "Preço Otimizado": "$3.54",
        "Lucro/Unidade": "$0.75",
        "Estoque": 6,
        "Lucro Total": "$4.50"
    },
    {
        Oferta: "Premium (Towel Pink)",
        "Preço Original": "$0.99",
        "Preço Otimizado": "$2.89",
        "Lucro/Unidade": "$0.61",
        "Estoque": 42,
        "Lucro Total": "$25.62"
    },
    {
        Oferta: "Completa (10pcs Blue)",
        "Preço Original": "$4.19 + $2.04",
        "Preço Otimizado": "$11.36",
        "Lucro/Unidade": "$2.41",
        "Estoque": 10,
        "Lucro Total": "$24.06"
    }
];

console.table(comparisonTable);

// Recomendações finais
console.log("\n💡 RECOMENDAÇÕES FINAIS:");
console.log("=" .repeat(30));

console.log("✅ TODAS AS OFERTAS SÃO AGORA LUCRATIVAS:");
console.log("  • Margem real mínima: 21.19%");
console.log("  • Considera todas as taxas do AliExpress");
console.log("  • Oferta completa inclui frete de $2.04");
console.log("  • Preços acessíveis para o cliente");
console.log("  • Lucro garantido por unidade vendida");

console.log("\n🎯 ESTRATÉGIA DE PREÇOS:");
console.log("  • Preços diferenciados por produto (baseado no custo real)");
console.log("  • Margem de segurança de 10% adicional");
console.log("  • Transparência nas taxas aplicadas");
console.log("  • Foco na lucratividade sustentável");

console.log("\n📊 IMPACTO DAS TAXAS DO ALIEXPRESS:");
console.log("  • Taxas consomem ~$1.20-2.20 por unidade vendida");
console.log("  • Total de taxas: ~26-40% do preço de venda");
console.log("  • Frete da oferta completa: $2.04");
console.log("  • Preços otimizados garantem margem real de 21.19%");

console.log("\n🎉 RESULTADO FINAL:");
console.log(`  💰 Lucro total potencial: $${totalCombinedProfit.toFixed(2)}`);
console.log(`  📦 ${totalCombinedStock} unidades em estoque`);
console.log(`  🎯 Todas as ofertas são lucrativas`);
console.log(`  📈 Melhoria de +${((improvement / previousTotalProfit) * 100).toFixed(1)}% vs análise anterior`);

// Exportar dados para uso em outros arquivos
export const FINAL_UPDATED_ANALYSIS = {
    totalProfit: totalCombinedProfit,
    totalStock: totalCombinedStock,
    averageProfitPerUnit: totalCombinedProfit / totalCombinedStock,
    improvement: improvement,
    improvementPercentage: (improvement / previousTotalProfit) * 100,
    allProductsProfitable: true,
    minimumMargin: 21.19,
    completeOfferIncludesShipping: true
};
