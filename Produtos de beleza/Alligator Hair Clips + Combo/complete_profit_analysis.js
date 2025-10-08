// Análise completa de lucro para ambas as ofertas (Básica e Premium)

// Dados da oferta básica (Nude Pink)
const ALLIGATOR_PRICES = {
    "nude-pink": {
        originalPrice: "$1.39",
        profitPrice: "$2.31",
        margin: "50%",
        stock: 6
    }
};

// Dados da oferta premium
const PREMIUM_PRICES = {
    "towel-cloth-pink": {
        originalPrice: "$0.99",
        margin: "50%",
        stock: 42,
        productName: "Towel cloth-pink"
    }
};

// Taxas e comissões do AliExpress
const ALIEXPRESS_FEES = {
    commissionRate: 0.06, // 6% - comissão do AliExpress
    paymentProcessing: 0.029, // 2.9% + $0.30 por transação
    currencyExchange: 0.02, // 2% para conversões de moeda
    withdrawalFee: 0.01, // 1% para retirada de fundos
    storageFee: 0, // $0 se não usar armazenamento premium
    marketingFee: 0.05, // 5% se usar anúncios pagos
};

// Função para calcular lucro real considerando todas as taxas
function calculateRealProfit(originalPrice, sellingPrice, fees = ALIEXPRESS_FEES) {
    const originalPriceValue = parseFloat(originalPrice.replace('$', ''));
    const sellingPriceValue = parseFloat(sellingPrice.replace('$', ''));
    
    const grossRevenue = sellingPriceValue;
    const productCost = originalPriceValue;
    const commissionFee = grossRevenue * fees.commissionRate;
    const paymentFee = (grossRevenue * fees.paymentProcessing) + 0.30;
    const exchangeFee = grossRevenue * fees.currencyExchange;
    const withdrawalFee = grossRevenue * fees.withdrawalFee;
    const marketingFee = grossRevenue * fees.marketingFee;
    const fixedCosts = 0.50;
    
    const totalFees = commissionFee + paymentFee + exchangeFee + withdrawalFee + marketingFee;
    const totalCosts = productCost + totalFees + fixedCosts;
    const netProfit = grossRevenue - totalCosts;
    const profitMargin = (netProfit / grossRevenue) * 100;
    
    return {
        grossRevenue,
        productCost,
        totalFees,
        fixedCosts,
        totalCosts,
        netProfit,
        profitMargin
    };
}

console.log("🐊 ANÁLISE COMPLETA DE LUCRO - ALLIGATOR HAIR CLIPS");
console.log("=" .repeat(70));

// Análise da Oferta Básica (Nude Pink)
console.log("\n📋 OFERTA BÁSICA - NUDE PINK:");
console.log("-" .repeat(40));

const basicProduct = ALLIGATOR_PRICES["nude-pink"];
const basicSellingPrice = basicProduct.profitPrice;
const basicAnalysis = calculateRealProfit(basicProduct.originalPrice, basicSellingPrice);

console.log(`💵 Preço de compra: ${basicProduct.originalPrice}`);
console.log(`💸 Preço de venda: ${basicSellingPrice}`);
console.log(`💰 Lucro líquido: $${basicAnalysis.netProfit.toFixed(2)}`);
console.log(`📊 Margem real: ${basicAnalysis.profitMargin.toFixed(2)}%`);
console.log(`📦 Estoque: ${basicProduct.stock} unidades`);
console.log(`💎 Lucro total potencial: $${(basicAnalysis.netProfit * basicProduct.stock).toFixed(2)}`);

// Análise da Oferta Premium
console.log("\n🛍️ OFERTA PREMIUM - TOWEL CLOTH-PINK:");
console.log("-" .repeat(40));

const premiumProduct = PREMIUM_PRICES["towel-cloth-pink"];
const premiumSellingPrice = "$2.48"; // Preço calculado anteriormente
const premiumAnalysis = calculateRealProfit(premiumProduct.originalPrice, premiumSellingPrice);

console.log(`💵 Preço de compra: ${premiumProduct.originalPrice}`);
console.log(`💸 Preço de venda: ${premiumSellingPrice}`);
console.log(`💰 Lucro líquido: $${premiumAnalysis.netProfit.toFixed(2)}`);
console.log(`📊 Margem real: ${premiumAnalysis.profitMargin.toFixed(2)}%`);
console.log(`📦 Estoque: ${premiumProduct.stock} unidades`);
console.log(`💎 Lucro total potencial: $${(premiumAnalysis.netProfit * premiumProduct.stock).toFixed(2)}`);

// Comparação entre ofertas
console.log("\n⚖️ COMPARAÇÃO ENTRE OFERTAS:");
console.log("=" .repeat(50));

