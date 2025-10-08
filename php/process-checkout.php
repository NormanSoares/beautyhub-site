<?php
/**
 * Processamento de Checkout - 67 Beauty Hub
 * Validação e processamento de pedidos
 */

require_once 'validation.php';

// Configurações
$success = false;
$errors = [];
$data = [];

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Obter dados do formulário
    $data = [
        'firstName' => $_POST['firstName'] ?? '',
        'lastName' => $_POST['lastName'] ?? '',
        'email' => $_POST['email'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'address' => $_POST['address'] ?? '',
        'city' => $_POST['city'] ?? '',
        'state' => $_POST['state'] ?? '',
        'zipCode' => $_POST['zipCode'] ?? '',
        'quantity' => $_POST['quantity'] ?? 1,
        'paymentMethod' => $_POST['paymentMethod'] ?? '',
        'productName' => $_POST['productName'] ?? '',
        'productPrice' => $_POST['productPrice'] ?? 0,
        'total' => $_POST['total'] ?? 0
    ];
    
    // Validar dados
    $validator = Validator::validateCheckout($data);
    
    if ($validator->hasErrors()) {
        $errors = $validator->getErrors();
    } else {
        // Dados válidos, processar pedido
        $validatedData = $validator->getValidatedData();
        
        // Gerar ID único do pedido
        $orderId = 'ORDER_' . date('YmdHis') . '_' . rand(1000, 9999);
        
        // Calcular total
        $quantity = (int)$validatedData['quantity'];
        $price = (float)$validatedData['productPrice'];
        $total = $quantity * $price;
        
        // Dados do pedido
        $orderData = [
            'id' => $orderId,
            'customer' => [
                'firstName' => $validatedData['firstName'],
                'lastName' => $validatedData['lastName'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'address' => $validatedData['address'],
                'city' => $validatedData['city'],
                'state' => $validatedData['state'],
                'zipCode' => $validatedData['zipCode']
            ],
            'product' => [
                'name' => $validatedData['productName'],
                'price' => $price,
                'quantity' => $quantity
            ],
            'payment' => [
                'method' => $validatedData['paymentMethod'],
                'total' => $total
            ],
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
            'shipping' => [
                'method' => 'standard',
                'estimated_days' => '15-25',
                'cost' => 0
            ]
        ];
        
        // Salvar pedido (simulação - em produção seria no banco de dados)
        $ordersFile = 'data/orders.json';
        if (!file_exists('data')) {
            mkdir('data', 0777, true);
        }
        
        // Carregar pedidos existentes
        $orders = [];
        if (file_exists($ordersFile)) {
            $orders = json_decode(file_get_contents($ordersFile), true) ?: [];
        }
        
        // Adicionar novo pedido
        $orders[] = $orderData;
        
        // Salvar pedidos
        file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT));
        
        // Enviar email de confirmação (simulação)
        sendOrderConfirmation($orderData);
        
        $success = true;
        
        // Redirecionar para página de sucesso
        header("Location: order-success.php?orderId=" . $orderId);
        exit;
    }
}

/**
 * Enviar email de confirmação
 */
function sendOrderConfirmation($orderData) {
    $to = $orderData['customer']['email'];
    $subject = "Confirmação de Pedido - 67 Beauty Hub";
    
    $message = "
    <html>
    <head>
        <title>Confirmação de Pedido</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #b8941f); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎉 Pedido Confirmado!</h1>
                <p>Obrigado por escolher a 67 Beauty Hub</p>
            </div>
            
            <div class='content'>
                <h2>Detalhes do Pedido</h2>
                <p><strong>ID do Pedido:</strong> {$orderData['id']}</p>
                <p><strong>Data:</strong> {$orderData['created_at']}</p>
                
                <div class='order-details'>
                    <h3>Produto</h3>
                    <p><strong>Nome:</strong> {$orderData['product']['name']}</p>
                    <p><strong>Quantidade:</strong> {$orderData['product']['quantity']}</p>
                    <p><strong>Preço Unitário:</strong> R$ " . number_format($orderData['product']['price'], 2, ',', '.') . "</p>
                    <p><strong>Total:</strong> R$ " . number_format($orderData['payment']['total'], 2, ',', '.') . "</p>
                </div>
                
                <div class='order-details'>
                    <h3>Informações de Entrega</h3>
                    <p><strong>Nome:</strong> {$orderData['customer']['firstName']} {$orderData['customer']['lastName']}</p>
                    <p><strong>Endereço:</strong> {$orderData['customer']['address']}</p>
                    <p><strong>Cidade:</strong> {$orderData['customer']['city']} - {$orderData['customer']['state']}</p>
                    <p><strong>CEP:</strong> {$orderData['customer']['zipCode']}</p>
                    <p><strong>Telefone:</strong> {$orderData['customer']['phone']}</p>
                </div>
                
                <div class='order-details'>
                    <h3>Informações de Envio</h3>
                    <p><strong>Prazo:</strong> {$orderData['shipping']['estimated_days']} dias úteis</p>
                    <p><strong>Frete:</strong> Grátis</p>
                    <p><strong>Status:</strong> {$orderData['status']}</p>
                </div>
                
                <p>Acompanhe seu pedido através do ID: <strong>{$orderData['id']}</strong></p>
            </div>
            
            <div class='footer'>
                <p>67 Beauty Hub - Beleza e Conforto</p>
                <p>Em caso de dúvidas, entre em contato conosco.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: 67 Beauty Hub <noreply@67beautyhub.com>',
        'Reply-To: contato@67beautyhub.com',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Em produção, usar mail() ou biblioteca de email
    // mail($to, $subject, $message, implode("\r\n", $headers));
    
    // Para desenvolvimento, salvar em arquivo
    $emailFile = 'data/emails/' . $orderData['id'] . '.html';
    if (!file_exists('data/emails')) {
        mkdir('data/emails', 0777, true);
    }
    file_put_contents($emailFile, $message);
}

// Se não for POST, redirecionar para página principal
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../index.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processando Pedido - 67 Beauty Hub</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .alert {
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .alert-danger {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert ul {
            text-align: left;
            margin: 10px 0;
        }
        
        .alert li {
            margin: 5px 0;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            font-size: 1.2rem;
            color: #666;
        }
        
        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #d4af37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .btn {
            background: linear-gradient(135deg, #d4af37, #b8941f);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            margin: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }
        
        .logo {
            margin-bottom: 30px;
        }
        
        .logo img {
            max-width: 150px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="../Imagens/Logotipo.png" alt="67 Beauty Hub">
        </div>
        
        <?php if (!empty($errors)): ?>
            <?php displayErrors($errors); ?>
            <a href="javascript:history.back()" class="btn">
                <i class="fas fa-arrow-left"></i> Voltar e Corrigir
            </a>
        <?php else: ?>
            <div class="loading">
                <div class="spinner"></div>
                <span>Processando seu pedido...</span>
            </div>
            <p>Por favor, aguarde enquanto processamos suas informações.</p>
        <?php endif; ?>
    </div>
    
    <script>
        // Se há erros, não fazer redirect
        <?php if (empty($errors)): ?>
        // Simular processamento e redirect
        setTimeout(function() {
            window.location.href = 'order-success.php?orderId=<?= $orderId ?? '' ?>';
        }, 2000);
        <?php endif; ?>
    </script>
</body>
</html>









