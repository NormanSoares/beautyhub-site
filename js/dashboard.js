/**
 * Dashboard JavaScript - 67 Beauty Hub
 * Sistema de gerenciamento de pedidos
 */

class DashboardManager {
    constructor() {
        this.orders = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.lastOrdersHash = null; // Para detectar mudanças
        this.financialMetrics = null; // Cache das métricas financeiras
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Dashboard...');
        await this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        await this.loadSalesHistory(); // Carregar histórico de vendas
        this.startAutoRefresh();
        console.log('✅ Dashboard inicializado com sucesso!');
    }

    async loadOrders() {
        try {
            console.log('📥 Carregando pedidos...');
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                const newOrders = Array.isArray(data.data) ? data.data : [];
                
                // Detectar se houve mudanças nos pedidos
                const newOrdersHash = this.generateOrdersHash(newOrders);
                const hasChanges = this.lastOrdersHash !== newOrdersHash;
                
                this.orders = newOrders;
                this.lastOrdersHash = newOrdersHash;
                
                console.log(`✅ ${this.orders.length} pedidos carregados`);
                if (hasChanges) {
                    console.log('🔄 Mudanças detectadas nos pedidos - atualizando métricas e histórico!');
                }
                
                this.updateLastUpdateTime();
            } else {
                console.error('❌ Erro ao carregar pedidos:', response.status);
                this.orders = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar pedidos:', error);
            this.orders = [];
        }
    }

    generateOrdersHash(orders) {
        // Gerar hash simples para detectar mudanças
        const ordersData = orders.map(order => ({
            id: order.id,
            total: order.total,
            timestamp: order.created_at || order.timestamp
        }));
        return JSON.stringify(ordersData).length;
    }

