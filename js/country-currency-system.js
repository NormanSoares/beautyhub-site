// Country/Currency System for Checkout Pages
// This script provides automatic currency detection and country selection

let currentCurrency = 'US';
let currentLanguage = 'en';
let exchangeRates = {
    'US': { symbol: '$', rate: 1, locale: 'en-US', language: 'en', currency: 'USD' },
    'BR': { symbol: 'R$', rate: 5.27, locale: 'pt-BR', language: 'pt', currency: 'BRL' },
    'PT': { symbol: '€', rate: 0.92, locale: 'pt-PT', language: 'pt', currency: 'EUR' }
};

// Auto-detect user language and set currency accordingly
function detectUserLanguageAndCurrency() {
    // SEMPRE verificar se usuário já tem preferência salva PRIMEIRO
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry && exchangeRates[savedCountry]) {
        console.log('🌍 Usando preferência salva do usuário:', savedCountry);
        return savedCountry;
    }
    
    // Se não há preferência salva, usar US como padrão
    console.log('🇺🇸 Nenhuma preferência salva, usando US como padrão');
    return 'US';
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { detectUserLanguageAndCurrency, exchangeRates };
}