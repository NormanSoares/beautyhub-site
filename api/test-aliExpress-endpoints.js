/**
 * Teste de Endpoints AliExpress
 * Verificar qual endpoint funciona
 */

import fetch from 'node-fetch';

const credentials = {
    appKey: '520258',
    appSecret: 'HWUOyFoxVp9U5EoiM1U4febs77IUFDX3',
    trackingId: '520258'
};

const endpoints = [
    'https://api-sg.aliexpress.com/oauth/token',
    'https://api.aliexpress.com/oauth/token',
    'https://openservice.aliexpress.com/oauth/token',
    'https://api-sg.aliexpress.com/oauth/authorize',
    'https://api.aliexpress.com/oauth/authorize'
];

async function testEndpoint(url) {
    try {
        console.log(`🔍 Testando: ${url}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                client_id: credentials.appKey,
                client_secret: credentials.appSecret
            })
        });

        const data = await response.text();
        
        console.log(`✅ Status: ${response.status}`);
        console.log(`📄 Response: ${data.substring(0, 200)}...`);
        
        if (response.ok) {
            console.log('🎯 ENDPOINT FUNCIONANDO!');
            return { success: true, url, data };
        } else {
            console.log('❌ Endpoint falhou');
            return { success: false, url, error: data };
        }
        
    } catch (error) {
        console.log(`❌ Erro: ${error.message}`);
        return { success: false, url, error: error.message };
    }
}

async function testAllEndpoints() {
    console.log('🚀 Testando todos os endpoints AliExpress...\n');
    
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
        console.log('---\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Executar teste
testAllEndpoints().catch(console.error);

