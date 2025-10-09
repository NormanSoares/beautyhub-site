/**
 * Script para testar o endpoint /api/
 * 
 * Execute: node scripts/test-api-index.js
 */

const https = require('https');
const http = require('http');

// Configurações de teste
const TEST_CONFIG = {
    // URL do endpoint (ajuste conforme necessário)
    url: process.env.API_URL || 'http://localhost:3001/api/',
    
    // Dados de teste para POST
    testActions: [
        {
            name: 'Get Stats',
            data: { action: 'get_stats', data: {} }
        },
        {
            name: 'Get Health',
            data: { action: 'get_health', data: {} }
        },
        {
            name: 'Get Endpoints',
            data: { action: 'get_endpoints', data: {} }
        },
        {
            name: 'Test Connection',
            data: { action: 'test_connection', data: {} }
        }
    ]
};

/**
 * Faz requisição HTTP
 */
function makeRequest(url, data = null, method = 'GET') {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'BeautyHub-API-Test/1.0'
            }
        };
        
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        
        const req = client.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

/**
 * Testa endpoint GET
 */
async function testGetEndpoint() {
    console.log('\n🧪 Testando endpoint GET /api/...');
    
    try {
        const response = await makeRequest(TEST_CONFIG.url);
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Resposta:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Verificar se a resposta contém as informações esperadas
        const hasAPIInfo = response.data.api && response.data.api.name;
        const hasHealth = response.data.health;
        const hasStats = response.data.stats;
        const hasEndpoints = response.data.endpoints;
        
        console.log('\nVerificações:');
        console.log(`✅ API Info: ${hasAPIInfo ? 'Presente' : 'Ausente'}`);
        console.log(`✅ Health: ${hasHealth ? 'Presente' : 'Ausente'}`);
        console.log(`✅ Stats: ${hasStats ? 'Presente' : 'Ausente'}`);
        console.log(`✅ Endpoints: ${hasEndpoints ? 'Presente' : 'Ausente'}`);
        
        return {
            success: response.statusCode === 200,
            statusCode: response.statusCode,
            hasAllData: hasAPIInfo && hasHealth && hasStats && hasEndpoints
        };
        
    } catch (error) {
        console.error('❌ Erro no teste GET:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Testa diferentes ações POST
 */
async function testPostActions() {
    console.log('\n🧪 Testando ações POST...');
    
    const results = [];
    
    for (const test of TEST_CONFIG.testActions) {
        console.log(`\n📡 Testando: ${test.name}...`);
        
        try {
            const response = await makeRequest(TEST_CONFIG.url, test.data, 'POST');
            
            console.log(`Status: ${response.statusCode}`);
            console.log('Resposta:');
            console.log(JSON.stringify(response.data, null, 2));
            
            results.push({
                test: test.name,
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                response: response.data
            });
            
            // Aguardar um pouco entre os testes
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Erro no teste ${test.name}:`, error.message);
            results.push({
                test: test.name,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

/**
 * Testa endpoint OPTIONS (CORS)
 */
async function testOptionsEndpoint() {
    console.log('\n🧪 Testando endpoint OPTIONS (CORS)...');
    
    try {
        const response = await makeRequest(TEST_CONFIG.url, null, 'OPTIONS');
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Headers CORS:');
        console.log(`Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Não definido'}`);
        console.log(`Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'Não definido'}`);
        console.log(`Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'Não definido'}`);
        
        return {
            success: response.statusCode === 200,
            statusCode: response.statusCode,
            corsConfigured: !!response.headers['access-control-allow-origin']
        };
        
    } catch (error) {
        console.error('❌ Erro no teste OPTIONS:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Função principal
 */
async function runTests() {
    console.log('🚀 Iniciando testes do endpoint /api/');
    console.log(`URL: ${TEST_CONFIG.url}`);
    
    // Teste GET
    const getTestResult = await testGetEndpoint();
    
    // Teste OPTIONS
    const optionsTestResult = await testOptionsEndpoint();
    
    // Testes POST
    const postResults = await testPostActions();
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('==================');
    console.log(`GET Test: ${getTestResult.success ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`OPTIONS Test: ${optionsTestResult.success ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    postResults.forEach(result => {
        const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`${result.test}: ${status}`);
        if (!result.success && result.error) {
            console.log(`  Erro: ${result.error}`);
        }
    });
    
    const totalTests = 2 + postResults.length; // GET + OPTIONS + POST actions
    const passedTests = (getTestResult.success ? 1 : 0) + 
                       (optionsTestResult.success ? 1 : 0) + 
                       postResults.filter(r => r.success).length;
    
    console.log(`\nResultado: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
        console.log('🎉 Todos os testes passaram!');
        console.log('✅ API está funcionando corretamente');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique a configuração.');
    }
    
    // Informações adicionais
    if (getTestResult.hasAllData) {
        console.log('\n📈 API Status:');
        console.log('- Informações da API: ✅');
        console.log('- Status de saúde: ✅');
        console.log('- Estatísticas: ✅');
        console.log('- Lista de endpoints: ✅');
    }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testGetEndpoint,
    testPostActions,
    testOptionsEndpoint,
    makeRequest
};
