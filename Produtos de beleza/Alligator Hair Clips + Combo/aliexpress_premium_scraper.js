import fs from "fs";

// Função principal que processa o JSON da oferta premium
function extractPremiumProductInfo(rawJson) {
    const data = JSON.parse(rawJson);

    const priceMap = data?.data?.result?.PRICE?.skuPriceInfoMap;
    const skuPaths = data?.data?.result?.SKU?.skuPaths;

    if (!priceMap || !skuPaths) {
        console.error("❌ Estrutura inesperada: não foi possível localizar os campos esperados.");
        return [];
    }

    // Filtrar apenas o "Towel cloth-pink" (SKU ID: 12000048389386301)
    const pinkTowelSku = skuPaths.find(sku => 
        sku.skuIdStr === "12000048389386301" && 
        sku.skuAttr.includes("Towel cloth-pink")
    );

    if (!pinkTowelSku) {
        console.error("❌ SKU 'Towel cloth-pink' não encontrado!");
        return [];
    }

    const skuId = pinkTowelSku.skuIdStr;
    const attr = pinkTowelSku.skuAttr;
    const stock = pinkTowelSku.skuStock || 0;
    const priceInfo = priceMap[skuId];
    const price = priceInfo?.salePriceString || "N/A";
    const originalPrice = priceInfo?.originalPrice?.formatedAmount || "N/A";

    const result = {
        skuId,
        variation: attr,
        price,
        originalPrice,
        stock,
        productType: "Towel cloth-pink"
    };

    return [result];
}

// Exemplo: ler de um arquivo (para quando colar responses)
const filePath = "./aliexpress_premium_response.json";
const rawJson = fs.readFileSync(filePath, "utf8");

const extracted = extractPremiumProductInfo(rawJson);

// Mostrar o resultado
console.log("🛍️ Dados da Oferta Premium - Towel cloth-pink:");
console.table(extracted);

// Salvar em CSV
const csv = [
    "SKU ID,Produto,Preço Atual,Preço Original,Estoque",
    ...extracted.map(
        (x) =>
            `${x.skuId},"${x.variation}",${x.price},${x.originalPrice},${x.stock}`
    ),
].join("\n");

fs.writeFileSync("aliexpress_premium_skus.csv", csv);
console.log("✅ Dados salvos em aliexpress_premium_skus.csv");

// Mostrar informações específicas
if (extracted.length > 0) {
    const product = extracted[0];
    console.log("\n📊 Resumo da Oferta Premium:");
    console.log(`🏷️  Produto: ${product.variation}`);
    console.log(`💰 Preço atual: ${product.price}`);
    console.log(`💸 Preço original: ${product.originalPrice}`);
    console.log(`📦 Estoque: ${product.stock} unidades`);
    console.log(`🆔 SKU ID: ${product.skuId}`);
}


