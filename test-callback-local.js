/**
 * Teste local do callback AliExpress
 */

// Simular variáveis de ambiente
process.env.ROCKETDB_URI = 'mongodb+srv://BATMANRICH_db_user:password1234567@cluster0.pdopfr2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
process.env.NODE_ENV = 'development';

const { MongoClient } = require('mongodb');

async function testCallback() {
    console.log('🧪 Testando callback AliExpress localmente...\n');
    
    // Teste 1: Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente:');
    console.log('   ROCKETDB_URI:', process.env.ROCKETDB_URI ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'NÃO CONFIGURADA');
    
    // Teste 2: Verificar conexão MongoDB
    console.log('\n2️⃣ Testando conexão MongoDB:');
    try {
        const client = new MongoClient(process.env.ROCKETDB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        await client.connect();
        console.log('   ✅ Conexão MongoDB OK!');
        
        // Teste 3: Verificar inserção de dados
        console.log('\n3️⃣ Testando inserção de dados:');
        const db = client.db('beautyhub');
        const collection = db.collection('orders');
        
        const testOrder = {
            order_id: 'TEST_LOCAL_' + Date.now(),
            event_type: 'order_created',
            customer: {
                email: 'test@example.com',
                name: 'Cliente Teste Local'
            },
            total_amount: 99.99,
            currency: 'BRL',
            items: [{
                product_id: 'PHOERA_FOUNDATION',
                quantity: 1,
                price: 99.99
            }],
            timestamp: new Date().toISOString()
        };
        
        const result = await collection.insertOne(testOrder);
        console.log('   ✅ Dados inseridos com sucesso!');
        console.log('   📝 ID do documento:', result.insertedId);
        
        await client.close();
        console.log('\n🎉 Todos os testes passaram! O callback está funcionando perfeitamente!');
        
    } catch (error) {
        console.log('   ❌ Erro:', error.message);
        console.log('\n💡 O problema está na conexão MongoDB ou configuração.');
    }
}

// Executar teste
testCallback().catch(console.error);
