<?php
/**
 * Página de Sucesso do Contato - 67 Beauty Hub
 */

require_once 'validation.php';

$messageId = $_GET['messageId'] ?? '';
$messageData = null;

// Carregar dados da mensagem se ID foi fornecido
if (!empty($messageId)) {
    $messagesFile = 'data/messages.json';
    if (file_exists($messagesFile)) {
        $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        foreach ($messages as $message) {
            if ($message['id'] === $messageId) {
                $messageData = $message;
                break;
            }
        }
    }
}

// Se não encontrou a mensagem, redirecionar
if (empty($messageData)) {
    header("Location: ../index.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensagem Enviada - 67 Beauty Hub</title>
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
            max-width: 700px;
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
        
        .message-details {
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
        
        .message-content {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #28a745;
        }
        
        .message-content h4 {
            color: #28a745;
            margin-bottom: 15px;
        }
        
        .message-text {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            line-height: 1.6;
            color: #333;
        }
        
        .response-info {
            background: #fff3cd;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #ffc107;
        }
        
        .response-info h4 {
            color: #856404;
            margin-bottom: 15px;
        }
        
        .response-info p {
            color: #856404;
            margin: 5px 0;
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
                <i class="fas fa-envelope-open"></i>
            </div>
            <h1 class="success-title">Mensagem Enviada!</h1>
            <p class="success-subtitle">Obrigado por entrar em contato com a 67 Beauty Hub</p>
            <p><strong>ID da Mensagem:</strong> <?= htmlspecialchars($messageData['id']) ?></p>
        </div>
        
        <!-- Detalhes da Mensagem -->
        <div class="message-details">
            <h2 class="section-title">Detalhes da Mensagem</h2>
            
            <!-- Informações do Cliente -->
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Nome</div>
                    <div class="detail-value"><?= htmlspecialchars($messageData['name']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value"><?= htmlspecialchars($messageData['email']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Assunto</div>
                    <div class="detail-value"><?= htmlspecialchars($messageData['subject']) ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Data de Envio</div>
                    <div class="detail-value"><?= date('d/m/Y H:i', strtotime($messageData['created_at'])) ?></div>
                </div>
            </div>
            
            <!-- Conteúdo da Mensagem -->
            <div class="message-content">
                <h4><i class="fas fa-comment"></i> Sua Mensagem</h4>
                <div class="message-text">
                    <?= nl2br(htmlspecialchars($messageData['message'])) ?>
                </div>
            </div>
            
            <!-- Informações de Resposta -->
            <div class="response-info">
                <h4><i class="fas fa-clock"></i> Próximos Passos</h4>
                <p><strong>✓ Mensagem Recebida:</strong> Sua mensagem foi enviada com sucesso!</p>
                <p><strong>📧 Email de Confirmação:</strong> Enviamos um email de confirmação para <?= htmlspecialchars($messageData['email']) ?></p>
                <p><strong>⏰ Tempo de Resposta:</strong> Nossa equipe responderá em até 24 horas</p>
                <p><strong>📞 Urgências:</strong> Para questões urgentes, entre em contato via telefone</p>
            </div>
        </div>
        
        <!-- Botões de Ação -->
        <div class="action-buttons">
            <a href="../index.html" class="btn">
                <i class="fas fa-home"></i> Voltar ao Início
            </a>
            <a href="../index.html#contact" class="btn btn-secondary">
                <i class="fas fa-envelope"></i> Enviar Outra Mensagem
            </a>
            <a href="../beauty-store.html" class="btn btn-secondary">
                <i class="fas fa-palette"></i> Ver Produtos de Beleza
            </a>
            <a href="../comfort-store.html" class="btn btn-secondary">
                <i class="fas fa-home"></i> Ver Produtos de Conforto
            </a>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><i class="fas fa-heart"></i> Obrigado por confiar na 67 Beauty Hub!</p>
            <p>Ficamos felizes em ajudar você. Em breve entraremos em contato!</p>
        </div>
    </div>
    
    <script>
        // Salvar mensagem no localStorage para referência
        const messageData = <?= json_encode($messageData) ?>;
        localStorage.setItem('lastMessage', JSON.stringify(messageData));
        
        // Analytics (simulação)
        console.log('Mensagem enviada:', messageData);
        
        // Auto-scroll para o topo
        window.scrollTo(0, 0);
        
        // Mostrar notificação de sucesso
        if (typeof(Notification) !== "undefined") {
            if (Notification.permission === "granted") {
                new Notification("Mensagem Enviada!", {
                    body: "Sua mensagem foi enviada com sucesso!",
                    icon: "../Imagens/Logotipo.png"
                });
            }
        }
    </script>
</body>
</html>









