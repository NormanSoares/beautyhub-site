<?php
/**
 * Sistema de Validação PHP para 67 Beauty Hub
 * Funções reutilizáveis para validação de formulários
 */

class Validator {
    private $errors = [];
    private $data = [];
    
    public function __construct($data = []) {
        $this->data = $data;
        $this->errors = [];
    }
    
    /**
     * Validar campo obrigatório
     */
    public function required($field, $message = null) {
        $value = $this->getValue($field);
        if (empty($value)) {
            $this->addError($field, $message ?? "O campo {$field} é obrigatório");
        }
        return $this;
    }
    
    /**
     * Validar email
     */
    public function email($field, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, $message ?? "Email inválido");
        }
        return $this;
    }
    
    /**
     * Validar telefone brasileiro
     */
    public function phone($field, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value)) {
            // Remove caracteres não numéricos
            $phone = preg_replace('/\D/', '', $value);
            // Valida se tem 10 ou 11 dígitos
            if (!preg_match('/^\d{10,11}$/', $phone)) {
                $this->addError($field, $message ?? "Telefone deve ter 10 ou 11 dígitos");
            }
        }
        return $this;
    }
    
    /**
     * Validar tamanho mínimo
     */
    public function minLength($field, $min, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value) && strlen($value) < $min) {
            $this->addError($field, $message ?? "Campo deve ter pelo menos {$min} caracteres");
        }
        return $this;
    }
    
    /**
     * Validar tamanho máximo
     */
    public function maxLength($field, $max, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value) && strlen($value) > $max) {
            $this->addError($field, $message ?? "Campo deve ter no máximo {$max} caracteres");
        }
        return $this;
    }
    
    /**
     * Validar CEP brasileiro
     */
    public function zipCode($field, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value)) {
            // Remove caracteres não numéricos
            $zip = preg_replace('/\D/', '', $value);
            // Valida formato do CEP
            if (!preg_match('/^\d{8}$/', $zip)) {
                $this->addError($field, $message ?? "CEP deve ter 8 dígitos");
            }
        }
        return $this;
    }
    
    /**
     * Validar se valor está em lista
     */
    public function in($field, $options, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value) && !in_array($value, $options)) {
            $this->addError($field, $message ?? "Valor inválido");
        }
        return $this;
    }
    
    /**
     * Validar número
     */
    public function numeric($field, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value) && !is_numeric($value)) {
            $this->addError($field, $message ?? "Deve ser um número");
        }
        return $this;
    }
    
    /**
     * Validar quantidade (para produtos)
     */
    public function quantity($field, $min = 1, $max = 10, $message = null) {
        $value = $this->getValue($field);
        if (!empty($value)) {
            $quantity = (int)$value;
            if ($quantity < $min || $quantity > $max) {
                $this->addError($field, $message ?? "Quantidade deve estar entre {$min} e {$max}");
            }
        }
        return $this;
    }
    
    /**
     * Sanitizar dados
     */
    public function sanitize($field, $type = 'string') {
        $value = $this->getValue($field);
        switch ($type) {
            case 'email':
                return filter_var($value, FILTER_SANITIZE_EMAIL);
            case 'string':
                return filter_var($value, FILTER_SANITIZE_STRING);
            case 'int':
                return filter_var($value, FILTER_SANITIZE_NUMBER_INT);
            case 'float':
                return filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            default:
                return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
    }
    
    /**
     * Obter valor do campo
     */
    private function getValue($field) {
        return $this->data[$field] ?? '';
    }
    
    /**
     * Adicionar erro
     */
    private function addError($field, $message) {
        $this->errors[$field] = $message;
    }
    
    /**
     * Verificar se há erros
     */
    public function hasErrors() {
        return !empty($this->errors);
    }
    
    /**
     * Obter todos os erros
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Obter erro específico
     */
    public function getError($field) {
        return $this->errors[$field] ?? null;
    }
    
    /**
     * Obter dados validados
     */
    public function getValidatedData() {
        $validated = [];
        foreach ($this->data as $field => $value) {
            $validated[$field] = htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
        }
        return $validated;
    }
    
    /**
     * Validar dados de checkout
     */
    public static function validateCheckout($data) {
        $validator = new self($data);
        
        // Dados pessoais
        $validator->required('firstName', 'Nome é obrigatório')
                 ->minLength('firstName', 2, 'Nome deve ter pelo menos 2 caracteres')
                 ->maxLength('firstName', 50, 'Nome deve ter no máximo 50 caracteres');
                 
        $validator->required('lastName', 'Sobrenome é obrigatório')
                 ->minLength('lastName', 2, 'Sobrenome deve ter pelo menos 2 caracteres')
                 ->maxLength('lastName', 50, 'Sobrenome deve ter no máximo 50 caracteres');
                 
        $validator->required('email', 'Email é obrigatório')
                 ->email('email', 'Email inválido');
                 
        $validator->required('phone', 'Telefone é obrigatório')
                 ->phone('phone', 'Telefone inválido');
        
        // Endereço
        $validator->required('address', 'Endereço é obrigatório')
                 ->minLength('address', 10, 'Endereço deve ter pelo menos 10 caracteres');
                 
        $validator->required('city', 'Cidade é obrigatória')
                 ->minLength('city', 2, 'Nome da cidade inválido');
                 
        $validator->required('state', 'Estado é obrigatório');
                 
        $validator->required('zipCode', 'CEP é obrigatório')
                 ->zipCode('zipCode', 'CEP inválido');
        
        // Produto
        $validator->required('quantity', 'Quantidade é obrigatória')
                 ->quantity('quantity', 1, 10, 'Quantidade deve estar entre 1 e 10');
                 
        $validator->required('paymentMethod', 'Método de pagamento é obrigatório')
                 ->in('paymentMethod', ['paypal', 'card'], 'Método de pagamento inválido');
        
        return $validator;
    }
    
    /**
     * Validar dados de contato
     */
    public static function validateContact($data) {
        $validator = new self($data);
        
        $validator->required('name', 'Nome é obrigatório')
                 ->minLength('name', 2, 'Nome deve ter pelo menos 2 caracteres')
                 ->maxLength('name', 100, 'Nome deve ter no máximo 100 caracteres');
                 
        $validator->required('email', 'Email é obrigatório')
                 ->email('email', 'Email inválido');
                 
        $validator->required('subject', 'Assunto é obrigatório')
                 ->minLength('subject', 5, 'Assunto deve ter pelo menos 5 caracteres')
                 ->maxLength('subject', 200, 'Assunto deve ter no máximo 200 caracteres');
                 
        $validator->required('message', 'Mensagem é obrigatória')
                 ->minLength('message', 10, 'Mensagem deve ter pelo menos 10 caracteres')
                 ->maxLength('message', 1000, 'Mensagem deve ter no máximo 1000 caracteres');
        
        return $validator;
    }
}

/**
 * Função auxiliar para exibir erros
 */
function displayErrors($errors) {
    if (!empty($errors)) {
        echo '<div class="alert alert-danger">';
        echo '<h4>Por favor, corrija os seguintes erros:</h4>';
        echo '<ul>';
        foreach ($errors as $error) {
            echo '<li>' . htmlspecialchars($error) . '</li>';
        }
        echo '</ul>';
        echo '</div>';
    }
}

/**
 * Função auxiliar para exibir sucesso
 */
function displaySuccess($message) {
    echo '<div class="alert alert-success">';
    echo '<i class="fas fa-check-circle"></i> ' . htmlspecialchars($message);
    echo '</div>';
}

/**
 * Estados brasileiros
 */
function getBrazilianStates() {
    return [
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
    ];
}
?>









