<?php
/**
 * Configurações do Sistema - 67 Beauty Hub
 */

// Configurações de erro
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurações de timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurações de sessão
session_start();

// Configurações de email
define('EMAIL_FROM', 'noreply@67beautyhub.com');
define('EMAIL_REPLY_TO', 'contato@67beautyhub.com');
define('ADMIN_EMAIL', 'admin@67beautyhub.com');

// Configurações de arquivo
define('DATA_DIR', __DIR__ . '/../data');
define('ORDERS_FILE', DATA_DIR . '/orders.json');
define('MESSAGES_FILE', DATA_DIR . '/messages.json');
define('EMAILS_DIR', DATA_DIR . '/emails');

// Configurações de produto
define('PRODUCTS', [
    'phoera-foundation' => [
        'name' => '2 Pack PHOERA Foundation + Combo',
        'price' => 39.99,
        'category' => 'beauty'
    ],
    'alligator-clips' => [
        'name' => 'Alligator Hair Clips + Combo',
        'price' => 15.99,
        'category' => 'beauty'
    ],
    'heat-resistant-mat' => [
        'name' => 'Heat-Resistant Mat + Combo',
        'price' => 19.99,
        'category' => 'beauty'
    ],
    'golden-sakura' => [
        'name' => 'LAIKOU Vitamin C 24K Golden Sakura',
        'price' => 69.99,
        'category' => 'beauty'
    ],
    
    'wrinkle-reducer' => [
        'name' => 'Vara de Skincare - Wrinkle Reducer - Red Light Therapy',
        'price' => 89.99,
        'category' => 'beauty'
    ],
    'sofa-cover' => [
        'name' => 'Detachable Sofa Cover Bean Bag Cover',
        'price' => 34.99,
        'category' => 'comfort'
    ],
    'steam-dryer' => [
        'name' => 'Household Quick Dry Ironing Compact Steam Portable Dryer',
        'price' => 45.99,
        'category' => 'comfort'
    ],
    'human-dog-bed' => [
        'name' => 'Human Dog Bed',
        'price' => 79.99,
        'category' => 'comfort'
    ],
    'cat-litter-box' => [
        'name' => 'Intelligent Cat Litter Box',
        'price' => 299.99,
        'category' => 'comfort'
    ],
    'snooze-bundle' => [
        'name' => 'SNOOZE BUNDLE',
        'price' => 149.99,
        'category' => 'comfort'
    ]
]);

// Configurações de frete
define('SHIPPING_CONFIG', [
    'free_threshold' => 0, // Frete grátis para todos
    'standard_days' => '15-25',
    'express_days' => '7-15',
    'express_cost' => 15.99
]);

// Estados brasileiros
define('BRAZILIAN_STATES', [
    'AC' => 'Acre',
    'AL' => 'Alagoas',
    'AP' => 'Amapá',
    'AM' => 'Amazonas',
    'BA' => 'Bahia',
    'CE' => 'Ceará',
    'DF' => 'Distrito Federal',
    'ES' => 'Espírito Santo',
    'GO' => 'Goiás',
    'MA' => 'Maranhão',
    'MT' => 'Mato Grosso',
    'MS' => 'Mato Grosso do Sul',
    'MG' => 'Minas Gerais',
    'PA' => 'Pará',
    'PB' => 'Paraíba',
    'PR' => 'Paraná',
    'PE' => 'Pernambuco',
    'PI' => 'Piauí',
    'RJ' => 'Rio de Janeiro',
    'RN' => 'Rio Grande do Norte',
    'RS' => 'Rio Grande do Sul',
    'RO' => 'Rondônia',
    'RR' => 'Roraima',
    'SC' => 'Santa Catarina',
    'SP' => 'São Paulo',
    'SE' => 'Sergipe',
    'TO' => 'Tocantins'
]);

// Função para criar diretórios necessários
function createDirectories() {
    if (!file_exists(DATA_DIR)) {
        mkdir(DATA_DIR, 0777, true);
    }
    if (!file_exists(EMAILS_DIR)) {
        mkdir(EMAILS_DIR, 0777, true);
    }
}

// Função para obter informações do produto
function getProductInfo($productId) {
    return PRODUCTS[$productId] ?? null;
}

// Função para calcular frete
function calculateShipping($total, $method = 'standard') {
    if ($method === 'express') {
        return [
            'cost' => SHIPPING_CONFIG['express_cost'],
            'days' => SHIPPING_CONFIG['express_days']
        ];
    }
    
    return [
        'cost' => 0, // Frete grátis
        'days' => SHIPPING_CONFIG['standard_days']
    ];
}

// Função para gerar ID único
function generateUniqueId($prefix = 'ID') {
    return $prefix . '_' . date('YmdHis') . '_' . rand(1000, 9999);
}

// Função para sanitizar dados
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Função para validar CSRF token
function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Função para gerar CSRF token
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Função para log de atividades
function logActivity($action, $data = []) {
    $logFile = DATA_DIR . '/activity.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'data' => $data
    ];
    
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

// Função para limpar dados antigos (manutenção)
function cleanupOldData($days = 30) {
    $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));
    
    // Limpar emails antigos
    if (file_exists(EMAILS_DIR)) {
        $files = glob(EMAILS_DIR . '/*.html');
        foreach ($files as $file) {
            if (filemtime($file) < strtotime($cutoffDate)) {
                unlink($file);
            }
        }
    }
    
    // Limpar logs antigos
    $logFile = DATA_DIR . '/activity.log';
    if (file_exists($logFile)) {
        $lines = file($logFile, FILE_IGNORE_NEW_LINES);
        $filteredLines = array_filter($lines, function($line) use ($cutoffDate) {
            $data = json_decode($line, true);
            return $data && $data['timestamp'] >= $cutoffDate;
        });
        file_put_contents($logFile, implode("\n", $filteredLines) . "\n");
    }
}

// Inicializar sistema
createDirectories();

// Log de inicialização
logActivity('system_init', ['version' => '1.0']);

// Limpeza automática (executar apenas uma vez por dia)
$lastCleanup = DATA_DIR . '/last_cleanup.txt';
if (!file_exists($lastCleanup) || filemtime($lastCleanup) < strtotime('-1 day')) {
    cleanupOldData();
    file_put_contents($lastCleanup, date('Y-m-d H:i:s'));
}
?>









