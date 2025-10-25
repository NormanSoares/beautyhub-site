/**
 * Sistema de Processamento de Pedidos para Fornecedores - 67 Beauty Hub
 * 
 * Este sistema processa pedidos dos clientes e os envia para os fornecedores
 * (AliExpress) com todas as especificações corretas.
 * 
 * @version 1.0.0
 * @author 67 Beauty Hub
 */

console.log('🚀 supplier-order-processor.js CARREGADO!');
console.log('🔍 Verificando se estamos na página Heat-Resistant Mat...');
console.log('🔍 URL atual:', window.location.href);

class SupplierOrderProcessor {
    constructor() {
        this.suppliers = {
            aliexpress: {
                name: 'AliExpress',
                apiEndpoint: 'https://api.aliexpress.com',
                currency: 'USD',
                skuPrefix: 'AE-',
                urlPattern: 'https://pt.aliexpress.com/item/{id}.html'
            }
        };
        
        this.orderStatuses = {
            PENDING: 'pending',
            PROCESSING: 'processing',
            SENT_TO_SUPPLIER: 'sent_to_supplier',
            CONFIRMED_BY_SUPPLIER: 'confirmed_by_supplier',
            SHIPPED: 'shipped',
            DELIVERED: 'delivered',
            CANCELLED: 'cancelled'
        };
        
        this.initializeProcessor();
    }

    /**
     * Inicializa o processador de pedidos
     */
    initializeProcessor() {
        console.log('🏭 Inicializando processador de pedidos para fornecedores...');
        
        // Configurar eventos de pedido
        this.setupOrderEvents();
        
        // Iniciar processamento automático
        this.startAutomaticProcessing();
        
        console.log('✅ Processador inicializado com sucesso');
    }

    /**
     * Configura eventos de pedido
     */
    setupOrderEvents() {
        // Interceptar submissão de formulário de checkout IMEDIATAMENTE
        console.log('🔍 Procurando formulários de checkout...');
            const checkoutForms = document.querySelectorAll('#checkoutForm');
        console.log('📋 Formulários encontrados:', checkoutForms.length);
        
        // Verificar se há formulário na página
        if (checkoutForms.length === 0) {
            console.log('❌ NENHUM formulário checkoutForm encontrado!');
            console.log('🔍 Procurando outros formulários...');
            const allForms = document.querySelectorAll('form');
            console.log('📋 Todos os formulários encontrados:', allForms.length);
            allForms.forEach((form, index) => {
                console.log(`📝 Formulário ${index}:`, form.id || 'sem id', form);
            });
        }
        
        checkoutForms.forEach((form, index) => {
            console.log(`📝 Configurando evento para formulário ${index + 1}:`, form);
            
            // Interceptar o evento ANTES que outros scripts o façam
            const originalSubmit = form.onsubmit;
            form.onsubmit = null;
            
            // Remover event listeners existentes
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // Adicionar nosso event listener com prioridade máxima
            newForm.addEventListener('submit', (e) => {
                console.log('🚀 Evento de submit capturado pelo SUPPLIER PROCESSOR!');
                console.log('🚀 SUPPLIER PROCESSOR EXECUTANDO!');
                e.stopImmediatePropagation(); // Impedir que outros handlers executem
                    this.handleOrderSubmission(e);
            }, true); // true = capture phase (executa antes)
        });
        
        // Também interceptar quando outros scripts tentarem adicionar listeners
        this.interceptFutureListeners();
    }
    
