import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para extrair JSON do HTML
function extractJSONFromHTML(html) {
  try {
    // Padrões de extração em ordem de prioridade (__INITIAL_STATE__ primeiro)
    const patterns = [
      // 1. __INITIAL_STATE__ (padrão moderno - PRIORIDADE MÁXIMA)
      {
        name: '__INITIAL_STATE__',
        regex: /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/,
        clean: (text) => text.replace(/;\s*$/, "")
      },
      // 2. Script com dados JSON inline
      {
        name: 'inline_json_script',
        regex: /<script[^>]*type=["']application\/json["'][^>]*>(.+?)<\/script>/s,
        clean: (text) => text.replace(/<\/script>.*$/s, '')
      },
      // 3. Script com id contendo dados
      {
        name: 'script_with_id',
        regex: /<script[^>]*id=["'][^"']*data[^"']*["'][^>]*>(.+?)<\/script>/s,
        clean: (text) => text.replace(/<\/script>.*$/s, '')
      },
      // 4. Qualquer script com objeto JSON grande contendo itemInfo
      {
        name: 'large_json_with_itemInfo',
        regex: /<script[^>]*>[\s\S]*?(\{[^{}]*"itemInfo"[^{}]*\{[\s\S]{1000,}\})[\s\S]*?<\/script>/s,
        clean: (text) => text.replace(/<\/script>.*$/s, '')
      },
      // 5. Qualquer script com objeto JSON grande contendo skuBase
      {
        name: 'large_json_with_skuBase',
        regex: /<script[^>]*>[\s\S]*?(\{[^{}]*"skuBase"[^{}]*\{[\s\S]{1000,}\})[\s\S]*?<\/script>/s,
        clean: (text) => text.replace(/<\/script>.*$/s, '')
      },
      // 6. runParams (padrão clássico - FALLBACK)
      {
        name: 'runParams',
        regex: /window\.runParams\s*=\s*(\{[\s\S]*?\});/,
        clean: (text) => text.replace(/;\s*$/, "")
      },
      // 7. DCData (dados do produto)
      {
        name: 'DCData',
        regex: /window\._d_c_\.DCData\s*=\s*(\{[\s\S]*?\});/,
        clean: (text) => text.replace(/;\s*$/, "")
      },
      // 8. __AER_DATA__ (novo formato)
      {
        name: '__AER_DATA__',
        regex: /window\.__AER_DATA__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/,
        clean: (text) => text.replace(/;\s*$/, "").replace(/<\/script>.*$/s, '')
      },
      // 9. Script tag com __AER_DATA__
      {
        name: 'script_AER_DATA',
        regex: /<script[^>]*id="__AER_DATA__"[^>]*>(.+?)<\/script>/s,
        clean: (text) => text.replace(/<\/script>.*$/s, '')
      }
    ];

        for (const pattern of patterns) {
          const match = html.match(pattern.regex);
          if (match && match[1]) {
            console.log(`📦 JSON encontrado com padrão: ${pattern.name}`);

            let jsonText = pattern.clean(match[1].trim());
            
            // Sanitização robusta do JSON
            jsonText = jsonText
              .replace(/;\s*$/, '') // Remove ponto e vírgula no final
              .replace(/,\s*}/g, '}') // Remove vírgulas antes de chaves fechando
              .replace(/,\s*]/g, ']') // Remove vírgulas antes de arrays fechando
              .replace(/\s*$/, '') // Remove espaços no final
              .replace(/^\{/, '{') // Garante que começa com {
              .replace(/\}$/, '}') // Garante que termina com }
              .replace(/undefined/g, 'null') // Substitui undefined por null
              .replace(/,\s*,/g, ',') // Remove vírgulas duplas
              .replace(/,\s*}/g, '}') // Remove vírgulas antes de }
              .replace(/,\s*]/g, ']') // Remove vírgulas antes de ]
              .replace(/\n\s*/g, '') // Remove quebras de linha e espaços
              .replace(/\r/g, '') // Remove retornos de carro
              .trim(); // Remove espaços no início e fim

            try {
              const data = JSON.parse(jsonText);
              console.log(`✅ JSON ${pattern.name} extraído com sucesso!`, Object.keys(data));
              return { source: pattern.name, data };
            } catch (err) {
              console.error(`❌ Erro ao parsear JSON ${pattern.name}:`, err.message);
              // Salvar para debug
              fs.writeFileSync(`debug_${pattern.name}.json`, jsonText);
            }
          }
        }

    throw new Error('Nenhum JSON encontrado no HTML');
  } catch (err) {
    console.error('❌ Erro ao extrair JSON:', err.message);
    return null;
  }
}

