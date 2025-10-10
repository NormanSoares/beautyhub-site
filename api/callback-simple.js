/**
 * API Callback Endpoint Simplificado - Para debug
 */

import { MongoClient } from 'mongodb';
import crypto from 'crypto';

// Configurações
const MONGODB_URI = process.env.ROCKETDB_URI || process.env.ROCKETDB || process.env.NORMANDB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/beautyhub';

/**
 * Handler principal simplificado
 */
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Endpoint de teste
        if (req.method === 'GET' && req.query.test === '1') {
            return res.status(200).json({
                success: true,
                message: 'Callback geral funcionando!',
                timestamp: new Date().toISOString(),
                method: req.method,
                query: req.query
            });
        }
        
        // Processar POST
        if (req.method === 'POST') {
            return res.status(200).json({
                success: true,
                message: 'POST recebido com sucesso',
                data: req.body,
                timestamp: new Date().toISOString()
            });
        }
        
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowed: ['GET', 'POST', 'OPTIONS']
        });
        
    } catch (error) {
        console.error('Erro no callback:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
