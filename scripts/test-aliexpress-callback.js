/**
 * Script de teste para o callback do AliExpress
 * Testa o endpoint convertido de PHP para Node.js
 */

const https = require('https');
const http = require('http');

// Configurações
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const ENDPOINT = '/api/aliexpress-callback';

/**
 * Faz requisição HTTP
 */
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const req = client.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (err) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

/**
 * Testa endpoint de teste
 */
async function testEndpoint() {
    console.log('🧪 Testando endpoint de teste...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}?test=1`);
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Teste do endpoint passou!');
            return true;
        } else {
            console.log('❌ Teste do endpoint falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste:', error.message);
        return false;
    }
}

/**
 * Testa webhook POST
 */
async function testWebhook() {
    console.log('\n🔗 Testando webhook POST...');
    
    const testPayload = {
        event_type: 'order_created',
        order: {
            order_id: `TEST_${Date.now()}`,
            customer: {
                email: 'test@example.com',
                name: 'Cliente Teste'
            },
            total_amount: 99.99,
            currency: 'BRL',
            items: [
                {
                    product_id: 'PHOERA_FOUNDATION',
                    quantity: 1,
                    price: 99.99
                }
            ]
        }
    };
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            body: testPayload
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Teste do webhook passou!');
            return true;
        } else {
            console.log('❌ Teste do webhook falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste do webhook:', error.message);
        return false;
    }
}

/**
 * Testa CORS
 */
async function testCORS() {
    console.log('\n🌐 Testando CORS...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://example.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Headers CORS:', {
            'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
        });
        
        if (response.status === 200) {
            console.log('✅ Teste CORS passou!');
            return true;
        } else {
            console.log('❌ Teste CORS falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste CORS:', error.message);
        return false;
    }
}

/**
 * Executa todos os testes
 */
async function runTests() {
    console.log('🚀 Iniciando testes do callback AliExpress...');
    console.log(`📍 URL base: ${BASE_URL}`);
    console.log(`🎯 Endpoint: ${ENDPOINT}\n`);
    
    const results = {
        endpoint: await testEndpoint(),
        webhook: await testWebhook(),
        cors: await testCORS()
    };
    
    console.log('\n📊 Resultados dos testes:');
    console.log('========================');
    console.log(`Endpoint de teste: ${results.endpoint ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Webhook POST: ${results.webhook ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`CORS: ${results.cors ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 Todos os testes passaram! O callback está funcionando corretamente.');
    } else {
        console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.');
    }
    
    return allPassed;
}

// Executar testes se chamado diretamente
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = { runTests, testEndpoint, testWebhook, testCORS };