// Função para processar dados do produto
function processProductData(jsonResult) {
  try {
    console.log('🔍 Processando dados do produto...');
    console.log('📊 Fonte dos dados:', jsonResult.source);
    
    const jsonData = jsonResult.data;
    console.log('📊 Estrutura encontrada:', Object.keys(jsonData));

    // Mapeamento baseado na estrutura __INITIAL_STATE__ do AliExpress
    const result = {
      // Título - estrutura __INITIAL_STATE__ primeiro
      title: 
        jsonData?.title || // Dados extraídos de elementos HTML
        jsonData?.itemInfo?.title ||
        jsonData?.data?.itemInfo?.title ||
        jsonData?.data?.titleModule?.subject ||
        jsonData?.data?.item?.title ||
        jsonData?.data?.productDetailComponent?.titleModule?.subject ||
        jsonData?.titleModule?.subject ||
        jsonData?.item?.title ||
        'Título não encontrado',

      // Preço - estrutura __INITIAL_STATE__ primeiro
      price:
        jsonData?.price || // Dados extraídos de elementos HTML
        jsonData?.skuBase?.price?.salePrice?.formatted ||
        jsonData?.data?.skuBase?.price?.salePrice?.formatted ||
        jsonData?.data?.priceModule?.formatedPrice ||
        jsonData?.data?.priceModule?.price ||
        jsonData?.data?.productDetailComponent?.priceModule?.formatedPrice ||
        jsonData?.priceModule?.formatedPrice ||
        jsonData?.priceModule?.price ||
        jsonData?.price?.salePrice?.formattedAmount ||
        jsonData?.price?.displayAmount ||
        'Preço não encontrado',

      // Loja - estrutura __INITIAL_STATE__ primeiro
      store:
        jsonData?.store || // Dados extraídos de elementos HTML
        jsonData?.shopInfo?.name ||
        jsonData?.data?.shopInfo?.name ||
        jsonData?.data?.storeModule?.storeName ||
        jsonData?.data?.productDetailComponent?.storeModule?.storeName ||
        jsonData?.storeModule?.storeName ||
        jsonData?.store?.storeName ||
        jsonData?.seller?.storeName ||
        'Loja não encontrada',

      // Imagens - estrutura __INITIAL_STATE__ primeiro
      images:
        jsonData?.images || // Dados extraídos de elementos HTML
        jsonData?.imageModule?.imagePathList ||
        jsonData?.data?.imageModule?.imagePathList ||
        jsonData?.data?.imageModule?.imageList ||
        jsonData?.data?.productDetailComponent?.imageModule?.imagePathList ||
        jsonData?.imageModule?.imageList ||
        [],

      // Informações adicionais - estrutura __INITIAL_STATE__ primeiro
      rating:
        jsonData?.rating || // Dados extraídos de elementos HTML
        jsonData?.feedbackModule?.averageStar ||
        jsonData?.data?.feedbackModule?.averageStar ||
        jsonData?.data?.productDetailComponent?.feedbackModule?.averageStar ||
        'N/A',

      reviewCount:
        jsonData?.reviewCount || // Dados extraídos de elementos HTML
        jsonData?.feedbackModule?.totalValidNum ||
        jsonData?.data?.feedbackModule?.totalValidNum ||
        jsonData?.data?.productDetailComponent?.feedbackModule?.totalValidNum ||
        0,

      // Metadados
      source: jsonResult.source,
      extractedAt: new Date().toISOString()
    };

    console.log('✅ Dados extraídos:', result);
    return result;
  } catch (err) {
    console.error('❌ Estrutura inesperada: não foi possível localizar os campos esperados.');
    console.error('❌ Erro:', err.message);
    return null;
  }
}

