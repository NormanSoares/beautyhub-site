/**
 * Rotas de Autenticação - Express Routes
 * Sistema de autenticação de usuários
 */

import express from 'express';
import { authenticateUser } from './users.js';

const router = express.Router();

// Middleware de logging
router.use((req, res, next) => {
    console.log(`🔐 ${req.method} ${req.path}`, {
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    next();
});

// Rota para autenticação
router.post('/login', authenticateUser);

// Rota para verificar token (futuro)
// router.post('/verify', verifyToken);

export default router;






