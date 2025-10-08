// Scraper para extrair dados do produto 10pcsTouMing-blue da oferta completa
import fs from "fs";

function extractCompleteProductInfo(rawJson) {
    const data = JSON.parse(rawJson);

    const skuData = data?.data?.result?.SKU;
    const priceMap = data?.data?.result?.PRICE?.skuPriceInfoMap;

    if (!skuData || !priceMap) {
        console.error("❌ Estrutura inesperada: não foi possível localizar os campos esperados para a oferta completa.");
        return [];
    }

    // Buscar especificamente pelo produto 10pcsTouMing-blue
    const targetSkuId = "12000039248326638"; // SKU ID para "10pcsTouMing-blue"
    const targetVariationName = "10pcsTouMing-blue";

    const skuPath = skuData.skuPaths.find(sku => sku.skuIdStr === targetSkuId);
    const priceInfo = priceMap[targetSkuId];

    if (!skuPath || !priceInfo) {
        console.error(`❌ SKU ID ${targetSkuId} ou informações de preço não encontradas para a oferta completa.`);
        return [];
    }

    const skuId = skuPath.skuIdStr;
    const variation = skuPath.skuAttr || "N/A";
    const stock = skuPath.skuStock || 0;
    const price = priceInfo?.salePriceString || "N/A";
    const originalPrice = priceInfo?.originalPrice?.formatedAmount || "N/A";

    // Calcular o desconto percentual
    let discountPercentage = "N/A";
    if (price !== "N/A" && originalPrice !== "N/A") {
        const priceValue = parseFloat(price.replace('$', ''));
        const originalPriceValue = parseFloat(originalPrice.replace('$', ''));
        if (originalPriceValue > 0) {
            discountPercentage = (((originalPriceValue - priceValue) / originalPriceValue) * 100).toFixed(1) + '%';
        }
    }

    const result = [{
        skuId,
        variation,
        price,
        originalPrice,
        stock,
        productType: targetVariationName,
        discountPercentage
    }];

    return result;
}

const filePath = "./aliexpress_complete_response.json";
const rawJson = fs.readFileSync(filePath, "utf8");

const extracted = extractCompleteProductInfo(rawJson);

console.log("🛍️ Dados da Oferta Completa - 10pcsTouMing-blue:");
console.table(extracted);

const csv = [
    "SKU ID,Cor/Variante,Preço,Preço Original,Estoque,Tipo de Produto,Desconto AliExpress",
    ...extracted.map(
        (x) =>
            `${x.skuId},"${x.variation}",${x.price},${x.originalPrice},${x.stock},"${x.productType}",${x.discountPercentage}`
    ),
].join("\n");

fs.writeFileSync("aliexpress_complete_skus.csv", csv);
console.log("✅ Dados salvos em aliexpress_complete_skus.csv");

if (extracted.length > 0) {
    const completeProduct = extracted[0];
    console.log("\n📊 Resumo da Oferta Completa:");
    console.log(`🏷️  Produto: ${completeProduct.variation}`);
    console.log(`💰 Preço atual: ${completeProduct.price}`);
    console.log(`💸 Preço original: ${completeProduct.originalPrice}`);
    console.log(`📦 Estoque: ${completeProduct.stock} unidades`);
    console.log(`🆔 SKU ID: ${completeProduct.skuId}`);
    console.log(`📉 Desconto: ${completeProduct.discountPercentage}`);
}


