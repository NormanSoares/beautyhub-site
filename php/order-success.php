<?php
/**
 * Página de Sucesso do Pedido - 67 Beauty Hub
 */

require_once 'validation.php';

$orderId = $_GET['orderId'] ?? '';
$orderData = null;

// Carregar dados do pedido se ID foi fornecido
if (!empty($orderId)) {
    $ordersFile = 'data/orders.json';
    if (file_exists($ordersFile)) {
        $orders = json_decode(file_get_contents($ordersFile), true) ?: [];
        foreach ($orders as $order) {
            if ($order['id'] === $orderId) {
                $orderData = $order;
                break;
            }
        }
    }
}

// Se não encontrou o pedido, redirecionar
if (empty($orderData)) {
    header("Location: ../index.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Confirmado - 67 Beauty Hub</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .success-header {
            background: white;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .success-icon {
            font-size: 4rem;
            color: #28a745;
            margin-bottom: 20px;
        }
        
        .success-title {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .success-subtitle {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 30px;
        }
        
        .order-details {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section-title {
            font-size: 1.5rem;
            color: #d4af37;
            margin-bottom: 20px;
            font-weight: 600;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 10px;
        }
        
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .detail-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #d4af37;
        }
        
        .detail-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .detail-value {
            color: #666;
        }
        
        .product-summary {
            background: linear-gradient(135deg, #d4af37, #b8941f);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .product-summary h3 {
            margin: 0 0 15px 0;
        }
        
        .product-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .total {
            font-size: 1.3rem;
            font-weight: 700;
            text-align: right;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.3);
        }
        
        .shipping-info {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #28a745;
        }
        
        .shipping-info h4 {
            color: #28a745;
            margin-bottom: 15px;
        }
        
        .shipping-info p {
            margin: 5px 0;
            color: #333;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            background: linear-gradient(135deg, #d4af37, #b8941f);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            font-size: 1rem;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }
        
        .btn-secondary {
            background: transparent;
            color: #d4af37;
            border: 2px solid #d4af37;
        }
        
        .btn-secondary:hover {
            background: #d4af37;
            color: white;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
        }
        
        @media (max-width: 768px) {
            .detail-grid {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .success-title {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header de Sucesso -->
        <div class="success-header">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h1 class="success-title">Pedido Confirmado!</h1>
            <p class="success-subtitle">Obrigado por escolher a 67 Beauty Hub</p>
            <p><strong>ID do Pedido:</strong> <?= htmlspecialchars($orderData['id']) ?></p>
        </div>
        
        <!-- Detalhes do Pedido -->
        <div class="order-details">
            <h2 class="section-title">Detalhes do Pedido</h2>
            
            <!-- Resumo do Produto -->
            <div class="product-summary">
                <h3><i class="fas fa-shopping-bag"></i> Produto</h3>
                <div class="product-info">
                    <span><?= htmlspecialchars($orderData['product']['name']) ?></span>
                    <span>Qtd: <?= $orderData['product']['quantity'] ?></span>
                </div>
                <div class="product-info">
                    <span>Preço Unitário</span>
                    <span>R$ <?= number_format($orderData['product']['price'], 2, ',', '.') ?></span>
                </div>
                <div class="total">
                    Total: R$ <?= number_format($orderData['payment']['total'], 2, ',', '.') ?>
                </div>
            </div>
            
            <!-- Informações do Cliente -->
            <h3 class="section-title">Informações de Entrega</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Nome Completo</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['firstName'] . ' ' . $orderData['customer']['lastName']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['email']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Telefone</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['phone']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Endereço</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['address']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Cidade</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['city']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Estado</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['state']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">CEP</div>
                    <div class="detail-value"><?= htmlspecialchars($orderData['customer']['zipCode']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Método de Pagamento</div>
                    <div class="detail-value"><?= ucfirst($orderData['payment']['method']) ?></div>
                </div>
            </div>
            
            <!-- Informações de Envio -->
            <div class="shipping-info">
                <h4><i class="fas fa-truck"></i> Informações de Envio</h4>
                <p><strong>Prazo de Entrega:</strong> <?= $orderData['shipping']['estimated_days'] ?> dias úteis</p>
                <p><strong>Frete:</strong> Grátis para todo o Brasil</p>
                <p><strong>Status Atual:</strong> Pedido em processamento</p>
                <p><strong>Data do Pedido:</strong> <?= date('d/m/Y H:i', strtotime($orderData['created_at'])) ?></p>
            </div>
        </div>
        
        <!-- Botões de Ação -->
        <div class="action-buttons">
            <a href="../index.html" class="btn">
                <i class="fas fa-home"></i> Voltar ao Início
            </a>
            <a href="../beauty-store.html" class="btn btn-secondary">
                <i class="fas fa-palette"></i> Continuar Comprando
            </a>
            <a href="../comfort-store.html" class="btn btn-secondary">
                <i class="fas fa-home"></i> Seção Conforto
            </a>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><i class="fas fa-heart"></i> Obrigado por confiar na 67 Beauty Hub!</p>
            <p>Em caso de dúvidas, entre em contato conosco.</p>
        </div>
    </div>
    
    <script>
        // Salvar pedido no localStorage para referência
        const orderData = <?= json_encode($orderData) ?>;
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Analytics (simulação)
        console.log('Pedido confirmado:', orderData);
        
        // Auto-scroll para o topo
        window.scrollTo(0, 0);
    </script>
</body>
</html>