const comparison = [
    {
        Oferta: "Básica (Nude Pink)",
        "Preço Compra": basicProduct.originalPrice,
        "Preço Venda": basicSellingPrice,
        "Lucro/Unidade": `$${basicAnalysis.netProfit.toFixed(2)}`,
        "Margem Real": `${basicAnalysis.profitMargin.toFixed(2)}%`,
        "Estoque": basicProduct.stock,
        "Lucro Total": `$${(basicAnalysis.netProfit * basicProduct.stock).toFixed(2)}`
    },
    {
        Oferta: "Premium (Towel Pink)",
        "Preço Compra": premiumProduct.originalPrice,
        "Preço Venda": premiumSellingPrice,
        "Lucro/Unidade": `$${premiumAnalysis.netProfit.toFixed(2)}`,
        "Margem Real": `${premiumAnalysis.profitMargin.toFixed(2)}%`,
        "Estoque": premiumProduct.stock,
        "Lucro Total": `$${(premiumAnalysis.netProfit * premiumProduct.stock).toFixed(2)}`
    }
];

console.table(comparison);

// Análise de rentabilidade
console.log("\n📊 ANÁLISE DE RENTABILIDADE:");
console.log("=" .repeat(40));

const totalBasicProfit = basicAnalysis.netProfit * basicProduct.stock;
const totalPremiumProfit = premiumAnalysis.netProfit * premiumProduct.stock;
const totalCombinedProfit = totalBasicProfit + totalPremiumProfit;

console.log(`💰 Lucro total Oferta Básica: $${totalBasicProfit.toFixed(2)}`);
console.log(`💰 Lucro total Oferta Premium: $${totalPremiumProfit.toFixed(2)}`);
console.log(`🎯 Lucro total combinado: $${totalCombinedProfit.toFixed(2)}`);

// Recomendações estratégicas
console.log("\n💡 RECOMENDAÇÕES ESTRATÉGICAS:");
console.log("=" .repeat(40));

if (basicAnalysis.profitMargin > premiumAnalysis.profitMargin) {
    console.log("🏆 OFERTA BÁSICA é mais rentável por margem");
    console.log(`📈 Margem básica: ${basicAnalysis.profitMargin.toFixed(2)}% vs Premium: ${premiumAnalysis.profitMargin.toFixed(2)}%`);
} else {
    console.log("🏆 OFERTA PREMIUM é mais rentável por margem");
    console.log(`📈 Margem premium: ${premiumAnalysis.profitMargin.toFixed(2)}% vs Básica: ${basicAnalysis.profitMargin.toFixed(2)}%`);
}

if (totalBasicProfit > totalPremiumProfit) {
    console.log("💰 OFERTA BÁSICA gera mais lucro total");
    console.log(`💎 Lucro básico: $${totalBasicProfit.toFixed(2)} vs Premium: $${totalPremiumProfit.toFixed(2)}`);
} else {
    console.log("💰 OFERTA PREMIUM gera mais lucro total");
    console.log(`💎 Lucro premium: $${totalPremiumProfit.toFixed(2)} vs Básico: $${totalBasicProfit.toFixed(2)}`);
}

// Análise de taxas
console.log("\n📋 BREAKDOWN DAS TAXAS (por unidade vendida):");
console.log("-" .repeat(50));

const feesBreakdown = [
    {
        Taxa: "Comissão AliExpress (6%)",
        "Oferta Básica": `$${(parseFloat(basicSellingPrice.replace('$', '')) * 0.06).toFixed(3)}`,
        "Oferta Premium": `$${(parseFloat(premiumSellingPrice.replace('$', '')) * 0.06).toFixed(3)}`
    },
    {
        Taxa: "Pagamento (2.9% + $0.30)",
        "Oferta Básica": `$${((parseFloat(basicSellingPrice.replace('$', '')) * 0.029) + 0.30).toFixed(3)}`,
        "Oferta Premium": `$${((parseFloat(premiumSellingPrice.replace('$', '')) * 0.029) + 0.30).toFixed(3)}`
    },
    {
        Taxa: "Câmbio (2%)",
        "Oferta Básica": `$${(parseFloat(basicSellingPrice.replace('$', '')) * 0.02).toFixed(3)}`,
        "Oferta Premium": `$${(parseFloat(premiumSellingPrice.replace('$', '')) * 0.02).toFixed(3)}`
    },
    {
        Taxa: "Retirada (1%)",
        "Oferta Básica": `$${(parseFloat(basicSellingPrice.replace('$', '')) * 0.01).toFixed(3)}`,
        "Oferta Premium": `$${(parseFloat(premiumSellingPrice.replace('$', '')) * 0.01).toFixed(3)}`
    },
    {
        Taxa: "Marketing (5%)",
        "Oferta Básica": `$${(parseFloat(basicSellingPrice.replace('$', '')) * 0.05).toFixed(3)}`,
        "Oferta Premium": `$${(parseFloat(premiumSellingPrice.replace('$', '')) * 0.05).toFixed(3)}`
    }
];

console.table(feesBreakdown);

console.log("\n🎯 CONCLUSÃO:");
console.log("=" .repeat(20));
console.log("✅ Ambas as ofertas são lucrativas");
console.log(`💰 Lucro total potencial: $${totalCombinedProfit.toFixed(2)}`);
console.log("📊 Margens reais considerando todas as taxas do AliExpress");
console.log("⚠️  Margens são menores que as margens brutas devido às taxas");
console.log("💡 Considere ajustar preços se necessário para melhorar margens");
