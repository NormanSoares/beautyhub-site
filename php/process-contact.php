<?php
/**
 * Processamento de Contato - 67 Beauty Hub
 * Validação e processamento de mensagens de contato
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
        'name' => $_POST['name'] ?? '',
        'email' => $_POST['email'] ?? '',
        'subject' => $_POST['subject'] ?? '',
        'message' => $_POST['message'] ?? ''
    ];
    
    // Validar dados
    $validator = Validator::validateContact($data);
    
    if ($validator->hasErrors()) {
        $errors = $validator->getErrors();
    } else {
        // Dados válidos, processar mensagem
        $validatedData = $validator->getValidatedData();
        
        // Gerar ID único da mensagem
        $messageId = 'MSG_' . date('YmdHis') . '_' . rand(1000, 9999);
        
        // Dados da mensagem
        $messageData = [
            'id' => $messageId,
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'subject' => $validatedData['subject'],
            'message' => $validatedData['message'],
            'created_at' => date('Y-m-d H:i:s'),
            'status' => 'new',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        // Salvar mensagem (simulação - em produção seria no banco de dados)
        $messagesFile = 'data/messages.json';
        if (!file_exists('data')) {
            mkdir('data', 0777, true);
        }
        
        // Carregar mensagens existentes
        $messages = [];
        if (file_exists($messagesFile)) {
            $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        }
        
        // Adicionar nova mensagem
        $messages[] = $messageData;
        
        // Salvar mensagens
        file_put_contents($messagesFile, json_encode($messages, JSON_PRETTY_PRINT));
        
        // Enviar email de confirmação (simulação)
        sendContactConfirmation($messageData);
        
        // Enviar email para administrador (simulação)
        sendAdminNotification($messageData);
        
        $success = true;
        
        // Redirecionar para página de sucesso
        header("Location: contact-success.php?messageId=" . $messageId);
        exit;
    }
}

/**
 * Enviar email de confirmação para o cliente
 */
function sendContactConfirmation($messageData) {
    $to = $messageData['email'];
    $subject = "Confirmação de Mensagem - 67 Beauty Hub";
    
    $message = "
    <html>
    <head>
        <title>Confirmação de Mensagem</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #b8941f); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .message-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>📧 Mensagem Recebida!</h1>
                <p>Obrigado por entrar em contato com a 67 Beauty Hub</p>
            </div>
            
            <div class='content'>
                <p>Olá <strong>{$messageData['name']}</strong>,</p>
                
                <p>Recebemos sua mensagem e entraremos em contato em breve!</p>
                
                <div class='message-details'>
                    <h3>Detalhes da sua mensagem:</h3>
                    <p><strong>ID:</strong> {$messageData['id']}</p>
                    <p><strong>Assunto:</strong> {$messageData['subject']}</p>
                    <p><strong>Data:</strong> {$messageData['created_at']}</p>
                    <p><strong>Sua mensagem:</strong></p>
                    <p style='background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 3px solid #d4af37;'>
                        " . nl2br(htmlspecialchars($messageData['message'])) . "
                    </p>
                </div>
                
                <p>Nossa equipe analisará sua mensagem e responderá o mais rápido possível.</p>
                
                <p>Atenciosamente,<br>
                <strong>Equipe 67 Beauty Hub</strong></p>
            </div>
            
            <div class='footer'>
                <p>67 Beauty Hub - Beleza e Conforto</p>
                <p>Este é um email automático, por favor não responda.</p>
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
    $emailFile = 'data/emails/contact_' . $messageData['id'] . '.html';
    if (!file_exists('data/emails')) {
        mkdir('data/emails', 0777, true);
    }
    file_put_contents($emailFile, $message);
}

/**
 * Enviar notificação para administrador
 */
function sendAdminNotification($messageData) {
    $subject = "Nova Mensagem de Contato - 67 Beauty Hub";
    
    $message = "
    <html>
    <head>
        <title>Nova Mensagem de Contato</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .message-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🔔 Nova Mensagem de Contato</h1>
                <p>Você recebeu uma nova mensagem no site</p>
            </div>
            
            <div class='content'>
                <div class='message-details'>
                    <h3>Informações do Cliente:</h3>
                    <p><strong>Nome:</strong> {$messageData['name']}</p>
                    <p><strong>Email:</strong> {$messageData['email']}</p>
                    <p><strong>IP:</strong> {$messageData['ip']}</p>
                    <p><strong>Data:</strong> {$messageData['created_at']}</p>
                    <p><strong>ID da Mensagem:</strong> {$messageData['id']}</p>
                </div>
                
                <div class='message-details'>
                    <h3>Conteúdo da Mensagem:</h3>
                    <p><strong>Assunto:</strong> {$messageData['subject']}</p>
                    <p><strong>Mensagem:</strong></p>
                    <p style='background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 3px solid #e74c3c;'>
                        " . nl2br(htmlspecialchars($messageData['message'])) . "
                    </p>
                </div>
                
                <p><strong>Ação Necessária:</strong> Responder ao cliente o mais rápido possível.</p>
            </div>
            
            <div class='footer'>
                <p>Sistema de Notificações - 67 Beauty Hub</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Para desenvolvimento, salvar em arquivo
    $emailFile = 'data/emails/admin_notification_' . $messageData['id'] . '.html';
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
    <title>Processando Mensagem - 67 Beauty Hub</title>
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
                <span>Enviando sua mensagem...</span>
            </div>
            <p>Por favor, aguarde enquanto processamos sua mensagem.</p>
        <?php endif; ?>
    </div>
    
    <script>
        // Se há erros, não fazer redirect
        <?php if (empty($errors)): ?>
        // Simular processamento e redirect
        setTimeout(function() {
            window.location.href = 'contact-success.php?messageId=<?= $messageId ?? '' ?>';
        }, 2000);
        <?php endif; ?>
    </script>
</body>
</html>









