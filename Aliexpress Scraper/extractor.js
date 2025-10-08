// Extractor.js - Apenas extrai dados, não executa scraping

function extractProductInfo(rawJson) {
  const data = JSON.parse(rawJson);
  
  // Tentar múltiplas estruturas possíveis (__INITIAL_STATE__ primeiro)
  const resultData = data?.data?.result || data?.data || data || {};
  
  // Padrões modernos primeiro (estrutura __INITIAL_STATE__)
  const skuData = resultData?.LOT || data?.skuBase?.lot || data?.lot;
  const priceMap = resultData?.PRICE?.skuPriceInfoMap || data?.skuBase?.priceMap || data?.priceMap;
  const skuPaths = resultData?.SKU?.skuPaths || data?.skuBase?.skuPaths || data?.skuPaths;

  if (!skuData || !priceMap || !skuPaths) {
    console.error("❌ Estrutura inesperada: não foi possível localizar os campos esperados.");
    console.log("📊 Estrutura disponível:", Object.keys(data));
    return [];
  }

  const baseInfo = {
    // Mapeamento correto conforme sugerido (__INITIAL_STATE__ structure)
    title: data?.itemInfo?.title || 
           data?.title || 
           resultData?.titleModule?.subject || 
           data?.titleModule?.subject || 
           "Título não encontrado",
    description: data?.itemInfo?.description || 
                 data?.description || 
                 resultData?.titleModule?.subTitle || 
                 data?.titleModule?.subTitle || 
                 "N/A",
    images: data?.imageModule?.imagePathList || 
            data?.images || 
            resultData?.imageModule?.imagePathList || 
            [],
    sellerName: data?.shopInfo?.name || 
                data?.store?.name || 
                resultData?.storeModule?.storeName || 
                data?.storeModule?.storeName || 
                "Loja não encontrada",
    storeUrl: data?.shopInfo?.url || 
              data?.store?.url || 
              resultData?.storeModule?.storeUrl || 
              data?.storeModule?.storeUrl || 
              "N/A",
    category: data?.category?.title || 
              data?.category || 
              resultData?.crossLinkModule?.category?.title || 
              data?.crossLinkModule?.category?.title || 
              "N/A",
    rating: data?.feedback?.rating || 
            data?.feedbackModule?.averageStar || 
            data?.rating || 
            resultData?.feedbackModule?.averageStar || 
            "N/A",
    reviewCount: data?.feedback?.reviewCount || 
                 data?.feedbackModule?.totalValidNum || 
                 data?.reviewCount || 
                 resultData?.feedbackModule?.totalValidNum || 
                 0,
    currency: data?.webEnv?.currency || 
              data?.currency || 
              resultData?.webEnv?.currency || 
              "USD",
  };

  const skus = skuPaths.map((sku) => {
    const skuId = sku.skuIdStr || sku.id || sku.skuId || "N/A";
    const attr = sku.skuAttr || sku.attr || sku.variation || "N/A";
    const stock = sku.skuStock || sku.stock || sku.quantity || 0;
    
    // Múltiplos caminhos para preço (estrutura __INITIAL_STATE__)
    const priceInfo = priceMap[skuId] || priceMap[sku.id] || priceMap[sku.skuId];
    const price = priceInfo?.salePriceString || 
                  priceInfo?.salePrice?.formatted || 
                  priceInfo?.price || 
                  priceInfo?.formattedPrice || 
                  data?.skuBase?.price?.salePrice?.formatted || 
                  "N/A";
    
    // Múltiplos caminhos para informações de unidade
    const unitInfo = skuData?.unitContentSkuMap?.[skuId] || 
                     skuData?.unitContentSkuMap?.[sku.id] || 
                     skuData?.unitContentSkuMap?.[sku.skuId] || 
                     sku?.unitInfo || 
                     "";
    
    const matchPieces = unitInfo.match(/(\d+)\s*(bag|piece|set|pcs|unit|item)/i);
    const piecesPerPack = matchPieces ? parseInt(matchPieces[1]) : 1;
    const totalPieces = piecesPerPack * stock;

    return {
      ...baseInfo,
      skuId,
      variation: attr,
      price,
      stockPacks: stock,
      piecesPerPack,
      totalPieces,
    };
  });

  return skus;
}

// Exportar apenas a função de extração
export { extractProductInfo };
