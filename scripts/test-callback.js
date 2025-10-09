/**
 * Script para testar o endpoint /api/callback
 * 
 * Execute: node scripts/test-callback.js
 */

const https = require('https');
const http = require('http');

// Configurações de teste
const TEST_CONFIG = {
    // URL do endpoint (ajuste conforme necessário)
    url: process.env.CALLBACK_URL || 'http://localhost:3001/api/callback',
    
    // Dados de teste
    testData: {
        // Teste de pedido
        orderTest: {
            type: 'order_created',
            order_id: `TEST_ORDER_${Date.now()}`,
            customer: {
                email: 'test@beautyhub.com',
                name: 'Cliente Teste'
            },
            total_amount: 199.99,
            currency: 'BRL',
            items: [
                {
                    product_id: 'PHOERA_FOUNDATION',
                    name: 'PHOERA Foundation 2 Pack',
                    quantity: 1,
                    price: 199.99
                }
            ],
            metadata: {
                source: 'test_script',
                timestamp: new Date().toISOString()
            }
        },
        
        // Teste de pagamento
        paymentTest: {
            type: 'payment_webhook',
            payment_id: `TEST_PAYMENT_${Date.now()}`,
            order_id: `TEST_ORDER_${Date.now()}`,
            amount: 199.99,
            currency: 'BRL',
            status: 'completed',
            method: 'credit_card',
            metadata: {
                source: 'test_script',
                timestamp: new Date().toISOString()
            }
        },
        
        // Teste do AliExpress
        aliexpressTest: {
            type: 'aliexpress_webhook',
            order_id: `TEST_ALIEXPRESS_${Date.now()}`,
            product_id: 'PHOERA_FOUNDATION',
            status: 'shipped',
            tracking_number: 'TEST123456789',
            shipping_company: 'Correios',
            metadata: {
                source: 'test_script',
                timestamp: new Date().toISOString()
            }
        }
    }
};

/**
 * Faz requisição HTTP
 */
function makeRequest(url, data, method = 'POST') {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'BeautyHub-Test-Script/1.0'
            }
        };
        
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
        
        if (method === 'POST' && data) {
            req.write(postData);
        }
        
        req.end();
    });
}

/**
 * Testa endpoint GET (teste simples)
 */
async function testGetEndpoint() {
    console.log('\n🧪 Testando endpoint GET...');
    
    try {
        const response = await makeRequest(`${TEST_CONFIG.url}?test=1`, null, 'GET');
        
        console.log(`Status: ${response.statusCode}`);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.statusCode === 200;
    } catch (error) {
        console.error('❌ Erro no teste GET:', error.message);
        return false;
    }
}

/**
 * Testa diferentes tipos de callbacks
 */
async function testCallbacks() {
    const tests = [
        { name: 'Order Created', data: TEST_CONFIG.testData.orderTest },
        { name: 'Payment Webhook', data: TEST_CONFIG.testData.paymentTest },
        { name: 'AliExpress Webhook', data: TEST_CONFIG.testData.aliexpressTest }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n🧪 Testando ${test.name}...`);
        
        try {
            const response = await makeRequest(TEST_CONFIG.url, test.data);
            
            console.log(`Status: ${response.statusCode}`);
            console.log('Resposta:', JSON.stringify(response.data, null, 2));
            
            results.push({
                test: test.name,
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                response: response.data
            });
            
            // Aguardar um pouco entre os testes
            await new Promise(resolve => setTimeout(resolve, 1000));
            
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
 * Função principal
 */
async function runTests() {
    console.log('🚀 Iniciando testes do endpoint /api/callback');
    console.log(`URL: ${TEST_CONFIG.url}`);
    
    // Teste GET
    const getTestResult = await testGetEndpoint();
    
    // Testes POST
    const callbackResults = await testCallbacks();
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('==================');
    console.log(`GET Test: ${getTestResult ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    callbackResults.forEach(result => {
        const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`${result.test}: ${status}`);
        if (!result.success && result.error) {
            console.log(`  Erro: ${result.error}`);
        }
    });
    
    const totalTests = 1 + callbackResults.length;
    const passedTests = (getTestResult ? 1 : 0) + callbackResults.filter(r => r.success).length;
    
    console.log(`\nResultado: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
        console.log('🎉 Todos os testes passaram!');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique a configuração.');
    }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testGetEndpoint,
    testCallbacks,
    makeRequest
};
