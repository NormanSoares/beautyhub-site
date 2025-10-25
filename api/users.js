/**
 * API de Gerenciamento de Usuários
 * Sistema de autenticação e gerenciamento de usuários
 */

import { MongoClient } from 'mongodb';

// Configuração do MongoDB
// Nunca incluir credenciais embutidas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';

let mongoClient = null;

/**
 * Conecta ao MongoDB
 */
async function connectToMongoDB() {
    if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
        return mongoClient;
    }

    try {
        mongoClient = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        await mongoClient.connect();
        console.log('✅ Conectado ao MongoDB (Users API)');
        return mongoClient;
    } catch (error) {
        console.error('❌ Erro ao conectar MongoDB (Users API):', error.message);
        throw error;
    }
}

/**
 * Hash simples para senha (em produção usar bcrypt)
 */
function hashPassword(password) {
    return Buffer.from(password).toString('base64');
}

/**
 * Verifica senha (em produção usar bcrypt)
 */
function verifyPassword(password, hashedPassword) {
    return Buffer.from(password).toString('base64') === hashedPassword;
}

/**
 * Cria um novo usuário
 */
async function createUser(req, res) {
    try {
        const { name, email, password, provider = 'email' } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Nome e email são obrigatórios'
            });
        }

        const client = await connectToMongoDB();
        const db = client.db();

        // Verificar se usuário já existe
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Usuário já existe'
            });
        }

        const user = {
            name,
            email,
            provider,
            status: 'active',
            createdAt: new Date(),
            lastLogin: new Date(),
            ...(password && { password: hashPassword(password) })
        };

        const result = await db.collection('users').insertOne(user);

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            userId: result.insertedId,
            user: {
                id: result.insertedId,
                name: user.name,
                email: user.email,
                provider: user.provider
            }
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Autentica um usuário
 */
async function authenticateUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        const client = await connectToMongoDB();
        const db = client.db();

        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                error: 'Usuário sem senha definida'
            });
        }

        const isValidPassword = verifyPassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Senha incorreta'
            });
        }

        // Atualizar último login
        await db.collection('users').updateOne(
            { email },
            { $set: { lastLogin: new Date() } }
        );

        res.json({
            success: true,
            message: 'Autenticação bem-sucedida',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Busca um usuário por email
 */
async function getUserByEmail(req, res) {
    try {
        const { email } = req.params;

        const client = await connectToMongoDB();
        const db = client.db();

        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                status: user.status,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Lista todos os usuários
 */
async function getAllUsers(req, res) {
    try {
        const client = await connectToMongoDB();
        const db = client.db();

        const users = await db.collection('users').find({}).toArray();

        const sanitizedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            status: user.status,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        res.json({
            success: true,
            count: sanitizedUsers.length,
            users: sanitizedUsers
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Atualiza um usuário
 */
async function updateUser(req, res) {
    try {
        const { email } = req.params;
        const updateData = req.body;

        const client = await connectToMongoDB();
        const db = client.db();

        // Remover campos que não devem ser atualizados diretamente
        delete updateData._id;
        delete updateData.email; // Não permitir alteração de email

        // Verificar se o usuário existe
        const existingUser = await db.collection('users').findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        // Se estiver atualizando senha, fazer hash
        if (updateData.password) {
            updateData.password = hashPassword(updateData.password);
        }

        const result = await db.collection('users').updateOne(
            { email },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Atualiza permissões de um usuário
 */
async function updateUserPermissions(req, res) {
    try {
        const { email } = req.params;
        const { permissions } = req.body;

        const client = await connectToMongoDB();
        const db = client.db();

        const result = await db.collection('users').updateOne(
            { email },
            {
                $set: {
                    permissions: permissions || {},
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Permissões atualizadas com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar permissões:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Busca permissões de um usuário
 */
async function getUserPermissions(req, res) {
    try {
        const { email } = req.params;

        const client = await connectToMongoDB();
        const db = client.db();

        const user = await db.collection('users').findOne(
            { email },
            { projection: { permissions: 1, role: 1, status: 1 } }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            permissions: user.permissions || {},
            role: user.role,
            status: user.status
        });

    } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

/**
 * Remove um usuário
 */
async function deleteUser(req, res) {
    try {
        const { email } = req.params;

        const client = await connectToMongoDB();
        const db = client.db();

        const result = await db.collection('users').deleteOne({ email });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuário removido com sucesso'
        });

    } catch (error) {
        console.error('Erro ao remover usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
}

export {
    createUser,
    authenticateUser,
    getUserByEmail,
    getAllUsers,
    updateUser,
    updateUserPermissions,
    getUserPermissions,
    deleteUser
};



