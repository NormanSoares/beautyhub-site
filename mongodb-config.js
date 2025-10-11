/**
 * Configuração do MongoDB para 67 Beauty Hub
 * Este arquivo contém as configurações de conexão com o banco de dados
 */

// Configurações do MongoDB
export const MONGODB_CONFIG = {
    // MongoDB Atlas (Cloud) - RECOMENDADO
    atlas: {
        uri: 'mongodb+srv://BATMANRICH_db_user:password1234567@cluster0.pdopfr2.mongodb.net/beautyhub?retryWrites=true&w=majority&appName=Cluster0',
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 2000,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 2000,
            retryWrites: true,
            retryReads: true,
        }
    },
    
    // MongoDB Atlas - Usuário alternativo
    atlas_alt: {
        uri: 'mongodb+srv://mojojojo946925_db_user:dilr1234567@cluster0.pdopfr2.mongodb.net/beautyhub?retryWrites=true&w=majority&appName=Cluster0',
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 2000,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 2000,
            retryWrites: true,
            retryReads: true,
        }
    },
    
    // MongoDB Local (Desenvolvimento)
    local: {
        uri: 'mongodb://localhost:27017/beautyhub',
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 2000,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 2000,
            retryWrites: true,
            retryReads: true,
        }
    }
};

// Configurações de Webhook
export const WEBHOOK_CONFIG = {
    secret: '67beautyhub_webhook_secret_2024',
    aliexpressSecret: '67beautyhub_webhook_secret_2024',
    allowedOrigins: ['*']
};

// Configurações do Servidor
export const SERVER_CONFIG = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
};

/**
 * Função para obter a URI do MongoDB
 * Prioriza variáveis de ambiente, depois configurações padrão
 */
export function getMongoURI() {
    // Verificar variáveis de ambiente primeiro
    const envVars = [
        'MONGODB_URI',
        'ROCKETDB_URI', 
        'NORMANDB_URI',
        'MONGODB_ATLAS_URI'
    ];
    
    for (const envVar of envVars) {
        if (process.env[envVar]) {
            console.log(`✅ Usando ${envVar} para conexão MongoDB`);
            return process.env[envVar];
        }
    }
    
    // Fallback para configuração Atlas (BATMANRICH)
    console.log('✅ Usando configuração Atlas (BATMANRICH_db_user)');
    return MONGODB_CONFIG.atlas.uri;
}

/**
 * Função para obter as opções de conexão
 */
export function getMongoOptions() {
    return MONGODB_CONFIG.atlas.options;
}

/**
 * Função para testar conexão com MongoDB
 */
export async function testMongoConnection() {
    const { MongoClient } = await import('mongodb');
    
    try {
        const uri = getMongoURI();
        const options = getMongoOptions();
        
        console.log('🔌 Testando conexão com MongoDB...');
        console.log(`📍 URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`); // Mascarar credenciais
        
        const client = new MongoClient(uri, options);
        await client.connect();
        
        // Testar ping
        await client.db('admin').command({ ping: 1 });
        
        console.log('✅ Conexão com MongoDB estabelecida com sucesso!');
        
        // Listar databases
        const adminDb = client.db('admin');
        const databases = await adminDb.admin().listDatabases();
        console.log('📊 Databases disponíveis:', databases.databases.map(db => db.name));
        
        await client.close();
        return { success: true, message: 'Conexão estabelecida' };
        
    } catch (error) {
        console.error('❌ Erro ao conectar com MongoDB:', error.message);
        return { success: false, error: error.message };
    }
}

// Exportar configuração padrão
export default {
    MONGODB_CONFIG,
    WEBHOOK_CONFIG,
    SERVER_CONFIG,
    getMongoURI,
    getMongoOptions,
    testMongoConnection
};
