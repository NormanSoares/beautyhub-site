// config.js - Configurações do Aliexpress Scraper

export const config = {
  // URLs dos produtos para monitorar
  productUrls: [
    "https://www.aliexpress.com/item/1005001234567890.html", // Substitua pela URL real
    // Adicione mais URLs conforme necessário
  ],
  
  // Configurações de rate limiting
  rateLimit: {
    minDelay: 2000,    // 2 segundos mínimo entre requisições
    maxDelay: 5000,    // 5 segundos máximo entre requisições
    retries: 3,        // Número de tentativas em caso de falha
    timeout: 30000     // 30 segundos timeout
  },
  
  // Configurações de cron
  cron: {
    schedule: "0 */2 * * *", // A cada 2 horas
    timezone: "America/Sao_Paulo"
  },
  
  // Configurações de log
  logging: {
    saveResponses: true,
    logLevel: "info" // debug, info, warn, error
  }
};

