import fs from "fs";

// Configurações de margem de lucro
const PROFIT_CONFIG = {
  minProfitMargin: 30,
  desiredProfitMargin: 50,
  fixedCosts: 0.50,
  usdToBrl: 5.20
};

// Função para calcular preço com margem de lucro
function calculateProfitPrice(originalPrice, colorName) {
  const priceValue = parseFloat(originalPrice.replace("$", ""));
  const estimatedCost = priceValue * 0.75;
  const totalCost = estimatedCost + PROFIT_CONFIG.fixedCosts;
  const profitPrice = totalCost * (1 + PROFIT_CONFIG.desiredProfitMargin / 100);
  const priceInBrl = profitPrice * PROFIT_CONFIG.usdToBrl;
  
  return {
    originalPrice: originalPrice,
    estimatedCost: estimatedCost.toFixed(2),
    totalCost: totalCost.toFixed(2),
    profitPriceUSD: profitPrice.toFixed(2),
    profitPriceBRL: priceInBrl.toFixed(2),
    profitMargin: PROFIT_CONFIG.desiredProfitMargin,
    colorName: colorName
  };
}

// Função principal que processa os dados do scraper
function processAlligatorPrices() {
  try {
    const rawJson = fs.readFileSync("./aliexpress_response.json", "utf8");
    const data = JSON.parse(rawJson);
    
    const skuPaths = data?.data?.result?.SKU?.skuPaths;
    const priceMap = data?.data?.result?.PRICE?.skuPriceInfoMap;
    
    if (!skuPaths || !priceMap) {
      throw new Error("Dados não encontrados");
    }
    
    const alligatorPrices = skuPaths.map((sku) => {
      const skuId = sku.skuIdStr;
      const priceInfo = priceMap[skuId];
      const originalPrice = priceInfo?.salePriceString || "N/A";
      
      const colorMatch = sku.skuAttr.match(/#([^(]+)/);
      const colorName = colorMatch ? colorMatch[1].trim() : "Unknown";
      
      const profitData = calculateProfitPrice(originalPrice, colorName);
      
      return {
        skuId,
        colorName,
        originalPrice,
        ...profitData,
        stock: sku.skuStock
      };
    });
    
    return alligatorPrices;
    
  } catch (error) {
    console.error("? Erro ao processar preços:", error.message);
    return [];
  }
}

// Executa o processamento
const alligatorPrices = processAlligatorPrices();

if (alligatorPrices.length > 0) {
  console.log("?? Preços calculados para o Alligator:");
  console.table(alligatorPrices.map(p => ({
    Cor: p.colorName,
    "Preço Original": p.originalPrice,
    "Preço com Lucro (USD)": `$${p.profitPriceUSD}`,
    "Preço com Lucro (BRL)": `R$${p.profitPriceBRL}`,
    "Margem": `${p.profitMargin}%`,
    Estoque: p.stock
  })));
} else {
  console.log("? Nenhum preço foi processado");
}
