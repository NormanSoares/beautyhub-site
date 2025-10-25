// Sistema de Debug para Tradução
// Este arquivo ajuda a diagnosticar problemas com o sistema de tradução

class TranslationDebugger {
    constructor() {
        this.logs = [];
        this.startTime = Date.now();
        this.init();
    }

    init() {
        console.log('🔧 Translation Debugger inicializado');

        // Interceptar console.log para capturar logs
        this.originalConsoleLog = console.log;
        console.log = (...args) => {
            this.log('LOG', ...args);
            this.originalConsoleLog(...args);
        };

        // Interceptar console.error
        this.originalConsoleError = console.error;
        console.error = (...args) => {
            this.log('ERROR', ...args);
            this.originalConsoleError(...args);
        };

        // Interceptar console.warn
        this.originalConsoleWarn = console.warn;
        console.warn = (...args) => {
            this.log('WARN', ...args);
            this.originalConsoleWarn(...args);
        };

        // Monitorar carregamento de scripts
        this.monitorScriptLoading();

        // Verificar elementos traduzíveis
        this.checkTranslatableElements();

        // Monitorar mudanças no DOM
        this.monitorDOMChanges();
    }

    log(level, ...args) {
        const timestamp = Date.now() - this.startTime;
        const logEntry = {
            timestamp,
            level,
            message: args.join(' '),
            stack: new Error().stack
        };

        this.logs.push(logEntry);

        // Manter apenas os últimos 100 logs
        if (this.logs.length > 100) {
            this.logs.shift();
        }
    }

    monitorScriptLoading() {
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, options) {
            const element = originalCreateElement.call(this, tagName, options);

            if (tagName === 'script') {
                const originalOnload = element.onload;
                const originalOnerror = element.onerror;

                element.onload = function() {
                    console.log(`✅ Script carregado: ${element.src}`);
                    if (originalOnload) originalOnload.call(this);
                };

                element.onerror = function(error) {
                    console.error(`❌ Erro ao carregar script: ${element.src}`, error);
                    if (originalOnerror) originalOnerror.call(this, error);
                };
            }

            return element;
        };
    }

    checkTranslatableElements() {
        setTimeout(() => {
            const elements = document.querySelectorAll('[data-translate-key]');
            console.log(`📝 Elementos com data-translate-key encontrados: ${elements.length}`);

            elements.forEach((element, index) => {
                const key = element.getAttribute('data-translate-key');
                const currentText = element.textContent.trim();
                console.log(`[${index + 1}] Elemento: ${element.tagName} | Chave: "${key}" | Texto atual: "${currentText}"`);
            });

            // Verificar inputs com placeholder
            const inputs = document.querySelectorAll('input[placeholder]');
            console.log(`📋 Inputs com placeholder encontrados: ${inputs.length}`);

            inputs.forEach((input, index) => {
                const placeholder = input.getAttribute('placeholder');
                console.log(`[${index + 1}] Input: ${input.type} | Placeholder: "${placeholder}"`);
            });
        }, 500);
    }

    monitorDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const translatableElements = node.querySelectorAll ?
                                node.querySelectorAll('[data-translate-key]') : [];

                            if (translatableElements.length > 0) {
                                console.log(`🔄 Novos elementos traduzíveis adicionados: ${translatableElements.length}`);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    getDebugInfo() {
        return {
            logs: this.logs,
            uptime: Date.now() - this.startTime,
            userAgent: navigator.userAgent,
            language: navigator.language,
            url: window.location.href,
            scripts: Array.from(document.scripts).map(s => ({
                src: s.src,
                loaded: !s.onerror
            }))
        };
    }

    showDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'translation-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            height: 300px;
            background: rgba(0,0,0,0.9);
            color: white;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            overflow-y: auto;
            z-index: 10000;
            border-radius: 5px;
        `;

        document.body.appendChild(panel);
        this.updateDebugPanel(panel);
    }

    updateDebugPanel(panel) {
        const info = this.getDebugInfo();
        panel.innerHTML = `
            <h3>🔧 Translation Debug</h3>
            <p><strong>Uptime:</strong> ${info.uptime}ms</p>
            <p><strong>Language:</strong> ${info.language}</p>
            <p><strong>URL:</strong> ${info.url}</p>
            <p><strong>Logs:</strong> ${info.logs.length}</p>
            <div style="margin-top: 10px;">
                ${info.logs.slice(-10).map(log =>
                    `<div style="margin: 2px 0; padding: 2px; background: ${log.level === 'ERROR' ? '#ff4444' : log.level === 'WARN' ? '#ffaa00' : '#444'};">
                        [${log.timestamp}ms] ${log.level}: ${log.message}
                    </div>`
                ).join('')}
            </div>
        `;

        setTimeout(() => this.updateDebugPanel(panel), 1000);
    }
}

// Inicializar debugger
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Translation Debugger...');
    window.translationDebugger = new TranslationDebugger();

    // Adicionar botão para mostrar painel de debug
    setTimeout(() => {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔧 Debug';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            padding: 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
        `;
        debugBtn.onclick = () => window.translationDebugger.showDebugPanel();
        document.body.appendChild(debugBtn);
    }, 2000);
});

// Exportar para uso global
window.TranslationDebugger = TranslationDebugger;

