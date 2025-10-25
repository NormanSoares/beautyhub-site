/**
 * Sistema de Conversão de Moedas AOA para USD
 * Conversão em tempo real com cache inteligente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações de conversão
const CURRENCY_CONFIG = {
    baseCurrency: 'USD',
    targetCurrency: 'AOA',
    cacheFile: path.join(__dirname, '../data/currency_cache.json'),
    cacheDuration: 60 * 60 * 1000, // 1 hora
    fallbackRate: 920, // Taxa de fallback AOA/USD
    apiEndpoints: [
        'https://api.exchangerate-api.com/v4/latest/USD',
        'https://api.fixer.io/latest?base=USD',
        'https://api.currencylayer.com/live?access_key=YOUR_KEY'
    ]
};

/**
 * Classe para Conversão de Moedas
 */
class CurrencyConverter {
    constructor() {
        this.cache = this.loadCache();
        this.rates = this.cache.rates || {};
        this.lastUpdate = this.cache.lastUpdate || 0;
    }

    /**
     * Carregar cache de taxas
     */
    loadCache() {
        try {
            if (fs.existsSync(CURRENCY_CONFIG.cacheFile)) {
                const cacheData = fs.readFileSync(CURRENCY_CONFIG.cacheFile, 'utf8');
                return JSON.parse(cacheData);
            }
        } catch (error) {
            console.log('⚠️ Cache de moedas não encontrado, criando novo...');
        }
        return { rates: {}, lastUpdate: 0 };
    }

