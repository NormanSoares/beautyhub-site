// Análise detalhada de lucro considerando taxas do AliExpress
import { PREMIUM_PRICES, PREMIUM_PROFIT_SETTINGS } from './premium_profit_config.js';

// Taxas e comissões do AliExpress
const ALIEXPRESS_FEES = {
    // Taxa de comissão do AliExpress (varia por categoria, mas geralmente 5-8%)
    commissionRate: 0.06, // 6% - média para produtos de beleza
    
    // Taxa de processamento de pagamento (PayPal, cartão, etc.)
    paymentProcessing: 0.029, // 2.9% + $0.30 por transação
    
    // Taxa de câmbio (se aplicável)
    currencyExchange: 0.02, // 2% para conversões de moeda
    
    // Taxa de retirada/transferência
    withdrawalFee: 0.01, // 1% para retirada de fundos
    
    // Taxa de armazenamento (se usar FBA ou similar)
    storageFee: 0, // $0 se não usar armazenamento premium
    
    // Taxa de marketing/PPC (opcional)
    marketingFee: 0.05, // 5% se usar anúncios pagos
};

// Função para calcular lucro real considerando todas as taxas
function calculateRealProfit(originalPrice, sellingPrice, fees = ALIEXPRESS_FEES) {
    const originalPriceValue = parseFloat(originalPrice.replace('$', ''));
    const sellingPriceValue = parseFloat(sellingPrice.replace('$', ''));
    
    // 1. Receita bruta
    const grossRevenue = sellingPriceValue;
    
    // 2. Custo do produto
    const productCost = originalPriceValue;
    
    // 3. Taxa de comissão do AliExpress
    const commissionFee = grossRevenue * fees.commissionRate;
    
    // 4. Taxa de processamento de pagamento
    const paymentFee = (grossRevenue * fees.paymentProcessing) + 0.30;
    
    // 5. Taxa de câmbio (se aplicável)
    const exchangeFee = grossRevenue * fees.currencyExchange;
    
    // 6. Taxa de retirada
    const withdrawalFee = grossRevenue * fees.withdrawalFee;
    
    // 7. Taxa de marketing (opcional)
    const marketingFee = grossRevenue * fees.marketingFee;
    
    // 8. Custos fixos (embalagem, etiquetas, etc.)
    const fixedCosts = 0.50; // Custo fixo por item
    
    // 9. Cálculo do lucro líquido
    const totalFees = commissionFee + paymentFee + exchangeFee + withdrawalFee + marketingFee;
    const totalCosts = productCost + totalFees + fixedCosts;
    const netProfit = grossRevenue - totalCosts;
    
    // 10. Margem de lucro real
    const profitMargin = (netProfit / grossRevenue) * 100;
    
    return {
        grossRevenue,
        productCost,
        fees: {
            commission: commissionFee,
            payment: paymentFee,
            exchange: exchangeFee,
            withdrawal: withdrawalFee,
            marketing: marketingFee,
            total: totalFees
        },
        fixedCosts,
        totalCosts,
        netProfit,
        profitMargin,
        breakdown: {
            'Receita Bruta': grossRevenue,
            'Custo do Produto': productCost,
            'Taxa AliExpress (6%)': commissionFee,
            'Taxa Pagamento (2.9% + $0.30)': paymentFee,
            'Taxa Câmbio (2%)': exchangeFee,
            'Taxa Retirada (1%)': withdrawalFee,
            'Taxa Marketing (5%)': marketingFee,
            'Custos Fixos': fixedCosts,
            'Total Custos': totalCosts,
            'Lucro Líquido': netProfit,
            'Margem Real': `${profitMargin.toFixed(2)}%`
        }
    };
}

// Análise para a Oferta Premium - Towel cloth-pink
console.log("📊 ANÁLISE DETALHADA DE LUCRO - OFERTA PREMIUM");
console.log("=" .repeat(60));

const premiumProduct = PREMIUM_PRICES["towel-cloth-pink"];
const sellingPrice = "$2.48"; // Preço com margem de 50%

