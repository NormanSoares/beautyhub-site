/**
 * Configuração do MongoDB para o Beauty Hub
 * 
 * Este arquivo contém as configurações e schemas para o MongoDB
 */

// Configurações de conexão
const MONGODB_CONFIG = {
    // URI de conexão (será sobrescrita pela variável de ambiente)
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub',
    
    // Configurações de conexão
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
    },
    
    // Nome do banco de dados
    database: 'beautyhub',
    
    // Collections disponíveis
    collections: {
        orders: 'orders',
        payments: 'payments',
        users: 'users',
        products: 'products',
        aliexpress_orders: 'aliexpress_orders',
        webhooks: 'webhooks',
        logs: 'logs'
    }
};

// Schemas/estruturas dos documentos
const SCHEMAS = {
    orders: {
        orderId: String,
        status: String,
        customerEmail: String,
        totalAmount: Number,
        currency: String,
        items: Array,
        timestamp: Date,
        createdAt: Date,
        updatedAt: Date,
        metadata: Object
    },
    
    payments: {
        paymentId: String,
        orderId: String,
        amount: Number,
        currency: String,
        status: String,
        method: String,
        timestamp: Date,
        createdAt: Date,
        metadata: Object
    },
    
    users: {
        userId: String,
        email: String,
        name: String,
        registrationDate: Date,
        createdAt: Date,
        metadata: Object
    },
    
    products: {
        productId: String,
        name: String,
        price: Number,
        stock: Number,
        status: String,
        timestamp: Date,
        createdAt: Date,
        updatedAt: Date,
        metadata: Object
    },
    
    aliexpress_orders: {
        orderId: String,
        productId: String,
        status: String,
        trackingNumber: String,
        shippingCompany: String,
        timestamp: Date,
        createdAt: Date,
        metadata: Object
    },
    
    webhooks: {
        webhookId: String,
        source: String,
        type: String,
        payload: Object,
        processed: Boolean,
        timestamp: Date,
        createdAt: Date
    },
    
    logs: {
        level: String,
        message: String,
        source: String,
        data: Object,
        timestamp: Date,
        createdAt: Date
    }
};

// Índices recomendados para otimização
const INDEXES = {
    orders: [
        { orderId: 1 },
        { customerEmail: 1 },
        { status: 1 },
        { createdAt: -1 }
    ],
    
    payments: [
        { paymentId: 1 },
        { orderId: 1 },
        { status: 1 },
        { createdAt: -1 }
    ],
    
    users: [
        { userId: 1 },
        { email: 1 },
        { registrationDate: -1 }
    ],
    
    products: [
        { productId: 1 },
        { name: 1 },
        { status: 1 },
        { updatedAt: -1 }
    ],
    
    aliexpress_orders: [
        { orderId: 1 },
        { productId: 1 },
        { status: 1 },
        { createdAt: -1 }
    ],
    
    webhooks: [
        { webhookId: 1 },
        { source: 1 },
        { type: 1 },
        { timestamp: -1 }
    ],
    
    logs: [
        { level: 1 },
        { source: 1 },
        { timestamp: -1 }
    ]
};

// Funções utilitárias para MongoDB
const MongoDBUtils = {
    /**
     * Cria índices para uma collection
     */
    async createIndexes(db, collectionName) {
        try {
            const collection = db.collection(collectionName);
            const collectionIndexes = INDEXES[collectionName] || [];
            
            for (const index of collectionIndexes) {
                await collection.createIndex(index);
                console.log(`Índice criado para ${collectionName}:`, index);
            }
        } catch (error) {
            console.error(`Erro ao criar índices para ${collectionName}:`, error);
        }
    },
    
    /**
     * Cria todos os índices do banco
     */
    async createAllIndexes(db) {
        for (const collectionName of Object.keys(INDEXES)) {
            await this.createIndexes(db, collectionName);
        }
    },
    
    /**
     * Valida estrutura de documento
     */
    validateDocument(collectionName, document) {
        const schema = SCHEMAS[collectionName];
        if (!schema) {
            return { valid: false, error: 'Collection schema not found' };
        }
        
        // Validações básicas (pode ser expandido)
        const requiredFields = Object.keys(schema).filter(field => 
            !field.includes('?') && !field.includes('*')
        );
        
        for (const field of requiredFields) {
            if (document[field] === undefined || document[field] === null) {
                return { 
                    valid: false, 
                    error: `Required field missing: ${field}` 
                };
            }
        }
        
        return { valid: true };
    },
    
    /**
     * Sanitiza documento para inserção
     */
    sanitizeDocument(document) {
        const sanitized = { ...document };
        
        // Adicionar timestamps se não existirem
        if (!sanitized.createdAt) {
            sanitized.createdAt = new Date();
        }
        if (!sanitized.timestamp) {
            sanitized.timestamp = new Date();
        }
        
        // Remover campos vazios
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === undefined || sanitized[key] === null || sanitized[key] === '') {
                delete sanitized[key];
            }
        });
        
        return sanitized;
    }
};

module.exports = {
    MONGODB_CONFIG,
    SCHEMAS,
    INDEXES,
    MongoDBUtils
};