    /**
     * Salvar cache de taxas
     */
    saveCache() {
        try {
            const cacheDir = path.dirname(CURRENCY_CONFIG.cacheFile);
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }
            
            const cacheData = {
                rates: this.rates,
                lastUpdate: this.lastUpdate
            };
            
            fs.writeFileSync(CURRENCY_CONFIG.cacheFile, JSON.stringify(cacheData, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar cache de moedas:', error);
        }
    }

    /**
     * Verificar se cache é válido
     */
    isCacheValid() {
        const now = Date.now();
        return (now - this.lastUpdate) < CURRENCY_CONFIG.cacheDuration;
    }

    /**
     * Obter taxa de câmbio AOA/USD
     */
    async getAOARate() {
        // Verificar cache primeiro
        if (this.isCacheValid() && this.rates.AOA) {
            console.log('🎯 Taxa AOA do cache:', this.rates.AOA);
            return this.rates.AOA;
        }

        // Tentar APIs de câmbio
        for (const endpoint of CURRENCY_CONFIG.apiEndpoints) {
            try {
                console.log(`🌐 Buscando taxa AOA de: ${endpoint}`);
                
                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    const aoaRate = this.extractAOARate(data);
                    
                    if (aoaRate && aoaRate > 0) {
                        this.rates.AOA = aoaRate;
                        this.lastUpdate = Date.now();
                        this.saveCache();
                        
                        console.log(`✅ Taxa AOA obtida: ${aoaRate}`);
                        return aoaRate;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Erro ao buscar taxa de ${endpoint}:`, error.message);
                continue;
            }
        }

        // Usar taxa de fallback
        console.log(`⚠️ Usando taxa de fallback AOA: ${CURRENCY_CONFIG.fallbackRate}`);
        this.rates.AOA = CURRENCY_CONFIG.fallbackRate;
        this.lastUpdate = Date.now();
        this.saveCache();
        
        return CURRENCY_CONFIG.fallbackRate;
    }

    /**
     * Extrair taxa AOA dos dados da API
     */
    extractAOARate(data) {
        // Tentar diferentes formatos de API
        if (data.rates && data.rates.AOA) {
            return data.rates.AOA;
        }
        
        if (data.quotes && data.quotes.USDAOA) {
            return data.quotes.USDAOA;
        }
        
        if (data.AOA) {
            return data.AOA;
        }
        
        return null;
    }

    /**
     * Converter AOA para USD
     */
    async convertAOAToUSD(aoaAmount) {
        try {
            const aoaRate = await this.getAOARate();
            const usdAmount = aoaAmount / aoaRate;
            
            console.log(`💱 Conversão: ${aoaAmount} AOA = ${usdAmount.toFixed(2)} USD (Taxa: ${aoaRate})`);
            return {
                success: true,
                originalAmount: aoaAmount,
                originalCurrency: 'AOA',
                convertedAmount: usdAmount,
                convertedCurrency: 'USD',
                exchangeRate: aoaRate,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Erro na conversão AOA->USD:', error);
            return {
                success: false,
                error: error.message,
                fallbackAmount: aoaAmount / CURRENCY_CONFIG.fallbackRate
            };
        }
    }

    /**
     * Converter USD para AOA
     */
    async convertUSDToAOA(usdAmount) {
        try {
            const aoaRate = await this.getAOARate();
            const aoaAmount = usdAmount * aoaRate;
            
            console.log(`💱 Conversão: ${usdAmount} USD = ${aoaAmount.toFixed(2)} AOA (Taxa: ${aoaRate})`);
            return {
                success: true,
                originalAmount: usdAmount,
                originalCurrency: 'USD',
                convertedAmount: aoaAmount,
                convertedCurrency: 'AOA',
                exchangeRate: aoaRate,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Erro na conversão USD->AOA:', error);
            return {
                success: false,
                error: error.message,
                fallbackAmount: usdAmount * CURRENCY_CONFIG.fallbackRate
            };
        }
    }

    /**
     * Detectar moeda do preço
     */
    detectCurrency(priceText) {
        const priceStr = priceText.toString().toLowerCase();
        
        if (priceStr.includes('aoa') || priceStr.includes('kz')) {
            return 'AOA';
        }
        if (priceStr.includes('usd') || priceStr.includes('$')) {
            return 'USD';
        }
        if (priceStr.includes('eur') || priceStr.includes('€')) {
            return 'EUR';
        }
        if (priceStr.includes('gbp') || priceStr.includes('£')) {
            return 'GBP';
        }
        
        return 'USD'; // Default
    }

    /**
     * Processar preço com conversão automática
     */
    async processPrice(priceText) {
        try {
            const currency = this.detectCurrency(priceText);
            const numericPrice = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));
            
            if (isNaN(numericPrice)) {
                return {
                    success: false,
                    error: 'Preço inválido',
                    originalPrice: priceText
                };
            }

            if (currency === 'AOA') {
                // Converter AOA para USD
                const conversion = await this.convertAOAToUSD(numericPrice);
                return {
                    success: true,
                    originalPrice: priceText,
                    originalAmount: numericPrice,
                    originalCurrency: 'AOA',
                    convertedAmount: conversion.convertedAmount,
                    convertedCurrency: 'USD',
                    exchangeRate: conversion.exchangeRate,
                    formattedPrice: `$${conversion.convertedAmount.toFixed(2)} USD`
                };
            } else {
                // Já está em USD ou outra moeda
                return {
                    success: true,
                    originalPrice: priceText,
                    originalAmount: numericPrice,
                    originalCurrency: currency,
                    convertedAmount: numericPrice,
                    convertedCurrency: currency,
                    exchangeRate: 1,
                    formattedPrice: `$${numericPrice.toFixed(2)} ${currency}`
                };
            }
        } catch (error) {
            console.error('❌ Erro ao processar preço:', error);
            return {
                success: false,
                error: error.message,
                originalPrice: priceText
            };
        }
    }

    /**
     * Obter estatísticas de conversão
     */
    getStats() {
        return {
            lastUpdate: this.lastUpdate,
            cacheAge: Date.now() - this.lastUpdate,
            aoaRate: this.rates.AOA,
            fallbackRate: CURRENCY_CONFIG.fallbackRate,
            isCacheValid: this.isCacheValid()
        };
    }
}

// Instância global
let globalCurrencyConverter = null;

/**
 * Obter instância do conversor
 */
export function getCurrencyConverter() {
    if (!globalCurrencyConverter) {
        globalCurrencyConverter = new CurrencyConverter();
    }
    return globalCurrencyConverter;
}

/**
 * Converter AOA para USD
 */
export async function convertAOAToUSD(aoaAmount) {
    const converter = getCurrencyConverter();
    return await converter.convertAOAToUSD(aoaAmount);
}

/**
 * Converter USD para AOA
 */
export async function convertUSDToAOA(usdAmount) {
    const converter = getCurrencyConverter();
    return await converter.convertUSDToAOA(usdAmount);
}

/**
 * Processar preço com conversão automática
 */
export async function processPrice(priceText) {
    const converter = getCurrencyConverter();
    return await converter.processPrice(priceText);
}

/**
 * Obter estatísticas de conversão
 */
export function getCurrencyStats() {
    const converter = getCurrencyConverter();
    return converter.getStats();
}

export default CurrencyConverter;

