/**
 * Rotas de Usuários - Express Routes
 * Sistema de gerenciamento de usuários com Express
 */

import express from 'express';
import {
    createUser,
    authenticateUser,
    getUserByEmail,
    getAllUsers,
    updateUser,
    updateUserPermissions,
    getUserPermissions,
    deleteUser
} from './users.js';

const router = express.Router();

// Middleware de logging
router.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path}`, {
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    next();
});

// Rota para criar usuário
router.post('/', createUser);

// Rota para listar todos os usuários
router.get('/', getAllUsers);

// Rota para buscar usuário por email
router.get('/:email', getUserByEmail);

// Rota para atualizar usuário
router.put('/:email', updateUser);

// Rota para deletar usuário
router.delete('/:email', deleteUser);

// Rota para buscar permissões de usuário
router.get('/:email/permissions', getUserPermissions);

// Rota para atualizar permissões de usuário
router.put('/:email/permissions', updateUserPermissions);

export default router;



