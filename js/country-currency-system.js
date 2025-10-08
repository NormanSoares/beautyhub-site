// Country/Currency System for Checkout Pages
// This script provides automatic currency detection and country selection

let currentCurrency = 'US';
let currentLanguage = 'en';
let exchangeRates = {
    'US': { symbol: '$', rate: 1, locale: 'en-US', language: 'en', currency: 'USD' },
    'BR': { symbol: 'R$', rate: 5.27, locale: 'pt-BR', language: 'pt', currency: 'BRL' },
    'CA': { symbol: 'C$', rate: 1.35, locale: 'en-CA', language: 'en', currency: 'CAD' },
    'MX': { symbol: '$', rate: 17.50, locale: 'es-MX', language: 'es', currency: 'MXN' },
    'AR': { symbol: '$', rate: 850, locale: 'es-AR', language: 'es', currency: 'ARS' },
    'CL': { symbol: '$', rate: 950, locale: 'es-CL', language: 'es', currency: 'CLP' },
    'CO': { symbol: '$', rate: 4200, locale: 'es-CO', language: 'es', currency: 'COP' },
    'PE': { symbol: 'S/', rate: 3.75, locale: 'es-PE', language: 'es', currency: 'PEN' },
    'UY': { symbol: '$', rate: 42, locale: 'es-UY', language: 'es', currency: 'UYU' },
    'PT': { symbol: '€', rate: 0.92, locale: 'pt-PT', language: 'pt', currency: 'EUR' },
    'ES': { symbol: '€', rate: 0.92, locale: 'es-ES', language: 'es', currency: 'EUR' },
    'FR': { symbol: '€', rate: 0.92, locale: 'fr-FR', language: 'fr', currency: 'EUR' },
    'DE': { symbol: '€', rate: 0.92, locale: 'de-DE', language: 'de', currency: 'EUR' },
    'IT': { symbol: '€', rate: 0.92, locale: 'it-IT', language: 'it', currency: 'EUR' },
    'GB': { symbol: '£', rate: 0.79, locale: 'en-GB', language: 'en', currency: 'GBP' },
    'AU': { symbol: 'A$', rate: 1.52, locale: 'en-AU', language: 'en', currency: 'AUD' },
    'JP': { symbol: '¥', rate: 150, locale: 'ja-JP', language: 'ja', currency: 'JPY' },
    'CN': { symbol: '¥', rate: 7.25, locale: 'zh-CN', language: 'zh', currency: 'CNY' },
    'IN': { symbol: '₹', rate: 83, locale: 'en-IN', language: 'en', currency: 'INR' }
};

// Auto-detect user language and set currency accordingly
function detectUserLanguageAndCurrency() {
    const userLanguage = navigator.language || navigator.userLanguage;
    const languageCode = userLanguage.toLowerCase();
    
    console.log('Detected browser language:', userLanguage);
    
    let detectedCountry = 'US';
    
    if (languageCode.startsWith('pt')) {
        detectedCountry = 'BR';
        console.log('Portuguese detected → Brazil');
    } else if (languageCode.startsWith('es')) {
        detectedCountry = 'MX';
        console.log('Spanish detected → Mexico');
    } else if (languageCode.startsWith('en')) {
        if (languageCode.includes('gb') || languageCode.includes('uk')) {
            detectedCountry = 'GB';
            console.log('British English detected → UK');
        } else if (languageCode.includes('ca')) {
            detectedCountry = 'CA';
            console.log('Canadian English detected → Canada');
        } else if (languageCode.includes('au')) {
            detectedCountry = 'AU';
            console.log('Australian English detected → Australia');
        } else {
            detectedCountry = 'US';
            console.log('English detected → USA');
        }
    } else if (languageCode.startsWith('fr')) {
        detectedCountry = 'FR';
        console.log('French detected → France');
    } else if (languageCode.startsWith('de')) {
        detectedCountry = 'DE';
        console.log('German detected → Germany');
    } else if (languageCode.startsWith('it')) {
        detectedCountry = 'IT';
        console.log('Italian detected → Italy');
    } else if (languageCode.startsWith('ja')) {
        detectedCountry = 'JP';
        console.log('Japanese detected → Japan');
    } else if (languageCode.startsWith('zh')) {
        detectedCountry = 'CN';
        console.log('Chinese detected → China');
    }
    
    return detectedCountry;
}

// Change country and update currency
function changeCountry(countryCode) {
    currentCurrency = countryCode;
    currentLanguage = exchangeRates[countryCode].language;
    
    // Update currency display
    const currencyDisplay = document.getElementById('currentCurrencyDisplay');
    if (currencyDisplay) {
        const currencyInfo = exchangeRates[countryCode];
        currencyDisplay.textContent = `Moeda: ${currencyInfo.currency} (${currencyInfo.symbol})`;
    }
    
    // Update country selector
    const countrySelector = document.getElementById('countrySelector');
    if (countrySelector) {
        countrySelector.value = countryCode;
    }
    
    // Update all prices
    if (typeof updateCurrencyDisplay === 'function') {
        updateCurrencyDisplay();
    }
    
    // Save selection to localStorage
    localStorage.setItem('selectedCountry', countryCode);
    
    console.log(`Country changed to: ${countryCode}, Currency: ${exchangeRates[countryCode].currency}`);
}

// Format price for display
function formatPrice(price) {
    const currencyInfo = exchangeRates[currentCurrency];
    const convertedPrice = price * currencyInfo.rate;
    return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currencyInfo.currency
    }).format(convertedPrice);
}

// Initialize currency system
function initializeCurrency() {
    // Check if user has a saved country preference
    const savedCountry = localStorage.getItem('selectedCountry');
    let detectedCountry;
    
    if (savedCountry && exchangeRates[savedCountry]) {
        detectedCountry = savedCountry;
        console.log('Using saved country preference:', savedCountry);
    } else {
        detectedCountry = detectUserLanguageAndCurrency();
        console.log('Auto-detected country:', detectedCountry);
    }
    
    currentCurrency = detectedCountry;
    currentLanguage = exchangeRates[detectedCountry].language;
    
    // Set the country selector
    const countrySelector = document.getElementById('countrySelector');
    if (countrySelector) {
        countrySelector.value = detectedCountry;
    }
    
    // Update currency display
    const currencyDisplay = document.getElementById('currentCurrencyDisplay');
    if (currencyDisplay) {
        const currencyInfo = exchangeRates[detectedCountry];
        currencyDisplay.textContent = `Moeda: ${currencyInfo.currency} (${currencyInfo.symbol})`;
    }
    
    console.log('🌍 Auto-set currency:', currentCurrency, 'language:', currentLanguage, 'from browser:', navigator.language);
    
    // Update currency display if function exists
    if (typeof updateCurrencyDisplay === 'function') {
        updateCurrencyDisplay();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCurrency();
});






