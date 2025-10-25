/**
 * Sistema de Assinatura para AliExpress API
 * Implementa assinatura obrigatória conforme documentação oficial
 */

import crypto from 'crypto';

/**
 * Gerar assinatura para requisições AliExpress
 * @param {Object} params - Parâmetros da requisição
 * @param {string} appSecret - Chave secreta da aplicação
 * @param {string} timestamp - Timestamp da requisição
 * @returns {string} - Assinatura gerada
 */
export function generateSignature(params, appSecret, timestamp) {
    try {
        // 1. Ordenar parâmetros alfabeticamente
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        // 2. Criar string para assinatura
        const signString = `${sortedParams}&timestamp=${timestamp}&secret=${appSecret}`;
        
        // 3. Gerar hash MD5
        const signature = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
        
        console.log('🔐 Assinatura gerada:', signature);
        return signature;
        
    } catch (error) {
        console.error('❌ Erro ao gerar assinatura:', error);
        throw error;
    }
}

/**
 * Adicionar parâmetros obrigatórios para AliExpress
 * @param {Object} baseParams - Parâmetros base
 * @param {string} appKey - Chave da aplicação
 * @param {string} appSecret - Chave secreta
 * @returns {Object} - Parâmetros com assinatura
 */
export function addRequiredParams(baseParams, appKey, appSecret) {
    const timestamp = Date.now().toString();
    
    const params = {
        ...baseParams,
        app_key: appKey,
        timestamp: timestamp,
        format: 'json',
        v: '2.0',
        sign_method: 'md5'
    };

    // Gerar assinatura
    const signature = generateSignature(params, appSecret, timestamp);
    params.sign = signature;

    return params;
}

/**
 * Validar resposta da API
 * @param {Object} response - Resposta da API
 * @returns {boolean} - Se a resposta é válida
 */
export function validateApiResponse(response) {
    if (!response) return false;
    
    // Verificar se é HTML (erro comum)
    if (typeof response === 'string' && response.includes('<!DOCTYPE')) {
        console.error('❌ API retornou HTML em vez de JSON');
        return false;
    }
    
    // Verificar estrutura de resposta AliExpress
    if (response.error_response) {
        console.error('❌ Erro da API AliExpress:', response.error_response);
        return false;
    }
    
    return true;
}

export default {
    generateSignature,
    addRequiredParams,
    validateApiResponse
};