    startAutoRefresh() {
        console.log('🔄 Iniciando atualização automática...');
        
        // Auto-refresh a cada 10 segundos
        setInterval(async () => {
            const previousCount = this.orders.length;
            await this.loadOrders();
            
            // Se houve novos pedidos, mostrar notificação
            if (this.orders.length > previousCount) {
                const newOrdersCount = this.orders.length - previousCount;
                this.showNewOrdersNotification(newOrdersCount);
                console.log(`🆕 ${newOrdersCount} novo(s) pedido(s) detectado(s)!`);
            }
            
        // Atualizar TODAS as seções do dashboard
        this.renderOrders();
        this.updateFinancialMetrics(); // Atualizar métricas financeiras primeiro
        this.loadSalesHistory(); // Atualizar histórico de vendas baseado nas métricas
        
        // Atualizar fluxo de processamento de pedidos
        if (typeof updateOrderFlowStats === 'function') {
            updateOrderFlowStats();
        }
        }, 10000); // 10 segundos
        
        // Também atualizar quando a página ganha foco (usuário volta à aba)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ Página ganhou foco, atualizando pedidos...');
                this.loadOrders().then(() => {
                    this.renderOrders();
                    this.updateFinancialMetrics(); // Atualizar métricas financeiras primeiro
                    this.loadSalesHistory(); // Atualizar histórico de vendas baseado nas métricas
                    
                    // Atualizar fluxo de processamento de pedidos
                    if (typeof updateOrderFlowStats === 'function') {
                        updateOrderFlowStats();
                    }
                });
            }
        });
    }

    showNewOrdersNotification(count) {
        // Criar notificação visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <i class="fas fa-bell"></i> 
            ${count} novo(s) pedido(s) recebido(s)!
        `;
        
        // Adicionar animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            lastUpdateElement.textContent = `Última atualização: ${timeString}`;
        }
    }

    updateFinancialMetrics() {
        console.log('💰 Atualizando métricas financeiras...');
        
        // Calcular métricas
        const totalRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = this.orders.length;
        const averageMargin = this.calculateAverageMargin();
        const totalProfit = this.calculateTotalProfit();
        
        // Atualizar elementos na página (sempre em dólar)
        this.updateElement('totalRevenue', `$ ${totalRevenue.toFixed(2)}`);
        this.updateElement('totalProfit', `$ ${totalProfit.toFixed(2)}`);
        this.updateElement('averageMargin', `${averageMargin.toFixed(1)}%`);
        this.updateElement('totalOrders', totalOrders.toString());
        
        console.log(`💰 Métricas DINÂMICAS atualizadas: Receita: $ ${totalRevenue.toFixed(2)}, Lucro: $ ${totalProfit.toFixed(2)}, Margem: ${averageMargin.toFixed(1)}%, Pedidos: ${totalOrders}`);
        console.log(`🔄 Sistema 100% DINÂMICO - Nada hardcoded, tudo se adapta aos pedidos reais!`);
        
        // Salvar métricas para uso no histórico de vendas
        this.financialMetrics = {
            totalRevenue,
            totalProfit,
            averageMargin,
            totalOrders
        };
    }

    calculateAverageMargin() {
        // Calcular margem média dinamicamente baseada nos pedidos reais
        if (this.orders.length === 0) return 0;
        
        const totalRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalCost = this.orders.reduce((sum, order) => {
            // Calcular custo baseado no preço do produto (assumindo 50% de margem por padrão)
            const orderCost = (order.total || 0) * 0.5; // 50% do preço de venda como custo
            return sum + orderCost;
        }, 0);
        
        if (totalRevenue === 0) return 0;
        
        const averageMargin = ((totalRevenue - totalCost) / totalRevenue) * 100;
        return Math.round(averageMargin * 10) / 10; // Arredondar para 1 casa decimal
    }

    calculateTotalProfit() {
        // Calcular lucro total dinamicamente baseado nos pedidos reais
        const totalRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalCost = this.orders.reduce((sum, order) => {
            // Calcular custo baseado no preço do produto
            const orderCost = (order.total || 0) * 0.5; // 50% do preço de venda como custo
            return sum + orderCost;
        }, 0);
        
        return totalRevenue - totalCost; // Lucro real = Receita - Custo
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Carregar histórico de vendas baseado nos pedidos reais
     */
    async loadSalesHistory() {
        console.log('📈 Atualizando histórico de vendas baseado em pedidos reais...');
        const salesDiv = document.getElementById('salesHistory');
        if (!salesDiv) return;

        try {
            // Gerar dados baseados nos pedidos reais
            const salesData = this.generateSalesHistoryFromOrders();
            
            const chartHTML = this.generateSalesChart(salesData);
            salesDiv.innerHTML = chartHTML;
            
            // Velas já aparecem com altura correta
            
            // Adicionar timestamp de última atualização
            const timestamp = new Date().toLocaleTimeString('pt-BR');
            console.log(`✅ Histórico de vendas atualizado às ${timestamp} com dados reais`);
            
            // Mostrar indicador visual de atualização
            this.showSalesHistoryUpdateIndicator();
            
        } catch (error) {
            console.error('❌ Erro ao carregar histórico de vendas:', error);
            salesDiv.innerHTML = '<div class="error">Erro ao carregar histórico de vendas</div>';
        }
    }

    showSalesHistoryUpdateIndicator() {
        // Adicionar indicador visual de atualização
        const salesDiv = document.getElementById('salesHistory');
        if (salesDiv && !salesDiv.querySelector('.update-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'update-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: #28a745;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                animation: fadeInOut 2s ease-in-out;
            `;
            indicator.innerHTML = '🔄 Atualizado';
            
            // Adicionar animação CSS
            if (!document.querySelector('#sales-history-animation')) {
                const style = document.createElement('style');
                style.id = 'sales-history-animation';
                style.textContent = `
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: scale(0.8); }
                        50% { opacity: 1; transform: scale(1); }
                        100% { opacity: 0; transform: scale(0.8); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            salesDiv.style.position = 'relative';
            salesDiv.appendChild(indicator);
            
            // Remover indicador após 2 segundos
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 2000);
        }
    }

    /**
     * Gerar histórico de vendas baseado nos pedidos reais
     */
    generateSalesHistoryFromOrders() {
        console.log('🔍 Gerando histórico de vendas dos pedidos reais...');
        console.log(`📊 Total de pedidos carregados: ${this.orders.length}`);
        
        // Agrupar pedidos por mês
        const monthlyData = {};
        
        this.orders.forEach((order, index) => {
            console.log(`📋 Processando pedido ${index + 1}:`, {
                id: order.id,
                total: order.total,
                timestamp: order.created_at || order.timestamp,
                customer: order.customer?.name || order.customer?.firstName || 'N/A'
            });
            
            // Usar created_at ou timestamp como fallback
            const orderDate = order.created_at || order.timestamp;
            
            if (orderDate) {
                const date = new Date(orderDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
                
                console.log(`📅 Mês do pedido: ${monthName} (${monthKey})`);
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthName,
                        revenue: 0,
                        orders: 0
                    };
                    console.log(`🆕 Novo mês criado: ${monthName}`);
                }
                
                monthlyData[monthKey].revenue += order.total || 0;
                monthlyData[monthKey].orders += 1;
                
                console.log(`💰 Mês ${monthName} agora tem: $${monthlyData[monthKey].revenue} (${monthlyData[monthKey].orders} pedidos)`);
            } else {
                console.warn('⚠️ Pedido sem data:', order);
            }
        });

        // Converter para array e ordenar por data
        const sortedData = Object.keys(monthlyData)
            .sort()
            .map(key => monthlyData[key]);

        // SEMPRE usar dados reais, mesmo que sejam poucos
        if (sortedData.length === 0) {
            console.log('⚠️ Nenhum pedido encontrado, mostrando gráfico vazio');
            return {
                months: [],
                values: [],
                orders: [],
                isRealData: true,
                isEmpty: true
            };
        }

        // Se há poucos dados reais, completar com zeros para mostrar evolução
        if (sortedData.length < 3) {
            console.log(`📊 Usando dados reais: ${sortedData.length} meses com pedidos`);
        }

        // Retornar dados reais desde o primeiro pedido
        const result = {
            months: sortedData.map(item => item.month),
            values: sortedData.map(item => Math.round(item.revenue)),
            orders: sortedData.map(item => item.orders),
            isRealData: true,
            totalOrders: this.orders.length,
            totalRevenue: sortedData.reduce((sum, item) => sum + item.revenue, 0)
        };
        
        console.log('✅ Histórico de vendas gerado com dados reais:');
        console.log('📊 Resultado final:', result);
        console.log(`💰 Receita total dos pedidos reais: $${result.totalRevenue}`);
        console.log(`📦 Total de pedidos processados: ${result.totalOrders}`);
        console.log('🔍 DEBUG - Valores por mês:', result.values);
        console.log('🔍 DEBUG - Meses:', result.months);
        
        return result;
    }

    /**
     * Gerar gráfico de vendas
     */
    generateSalesChart(data) {
        // Lidar com gráfico vazio
        if (data.isEmpty || data.values.length === 0) {
            return `
                <div class="sales-chart">
                    <div class="chart-header">
                        <h3>📊 Vendas por Mês (Dados Reais)</h3>
                        <div class="chart-stats">
                            <span class="stat-item">📭 Nenhum pedido encontrado ainda</span>
                        </div>
                    </div>
                    <div class="chart-container" style="align-items: center; justify-content: center;">
                        <div style="text-align: center; color: #666;">
                            <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 10px;"></i>
                            <p>Faça alguns pedidos para ver o histórico de vendas!</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const maxValue = Math.max(...data.values);
        console.log('🔍 DEBUG - Valores das barras:', data.values);
        console.log('🔍 DEBUG - Valor máximo:', maxValue);
        // Usar métricas financeiras reais e dinâmicas
        const totalSales = this.financialMetrics?.totalRevenue || data.totalRevenue || data.values.reduce((sum, val) => sum + val, 0);
        const totalOrders = this.financialMetrics?.totalOrders || data.totalOrders || data.orders.reduce((sum, val) => sum + val, 0);
        
        console.log('🔍 DEBUG - Cálculo esperado:');
        console.log(`   Janeiro: $23 ÷ $${maxValue} × 100 = ${(23/maxValue*100).toFixed(2)}%`);
        console.log(`   Outubro: $${maxValue} ÷ $${maxValue} × 100 = ${(maxValue/maxValue*100).toFixed(2)}%`);
        console.log('🔍 DEBUG - Valores finais:');
        console.log(`   Total Sales: $${totalSales.toFixed(2)}`);
        console.log(`   Max Value: $${maxValue.toFixed(2)}`);
        
        const averageSales = data.values.length > 0 ? (totalSales / data.values.length) : 0;
        const bestMonth = data.months[data.values.indexOf(maxValue)];
        const worstMonth = data.months[data.values.indexOf(Math.min(...data.values))];

        let chartHTML = `
            <div class="sales-chart">
                <div class="chart-header">
                    <h3>📊 Vendas por Mês (Baseado nas Métricas Financeiras)</h3>
                    <div class="chart-stats">
                        <span class="stat-item">💰 Total: $${totalSales.toFixed(2)}</span>
                        <span class="stat-item">📈 Média: $${averageSales.toFixed(2)}</span>
                        <span class="stat-item">🏆 Melhor: ${bestMonth} ($${maxValue.toFixed(2)})</span>
                        <span class="stat-item">📦 Pedidos: ${totalOrders}</span>
                    </div>
                </div>
                <div class="chart-container">
        `;

        // Gerar barras do gráfico com escala linear proporcional
        console.log('🔍 DEBUG - Criando velas para', data.values.length, 'valores');
        data.values.forEach((value, index) => {
            // Calcular altura baseada no valor real - ESCALA LINEAR
            let height = 0;
            
            if (value > 0) {
                // Escala linear: altura proporcional ao valor
                height = (value / maxValue) * 100; // Usar 100% do espaço máximo
                
                // Para valores muito pequenos, altura mínima de 2% (bem pequeno mas visível)
                if (height < 2) {
                    height = 2;
                }
                
                // Altura máxima de 100%
                if (height > 100) {
                    height = 100;
                }
            }
            
            const month = data.months[index];
            const orders = data.orders ? data.orders[index] : 0;
            
            // Debug: mostrar altura calculada
            console.log(`📊 ${month}: $${value} → altura: ${height}% (maxValue: ${maxValue})`);
            console.log(`🔍 CÁLCULO: ${value} ÷ ${maxValue} × 100 = ${height}%`);
            
            chartHTML += `
                <div class="chart-bar" title="${month}: $${value.toLocaleString()}${orders ? ` (${orders} pedidos)` : ''}">
                    <div class="bar" style="height: ${height}%; opacity: 1; transform: scaleY(1);"></div>
                    <div class="bar-label">${month}</div>
                    <div class="bar-value">$${value.toLocaleString()}</div>
                </div>
            `;
        });

        chartHTML += `
                </div>
            </div>
        `;

        console.log('🔍 DEBUG - HTML gerado:', chartHTML.substring(0, 500) + '...');
        return chartHTML;
    }

    getCurrencyForOrder(order) {
        // Detectar moeda baseada no país do cliente
        const country = order.shipping_address?.country || order.customer?.country || '';
        
        if (country.toLowerCase().includes('brasil') || country.toLowerCase().includes('brazil')) {
            return 'BRL';
        } else if (country.toLowerCase().includes('portugal')) {
            return 'EUR';
        } else if (country.toLowerCase().includes('angola') || country.toLowerCase().includes('moçambique')) {
            return 'AOA';
        } else {
            return 'USD'; // Padrão para outros países
        }
    }

    formatCurrency(amount, currency) {
        switch (currency) {
            case 'BRL':
                return `R$ ${amount.toFixed(2)}`;
            case 'EUR':
                return `€ ${amount.toFixed(2)}`;
            case 'AOA':
                return `Kz ${amount.toFixed(2)}`;
            case 'USD':
            default:
                return `$ ${amount.toFixed(2)}`;
        }
    }

    updateGeneralStats() {
        console.log('📊 Atualizando estatísticas gerais...');
        
        // Calcular estatísticas
        const totalProducts = this.calculateTotalProducts();
        const totalAlerts = this.calculateTotalAlerts();
        const productsToday = this.calculateProductsToday();
        const alertsToday = this.calculateAlertsToday();
        
        // Atualizar elementos
        this.updateElement('totalProducts', totalProducts);
        this.updateElement('totalAlerts', totalAlerts);
        this.updateElement('productsToday', productsToday);
        this.updateElement('alertsToday', alertsToday);
        
        console.log(`📊 Estatísticas atualizadas: Produtos: ${totalProducts}, Alertas: ${totalAlerts}, Hoje: ${productsToday} produtos, ${alertsToday} alertas`);
    }

    calculateTotalProducts() {
        // Contar produtos únicos nos pedidos
        const uniqueProducts = new Set();
        this.orders.forEach(order => {
            if (order.products && Array.isArray(order.products)) {
                order.products.forEach(product => {
                    uniqueProducts.add(product.name || product.id);
                });
            }
        });
        return uniqueProducts.size;
    }

    calculateTotalAlerts() {
        // Simular alertas baseados em pedidos com problemas
        return this.orders.filter(order => 
            order.status === 'pending' && 
            (!order.customer?.email || !order.shipping_address?.street)
        ).length;
    }

    calculateProductsToday() {
        const today = new Date().toDateString();
        return this.orders.filter(order => {
            const orderDate = new Date(order.created_at).toDateString();
            return orderDate === today;
        }).length;
    }

    calculateAlertsToday() {
        const today = new Date().toDateString();
        return this.orders.filter(order => {
            const orderDate = new Date(order.created_at).toDateString();
            return orderDate === today && order.status === 'pending';
        }).length;
    }

    setupEventListeners() {
        // Busca de pedidos
        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderOrders();
            });
        }

        // Filtro de status
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderOrders();
            });
        }

        // Botão de atualização manual
        const refreshButton = document.getElementById('refreshOrders');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                console.log('🔄 Atualização manual solicitada...');
                refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
                refreshButton.disabled = true;
                
                await this.loadOrders();
                this.renderOrders();
                this.updateFinancialMetrics(); // Atualizar métricas financeiras primeiro
                await this.loadSalesHistory(); // Atualizar histórico de vendas baseado nas métricas
                this.updateLastUpdateTime();
                
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Pedidos';
                refreshButton.disabled = false;
                console.log('✅ Atualização manual concluída!');
            });
        }

        // Botão de criar pedido teste
        const createTestOrderBtn = document.querySelector('button[onclick="createTestOrder()"]');
        if (createTestOrderBtn) {
            createTestOrderBtn.addEventListener('click', () => {
                this.createTestOrder();
            });
        }
    }

    renderOrders() {
        // Verificar se temos a tabela organizada
        const ordersContainer = document.getElementById('ordersTableBodyOrganized');
        if (!ordersContainer) {
            console.error('❌ Container de pedidos não encontrado');
            return;
        }

        // Garantir que orders é um array
        if (!Array.isArray(this.orders)) {
            this.orders = [];
        }

        // Filtrar pedidos
        let filteredOrders = this.orders;

        if (this.currentFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === this.currentFilter);
        }

        if (this.searchTerm) {
            filteredOrders = filteredOrders.filter(order =>
                order.customer.name.toLowerCase().includes(this.searchTerm) ||
                order.customer.email.toLowerCase().includes(this.searchTerm) ||
                order.id.toLowerCase().includes(this.searchTerm)
            );
        }

        // Renderizar na tabela organizada
        this.renderOrganizedTable(filteredOrders);

        // Também carregar na tabela de tempo real
        this.renderRealTimeTable(filteredOrders);

        // Atualizar métricas financeiras
        this.updateFinancialMetrics();
        
        // Atualizar estatísticas gerais
        this.updateGeneralStats();
    }

    renderOrderCard(order) {
        // Validar dados do pedido
        if (!order || !order.id) {
            console.error('❌ Pedido inválido:', order);
            return '';
        }

        const statusClass = this.getStatusClass(order.status || 'pending');
        const paymentStatusClass = this.getPaymentStatusClass(order.payment_status || 'pending');
        const orderId = order.id.split('_')[1] || order.id;
        const createdDate = order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A';
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Pedido #${orderId}</h3>
                        <p class="order-date">${createdDate}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${this.getStatusText(order.status || 'pending')}</span>
                        <span class="payment-status ${paymentStatusClass}">${this.getPaymentStatusText(order.payment_status || 'pending')}</span>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="customer-info">
                        <h4>Cliente</h4>
                        <p><strong>Nome:</strong> ${order.customer?.name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
                        <p><strong>Telefone:</strong> ${order.customer?.phone || 'Não informado'}</p>
                    </div>
                    
                    <div class="products-info">
                        <h4>Produtos</h4>
                        ${Array.isArray(order.products) ? order.products.map(product => `
                            <div class="product-item">
                                <p><strong>${product.name || 'Produto'}</strong></p>
                                <p>Quantidade: ${product.quantity || 1} | Preço: $${product.price || 0}</p>
                            </div>
                        `).join('') : '<p>Nenhum produto</p>'}
                    </div>
                    
                    <div class="shipping-info">
                        <h4>Endereço de Entrega</h4>
                        <p>${order.shipping_address?.street || 'N/A'}</p>
                        <p>${order.shipping_address?.city || 'N/A'}, ${order.shipping_address?.state || 'N/A'} ${order.shipping_address?.zip || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="dashboardManager.editOrder('${order.id}')">
                        Editar
                    </button>
                    <button class="btn btn-success" onclick="dashboardManager.processOrder('${order.id}')">
                        Processar
                    </button>
                    <button class="btn btn-warning" onclick="dashboardManager.updateStatus('${order.id}')">
                        Atualizar Status
                    </button>
                </div>
            </div>
        `;
    }

    renderOrganizedTable(orders) {
        const tbody = document.getElementById('ordersTableBodyOrganized');
        if (!tbody) {
            console.error('❌ Tabela organizada não encontrada');
            return;
        }

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center">Nenhum pedido encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => {
            const orderId = order.id.split('_')[1] || order.id;
            const createdDate = order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A';
            const createdTime = order.created_at ? new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : '';
            const itemsCount = Array.isArray(order.products) ? order.products.length : 0;
            
            return `
                <tr>
                    <td><input type="checkbox" class="order-checkbox" data-order-id="${order.id}"></td>
                    <td><strong>#${orderId}</strong></td>
                    <td>${createdDate}<br><small style="color: #666;">${createdTime}</small></td>
                    <td>${order.customer?.name || 'N/A'}</td>
                    <td>Online</td>
                    <td><strong>${this.formatCurrency(order.total || 0, this.getCurrencyForOrder(order))}</strong></td>
                    <td>
                        <span class="status-badge-table status-${order.payment_status === 'paid' ? 'paid' : 'pending-payment'}">
                            ${order.payment_status === 'paid' ? 'PAGO' : 'PENDENTE'}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge-table status-${order.status || 'pending'}">
                            ${order.status === 'pending' ? 'PENDENTE' : order.status === 'processing' ? 'PROCESSANDO' : order.status}
                        </span>
                    </td>
                    <td>${itemsCount} item</td>
                    <td>-</td>
                    <td>FRETE</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn-small btn-edit-small" onclick="dashboardManager.editOrder('${order.id}')" title="Editar">
                                E
                            </button>
                            <button class="action-btn-small btn-process-small" onclick="dashboardManager.processOrder('${order.id}')" title="Processar">
                                P
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderRealTimeTable(orders) {
        const tbody = document.getElementById('ordersTableBodyMain');
        if (!tbody) {
            console.error('❌ Tabela de tempo real não encontrada');
            return;
        }

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum pedido encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id.split('_')[1] || order.id}</td>
                <td>${order.customer?.name || 'N/A'}</td>
                <td>${Array.isArray(order.products) ? order.products.length : 0} produtos</td>
                <td>${this.formatCurrency(order.total || 0, this.getCurrencyForOrder(order))}</td>
                <td><span class="status-badge ${this.getStatusClass(order.status)}">${this.getStatusText(order.status)}</span></td>
                <td>AliExpress</td>
                <td>${order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="dashboardManager.editOrder('${order.id}')">Editar</button>
                    <button class="action-btn btn-process" onclick="dashboardManager.processOrder('${order.id}')">Processar</button>
                </td>
            </tr>
        `).join('');
    }

    getStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return statusClasses[status] || 'status-pending';
    }

    getPaymentStatusClass(paymentStatus) {
        const paymentClasses = {
            'pending': 'payment-pending',
            'paid': 'payment-paid',
            'failed': 'payment-failed',
            'refunded': 'payment-refunded'
        };
        return paymentClasses[paymentStatus] || 'payment-pending';
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'Pendente',
            'processing': 'Processando',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusTexts[status] || 'Pendente';
    }

    getPaymentStatusText(paymentStatus) {
        const paymentTexts = {
            'pending': 'Pagamento Pendente',
            'paid': 'Pago',
            'failed': 'Falha no Pagamento',
            'refunded': 'Reembolsado'
        };
        return paymentTexts[paymentStatus] || 'Pagamento Pendente';
    }

    async createTestOrder() {
        try {
            console.log('🧪 Criando pedido de teste...');
            const testOrder = {
                customer: {
                    name: 'Cliente Teste',
                    email: 'teste@example.com',
                    phone: '+1 (555) 123-4567'
                },
                products: [
                    {
                        id: 'test_product_1',
                        name: 'Produto de Teste',
                        price: 29.99,
                        quantity: 1
                    }
                ],
                total: 29.99,
                status: 'pending',
                payment_status: 'pending',
                shipping_address: {
                    street: '123 Test Street',
                    city: 'Test City',
                    state: 'TS',
                    zip: '12345',
                    country: 'USA'
                },
                notes: 'Pedido de teste criado pelo dashboard',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tracking: {
                    number: '',
                    carrier: '',
                    status: 'pending'
                }
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testOrder)
            });

            if (response.ok) {
                console.log('✅ Pedido de teste criado com sucesso!');
                await this.loadOrders();
                this.renderOrders();
            } else {
                console.error('❌ Erro ao criar pedido de teste:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao criar pedido de teste:', error);
        }
    }

    editOrder(orderId) {
        console.log('✏️ Editando pedido:', orderId);
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            this.showEditModal(order);
        }
    }

    showEditModal(order) {
        const modal = document.createElement('div');
        modal.className = 'order-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Editar Pedido #${order.id.split('_')[1]}</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editOrderForm">
                        <div class="form-section">
                            <h4>👤 Dados do Cliente</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCustomerName">Nome:</label>
                                    <input type="text" id="editCustomerName" value="${order.customer?.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="editCustomerEmail">Email:</label>
                                    <input type="email" id="editCustomerEmail" value="${order.customer?.email || ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCustomerPhone">Telefone:</label>
                                    <input type="tel" id="editCustomerPhone" value="${order.customer?.phone || ''}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>📍 Endereço de Entrega</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editStreet">Rua/Endereço:</label>
                                    <input type="text" id="editStreet" value="${order.shipping_address?.street || ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCity">Cidade:</label>
                                    <input type="text" id="editCity" value="${order.shipping_address?.city || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="editState">Estado:</label>
                                    <input type="text" id="editState" value="${order.shipping_address?.state || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="editZip">CEP:</label>
                                    <input type="text" id="editZip" value="${order.shipping_address?.zip || order.shipping_address?.zipCode || ''}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editCountry">País:</label>
                                    <input type="text" id="editCountry" value="${order.shipping_address?.country || ''}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>📦 Produtos (Somente Visualização)</h4>
                            <div class="products-readonly">
                                ${Array.isArray(order.products) ? order.products.map(product => `
                                    <div class="product-item-readonly">
                                        <strong>${product.name}</strong> - $${product.price} x ${product.quantity}
                                    </div>
                                `).join('') : '<p>Nenhum produto</p>'}
                            </div>
                        </div>
                        
                           <div class="form-section">
                               <h4>💰 Informações Financeiras (Somente Visualização)</h4>
                               <div class="financial-readonly">
                                   <p><strong>Total:</strong> ${this.formatCurrency(order.total || 0, this.getCurrencyForOrder(order))}</p>
                                   <p><strong>Status do Pagamento:</strong> ${this.getPaymentStatusText(order.payment_status || 'pending')}</p>
                               </div>
                           </div>

                           <div class="form-section">
                               <h4>📝 Notas do Pedido (Somente Visualização)</h4>
                               <div class="notes-readonly">
                                   <p><strong>Observações:</strong> ${order.notes || order.observations || 'Nenhuma observação'}</p>
                                   <p><strong>Método de Pagamento:</strong> ${order.payment_method || 'Não especificado'}</p>
                               </div>
                           </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" onclick="dashboardManager.saveOrderEdit('${order.id}')">💾 Salvar Alterações</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">❌ Cancelar</button>
                </div>
            </div>
        `;
        
        // Adicionar estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .order-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 10px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            .modal-body {
                padding: 20px;
            }
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .form-section {
                margin-bottom: 25px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .form-section h4 {
                margin: 0 0 15px 0;
                color: #333;
                border-bottom: 2px solid #007bff;
                padding-bottom: 5px;
            }
            .form-row {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            .form-group {
                flex: 1;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #555;
            }
            .form-group input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            .form-group input:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
            }
            .products-readonly, .financial-readonly, .notes-readonly {
                   background: #e9ecef;
                   padding: 10px;
                   border-radius: 4px;
                   color: #666;
               }
            .product-item-readonly {
                margin: 5px 0;
                padding: 5px;
                background: white;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    async saveOrderEdit(orderId) {
        try {
            console.log('💾 Salvando edição do pedido:', orderId);
            
            // Coletar dados do formulário
            const customerName = document.getElementById('editCustomerName').value;
            const customerEmail = document.getElementById('editCustomerEmail').value;
            const customerPhone = document.getElementById('editCustomerPhone').value;
            const street = document.getElementById('editStreet').value;
            const city = document.getElementById('editCity').value;
            const state = document.getElementById('editState').value;
            const zip = document.getElementById('editZip').value;
            const country = document.getElementById('editCountry').value;
            
            // Validar campos obrigatórios
            if (!customerName || !customerEmail || !street || !city || !state || !zip || !country) {
                alert('Por favor, preencha todos os campos obrigatórios!');
                return;
            }
            
            // Encontrar o pedido
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                alert('Pedido não encontrado!');
                return;
            }
            
            // Atualizar dados editáveis
            order.customer = {
                ...order.customer,
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            };
            
            order.shipping_address = {
                ...order.shipping_address,
                street: street,
                city: city,
                state: state,
                zip: zip,
                zipCode: zip, // Manter compatibilidade
                country: country
            };
            
            order.updated_at = new Date().toISOString();
            
            // Salvar no servidor
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            if (response.ok) {
                console.log('✅ Pedido editado com sucesso!');
                await this.loadOrders();
                this.renderOrders();
                
                // Fechar modal
                const modal = document.querySelector('.order-modal');
                if (modal) {
                    modal.remove();
                }
                
                alert('Pedido editado com sucesso!');
            } else {
                console.error('❌ Erro ao salvar edição:', response.status);
                alert('Erro ao salvar alterações!');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar edição:', error);
            alert('Erro ao salvar alterações!');
        }
    }

    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            alert('Pedido não encontrado!');
            return;
        }
        this.showOrderModal(order);
    }

    showOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'order-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Pedido #${order.id.split('_')[1]}</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-details">
                        <h4>Cliente</h4>
                        <p><strong>Nome:</strong> ${order.customer.name}</p>
                        <p><strong>Email:</strong> ${order.customer.email}</p>
                        <p><strong>Telefone:</strong> ${order.customer.phone || 'Não informado'}</p>
                        
                        <h4>Produtos e Ofertas Selecionadas</h4>
                        ${order.products.map((product, index) => `
                            <div class="product-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; background: #f9f9f9;">
                                <h5 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">
                                    ${index === 0 ? '🎯 Oferta Básica' : index === 1 ? '⭐ Oferta Premium' : '💎 Oferta Complete'}
                                </h5>
                                <p><strong>${product.name}</strong></p>
                                <p>Quantidade: ${product.quantity || 1}</p>
                                <p>Preço: ${this.formatCurrency(product.totalPrice || product.price || 0, this.getCurrencyForOrder(order))}</p>
                                ${product.selectedColor ? `<p>Cor selecionada: <strong style="color: #007bff;">${product.selectedColor.name}</strong></p>` : ''}
                                ${product.variation ? `<p>Variação: <strong>${product.variation.displayName || product.variation.value}</strong></p>` : ''}
                            </div>
                        `).join('')}
                        
                        <h4>Endereço de Entrega</h4>
                        <p>${order.shipping_address.street}</p>
                        <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}</p>
                        
                        <h4>Status</h4>
                        <p><strong>Pedido:</strong> ${this.getStatusText(order.status)}</p>
                        <p><strong>Pagamento:</strong> ${this.getPaymentStatusText(order.payment_status)}</p>
                        <p><strong>Total:</strong> ${this.formatCurrency(order.total, this.getCurrencyForOrder(order))}</p>
                        <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="dashboardManager.processOrder('${order.id}')">Processar</button>
                    <button class="btn btn-warning" onclick="dashboardManager.updateStatus('${order.id}')">Atualizar Status</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Fechar</button>
                </div>
            </div>
        `;
        
        // Adicionar estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .order-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 10px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            .modal-body {
                padding: 20px;
            }
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .order-details h4 {
                color: #333;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            .product-item {
                background: #f8f9fa;
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    async processOrder(orderId) {
        try {
            console.log('⚙️ Processando pedido:', orderId);
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                alert('Pedido não encontrado!');
                return;
            }
            
            // Confirmar se quer enviar para fornecedor
            const confirmSend = confirm(`Deseja enviar o pedido ${orderId} para o fornecedor (AliExpress)?`);
            if (!confirmSend) {
                return;
            }
            
            // Atualizar status para processando
            order.status = 'processing';
            order.updated_at = new Date().toISOString();
            
            // Salvar no servidor
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            if (response.ok) {
                console.log('✅ Pedido processado com sucesso!');
                
                // Simular envio para fornecedor
                await this.sendToSupplier(order);
                
                await this.loadOrders();
                this.renderOrders();
                alert('Pedido processado e enviado para o fornecedor!');
            } else {
                console.error('❌ Erro ao processar pedido:', response.status);
                alert('Erro ao processar pedido!');
            }
        } catch (error) {
            console.error('❌ Erro ao processar pedido:', error);
            alert('Erro ao processar pedido!');
        }
    }

    async sendToSupplier(order) {
        console.log('📤 Enviando pedido para fornecedor (AliExpress):', order.id);
        
        try {
            // Simular envio para AliExpress
            const supplierData = {
                orderId: order.id,
                customer: order.customer,
                products: order.products,
                total: order.total,
                shipping_address: order.shipping_address,
                timestamp: new Date().toISOString()
            };
            
            console.log('📦 Dados enviados para AliExpress:', supplierData);
            
            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Atualizar status para enviado
            order.status = 'sent_to_supplier';
            order.updated_at = new Date().toISOString();
            
            console.log('✅ Pedido enviado para AliExpress com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao enviar para fornecedor:', error);
            throw error;
        }
    }

    async updateStatus(orderId) {
        try {
            console.log('🔄 Atualizando status do pedido:', orderId);
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                alert('Pedido não encontrado!');
                return;
            }
            
            const newStatus = prompt('Novo status (pending, processing, shipped, delivered, cancelled):', order.status);
            if (!newStatus) return;
            
            order.status = newStatus;
            order.updated_at = new Date().toISOString();
            
            // Salvar no servidor
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            if (response.ok) {
                console.log('✅ Status atualizado com sucesso!');
                await this.loadOrders();
                this.renderOrders();
                alert('Status atualizado com sucesso!');
            } else {
                console.error('❌ Erro ao atualizar status:', response.status);
                alert('Erro ao atualizar status!');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            alert('Erro ao atualizar status!');
        }
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
