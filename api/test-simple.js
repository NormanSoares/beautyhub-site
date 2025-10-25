/**
 * Endpoint simples para teste
 */

import express from 'express';
const router = express.Router();

// GET /api/test-simple
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint funcionando',
        timestamp: new Date().toISOString()
    });
});

// POST /api/test-simple
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'Test POST funcionando',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});

export default router;

