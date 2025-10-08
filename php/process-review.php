<?php
/**
 * Processamento de Reviews com Upload de Imagens
 * 67 Beauty Hub
 */

require_once 'validation.php';

// Configurações
$success = false;
$errors = [];
$data = [];

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Verificar se usuário está logado (simulação)
    $userData = $_POST['userData'] ?? null;
    if (!$userData) {
        $errors[] = 'Usuário não está logado';
    }
    
    // Obter dados do formulário
    $data = [
        'productId' => $_POST['productId'] ?? '',
        'productName' => $_POST['productName'] ?? '',
        'userId' => $_POST['userId'] ?? '',
        'userName' => $_POST['userName'] ?? '',
        'rating' => $_POST['rating'] ?? '',
        'title' => $_POST['title'] ?? '',
        'comment' => $_POST['comment'] ?? '',
        'reviewDate' => $_POST['reviewDate'] ?? date('Y-m-d H:i:s')
    ];
    
    // Validar dados
    $validator = new Validator($data);
    
    $validator->required('productId', 'ID do produto é obrigatório')
             ->required('userId', 'ID do usuário é obrigatório')
             ->required('rating', 'Avaliação é obrigatória')
             ->in('rating', ['1', '2', '3', '4', '5'], 'Avaliação deve ser entre 1 e 5 estrelas')
             ->required('title', 'Título é obrigatório')
             ->minLength('title', 3, 'Título deve ter pelo menos 3 caracteres')
             ->maxLength('title', 100, 'Título deve ter no máximo 100 caracteres')
             ->required('comment', 'Comentário é obrigatório')
             ->minLength('comment', 10, 'Comentário deve ter pelo menos 10 caracteres')
             ->maxLength('comment', 500, 'Comentário deve ter no máximo 500 caracteres');
    
    if ($validator->hasErrors()) {
        $errors = $validator->getErrors();
    } else {
        // Dados válidos, processar review
        $validatedData = $validator->getValidatedData();
        
        // Gerar ID único da review
        $reviewId = 'REVIEW_' . date('YmdHis') . '_' . rand(1000, 9999);
        
        // Processar upload de imagem se houver
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = handleImageUpload($_FILES['image'], $reviewId);
        }
        
        // Dados da review
        $reviewData = [
            'id' => $reviewId,
            'productId' => $validatedData['productId'],
            'productName' => $validatedData['productName'],
            'userId' => $validatedData['userId'],
            'userName' => $validatedData['userName'],
            'rating' => (int)$validatedData['rating'],
            'title' => $validatedData['title'],
            'comment' => $validatedData['comment'],
            'imagePath' => $imagePath,
            'created_at' => $validatedData['reviewDate'],
            'status' => 'approved',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        // Salvar review
        saveReview($reviewData);
        
        // Enviar notificação (opcional)
        sendReviewNotification($reviewData);
        
        $success = true;
        
        // Retornar resposta JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Avaliação enviada com sucesso!',
            'reviewId' => $reviewId
        ]);
        exit;
    }
}

/**
 * Processar upload de imagem
 */
function handleImageUpload($file, $reviewId) {
    $uploadDir = '../uploads/reviews/';
    
    // Criar diretório se não existir
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Validar tipo de arquivo
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Tipo de arquivo não permitido. Use JPG, PNG ou GIF.');
    }
    
    // Validar tamanho (máximo 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        throw new Exception('Arquivo muito grande. Máximo 5MB.');
    }
    
    // Gerar nome único
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = $reviewId . '.' . $extension;
    $filePath = $uploadDir . $fileName;
    
    // Mover arquivo
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return $fileName;
    } else {
        throw new Exception('Erro ao fazer upload da imagem.');
    }
}

/**
 * Salvar review
 */
function saveReview($reviewData) {
    $reviewsFile = 'data/reviews.json';
    
    // Criar diretório se não existir
    if (!file_exists('data')) {
        mkdir('data', 0777, true);
    }
    
    // Carregar reviews existentes
    $reviews = [];
    if (file_exists($reviewsFile)) {
        $reviews = json_decode(file_get_contents($reviewsFile), true) ?: [];
    }
    
    // Adicionar nova review
    $reviews[] = $reviewData;
    
    // Salvar reviews
    file_put_contents($reviewsFile, json_encode($reviews, JSON_PRETTY_PRINT));
}

/**
 * Enviar notificação de nova review
 */
function sendReviewNotification($reviewData) {
    $subject = "Nova Avaliação - 67 Beauty Hub";
    
    $message = "
    <html>
    <head>
        <title>Nova Avaliação</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #b8941f); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .review-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .stars { color: #ffc107; font-size: 1.2rem; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>⭐ Nova Avaliação Recebida!</h1>
                <p>Uma nova avaliação foi enviada para um produto</p>
            </div>
            
            <div class='content'>
                <div class='review-details'>
                    <h3>Detalhes da Avaliação</h3>
                    <p><strong>Produto:</strong> {$reviewData['productName']}</p>
                    <p><strong>Cliente:</strong> {$reviewData['userName']}</p>
                    <p><strong>Avaliação:</strong> <span class='stars'>" . str_repeat('★', $reviewData['rating']) . "</span> ({$reviewData['rating']}/5)</p>
                    <p><strong>Título:</strong> {$reviewData['title']}</p>
                    <p><strong>Comentário:</strong></p>
                    <p style='background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 3px solid #d4af37;'>
                        " . nl2br(htmlspecialchars($reviewData['comment'])) . "
                    </p>
                    <p><strong>Data:</strong> {$reviewData['created_at']}</p>
                    <p><strong>ID da Avaliação:</strong> {$reviewData['id']}</p>
                </div>
                
                <p>Esta avaliação foi aprovada automaticamente e já está visível para outros clientes.</p>
            </div>
            
            <div class='footer'>
                <p>Sistema de Avaliações - 67 Beauty Hub</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Para desenvolvimento, salvar em arquivo
    $emailFile = 'data/notifications/review_' . $reviewData['id'] . '.html';
    if (!file_exists('data/notifications')) {
        mkdir('data/notifications', 0777, true);
    }
    file_put_contents($emailFile, $message);
}

// Se não for POST ou há erros, retornar erro
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !empty($errors)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit;
}
?>









