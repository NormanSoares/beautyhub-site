/**
 * Sistema de Retry Inteligente para AliExpress
 * Máxima eficiência com retry adaptativo
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações de retry inteligente
const SMART_RETRY_CONFIG = {
    maxRetries: 10,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    jitterRange: 0.3,
    successThreshold: 0.95,
    failureThreshold: 0.05
};

/**
 * Classe para Retry Inteligente
 */
class SmartRetrySystem {
    constructor() {
        this.stats = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
            averageResponseTime: 0,
            lastSuccessTime: null,
            lastFailureTime: null
        };
        this.adaptiveDelays = [];
        this.successPatterns = [];
        this.failurePatterns = [];
    }

    /**
     * Calcular delay adaptativo
     */
    calculateAdaptiveDelay(attemptNumber, lastResponseTime = 0) {
        // Delay base com backoff exponencial
        let baseDelay = SMART_RETRY_CONFIG.baseDelay * Math.pow(SMART_RETRY_CONFIG.backoffMultiplier, attemptNumber - 1);
        
        // Limitar delay máximo
        baseDelay = Math.min(baseDelay, SMART_RETRY_CONFIG.maxDelay);
        
        // Adicionar jitter para evitar thundering herd
        const jitter = baseDelay * SMART_RETRY_CONFIG.jitterRange * Math.random();
        const totalDelay = baseDelay + jitter;
        
        // Ajustar baseado no tempo de resposta anterior
        if (lastResponseTime > 0) {
            const responseTimeFactor = Math.min(lastResponseTime / 1000, 2); // Máximo 2x
            return totalDelay * responseTimeFactor;
        }
        
        return totalDelay;
    }

    /**
     * Determinar se deve tentar novamente
     */
    shouldRetry(attemptNumber, error, responseTime) {
        // Não exceder máximo de tentativas
        if (attemptNumber >= SMART_RETRY_CONFIG.maxRetries) {
            return false;
        }

        // Se taxa de sucesso muito baixa, parar
        const successRate = this.getSuccessRate();
        if (successRate < SMART_RETRY_CONFIG.failureThreshold) {
            return false;
        }

        // Se erro é recuperável
        if (this.isRecoverableError(error)) {
            return true;
        }

        // Se tempo de resposta muito alto, tentar com delay maior
        if (responseTime > 30000) { // 30 segundos
            return true;
        }

        // Se muitas falhas consecutivas, pausar mais
        if (this.stats.consecutiveFailures > 3) {
            return attemptNumber < 5; // Limitar tentativas
        }

        return true;
    }

    /**
     * Verificar se erro é recuperável
     */
    isRecoverableError(error) {
        const recoverableErrors = [
            'Navigation timeout',
            'Network error',
            'Connection refused',
            'Timeout',
            'Blocked',
            'Rate limited',
            'Temporary failure'
        ];

        const errorMessage = error.message || error.toString();
        return recoverableErrors.some(recoverableError => 
            errorMessage.toLowerCase().includes(recoverableError.toLowerCase())
        );
    }

    /**
     * Obter taxa de sucesso
     */
    getSuccessRate() {
        if (this.stats.totalAttempts === 0) return 1;
        return this.stats.successfulAttempts / this.stats.totalAttempts;
    }

    /**
     * Atualizar estatísticas
     */
    updateStats(success, responseTime) {
        this.stats.totalAttempts++;
        
        if (success) {
            this.stats.successfulAttempts++;
            this.stats.consecutiveSuccesses++;
            this.stats.consecutiveFailures = 0;
            this.stats.lastSuccessTime = Date.now();
        } else {
            this.stats.failedAttempts++;
            this.stats.consecutiveFailures++;
            this.stats.consecutiveSuccesses = 0;
            this.stats.lastFailureTime = Date.now();
        }

        // Atualizar tempo médio de resposta
        if (responseTime > 0) {
            this.stats.averageResponseTime = 
                (this.stats.averageResponseTime * (this.stats.totalAttempts - 1) + responseTime) / 
                this.stats.totalAttempts;
        }
    }

    /**
     * Executar com retry inteligente
     */
    async executeWithRetry(operation, context = {}) {
        let attemptNumber = 1;
        let lastError = null;
        let lastResponseTime = 0;

        while (attemptNumber <= SMART_RETRY_CONFIG.maxRetries) {
            const startTime = Date.now();
            
            try {
                console.log(`🔄 Tentativa ${attemptNumber}/${SMART_RETRY_CONFIG.maxRetries} - ${context.operation || 'Operação'}`);
                
                const result = await operation(attemptNumber, context);
                const responseTime = Date.now() - startTime;
                
                this.updateStats(true, responseTime);
                console.log(`✅ Sucesso na tentativa ${attemptNumber} (${responseTime}ms)`);
                
                return result;
                
            } catch (error) {
                const responseTime = Date.now() - startTime;
                lastError = error;
                lastResponseTime = responseTime;
                
                this.updateStats(false, responseTime);
                console.log(`❌ Falha na tentativa ${attemptNumber}: ${error.message}`);
                
                // Verificar se deve tentar novamente
                if (!this.shouldRetry(attemptNumber, error, responseTime)) {
                    console.log(`🛑 Parando tentativas - ${this.getStopReason()}`);
                    throw error;
                }
                
                // Calcular delay para próxima tentativa
                const delay = this.calculateAdaptiveDelay(attemptNumber, responseTime);
                console.log(`⏳ Aguardando ${Math.round(delay)}ms antes da próxima tentativa...`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                attemptNumber++;
            }
        }
        
        throw lastError || new Error('Todas as tentativas falharam');
    }

    /**
     * Obter razão para parar
     */
    getStopReason() {
        if (this.stats.totalAttempts >= SMART_RETRY_CONFIG.maxRetries) {
            return 'Máximo de tentativas atingido';
        }
        
        if (this.getSuccessRate() < SMART_RETRY_CONFIG.failureThreshold) {
            return 'Taxa de sucesso muito baixa';
        }
        
        return 'Erro não recuperável';
    }

    /**
     * Obter estatísticas
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.getSuccessRate(),
            averageResponseTime: Math.round(this.stats.averageResponseTime),
            consecutiveFailures: this.stats.consecutiveFailures,
            consecutiveSuccesses: this.stats.consecutiveSuccesses
        };
    }

    /**
     * Reset estatísticas
     */
    resetStats() {
        this.stats = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
            averageResponseTime: 0,
            lastSuccessTime: null,
            lastFailureTime: null
        };
    }
}

// Instância global
let globalSmartRetry = null;

/**
 * Obter instância do sistema de retry
 */
export function getSmartRetrySystem() {
    if (!globalSmartRetry) {
        globalSmartRetry = new SmartRetrySystem();
    }
    return globalSmartRetry;
}

/**
 * Executar operação com retry inteligente
 */
export async function executeWithSmartRetry(operation, context = {}) {
    const retrySystem = getSmartRetrySystem();
    return await retrySystem.executeWithRetry(operation, context);
}

/**
 * Obter estatísticas do sistema
 */
export function getRetryStats() {
    const retrySystem = getSmartRetrySystem();
    return retrySystem.getStats();
}

export default SmartRetrySystem;

