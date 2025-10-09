/**
 * Script de teste para a API Index
 * Testa o endpoint principal da API
 */

const https = require('https');
const http = require('http');

// Configurações
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const ENDPOINT = '/api/';

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
 * Testa endpoint GET
 */
async function testGetEndpoint() {
    console.log('🧪 Testando endpoint GET...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`);
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.api) {
            console.log('✅ Teste GET passou!');
            return true;
        } else {
            console.log('❌ Teste GET falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste GET:', error.message);
        return false;
    }
}

/**
 * Testa operação get_stats
 */
async function testGetStats() {
    console.log('\n📊 Testando operação get_stats...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            body: {
                action: 'get_stats',
                data: {}
            }
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Teste get_stats passou!');
            return true;
        } else {
            console.log('❌ Teste get_stats falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste get_stats:', error.message);
        return false;
    }
}

/**
 * Testa operação get_health
 */
async function testGetHealth() {
    console.log('\n❤️ Testando operação get_health...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            body: {
                action: 'get_health',
                data: {}
            }
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Teste get_health passou!');
            return true;
        } else {
            console.log('❌ Teste get_health falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste get_health:', error.message);
        return false;
    }
}

/**
 * Testa operação test_connection
 */
async function testConnection() {
    console.log('\n🔗 Testando operação test_connection...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            body: {
                action: 'test_connection',
                data: {}
            }
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Teste test_connection passou!');
            return true;
        } else {
            console.log('❌ Teste test_connection falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste test_connection:', error.message);
        return false;
    }
}

/**
 * Testa operação get_collections
 */
async function testGetCollections() {
    console.log('\n📁 Testando operação get_collections...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            body: {
                action: 'get_collections',
                data: {}
            }
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Teste get_collections passou!');
            return true;
        } else {
            console.log('❌ Teste get_collections falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste get_collections:', error.message);
        return false;
    }
}

/**
 * Testa operação inválida
 */
async function testInvalidAction() {
    console.log('\n❌ Testando operação inválida...');
    
    try {
        const response = await makeRequest(`${BASE_URL}${ENDPOINT}`, {
            method: 'POST',
            body: {
                action: 'invalid_action',
                data: {}
            }
        });
        
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 && !response.data.success) {
            console.log('✅ Teste operação inválida passou!');
            return true;
        } else {
            console.log('❌ Teste operação inválida falhou!');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste operação inválida:', error.message);
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
    console.log('🚀 Iniciando testes da API Index...');
    console.log(`📍 URL base: ${BASE_URL}`);
    console.log(`🎯 Endpoint: ${ENDPOINT}\n`);
    
    const results = {
        get: await testGetEndpoint(),
        getStats: await testGetStats(),
        getHealth: await testGetHealth(),
        testConnection: await testConnection(),
        getCollections: await testGetCollections(),
        invalidAction: await testInvalidAction(),
        cors: await testCORS()
    };
    
    console.log('\n📊 Resultados dos testes:');
    console.log('========================');
    console.log(`GET Endpoint: ${results.get ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`get_stats: ${results.getStats ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`get_health: ${results.getHealth ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`test_connection: ${results.testConnection ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`get_collections: ${results.getCollections ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Operação inválida: ${results.invalidAction ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`CORS: ${results.cors ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 Todos os testes passaram! A API Index está funcionando corretamente.');
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

module.exports = { 
    runTests, 
    testGetEndpoint, 
    testGetStats, 
    testGetHealth, 
    testConnection,
    testGetCollections,
    testInvalidAction,
    testCORS 
};