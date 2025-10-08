import cron from "node-cron";
import { runScraper as iniciarScraping } from "./aliexpress_scraper_improved.js";
import { extractProductInfo } from "./extractor.js";
import fs from "fs";

// Função para executar o fluxo completo: coletar + extrair
async function runCompleteFlow() {
  try {
    console.log("🚀 Iniciando fluxo completo de scraping...");
    
    // 1. Coletar dados do AliExpress
    console.log("📡 Coletando dados do AliExpress...");
    const productUrl = "https://www.aliexpress.com/item/1005001234567890.html"; // URL de teste real
    const scrapeResult = await iniciarScraping(productUrl);
    
    if (!scrapeResult.success) {
      console.error("❌ Falha na coleta de dados:", scrapeResult.error);
      return;
    }
    
    // 2. Extrair e processar dados do arquivo JSON salvo
    console.log("🔍 Extraindo dados do arquivo JSON...");
    const filePath = "./aliexpress_response.json";
    
    if (!fs.existsSync(filePath)) {
      console.error("❌ Arquivo aliexpress_response.json não encontrado!");
      return;
    }
    
    const rawJson = fs.readFileSync(filePath, "utf8");
    const extracted = extractProductInfo(rawJson);
    
    if (extracted.length === 0) {
      console.error("❌ Nenhum dado extraído!");
      return;
    }
    
    // 3. Exibir resultados
    console.table(extracted, [
      "skuId",
      "variation", 
      "price",
      "stockPacks",
      "piecesPerPack",
      "totalPieces",
    ]);
    
    // 4. Salvar CSV completo
    const csvHeader = "SKU ID,Cor/Variante,Preço,Pacotes Disponíveis,Peças por Pacote,Total de Peças,Título,Descrição,Loja,Link da Loja,Categoria,Avaliação,Avaliações,Moeda,Imagens";
    const csv = [
      csvHeader,
      ...extracted.map((x) =>
        [
          x.skuId,
          `"${x.variation}"`,
          x.price,
          x.stockPacks,
          x.piecesPerPack,
          x.totalPieces,
          `"${x.title}"`,
          `"${x.description}"`,
          `"${x.sellerName}"`,
          x.storeUrl,
          x.category,
          x.rating,
          x.reviewCount,
          x.currency,
          `"${x.images.join(" | ")}"`,
        ].join(",")
      ),
    ].join("\n");
    
    fs.writeFileSync("aliexpress_full_data.csv", csv);
    console.log("✅ Dados completos salvos em aliexpress_full_data.csv");
    console.log("✅ Fluxo completo concluído com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro no fluxo completo:", error.message);
  }
}

// Função para iniciar o sistema
async function start() {
  console.log("🟢 Sistema iniciado - executando fluxo completo...");
  await runCompleteFlow(); // executa imediatamente ao iniciar

  // Agenda para rodar a cada 12h
  cron.schedule("0 */12 * * *", async () => {
    console.log("🔁 Executando fluxo agendado...");
    await runCompleteFlow();
  });
}

start();

