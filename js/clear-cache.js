/**
 * Script para Limpar Cache do Dashboard
 * Força limpeza completa do cache
 */

// Função para limpar cache
function clearAllCache() {
    console.log('🗑️ LIMPANDO CACHE COMPLETO...');
    
    // Limpar localStorage
    localStorage.clear();
    console.log('✅ localStorage limpo');
    
    // Limpar sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage limpo');
    
    // Limpar cache do navegador
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
                console.log(`✅ Cache ${name} removido`);
            });
        });
    }
    
    // Limpar cookies
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    console.log('✅ Cookies limpos');
    
    console.log('🎉 CACHE COMPLETO LIMPO!');
}

// Função para forçar reload
function forceReload() {
    console.log('🔄 FORÇANDO RELOAD...');
    window.location.reload(true);
}

// Função para abrir em nova aba
function openFresh() {
    console.log('🆕 ABRINDO VERSÃO FRESH...');
    window.open('dashboard-fresh.html', '_blank');
}

// Executar limpeza automática
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Script de limpeza de cache iniciado');
    
    // Limpar cache automaticamente
    setTimeout(() => {
        clearAllCache();
    }, 1000);
    
    // Mostrar botões de controle
    const controlDiv = document.createElement('div');
    controlDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: #ff6b6b;
        color: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    controlDiv.innerHTML = `
        <div style="margin-bottom: 5px;">
            <strong>🔧 Controles de Cache</strong>
        </div>
        <button onclick="clearAllCache()" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">
            🗑️ Limpar Cache
        </button>
        <button onclick="forceReload()" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">
            🔄 Reload
        </button>
        <button onclick="openFresh()" style="background: #ffc107; color: black; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">
            🆕 Fresh
        </button>
    `;
    
    document.body.appendChild(controlDiv);
});

// Funções globais
window.clearAllCache = clearAllCache;
window.forceReload = forceReload;
window.openFresh = openFresh;





