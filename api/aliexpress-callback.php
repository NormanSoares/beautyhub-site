<?php
/**
 * AliExpress Callback Handler
 * Recebe notificações de mudanças de status de pedidos do AliExpress
 * 
 * Endpoint: https://seudominio.com/api/aliexpress-callback.php
 * Método: POST
 */

// Configurações de segurança
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Log de todas as requisições
$logFile = __DIR__ . '/logs/aliexpress-callback.log';
$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

function writeLog($message, $data = null) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    if ($data) {
        $logMessage .= " | Data: " . json_encode($data);
    }
    $logMessage .= "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// Configurações do AliExpress
$ALIEXPRESS_CONFIG = [
    'webhook_secret' => 'sua_chave_secreta_aqui', // Altere para sua chave secreta
    'allowed_ips' => [
        // IPs do AliExpress (exemplo - verifique os IPs oficiais)
        '47.254.128.0/18',
        '47.254.192.0/19',
        '47.254.224.0/19',
        '47.254.240.0/20',
        '47.254.248.0/21',
        '47.254.252.0/22',
        '47.254.254.0/23',
        '47.254.255.0/24'
    ],
    'timeout' => 30
];

/**
 * Valida se o IP da requisição é permitido
 */
function validateIP($allowedIPs) {
    $clientIP = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? 'unknown';
    
    // Para desenvolvimento, aceitar localhost
    if ($clientIP === '127.0.0.1' || $clientIP === '::1' || $clientIP === 'localhost') {
        return true;
    }
    
    foreach ($allowedIPs as $allowedIP) {
        if (strpos($allowedIP, '/') !== false) {
            // CIDR notation
            if (ipInRange($clientIP, $allowedIP)) {
                return true;
            }
        } else {
            // Single IP
            if ($clientIP === $allowedIP) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Verifica se IP está em range CIDR
 */
function ipInRange($ip, $range) {
    if (strpos($range, '/') === false) {
        return $ip === $range;
    }
    
    list($subnet, $bits) = explode('/', $range);
    $ip = ip2long($ip);
    $subnet = ip2long($subnet);
    $mask = -1 << (32 - $bits);
    $subnet &= $mask;
    
    return ($ip & $mask) === $subnet;
}

/**
 * Valida assinatura do webhook
 */
function validateSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expectedSignature, $signature);
}

/**
 * Processa diferentes tipos de eventos do AliExpress
 */
function processAliExpressEvent($eventData) {
    $eventType = $eventData['event_type'] ?? 'unknown';
    $orderData = $eventData['order'] ?? [];
    
    writeLog("Processando evento: $eventType", $eventData);
    
    switch ($eventType) {
        case 'order_created':
            return handleOrderCreated($orderData);
            
        case 'order_paid':
            return handleOrderPaid($orderData);
            
        case 'order_shipped':
            return handleOrderShipped($orderData);
            
        case 'order_delivered':
            return handleOrderDelivered($orderData);
            
        case 'order_cancelled':
            return handleOrderCancelled($orderData);
            
        case 'order_refunded':
            return handleOrderRefunded($orderData);
            
        default:
            writeLog("Tipo de evento não reconhecido: $eventType");
            return ['success' => false, 'error' => 'Event type not supported'];
    }
}

/**
 * Processa criação de pedido
 */
function handleOrderCreated($orderData) {
    $orderId = $orderData['order_id'] ?? '';
    $customerEmail = $orderData['customer']['email'] ?? '';
    
    writeLog("Novo pedido criado", [
        'order_id' => $orderId,
        'customer_email' => $customerEmail
    ]);
    
    // Aqui você pode:
    // 1. Salvar no banco de dados
    // 2. Enviar email de confirmação
    // 3. Atualizar estoque
    // 4. Notificar fornecedores
    
    return ['success' => true, 'message' => 'Order created successfully'];
}

/**
 * Processa pagamento confirmado
 */
function handleOrderPaid($orderData) {
    $orderId = $orderData['order_id'] ?? '';
    $amount = $orderData['total_amount'] ?? 0;
    
    writeLog("Pedido pago", [
        'order_id' => $orderId,
        'amount' => $amount
    ]);
    
    // Aqui você pode:
    // 1. Atualizar status no banco
    // 2. Notificar fornecedor para envio
    // 3. Enviar confirmação por email
    
    return ['success' => true, 'message' => 'Payment confirmed'];
}

/**
 * Processa envio do pedido
 */
function handleOrderShipped($orderData) {
    $orderId = $orderData['order_id'] ?? '';
    $trackingNumber = $orderData['tracking_number'] ?? '';
    $shippingCompany = $orderData['shipping_company'] ?? '';
    
    writeLog("Pedido enviado", [
        'order_id' => $orderId,
        'tracking_number' => $trackingNumber,
        'shipping_company' => $shippingCompany
    ]);
    
    // Aqui você pode:
    // 1. Atualizar status de envio
    // 2. Enviar email com código de rastreamento
    // 3. Atualizar interface do cliente
    
    return ['success' => true, 'message' => 'Order shipped'];
}

/**
 * Processa entrega do pedido
 */
function handleOrderDelivered($orderData) {
    $orderId = $orderData['order_id'] ?? '';
    $deliveryDate = $orderData['delivery_date'] ?? '';
    
    writeLog("Pedido entregue", [
        'order_id' => $orderId,
        'delivery_date' => $deliveryDate
    ]);
    
    // Aqui você pode:
    // 1. Marcar como entregue
    // 2. Solicitar review do produto
    // 3. Processar comissões
    
    return ['success' => true, 'message' => 'Order delivered'];
}

/**
 * Processa cancelamento do pedido
 */
function handleOrderCancelled($orderData) {
    $orderId = $orderData['order_id'] ?? '';
    $reason = $orderData['cancellation_reason'] ?? '';
    
    writeLog("Pedido cancelado", [
        'order_id' => $orderId,
        'reason' => $reason
    ]);
    
    // Aqui você pode:
    // 1. Processar reembolso
    // 2. Atualizar estoque
    // 3. Notificar cliente
    
    return ['success' => true, 'message' => 'Order cancelled'];
}

/**
 * Processa reembolso do pedido
 */
function handleOrderRefunded($orderData) {
    $orderId = $orderData['order_id'] ?? '';
    $refundAmount = $orderData['refund_amount'] ?? 0;
    
    writeLog("Pedido reembolsado", [
        'order_id' => $orderId,
        'refund_amount' => $refundAmount
    ]);
    
    // Aqui você pode:
    // 1. Atualizar status financeiro
    // 2. Notificar cliente
    // 3. Processar devolução de estoque
    
    return ['success' => true, 'message' => 'Order refunded'];
}

/**
 * Salva dados do pedido no localStorage (para integração com frontend)
 */
function saveOrderToFrontend($orderData) {
    $orderFile = __DIR__ . '/data/orders.json';
    $orderDir = dirname($orderFile);
    
    if (!is_dir($orderDir)) {
        mkdir($orderDir, 0755, true);
    }
    
    $orders = [];
    if (file_exists($orderFile)) {
        $orders = json_decode(file_get_contents($orderFile), true) ?: [];
    }
    
    $orderId = $orderData['order_id'] ?? uniqid('order_');
    $orders[$orderId] = [
        'order_id' => $orderId,
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => $orderData,
        'status' => $orderData['event_type'] ?? 'unknown'
    ];
    
    file_put_contents($orderFile, json_encode($orders, JSON_PRETTY_PRINT));
}

// ===== PROCESSAMENTO PRINCIPAL =====

try {
    // Verificar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    // Validar IP (opcional para desenvolvimento)
    if (!validateIP($ALIEXPRESS_CONFIG['allowed_ips'])) {
        writeLog("IP não autorizado", ['ip' => $_SERVER['REMOTE_ADDR']]);
        // Para desenvolvimento, comentar a linha abaixo
        // http_response_code(403);
        // echo json_encode(['error' => 'IP not allowed']);
        // exit;
    }
    
    // Obter dados do POST
    $rawPayload = file_get_contents('php://input');
    $payload = json_decode($rawPayload, true);
    
    if (!$payload) {
        writeLog("Payload inválido", ['raw' => $rawPayload]);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit;
    }
    
    // Validar assinatura (opcional)
    $signature = $_SERVER['HTTP_X_ALIEXPRESS_SIGNATURE'] ?? '';
    if ($signature && !validateSignature($rawPayload, $signature, $ALIEXPRESS_CONFIG['webhook_secret'])) {
        writeLog("Assinatura inválida");
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    // Processar evento
    $result = processAliExpressEvent($payload);
    
    // Salvar dados para integração com frontend
    saveOrderToFrontend($payload);
    
    // Log do resultado
    writeLog("Evento processado", $result);
    
    // Resposta de sucesso
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'result' => $result
    ]);
    
} catch (Exception $e) {
    writeLog("Erro no callback", ['error' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}

// ===== ENDPOINT PARA TESTE =====

// Para testar o callback, acesse: https://seudominio.com/api/aliexpress-callback.php?test=1
if (isset($_GET['test']) && $_GET['test'] === '1') {
    $testData = [
        'event_type' => 'order_created',
        'order' => [
            'order_id' => 'TEST_' . time(),
            'customer' => [
                'email' => 'test@example.com',
                'name' => 'Cliente Teste'
            ],
            'total_amount' => 99.99,
            'currency' => 'BRL',
            'items' => [
                [
                    'product_id' => 'PHOERA_FOUNDATION',
                    'quantity' => 1,
                    'price' => 99.99
                ]
            ]
        ]
    ];
    
    echo "<h2>Teste do Callback AliExpress</h2>";
    echo "<pre>";
    echo "Dados de teste:\n";
    echo json_encode($testData, JSON_PRETTY_PRINT);
    echo "\n\nProcessando evento...\n";
    
    $result = processAliExpressEvent($testData);
    echo "Resultado:\n";
    echo json_encode($result, JSON_PRETTY_PRINT);
    echo "</pre>";
}
?>