// Função principal do scraper
export async function runScraper(productUrl) {
  console.log('🚀 Iniciando scraper...');
  
  // Validação da URL
  if (!productUrl || typeof productUrl !== 'string') {
    console.error('❌ URL inválida:', productUrl);
    return { success: false, error: 'URL inválida' };
  }

  const url = productUrl.trim();
  console.log('🔗 URL:', url);

  // Verificação adicional da URL antes do page.goto
  if (!url.startsWith('http')) {
    console.error('❌ URL não começa com http:', url);
    return { success: false, error: 'URL inválida' };
  }

  // Validação com URL nativo
  try {
    new URL(url);
  } catch (err) {
    console.error('❌ URL malformada:', url);
    return { success: false, error: 'URL malformada' };
  }

  let browser;
  try {
    // Configuração do Puppeteer - modo visível para debug
    browser = await puppeteer.launch({
      headless: false, // Modo visível para ver onde trava
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    
    // Interceptar e bloquear recursos pesados para acelerar carregamento
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    // Configurar user agent e headers para evitar bloqueio anti-bot
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Adicionar headers adicionais
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    console.log('🌐 Navegando para:', url);
    
    // Navegar para a página com timeout aumentado
    await page.goto(url, {
      waitUntil: "networkidle2",  // Espera requisições de rede cessarem
      timeout: 90000,             // 90 segundos
    });

    // Aguardar elementos específicos do produto
    try {
      await page.waitForSelector('[data-pl="product-title"], .title--line-one--nU9Qtto, h1, .product-title', { timeout: 30000 });
      console.log('✅ Elemento do título encontrado');
    } catch (err) {
      console.log('⚠️ Elemento do título não encontrado, continuando...');
    }

    // Aguardar scripts com dados JSON
    try {
      await page.waitForFunction(() => {
        return window.__INITIAL_STATE__ || 
               window.runParams || 
               window._d_c_?.DCData ||
               document.querySelector('script[type="application/json"]');
      }, { timeout: 30000 });
      console.log('✅ Dados JSON encontrados na página');
    } catch (err) {
      console.log('⚠️ Dados JSON não encontrados, continuando...');
    }

    // Aguardar elementos específicos do produto
    try {
      await page.waitForSelector('.product-title, [data-pl="product-title"], .title--line-one--nU9Qtto, h1', { timeout: 30000 });
      console.log('✅ Elemento do produto encontrado');
    } catch (err) {
      console.log('⚠️ Elemento do produto não encontrado, continuando...');
    }

    // Aguardar com Promise em vez de waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Obter HTML
    const html = await page.content();
    
    // Salvar HTML para debug
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlFile = `aliexpress_response_${timestamp}.html`;
    fs.writeFileSync(htmlFile, html);
    console.log(`💾 HTML salvo: ${htmlFile}`);

    // Tentar extrair dados diretamente do JavaScript da página
    let jsonData = null;
    try {
      const initialState = await page.evaluate(() => {
        return window.__INITIAL_STATE__ || null;
      });
      
      if (initialState) {
        console.log('✅ __INITIAL_STATE__ encontrado diretamente do JavaScript');
        jsonData = { source: '__INITIAL_STATE__', data: initialState };
      }
    } catch (err) {
      console.log('⚠️ Erro ao extrair __INITIAL_STATE__:', err.message);
    }

    // Se não conseguiu extrair do JavaScript, tentar extrair dos elementos HTML
    if (!jsonData) {
      try {
        const htmlData = await page.evaluate(() => {
          const title = document.querySelector('[data-pl="product-title"]')?.textContent ||
                       document.querySelector('.title--line-one--nU9Qtto')?.textContent ||
                       document.querySelector('h1')?.textContent ||
                       document.querySelector('.product-title')?.textContent ||
                       'Título não encontrado';
          
          const price = document.querySelector('.price-current')?.textContent ||
                       document.querySelector('.price')?.textContent ||
                       document.querySelector('[data-pl="price"]')?.textContent ||
                       'Preço não encontrado';
          
          const store = document.querySelector('.store-name')?.textContent ||
                       document.querySelector('.seller-name')?.textContent ||
                       document.querySelector('[data-pl="store"]')?.textContent ||
                       'Loja não encontrada';
          
          const images = Array.from(document.querySelectorAll('.image img, .product-image img'))
                             .map(img => img.src)
                             .filter(src => src && src.startsWith('http'));
          
          const rating = document.querySelector('.rating-value')?.textContent ||
                        document.querySelector('.rating')?.textContent ||
                        'N/A';
          
          const reviewCount = document.querySelector('.review-count')?.textContent ||
                             document.querySelector('.reviews-count')?.textContent ||
                             '0';
          
          return {
            title,
            price,
            store,
            images,
            rating,
            reviewCount
          };
        });
        
        if (htmlData && htmlData.title !== 'Título não encontrado') {
          console.log('✅ Dados extraídos dos elementos HTML');
          jsonData = { source: 'HTML_ELEMENTS', data: htmlData };
        }
      } catch (err) {
        console.log('⚠️ Erro ao extrair dados dos elementos HTML:', err.message);
      }
    }

    // Se não conseguiu extrair diretamente, tentar do HTML
    if (!jsonData) {
      console.log('🔍 Tentando extrair JSON do HTML...');
      jsonData = extractJSONFromHTML(html);
    }

    if (!jsonData) {
      return { success: false, error: 'Não foi possível extrair JSON' };
    }

    // Processar dados
    const productData = processProductData(jsonData);
    if (!productData) {
      return { success: false, error: 'Não foi possível processar dados' };
    }

    // Salvar resultado
    const outputFile = path.join(__dirname, 'aliexpress_response.json');
    fs.writeFileSync(outputFile, JSON.stringify(productData, null, 2));
    console.log('💾 Dados salvos em: aliexpress_response.json');

    console.log('✅ Scraping concluído com sucesso!');
    return { success: true, data: productData };

  } catch (error) {
    console.error('❌ Erro no scraper:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar se chamado diretamente
if (process.argv[1] === __filename) {
  const url = process.argv[2] || 'https://www.aliexpress.com/item/1005001234567890.html';
  runScraper(url);
}