const profitAnalysis = calculateRealProfit(premiumProduct.originalPrice, sellingPrice);

console.log("\n💰 BREAKDOWN FINANCEIRO:");
console.table(profitAnalysis.breakdown);

console.log("\n📈 RESUMO EXECUTIVO:");
console.log(`🏷️  Produto: ${premiumProduct.productName}`);
console.log(`💵 Preço de compra: ${premiumProduct.originalPrice}`);
console.log(`💸 Preço de venda: ${sellingPrice}`);
console.log(`📊 Margem bruta: ${((parseFloat(sellingPrice.replace('$', '')) - parseFloat(premiumProduct.originalPrice.replace('$', ''))) / parseFloat(sellingPrice.replace('$', '')) * 100).toFixed(2)}%`);
console.log(`💰 Lucro líquido: $${profitAnalysis.netProfit.toFixed(2)}`);
console.log(`📊 Margem real: ${profitAnalysis.profitMargin.toFixed(2)}%`);
console.log(`📦 Estoque: ${premiumProduct.stock} unidades`);
console.log(`💎 Lucro total potencial: $${(profitAnalysis.netProfit * premiumProduct.stock).toFixed(2)}`);

// Análise de cenários
console.log("\n🎯 ANÁLISE DE CENÁRIOS:");
console.log("=" .repeat(40));

// Cenário 1: Sem marketing
const feesNoMarketing = { ...ALIEXPRESS_FEES, marketingFee: 0 };
const profitNoMarketing = calculateRealProfit(premiumProduct.originalPrice, sellingPrice, feesNoMarketing);
console.log(`📊 Sem marketing (5% a menos): $${profitNoMarketing.netProfit.toFixed(2)} (${profitNoMarketing.profitMargin.toFixed(2)}%)`);

// Cenário 2: Comissão menor (5% em vez de 6%)
const feesLowerCommission = { ...ALIEXPRESS_FEES, commissionRate: 0.05 };
const profitLowerCommission = calculateRealProfit(premiumProduct.originalPrice, sellingPrice, feesLowerCommission);
console.log(`📊 Comissão 5% (em vez de 6%): $${profitLowerCommission.netProfit.toFixed(2)} (${profitLowerCommission.profitMargin.toFixed(2)}%)`);

// Cenário 3: Preço de venda maior ($3.00)
const profitHigherPrice = calculateRealProfit(premiumProduct.originalPrice, "$3.00");
console.log(`📊 Preço $3.00: $${profitHigherPrice.netProfit.toFixed(2)} (${profitHigherPrice.profitMargin.toFixed(2)}%)`);

// Recomendações
console.log("\n💡 RECOMENDAÇÕES:");
console.log("=" .repeat(20));
if (profitAnalysis.netProfit > 0) {
    console.log("✅ Produto é lucrativo!");
    console.log(`💰 Lucro por unidade: $${profitAnalysis.netProfit.toFixed(2)}`);
    console.log(`📈 Margem real: ${profitAnalysis.profitMargin.toFixed(2)}%`);
    
    if (profitAnalysis.profitMargin < 20) {
        console.log("⚠️  Margem baixa - considere aumentar o preço");
    } else if (profitAnalysis.profitMargin > 40) {
        console.log("🎯 Margem excelente - produto muito lucrativo!");
    } else {
        console.log("👍 Margem saudável - produto bem posicionado");
    }
} else {
    console.log("❌ Produto não é lucrativo com as taxas atuais");
    console.log("💡 Considere aumentar o preço ou reduzir custos");
}

// Exportar dados para uso em outros arquivos
export const PROFIT_ANALYSIS = {
    premium: profitAnalysis,
    scenarios: {
        noMarketing: profitNoMarketing,
        lowerCommission: profitLowerCommission,
        higherPrice: profitHigherPrice
    },
    recommendations: {
        isProfitable: profitAnalysis.netProfit > 0,
        profitPerUnit: profitAnalysis.netProfit,
        profitMargin: profitAnalysis.profitMargin,
        totalPotential: profitAnalysis.netProfit * premiumProduct.stock
    }
};