    interceptFutureListeners() {
        // Interceptar addEventListener para checkoutForm
        const originalAddEventListener = Element.prototype.addEventListener;
        const self = this;
        
        Element.prototype.addEventListener = function(type, listener, options) {
            if (this.id === 'checkoutForm' && type === 'submit') {
                console.log('🚫 Interceptando tentativa de adicionar listener ao checkoutForm');
                console.log('🚀 Redirecionando para SUPPLIER PROCESSOR');
                
                // Substituir o listener pelo nosso
                return originalAddEventListener.call(this, type, (e) => {
                    console.log('🚀 Evento interceptado pelo SUPPLIER PROCESSOR!');
                    e.stopImmediatePropagation();
                    self.handleOrderSubmission(e);
                }, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Interceptar função processCheckout() para páginas que usam onclick
        if (typeof window.processCheckout === 'function') {
            console.log('🚫 Interceptando função processCheckout()');
            const originalProcessCheckout = window.processCheckout;
            
            window.processCheckout = function() {
                console.log('🚀 Função processCheckout() interceptada pelo SUPPLIER PROCESSOR!');
                
                // Criar evento simulado
                const event = {
                    preventDefault: () => {},
                    target: document.querySelector('.checkout-btn') || document.body
                };
                
                self.handleOrderSubmission(event);
            };
        }
        
        // Interceptar função processOrder() para páginas que usam onclick
        if (typeof window.processOrder === 'function') {
            console.log('🚫 Interceptando função processOrder()');
            const originalProcessOrder = window.processOrder;
            
            window.processOrder = function(transactionId) {
                console.log('🚀 Função processOrder() interceptada pelo SUPPLIER PROCESSOR!');
                
                // Criar evento simulado
                const event = {
                    preventDefault: () => {},
                    target: document.querySelector('.buy-now-btn') || document.body
                };
                
                self.handleOrderSubmission(event);
            };
        }
    }

    /**
     * Processa submissão de pedido
     */
    async handleOrderSubmission(event) {
        event.preventDefault();
        
        console.log('🚀🚀🚀 SUPPLIER ORDER PROCESSOR EXECUTADO! 🚀🚀🚀');
        console.log('📦 Processando pedido para fornecedor...');
        
        try {
            // Coletar dados do formulário
            const orderData = this.collectOrderData();
            console.log('📋 Dados coletados do formulário:', orderData);
            
            // Validar dados
            if (!this.validateOrderData(orderData)) {
                throw new Error('Dados do pedido inválidos');
            }
            
            // Processar pedido
            const processedOrder = await this.processOrder(orderData);
            
            // SIMULAR PAGAMENTO (pular PayPal)
            console.log('💳 Simulando pagamento aprovado...');
            processedOrder.payment_status = 'paid';
            processedOrder.payment_method = 'simulated';
            
            // NÃO enviar para fornecedor - aguardar revisão no dashboard
            console.log('⏳ Pedido salvo para revisão no dashboard');
            
            // Salvar no localStorage para dashboard
            this.saveOrderToLocalStorage(processedOrder);
            
            // Salvar na API também
            await this.saveOrderToAPI(processedOrder);
            
            // Mostrar popup de sucesso (substituindo o sistema original)
            this.showSuccessPopup(processedOrder);
            
        } catch (error) {
            console.error('❌ Erro ao processar pedido:', error);
            this.showOrderError(error);
        }
    }

    /**
     * Coleta dados do formulário de checkout
     */
    collectOrderData() {
        // Tentar encontrar formulário de checkout
        let form = document.getElementById('checkoutForm');
        
        console.log('🔍 Formulário encontrado:', !!form);
        
        // Se não encontrar, tentar coletar dados diretamente dos campos
        if (!form) {
            console.log('⚠️ Formulário checkoutForm não encontrado, coletando dados diretamente...');
            return this.collectDataFromFields();
        }
        
        const formData = new FormData(form);
        
        // Debug: verificar valores coletados
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        
        console.log('🔍 Valores coletados:', {
            firstName: firstName,
            lastName: lastName,
            email: email
        });
        
        return {
            // Dados do cliente
            customer: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                country: formData.get('country')
            },
            
            // Dados do pedido
            order: {
                id: this.generateOrderId(),
                timestamp: new Date().toISOString(),
                paymentMethod: formData.get('paymentMethod'),
                observations: formData.get('observations') || '',
                status: this.orderStatuses.PENDING
            },
            
            // Produtos selecionados
            products: this.getSelectedProducts(),
            
            // Dados de pagamento
            payment: {
                method: formData.get('paymentMethod'),
                amount: this.calculateTotalAmount(),
                currency: this.detectCurrency()
            }
        };
    }

    collectDataFromFields() {
        console.log('📋 Coletando dados diretamente dos campos...');
        
        // Coletar dados dos campos de input diretamente
        const getFieldValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };
        
        // Verificar se é uma página de produto sem formulário de checkout
        const isProductPage = !getFieldValue('firstName') && !getFieldValue('email');
        
        if (isProductPage) {
            console.log('🛍️ Página de produto detectada, criando dados de teste...');
            return this.createTestOrderData();
        }
        
        return {
            // Dados do cliente
            customer: {
                firstName: getFieldValue('firstName') || getFieldValue('first_name') || '',
                lastName: getFieldValue('lastName') || getFieldValue('last_name') || '',
                email: getFieldValue('email') || '',
                phone: getFieldValue('phone') || getFieldValue('telephone') || '',
                address: getFieldValue('address') || getFieldValue('street') || '',
                city: getFieldValue('city') || '',
                state: getFieldValue('state') || '',
                zipCode: getFieldValue('zipCode') || getFieldValue('zip') || getFieldValue('postal_code') || '',
                country: getFieldValue('country') || 'US'
            },
            
            // Dados do pedido
            order: {
                id: this.generateOrderId(),
                timestamp: new Date().toISOString(),
                paymentMethod: getFieldValue('paymentMethod') || 'simulated',
                observations: getFieldValue('observations') || getFieldValue('notes') || '',
                status: this.orderStatuses.PENDING
            },
            
            // Produtos selecionados
            products: this.getSelectedProducts(),
            
            // Dados de pagamento
            payment: {
                method: getFieldValue('paymentMethod') || 'simulated',
                amount: this.calculateTotalAmount(),
                currency: this.detectCurrency()
            }
        };
    }

    createTestOrderData() {
        console.log('🧪 Criando dados de teste para página de produto...');
        
        // Detectar produto baseado na URL
        const currentUrl = window.location.href;
        let productName = 'Produto';
        let productPrice = this.getDynamicProductPrice(currentUrl, null) || 29.99;
        
        if (currentUrl.includes('human-dog-bed')) {
            productName = 'Human Dog Bed';
            productPrice = this.getDynamicProductPrice(currentUrl, null) || 79.99;
        } else if (currentUrl.includes('sofa-cover')) {
            productName = 'Detachable Sofa Cover';
            productPrice = this.getDynamicProductPrice(currentUrl, null) || 34.99;
        } else if (currentUrl.includes('memory-foam-pillow')) {
            productName = 'Memory Foam Neck Pillow';
            productPrice = this.getDynamicProductPrice(currentUrl, null) || 42.70;
        }
        
        return {
            // Dados do cliente (dados de teste)
            customer: {
                firstName: 'Cliente',
                lastName: 'Teste',
                email: 'cliente@teste.com',
                phone: '+1 (555) 123-4567',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'US'
            },
            
            // Dados do pedido
            order: {
                id: this.generateOrderId(),
                timestamp: new Date().toISOString(),
                paymentMethod: 'simulated',
                observations: 'Pedido de teste - página de produto',
                status: this.orderStatuses.PENDING
            },
            
            // Produtos selecionados
            products: [{
                id: productName.toLowerCase().replace(/\s+/g, '-'),
                name: productName,
                price: productPrice,
                quantity: 1
            }],
            
            // Dados de pagamento
            payment: {
                method: 'simulated',
                amount: productPrice,
                currency: 'USD'
            }
        };
    }

    /**
     * Valida dados do pedido
     */
    validateOrderData(orderData) {
        const requiredFields = [
            'customer.firstName', 'customer.lastName', 'customer.email',
            'customer.phone', 'customer.address', 'customer.city',
            'customer.state', 'customer.zipCode', 'customer.country',
            'order.paymentMethod'
        ];
        
        for (const field of requiredFields) {
            const value = this.getNestedValue(orderData, field);
            if (!value || value.trim() === '') {
                console.error(`❌ Campo obrigatório ausente: ${field}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Processa pedido
     */
    async processOrder(orderData) {
        console.log('🔄 Processando pedido:', orderData.order.id);
        
        // Mapear produtos para fornecedor com variações
        const mappedProducts = await this.mapProductsWithVariations(orderData.products);
        
        // Calcular custos
        const costs = await this.calculateCosts(orderData.products);
        
        // Gerar especificações para fornecedor
        const supplierSpecs = this.generateSupplierSpecifications(orderData, mappedProducts);
        
        return {
            ...orderData,
            mappedProducts,
            costs,
            supplierSpecs,
            status: this.orderStatuses.PROCESSING
        };
    }

    /**
     * Mapeia produtos para fornecedor
     */
    async mapProductsToSupplier(products) {
        const mappedProducts = [];
        
        for (const product of products) {
            const mapping = await this.findProductMapping(product);
            if (mapping) {
                mappedProducts.push({
                    ...product,
                    supplierSku: mapping.supplierSku,
                    supplierUrl: mapping.supplierUrl,
                    supplierPrice: mapping.supplierPrice,
                    supplierCurrency: mapping.supplierCurrency
                });
            }
        }
        
        return mappedProducts;
    }

    /**
     * Mapeia produtos usando o sistema de variações
     */
    async mapProductsWithVariations(products) {
        const mappedProducts = [];
        
        for (const product of products) {
            // Determinar ID do produto baseado na URL
            const productId = this.getProductIdFromUrl();
            
            // Buscar mapeamento do produto
            const productMapping = this.getProductMapping(productId);
            if (!productMapping) {
                console.warn(`Mapeamento não encontrado para produto: ${productId}`);
                continue;
            }
            
            // Mapear variações se existirem
            let supplierVariation = null;
            if (product.color && productMapping.variations) {
                supplierVariation = this.mapVariation({
                    value: product.color,
                    displayName: product.colorName
                }, productMapping.variations.type);
            }
            
            // Gerar SKU do fornecedor
            const supplierSKU = this.generateSupplierSKU(productMapping.supplierId, supplierVariation);
            
            // Calcular preço do fornecedor
            const supplierUnitPrice = this.calculateSupplierPrice(productMapping, product.color);
            const supplierTotalPrice = supplierUnitPrice * product.quantity;
            
            mappedProducts.push({
                ...product,
                supplierSKU: supplierSKU,
                supplierId: productMapping.supplierId,
                supplierName: productMapping.name,
                supplierVariation: supplierVariation,
                supplierUnitPrice: supplierUnitPrice,
                supplierTotalPrice: supplierTotalPrice,
                supplierCurrency: 'USD'
            });
        }
        
        return mappedProducts;
    }

    /**
     * Obtém ID do produto baseado na URL
     */
    getProductIdFromUrl() {
        const currentUrl = window.location.href;
        
        if (currentUrl.includes('heat-resistant-mat')) return 'heat_resistant_mat';
        if (currentUrl.includes('alligator-clips')) return 'alligator_hair_clips';
        if (currentUrl.includes('phoera')) return 'phoera_foundation';
        if (currentUrl.includes('wrinkle-reducer')) return 'wrinkle_reducer';
        if (currentUrl.includes('golden-sakura')) return 'laikou_golden_sakura';
        
        return 'unknown_product';
    }

    /**
     * Obtém mapeamento de um produto
     */
    getProductMapping(productId) {
        // Se o sistema de mapeamento estiver disponível, usar ele
        if (typeof window.getProductMapping === 'function') {
            return window.getProductMapping(productId);
        }
        
        // Fallback: mapeamentos básicos
        const basicMappings = {
            'heat_resistant_mat': {
                name: 'Heat-Resistant Mat',
                supplierId: '100500456789123',
                basePrice: 2.29,
                variations: { type: 'size_color' }
            },
            'alligator_hair_clips': {
                name: 'Alligator Hair Clips',
                supplierId: '100500123456789',
                basePrice: 3.54,
                variations: { type: 'color' }
            },
            'phoera_foundation': {
                name: '2 Pack PHOERA Foundation',
                supplierId: '100500106836560',
                basePrice: 17.39,
                variations: { type: 'color' }
            },
            'wrinkle_reducer': {
                name: 'Wrinkle Reducer',
                supplierId: '100500987654321',
                basePrice: 17.45,
                variations: null
            },
            'laikou_golden_sakura': {
                name: 'LAIKOU Golden Sakura',
                supplierId: '100500789123456',
                basePrice: 24.99,
                variations: { type: 'type' }
            }
        };
        
        return basicMappings[productId];
    }

    /**
     * Mapeia uma variação específica
     */
    mapVariation(variation, variationType) {
        if (!variation || !variationType) return null;
        
        // Mapeamentos básicos de cores/tamanhos
        const colorMappings = {
            'small_pink': 'small-pink',
            'small_blue': 'small-blue',
            'small_green': 'small-green',
            'medium_pink': 'medium-pink',
            'medium_blue': 'medium-blue',
            'medium_green': 'medium-green',
            'large_pink': 'large-pink',
            'large_blue': 'large-blue',
            'large_green': 'large-green'
        };
        
        const mappedValue = colorMappings[variation.value] || variation.value;
        
        return {
            type: variationType,
            value: mappedValue,
            displayName: variation.displayName || variation.value
        };
    }

    /**
     * Gera SKU do fornecedor
     */
    generateSupplierSKU(supplierId, variation) {
        let sku = 'AE-' + supplierId;
        
        if (variation) {
            sku += '-' + variation.value.toUpperCase().replace('-', '_');
        }
        
        return sku;
    }

    /**
     * Calcula preço do fornecedor
     */
    calculateSupplierPrice(productMapping, variation) {
        // Margem de 50% para o fornecedor (custo real)
        return productMapping.basePrice * 0.5;
    }

    /**
     * Encontra mapeamento de produto
     */
    async findProductMapping(product) {
        // Simular busca de mapeamento
        // Em produção, isso seria uma consulta ao banco de dados
        return {
            supplierSku: `AE-${product.id}`,
            supplierUrl: `https://pt.aliexpress.com/item/${product.id}.html`,
            supplierPrice: product.price * 0.7, // Margem de 30%
            supplierCurrency: 'USD'
        };
    }

    /**
     * Calcula custos
     */
    async calculateCosts(products) {
        let totalCost = 0;
        let totalMargin = 0;
        
        for (const product of products) {
            const supplierPrice = product.price * 0.7; // Custo do fornecedor
            const margin = product.price - supplierPrice;
            
            totalCost += supplierPrice;
            totalMargin += margin;
        }
        
        return {
            totalCost,
            totalMargin,
            marginPercentage: (totalMargin / (totalCost + totalMargin)) * 100
        };
    }

    /**
     * Gera especificações para fornecedor
     */
    generateSupplierSpecifications(orderData, mappedProducts) {
        return {
            orderId: orderData.order.id,
            customerInfo: {
                name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
                email: orderData.customer.email,
                phone: orderData.customer.phone,
                address: {
                    street: orderData.customer.address,
                    city: orderData.customer.city,
                    state: orderData.customer.state,
                    zipCode: orderData.customer.zipCode,
                    country: orderData.customer.country
                }
            },
            products: mappedProducts.map(product => ({
                sku: product.supplierSku,
                name: product.name,
                color: product.color,
                size: product.size,
                quantity: product.quantity,
                price: product.supplierPrice,
                currency: product.supplierCurrency
            })),
            specialInstructions: orderData.order.observations,
            paymentMethod: orderData.payment.method,
            totalAmount: orderData.payment.amount,
            currency: orderData.payment.currency
        };
    }

    /**
     * Envia pedido para fornecedor
     */
    async sendToSupplier(processedOrder) {
        console.log('📤 Enviando pedido para fornecedor...');
        
        try {
            // Simular envio para AliExpress
            const response = await this.simulateAliExpressOrder(processedOrder);
            
            console.log('✅ Pedido enviado para fornecedor:', response);
            return response;
            
        } catch (error) {
            console.error('❌ Erro ao enviar para fornecedor:', error);
            throw error;
        }
    }

    /**
     * Simula envio para AliExpress
     */
    async simulateAliExpressOrder(processedOrder) {
        // Em produção, isso seria uma chamada real para a API do AliExpress
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    supplier_order_id: 'AE-' + Date.now(),
                    tracking_number: 'TRK' + Math.random().toString(36).substr(2, 9),
                    estimated_delivery: this.calculateEstimatedDelivery(processedOrder?.customer?.country || 'US'),
                    supplier: 'AliExpress',
                    status: 'confirmed'
                });
            }, 1000);
        });
    }

    /**
     * Calcula tempo estimado de entrega
     */
    calculateEstimatedDelivery(country) {
        const deliveryTimes = {
            'US': '7-14 dias',
            'BR': '15-25 dias',
            'CA': '10-18 dias',
            'UK': '12-20 dias',
            'AU': '15-25 dias'
        };
        
        return deliveryTimes[country] || '15-25 dias';
    }

    /**
     * Atualiza status do pedido
     */
    async updateOrderStatus(orderId, status) {
        console.log(`📊 Atualizando status do pedido ${orderId} para ${status}`);
        
        // Salvar no localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            orders[orderIndex].updated_at = new Date().toISOString();
            localStorage.setItem('orders', JSON.stringify(orders));
        }
    }

    /**
     * Salva pedido no localStorage
     */
    saveOrderToLocalStorage(processedOrder) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(processedOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log('💾 Pedido salvo no localStorage');
    }

    async saveOrderToAPI(processedOrder) {
        try {
            console.log('🔄 Tentando salvar pedido na API...');
            console.log('📊 Dados do processedOrder:', processedOrder);
            
            // Converter estrutura do checkout para formato da API
            const apiOrderData = {
                customer_name: `${processedOrder?.customer?.firstName || ''} ${processedOrder?.customer?.lastName || ''}`.trim(),
                customer_email: processedOrder?.customer?.email || '',
                customer_phone: processedOrder?.customer?.phone || '',
                products: processedOrder?.products || [],
                total: processedOrder?.payment?.amount || processedOrder?.total || 0,
                shipping_address: {
                    street: processedOrder?.customer?.address || '',
                    city: processedOrder?.customer?.city || '',
                    state: processedOrder?.customer?.state || '',
                    zip: processedOrder?.customer?.zipCode || '',
                    country: processedOrder?.customer?.country || ''
                },
                notes: processedOrder?.order?.observations || '',
                payment_method: processedOrder?.payment?.method || 'unknown',
                status: processedOrder?.order?.status || 'pending',
                payment_status: 'paid' // Simulado como pago
            };

            console.log('📤 Enviando dados para API:', apiOrderData);
            console.log('📦 Produtos sendo enviados:', apiOrderData.products);
            console.log('📦 Total de produtos:', apiOrderData.products.length);
            console.log('📦 Estrutura dos produtos:', JSON.stringify(apiOrderData.products, null, 2));

            const response = await fetch('/api/orders?action=create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiOrderData)
            });

            console.log('📡 Resposta da API:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Pedido salvo na API com sucesso:', result);
            } else {
                const errorText = await response.text();
                console.error('❌ Erro ao salvar na API:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Erro ao salvar na API:', error);
        }
    }

    /**
     * Mostra popup de sucesso (substituindo o sistema original)
     */
    showSuccessPopup(processedOrder) {
        try {
            console.log('🎉 Mostrando popup de sucesso...');
            console.log('📊 Dados do processedOrder:', processedOrder);
            
            // Detectar produto baseado na URL
            const currentUrl = window.location.href;
            let productName = 'Produto';
            
            if (currentUrl.includes('heat-resistant-mat')) {
                productName = 'Heat-Resistant Mat';
            } else if (currentUrl.includes('alligator-clips')) {
                productName = 'Alligator Hair Clips';
            } else if (currentUrl.includes('phoera')) {
                productName = '2 Pack PHOERA Foundation';
            } else if (currentUrl.includes('wrinkle-reducer')) {
                productName = 'Wrinkle Reducer - Red Light Therapy';
            } else if (currentUrl.includes('golden-sakura')) {
                productName = 'LAIKOU Vitamin C 24K Golden Sakura';
            }
            
            // Coletar ofertas selecionadas dos produtos do processedOrder
            console.log('🔍 Coletando ofertas dos produtos...');
            
            // Verificar se existem ofertas selecionadas na página
            let offerNames = '';
            
            // Primeiro: verificar se há ofertas selecionadas na página
            if (typeof window.selectedOffers !== 'undefined' && Array.isArray(window.selectedOffers) && window.selectedOffers.length > 0) {
                console.log('🔍 selectedOffers encontrado:', window.selectedOffers);
                
                if (typeof window.offers !== 'undefined') {
                    // Usar dados reais das ofertas da página
                    const selectedOfferNames = window.selectedOffers
                        .filter(offerKey => window.offers[offerKey])
                        .map(offerKey => window.offers[offerKey].name)
                        .filter(name => name && name !== productName); // Excluir produto principal
                    
                    offerNames = selectedOfferNames.join(', ');
                    console.log('📦 Ofertas encontradas via selectedOffers:', offerNames);
                }
            }
            
            // Segundo: verificar se há produtos com preços diferentes (ofertas reais)
            if (!offerNames && processedOrder?.products && processedOrder.products.length > 1) {
                const offerProducts = processedOrder.products
                    .filter(product => product.name !== productName) // Excluir produto principal
                    .filter(product => product.price > 0); // Apenas produtos com preço (ofertas reais)
                
                if (offerProducts.length > 0) {
                    offerNames = offerProducts.map(product => product.name).join(', ');
                    console.log('📦 Ofertas encontradas via produtos múltiplos:', offerNames);
                }
            }
            
            // Terceiro: verificar se há produtos com preço 0 (ofertas gratuitas)
            if (!offerNames && processedOrder?.products) {
                const freeOfferProducts = processedOrder.products.filter(product => 
                    product.price === 0 || product.name.toLowerCase().includes('oferta') || product.name.toLowerCase().includes('offer')
                );
                if (freeOfferProducts.length > 0) {
                    offerNames = freeOfferProducts.map(product => product.name).join(', ');
                    console.log('📦 Ofertas gratuitas encontradas:', offerNames);
                }
            }
            
            console.log('📦 Ofertas finais:', offerNames || 'Nenhuma');
            
            // Calcular total de forma segura
            console.log('💰 Calculando total...');
            const total = processedOrder?.payment?.amount || processedOrder?.total || 0;
            console.log('💰 Total calculado:', total);
            
            // Verificar se total é um número válido
            const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
            console.log('💰 Total seguro:', safeTotal);
            
            // Mostrar popup de sucesso
            console.log('💬 Criando mensagem...');
            const message = `Order placed successfully!\n\nProduto: ${productName}\nOfertas: ${offerNames || 'Nenhuma'}\nTotal: $${safeTotal.toFixed(2)}\n\nYou will receive um e-mail de confirmação em breve.`;
            console.log('💬 Mensagem criada:', message);
            
            // Mostrar popup de celebração em vez de alert básico
            this.showCelebrationPopup(productName, offerNames, safeTotal);
        } catch (error) {
            console.error('❌ Erro no showSuccessPopup:', error);
            console.error('❌ Stack trace:', error.stack);
            console.error('❌ Dados do processedOrder que causaram erro:', JSON.stringify(processedOrder, null, 2));
            // Fallback simples
            alert('Order placed successfully! You will receive a confirmation email shortly.');
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 3000);
        }
    }

    /**
     * Detectar idioma do usuário
     */
    getUserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('pt')) return 'pt';
        if (browserLang.startsWith('es')) return 'es';
        return 'en'; // Default para inglês
    }

    /**
     * Obter textos traduzidos para o popup
     */
    getPopupTranslations(language = this.getUserLanguage()) {
        const translations = {
            'pt': {
                title: 'Pedido Realizado com Sucesso!',
                product: 'Produto',
                offers: 'Ofertas',
                total: 'Total',
                none: 'Nenhuma',
                congratulations: 'Parabéns! Seu pedido foi processado com sucesso! Você receberá um e-mail de confirmação em breve.',
                continueShopping: '✨ CONTINUAR COMPRANDO',
                countdownText: 's para redirecionamento automático'
            },
            'en': {
                title: 'Order Placed Successfully!',
                product: 'Product',
                offers: 'Offers',
                total: 'Total',
                none: 'None',
                congratulations: 'Congratulations! Your order has been processed successfully! You will receive a confirmation email shortly.',
                continueShopping: '✨ CONTINUE SHOPPING',
                countdownText: 's until automatic redirect'
            },
            'es': {
                title: '¡Pedido Realizado con Éxito!',
                product: 'Producto',
                offers: 'Ofertas',
                total: 'Total',
                none: 'Ninguna',
                congratulations: '¡Felicidades! Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación pronto.',
                continueShopping: '✨ CONTINUAR COMPRANDO',
                countdownText: 's para redirección automática'
            }
        };
        
        return translations[language] || translations['en'];
    }

    /**
     * Mostrar popup de celebração moderno
     */
    showCelebrationPopup(productName, offerNames, total) {
        // Remover popup anterior se existir
        const existingPopup = document.getElementById('celebrationPopup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Obter traduções baseadas no idioma do usuário
        const translations = this.getPopupTranslations();
        const displayOffers = offerNames || translations.none;

        // Criar popup de celebração
        const popup = document.createElement('div');
        popup.id = 'celebrationPopup';
        popup.innerHTML = `
            <div class="celebration-overlay">
                <div class="celebration-popup">
                    <div class="celebration-header">
                        <div class="celebration-icon">🎉</div>
                        <h2>${translations.title}</h2>
                    </div>
                    
                    <div class="celebration-content">
                        <div class="order-summary">
                            <div class="summary-item">
                                <span class="label">${translations.product}:</span>
                                <span class="value">${productName}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">${translations.offers}:</span>
                                <span class="value">${displayOffers}</span>
                            </div>
                            <div class="summary-item total">
                                <span class="label">${translations.total}:</span>
                                <span class="value">$${total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="celebration-message">
                            <p>🎊 ${translations.congratulations}</p>
                        </div>
                        
                        <div class="celebration-animation">
                            <div class="confetti"></div>
                            <div class="confetti"></div>
                            <div class="confetti"></div>
                            <div class="confetti"></div>
                            <div class="confetti"></div>
                        </div>
                    </div>
                    
                    <div class="celebration-footer">
                        <button class="celebration-btn" onclick="continueShopping()">
                            ${translations.continueShopping}
                        </button>
                        <div class="countdown-timer">
                            <span id="countdown">8</span>${translations.countdownText}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .celebration-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .celebration-popup {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                text-align: center;
                    color: white;
                position: relative;
                overflow: hidden;
                animation: slideIn 0.5s ease;
            }
            
            .celebration-header {
                margin-bottom: 25px;
            }
            
            .celebration-icon {
                font-size: 4rem;
                margin-bottom: 15px;
                animation: bounce 1s infinite;
            }
            
            .celebration-header h2 {
                margin: 0;
                font-size: 1.8rem;
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .celebration-content {
                margin-bottom: 25px;
            }
            
            .order-summary {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
            }
            
            .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .summary-item.total {
                border-bottom: none;
                border-top: 2px solid #ffd700;
                margin-top: 15px;
                padding-top: 15px;
                font-weight: 700;
                font-size: 1.2rem;
            }
            
            .summary-item .label {
                color: #e0e0e0;
            }
            
            .summary-item .value {
                color: #ffd700;
                font-weight: 600;
            }
            
            .celebration-message {
                margin-bottom: 20px;
            }
            
            .celebration-message p {
                margin: 8px 0;
                font-size: 1.1rem;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .celebration-animation {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #ffd700;
                animation: confettiFall 3s linear infinite;
            }
            
            .confetti:nth-child(1) {
                left: 10%;
                animation-delay: 0s;
                background: #ff6b6b;
            }
            
            .confetti:nth-child(2) {
                left: 30%;
                animation-delay: 0.5s;
                background: #4ecdc4;
            }
            
            .confetti:nth-child(3) {
                left: 50%;
                animation-delay: 1s;
                background: #45b7d1;
            }
            
            .confetti:nth-child(4) {
                left: 70%;
                animation-delay: 1.5s;
                background: #96ceb4;
            }
            
            .confetti:nth-child(5) {
                left: 90%;
                animation-delay: 2s;
                background: #ffeaa7;
            }
            
            .celebration-footer {
                margin-top: 20px;
            }
            
            .celebration-btn {
                background: linear-gradient(135deg, #ffd700, #ffed4e);
                color: #333;
                    border: none;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 1.1rem;
                font-weight: 700;
                    cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
                display: block;
                width: 100%;
            }
            
            .celebration-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
                background: linear-gradient(135deg, #ffed4e, #ffd700);
            }
            
            .countdown-timer {
                font-size: 0.9rem;
                color: #e0e0e0;
                text-align: center;
                margin-top: 10px;
                opacity: 0.8;
            }
            
            .countdown-timer #countdown {
                color: #ffd700;
                font-weight: 700;
                font-size: 1.1rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    transform: scale(0.8) translateY(-50px);
                    opacity: 0;
                }
                to { 
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            @keyframes confettiFall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(popup);

        // Configurar countdown e redirecionamento
        this.setupCountdownAndRedirect();
    }

    /**
     * Configura countdown e redirecionamento estratégico
     */
    setupCountdownAndRedirect() {
        let countdown = 8; // 8 segundos para o usuário apreciar
        let countdownInterval;
        let redirectTimeout;

        // Atualizar countdown a cada segundo
        countdownInterval = setInterval(() => {
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.textContent = countdown;
                countdown--;
                
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    this.redirectToStrategicPage();
                }
            }
        }, 1000);

        // Configurar redirecionamento automático
        redirectTimeout = setTimeout(() => {
            clearInterval(countdownInterval);
            this.redirectToStrategicPage();
        }, 8000);

        // Adicionar função global para o botão
        window.continueShopping = () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimeout);
            this.redirectToStrategicPage();
        };
    }

    /**
     * Redireciona para página estratégica
     */
    redirectToStrategicPage() {
        // Remover popup
        const popup = document.getElementById('celebrationPopup');
        if (popup) {
            popup.remove();
        }

        // Estratégia de redirecionamento baseada no produto comprado
        const currentUrl = window.location.href;
        let redirectUrl;

        if (currentUrl.includes('wrinkle-reducer')) {
            // Para Wrinkle Reducer, sugerir produtos relacionados de beleza
            redirectUrl = '../../Produtos de beleza/beauty-store.html';
        } else if (currentUrl.includes('heat-resistant-mat')) {
            // Para Heat-Resistant Mat, sugerir outros produtos de casa
            redirectUrl = '../../Produtos de conforto/comfort-store.html';
        } else if (currentUrl.includes('phoera') || currentUrl.includes('golden-sakura') || currentUrl.includes('alligator-clips')) {
            // Para produtos de beleza, ir para loja de beleza
            redirectUrl = '../../Produtos de beleza/beauty-store.html';
        } else {
            // Fallback para página inicial
            redirectUrl = '../../index.html';
        }

        console.log('🎯 Redirecionando estrategicamente para:', redirectUrl);
        
        // Redirecionar com animação suave
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);
    }

    /**
     * Mostra confirmação do pedido
     */
    showOrderConfirmation(processedOrder, supplierResponse) {
        try {
            // Calcular total de forma segura
            const total = processedOrder?.payment?.amount || processedOrder?.total || 0;
            
            const message = `
                Order placed successfully!
                Produto: ${processedOrder.products[0]?.name || 'Produto'}
                Ofertas: ${processedOrder.products.slice(1).map(p => p.name).join(', ') || 'Nenhuma'}
                Total: $${total.toFixed(2)}
                You will receive um e-mail de confirmação em breve.
            `;
            
            alert(message);
        } catch (error) {
            console.error('❌ Erro no showOrderConfirmation:', error);
            alert('Order placed successfully! You will receive a confirmation email shortly.');
        }
        
        // Redirecionar para página de sucesso se existir
        if (window.location.pathname.includes('checkout-')) {
            setTimeout(() => {
                window.location.href = '/order-success.html';
            }, 2000);
        }
    }

    /**
     * Mostra erro do pedido
     */
    showOrderError(error) {
        const message = `
            Erro ao processar pedido:
            ${error.message}
            Por favor, tente novamente.
        `;
        
        alert(message);
    }

    /**
     * Inicia processamento automático
     */
    startAutomaticProcessing() {
        // Verificar pedidos pendentes a cada 30 segundos
        setInterval(() => {
            this.processPendingOrders();
        }, 30000);
    }

    /**
     * Processa pedidos pendentes
     */
    async processPendingOrders() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const pendingOrders = orders.filter(order => order.status === this.orderStatuses.PENDING);
        
        for (const order of pendingOrders) {
            try {
                await this.processOrder(order);
                await this.updateOrderStatus(order.id, this.orderStatuses.PROCESSING);
            } catch (error) {
                console.error('❌ Erro ao processar pedido pendente:', error);
            }
        }
    }

    /**
     * Utilitários
     */
    generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obter preço de fallback inteligente baseado no produto
     */
    getFallbackPrice(productId) {
        const fallbackPrices = {
            'heat-resistant-mat': 2.29, // Small é o mais comum
            'alligator-clips': 3.54,
            'phoera-foundation': 17.39,
            'wrinkle-reducer': 17.45,
            'golden-sakura': 5.99,
            'human-dog-bed': 79.99,
            'sofa-cover': 34.99,
            'memory-foam-pillow': 42.70,
            'generic': 29.99 // Fallback genérico
        };
        return fallbackPrices[productId] || 29.99;
    }

    /**
     * Obter preço dinâmico do produto baseado na página atual
     */
    getDynamicProductPrice(url, selectedColor) {
        try {
            // Heat-Resistant Mat - buscar preços por tamanho/cor
            if (url.includes('heat-resistant-mat')) {
                console.log('🔍 Heat-Resistant Mat detectado!');
                console.log('🔍 selectedColor recebido:', selectedColor);
                console.log('🔍 window.sizePricesUSD existe?', typeof window.sizePricesUSD !== 'undefined');
                
                // Definir preços diretamente no supplier-order-processor.js
                const sizePricesUSD = {
                    'small-pink': 2.29,    // 13.5x28.5cm Pink
                    'small-green': 2.29,   // 13.5x28.5cm Green
                    'small-gray': 2.29,    // 13.5x28.5cm Gray
                    'small-blue': 2.29,    // 13.5x28.5cm Blue
                    'medium-blue': 1.78,   // 21.8x16cm Blue
                    'medium-gray': 1.78,   // 21.8x16cm Gray
                    'medium-green': 1.78,  // 21.8x16cm Green
                    'medium-pink': 1.78,   // 21.8x16cm Pink
                    'large-blue': 2.50,    // 28.5x13.5cm Blue
                    'large-gray': 2.50,    // 28.5x13.5cm Gray
                    'large-green': 2.50,   // 28.5x13.5cm Green
                    'large-pink': 2.50,    // 28.5x13.5cm Pink
                    'extra-large': 4.99    // 30x39.5cm
                };
                
                // Tentar acessar sizePricesUSD da página OU usar o objeto local
                const priceSource = typeof window.sizePricesUSD !== 'undefined' ? window.sizePricesUSD : sizePricesUSD;
                
                if (selectedColor && priceSource[selectedColor]) {
                    const price = priceSource[selectedColor];
                    console.log(`🔍 Heat-Resistant Mat - Tamanho selecionado: ${selectedColor}, Preço: $${price}`);
                    return price;
                }
                // Se não encontrou selectedColor, tentar buscar o elemento selecionado novamente
                const selectedOption = document.querySelector('.color-option.selected');
                if (selectedOption && selectedOption.dataset.color) {
                    const colorKey = selectedOption.dataset.color;
                    const price = priceSource[colorKey];
                    console.log(`🔍 Heat-Resistant Mat - Fallback tamanho: ${colorKey}, Preço: $${price}`);
                    return price || this.getFallbackPrice('heat-resistant-mat');
                }
                // Tentar acessar offers da página
                if (typeof window.offers !== 'undefined' && window.offers.basic) {
                    return window.offers.basic.prices.USD || this.getFallbackPrice('heat-resistant-mat');
                }
                console.log('⚠️ Heat-Resistant Mat - Usando preço fallback inteligente');
                return this.getFallbackPrice('heat-resistant-mat'); // Fallback inteligente
            }
            
            // Wrinkle Reducer - buscar preços das ofertas
            if (url.includes('wrinkle-reducer')) {
                // Se tem múltiplas ofertas selecionadas, usar o preço da primeira
                if (typeof window.selectedOffers !== 'undefined' && window.selectedOffers.length > 0) {
                    const firstOffer = window.selectedOffers[0];
                    if (typeof window.offers !== 'undefined' && window.offers[firstOffer]) {
                        return window.offers[firstOffer].prices.USD || this.getFallbackPrice('wrinkle-reducer');
                    }
                }
                // Fallback para oferta básica
                if (typeof window.offers !== 'undefined' && window.offers.basic) {
                    return window.offers.basic.prices.USD || this.getFallbackPrice('wrinkle-reducer');
                }
                return this.getFallbackPrice('wrinkle-reducer'); // Preço real do produto
            }
            
            // PHOERA Foundation
            if (url.includes('phoera')) {
                // Definir TODAS as ofertas diretamente no supplier-order-processor.js
                const offers = {
                    basic: {
                        name: '2 Pack PHOERA Foundation',
                        prices: {
                            'USD': 17.39
                        }
                    },
                    premium: {
                        name: '8pcs Makeup Brush',
                        prices: {
                            'USD': 2.50
                        }
                    },
                    complete: {
                        name: '2 Pack PHOERA Primer',
                        prices: {
                            'USD': 11.64
                        }
                    }
                };
                
                // Tentar acessar window.offers OU usar o objeto local
                const offerSource = typeof window.offers !== 'undefined' ? window.offers : offers;
                
                // Se tem ofertas selecionadas, usar o preço da primeira
                if (typeof window.selectedOffers !== 'undefined' && window.selectedOffers.length > 0) {
                    const firstOffer = window.selectedOffers[0];
                    if (offerSource[firstOffer]) {
                        return offerSource[firstOffer].prices.USD || this.getFallbackPrice('phoera-foundation');
                    }
                }
                
                // Fallback para oferta básica
                if (offerSource.basic) {
                    return offerSource.basic.prices.USD || this.getFallbackPrice('phoera-foundation');
                }
                return this.getFallbackPrice('phoera-foundation'); // Preço real do produto
            }
            
            // Alligator Hair Clips
            if (url.includes('alligator-clips')) {
                // Definir TODAS as ofertas diretamente no supplier-order-processor.js
                const offers = {
                    basic: {
                        name: 'Alligator Hair Clips',
                        prices: {
                            'USD': 3.54
                        }
                    },
                    premium: {
                        name: 'Towel cloth-pink',
                        prices: {
                            'USD': 2.89
                        }
                    },
                    complete: {
                        name: '10pcsTouMing-blue',
                        prices: {
                            'USD': 11.36
                        }
                    }
                };
                
                // Tentar acessar window.offers OU usar o objeto local
                const offerSource = typeof window.offers !== 'undefined' ? window.offers : offers;
                
                // Se tem ofertas selecionadas, usar o preço da primeira
                if (typeof window.selectedOffers !== 'undefined' && window.selectedOffers.length > 0) {
                    const firstOffer = window.selectedOffers[0];
                    if (offerSource[firstOffer]) {
                        return offerSource[firstOffer].prices.USD || this.getFallbackPrice('alligator-clips');
                    }
                }
                
                // Fallback para oferta básica
                if (offerSource.basic) {
                    return offerSource.basic.prices.USD || this.getFallbackPrice('alligator-clips');
                }
                return this.getFallbackPrice('alligator-clips'); // Preço real do produto
            }
            
            // Golden Sakura
            if (url.includes('golden-sakura')) {
                // Definir TODAS as ofertas diretamente no supplier-order-processor.js
                const offers = {
                    'gold-snail': {
                        name: 'Gold Snail',
                        prices: {
                            'USD': 5.99
                        }
                    },
                    'sakura': {
                        name: 'Sakura',
                        prices: {
                            'USD': 5.99
                        }
                    },
                    'vitamin-c': {
                        name: 'Vitamin C',
                        prices: {
                            'USD': 5.99
                        }
                    }
                };
                
                // Tentar acessar window.offers OU usar o objeto local
                const offerSource = typeof window.offers !== 'undefined' ? window.offers : offers;
                
                // Se tem oferta selecionada, usar o preço dela
                if (typeof window.selectedOffers !== 'undefined' && window.selectedOffers.length > 0) {
                    const selectedOffer = window.selectedOffers[0];
                    if (offerSource[selectedOffer]) {
                        return offerSource[selectedOffer].prices.USD || this.getFallbackPrice('golden-sakura');
                    }
                }
                // Fallback para gold-snail
                if (offerSource['gold-snail']) {
                    return offerSource['gold-snail'].prices.USD || this.getFallbackPrice('golden-sakura');
                }
                return this.getFallbackPrice('golden-sakura'); // Preço real do produto
            }
            
            // Outros produtos - tentar buscar preço de elementos da página
            const priceElement = document.querySelector('.price, .product-price, [class*="price"]');
            if (priceElement) {
                const priceText = priceElement.textContent;
                const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
                if (priceMatch) {
                    return parseFloat(priceMatch[1]);
                }
            }
            
            return null; // Não encontrou preço dinâmico
        } catch (error) {
            console.warn('⚠️ Erro ao obter preço dinâmico:', error);
            return null;
        }
    }

    getSelectedProducts() {
        console.log('🚀 getSelectedProducts() executado!');
        // Coletar produtos selecionados da página
        const products = [];
        
        // Coletar quantidade real do campo productQuantity ou quantity
        const quantityInput = document.getElementById('productQuantity') || document.getElementById('quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        
        // Coletar cor/tamanho selecionado
        console.log('🔍 Procurando elemento .color-option.selected...');
        const selectedColorOption = document.querySelector('.color-option.selected');
        console.log('🔍 Elemento encontrado:', selectedColorOption);
        
        // Verificar todos os elementos .color-option
        const allColorOptions = document.querySelectorAll('.color-option');
        console.log('🔍 Todos os elementos .color-option encontrados:', allColorOptions.length);
        allColorOptions.forEach((option, index) => {
            console.log(`🔍 Opção ${index}:`, option.dataset.color, option.classList.contains('selected') ? 'SELECTED' : 'not selected');
        });
        
        if (selectedColorOption) {
            console.log('🔍 dataset.color:', selectedColorOption.dataset.color);
            console.log('🔍 textContent:', selectedColorOption.textContent);
        }
        
        const selectedColor = selectedColorOption ? selectedColorOption.dataset.color : null;
        const selectedColorName = selectedColorOption ? selectedColorOption.textContent.trim() : null;
        
        console.log('🔍 Opção selecionada:', selectedColorOption);
        console.log('🔍 Cor/Tamanho selecionado:', selectedColor);
        console.log('🔍 Nome da opção:', selectedColorName);
        
        // Debug adicional - verificar variáveis da página
        console.log('🔍 window.sizePricesUSD existe?', typeof window.sizePricesUSD !== 'undefined');
        console.log('🔍 window.offers existe?', typeof window.offers !== 'undefined');
        console.log('🔍 window.selectedOffers existe?', typeof window.selectedOffers !== 'undefined');
        
        if (typeof window.sizePricesUSD !== 'undefined') {
            console.log('🔍 Preços disponíveis:', window.sizePricesUSD);
            if (selectedColor) {
                console.log('🔍 Preço para', selectedColor, ':', window.sizePricesUSD[selectedColor]);
            }
        }
        
        if (typeof window.offers !== 'undefined') {
            console.log('🔍 Ofertas disponíveis:', window.offers);
        }
        
        if (typeof window.selectedOffers !== 'undefined') {
            console.log('🔍 Ofertas selecionadas:', window.selectedOffers);
        }
        
        // Detectar produto principal baseado na URL ou título da página
        const currentUrl = window.location.href;
        let mainProduct = null;
        
        // Tentar obter preço dinâmico da página primeiro
        const dynamicPrice = this.getDynamicProductPrice(currentUrl, selectedColor);
        
        if (currentUrl.includes('heat-resistant-mat')) {
            mainProduct = {
                id: 'heat-resistant-mat',
                name: 'Heat-Resistant Mat',
                price: dynamicPrice || this.getFallbackPrice('heat-resistant-mat'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName,
                size: selectedColor ? selectedColor.split('-')[0] : null // small, medium, large
            };
        } else if (currentUrl.includes('alligator-clips')) {
            mainProduct = {
                id: 'alligator-clips',
                name: 'Alligator Hair Clips',
                price: dynamicPrice || this.getFallbackPrice('alligator-clips'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else if (currentUrl.includes('phoera')) {
            mainProduct = {
                id: 'phoera-foundation',
                name: '2 Pack PHOERA Foundation',
                price: dynamicPrice || this.getFallbackPrice('phoera-foundation'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else if (currentUrl.includes('wrinkle-reducer')) {
            mainProduct = {
                id: 'wrinkle-reducer',
                name: 'Wrinkle Reducer - Red Light Therapy',
                price: dynamicPrice || this.getFallbackPrice('wrinkle-reducer'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else if (currentUrl.includes('golden-sakura')) {
            mainProduct = {
                id: 'golden-sakura',
                name: 'LAIKOU Vitamin C 24K Golden Sakura',
                price: dynamicPrice || this.getFallbackPrice('golden-sakura'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else if (currentUrl.includes('human-dog-bed')) {
            mainProduct = {
                id: 'human-dog-bed',
                name: 'Human Dog Bed',
                price: dynamicPrice || this.getFallbackPrice('human-dog-bed'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else if (currentUrl.includes('sofa-cover')) {
            mainProduct = {
                id: 'sofa-cover',
                name: 'Detachable Sofa Cover',
                price: dynamicPrice || this.getFallbackPrice('sofa-cover'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else if (currentUrl.includes('memory-foam-pillow')) {
            mainProduct = {
                id: 'memory-foam-pillow',
                name: 'Memory Foam Neck Pillow',
                price: dynamicPrice || this.getFallbackPrice('memory-foam-pillow'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        } else {
            // Fallback: tentar extrair do título da página
            const pageTitle = document.title;
            mainProduct = {
                id: 'product-' + Date.now(),
                name: pageTitle || 'Produto',
                price: dynamicPrice || this.getFallbackPrice('generic'), // Usar preço dinâmico ou fallback inteligente
                quantity: quantity,
                color: selectedColor,
                colorName: selectedColorName
            };
        }
        
        // Ofertas selecionadas - verificar se são produtos reais ou apenas promoções
        if (typeof selectedOffers !== 'undefined' && Array.isArray(selectedOffers)) {
            // Verificar se existem múltiplas ofertas com preços diferentes
            const hasMultipleRealOffers = selectedOffers.length > 1 || 
                (selectedOffers.length === 1 && typeof offers !== 'undefined' && 
                 offers[selectedOffers[0]] && offers[selectedOffers[0]].prices && 
                 offers[selectedOffers[0]].prices.USD > 0);
            
            // Verificar se é uma página com múltiplas ofertas reais (como Wrinkle Reducer, PHOERA, Alligator Clips)
            const isMultiOfferPage = currentUrl.includes('wrinkle-reducer') || currentUrl.includes('phoera') || currentUrl.includes('golden-sakura') || currentUrl.includes('alligator-clips');
            
            // Verificar se é uma página de oferta única mas com produto principal (como Heat-Resistant Mat)
            const isSingleOfferPage = currentUrl.includes('heat-resistant-mat');
            
            if (hasMultipleRealOffers && isMultiOfferPage) {
                console.log('🛍️ Múltiplas ofertas reais detectadas em página multi-oferta, usando apenas as ofertas');
                // Usar apenas as ofertas, não adicionar produto principal separado
                selectedOffers.forEach(offerKey => {
                    if (typeof offers !== 'undefined' && offers[offerKey]) {
                        const offer = offers[offerKey];
                        const offerData = {
                            id: offerKey,
                            name: offer.name || offerKey,
                            price: offer.prices ? offer.prices.USD : 0,
                            quantity: 1
                        };
                        products.push(offerData);
                    }
                });
            } else if (isSingleOfferPage) {
                console.log('ℹ️ Página de oferta única detectada, usando produto principal');
                // Para páginas de oferta única (como Heat-Resistant Mat), usar o produto principal
                if (mainProduct) {
                    products.push(mainProduct);
                }
            } else {
                console.log('ℹ️ Página padrão, usando produto principal');
                // Para outras páginas, usar o produto principal
                if (mainProduct) {
                    products.push(mainProduct);
                }
            }
        } else {
            // Se não há ofertas definidas, usar produto principal
            if (mainProduct) {
                products.push(mainProduct);
            }
        }
        
        return products;
    }

    calculateTotalAmount() {
        console.log('💰 calculateTotalAmount() executado!');
        const products = this.getSelectedProducts();
        let total = 0;
        
        console.log('🔍 Calculando total dos produtos:', products);
        
        products.forEach(product => {
            const productTotal = (product.price || 0) * (product.quantity || 1);
            total += productTotal;
            console.log(`💰 Produto: ${product.name} - Preço: $${product.price} x Quantidade: ${product.quantity} = $${productTotal}`);
        });
        
        console.log('💰 Total calculado:', total);
        return total;
    }

    detectCurrency() {
        const userLanguage = navigator.language || navigator.userLanguage;
        if (userLanguage.startsWith('pt-BR')) return 'BRL';
        if (userLanguage.startsWith('en')) return 'USD';
        return 'USD';
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}

// Inicializar processador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM carregado, verificando se é página de checkout...');
    console.log('📍 URL atual:', window.location.pathname);
    console.log('🔍 URL completa:', window.location.href);
    
    if (window.location.pathname.includes('checkout-') || window.location.href.includes('checkout-')) {
        console.log('✅ Página de checkout detectada, inicializando processador...');
        window.supplierProcessor = new SupplierOrderProcessor();
        console.log('✅ SupplierOrderProcessor inicializado:', window.supplierProcessor);
    } else {
        console.log('ℹ️ Não é página de checkout, processador não inicializado');
    }
});

// Exportar para uso global
window.SupplierOrderProcessor = SupplierOrderProcessor;
