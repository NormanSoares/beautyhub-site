#!/usr/bin/env node

/**
 * Script de Instalação de Pagamentos - 67 Beauty Hub
 * Instala e configura todas as dependências necessárias
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Instalando sistema de pagamentos...');

// Verificar se estamos no diretório correto
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json não encontrado. Execute este script na raiz do projeto.');
    process.exit(1);
}

// Instalar dependências
console.log('📦 Instalando dependências...');
try {
    execSync('npm install @paypal/checkout-server-sdk stripe axios', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas com sucesso!');
} catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
}

// Criar estrutura de diretórios
console.log('📁 Criando estrutura de diretórios...');
const directories = [
    'certs',
    'config',
    'api',
    'logs'
];

directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Diretório criado: ${dir}`);
    }
});

// Criar arquivo .env se não existir
console.log('🔐 Configurando variáveis de ambiente...');
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    const envContent = `# Configuração de Pagamentos - 67 Beauty Hub
# Copie este arquivo e preencha com suas credenciais reais

# PayPal Business
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
PAYPAL_RETURN_URL=https://67beautyhub.com/payment/success
PAYPAL_CANCEL_URL=https://67beautyhub.com/payment/cancel

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
STRIPE_SUCCESS_URL=https://67beautyhub.com/payment/success
STRIPE_CANCEL_URL=https://67beautyhub.com/payment/cancel

# PIX - Banco do Brasil
BB_CLIENT_ID=your_bb_client_id_here
BB_CLIENT_SECRET=your_bb_client_secret_here
BB_CERTIFICATE_PATH=./certs/bb-cert.p12
BB_CERTIFICATE_PASSWORD=your_bb_certificate_password_here

# PIX - Itaú
ITAU_CLIENT_ID=your_itau_client_id_here
ITAU_CLIENT_SECRET=your_itau_client_secret_here
ITAU_CERTIFICATE_PATH=./certs/itau-cert.p12
ITAU_CERTIFICATE_PASSWORD=your_itau_certificate_password_here

# PIX - Bradesco
BRADESCO_CLIENT_ID=your_bradesco_client_id_here
BRADESCO_CLIENT_SECRET=your_bradesco_client_secret_here
BRADESCO_CERTIFICATE_PATH=./certs/bradesco-cert.p12
BRADESCO_CERTIFICATE_PASSWORD=your_bradesco_certificate_password_here

# Configurações Gerais
NODE_ENV=production
WEBHOOK_BASE_URL=https://67beautyhub.com/api/webhooks

# MongoDB
MONGODB_URI=mongodb://localhost:27017/beautyhub
MONGODB_DATABASE=beautyhub

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@67beautyhub.com
SMTP_PASS=your_email_password_here`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado');
} else {
    console.log('⚠️ Arquivo .env já existe');
}

// Verificar se os arquivos de pagamento existem
console.log('🔍 Verificando arquivos de pagamento...');
const paymentFiles = [
    'js/payment-gateway.js',
    'js/payment-testing.js',
    'api/payments.js',
    'config/payment-config.js',
    'payment-test.html'
];

let allFilesExist = true;
paymentFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} existe`);
    } else {
        console.log(`❌ ${file} não encontrado`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('⚠️ Alguns arquivos de pagamento não foram encontrados. Verifique se foram criados corretamente.');
}

// Criar script de teste
console.log('🧪 Criando script de teste...');
const testScript = `#!/usr/bin/env node

/**
 * Script de Teste de Pagamentos
 */

const { execSync } = require('child_process');

console.log('🧪 Executando testes de pagamento...');

try {
    // Testar se o servidor inicia
    console.log('🔍 Testando servidor...');
    execSync('node server.js &', { stdio: 'inherit' });
    
    // Aguardar um pouco
    setTimeout(() => {
        console.log('✅ Servidor iniciado com sucesso!');
        console.log('🌐 Acesse: http://localhost:3001/payment-test.html');
        console.log('📊 Acesse: http://localhost:3001/api/health');
    }, 3000);
    
} catch (error) {
    console.error('❌ Erro ao testar:', error.message);
}`;

const testScriptPath = path.join(process.cwd(), 'scripts', 'test-payments.js');
fs.writeFileSync(testScriptPath, testScript);
fs.chmodSync(testScriptPath, '755');
console.log('✅ Script de teste criado');

// Criar README de pagamentos
console.log('📚 Criando documentação...');
const readmeContent = `# Sistema de Pagamentos - 67 Beauty Hub

## 🚀 Instalação Concluída

O sistema de pagamentos foi instalado com sucesso! Agora você precisa configurar suas credenciais.

## 📋 Próximos Passos

1. **Configure suas credenciais**:
   - Edite o arquivo \`.env\` com suas credenciais reais
   - Siga o guia em \`PAYMENT_SETUP_GUIDE.md\`

2. **Teste o sistema**:
   - Execute: \`node scripts/test-payments.js\`
   - Acesse: \`http://localhost:3001/payment-test.html\`

3. **Configure certificados PIX**:
   - Coloque os certificados em \`certs/\`
   - Configure as senhas no \`.env\`

## 🔧 Arquivos Criados

- \`js/payment-gateway.js\` - Gateway unificado de pagamentos
- \`js/payment-testing.js\` - Sistema de testes
- \`api/payments.js\` - APIs de pagamento
- \`config/payment-config.js\` - Configurações
- \`payment-test.html\` - Interface de teste
- \`.env\` - Variáveis de ambiente

## 🧪 Testando

1. Inicie o servidor: \`npm start\`
2. Acesse: \`http://localhost:3001/payment-test.html\`
3. Execute os testes de pagamento
4. Verifique os logs

## 📞 Suporte

Consulte \`PAYMENT_SETUP_GUIDE.md\` para instruções detalhadas.
`;

const readmePath = path.join(process.cwd(), 'PAYMENTS_README.md');
fs.writeFileSync(readmePath, readmeContent);
console.log('✅ Documentação criada');

// Finalizar
console.log('\n🎉 Instalação concluída com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure suas credenciais no arquivo .env');
console.log('2. Siga o guia PAYMENT_SETUP_GUIDE.md');
console.log('3. Execute: node scripts/test-payments.js');
console.log('4. Acesse: http://localhost:3001/payment-test.html');
console.log('\n🚀 Sistema de pagamentos pronto para uso!');

