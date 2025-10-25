# 🧪 Guia de Teste PIX - 67 Beauty Hub

## 🎯 **Como Testar o PIX sendo Angolano**

### **Problema:**
- PIX só aparece para clientes brasileiros (pt-BR)
- Você é angolano (pt genérico) → PIX não aparece
- Como testar se não consegue ver? 🤔

### **Solução: Modo de Teste**

#### **1. Ativar Modo de Teste:**
```javascript
// No console do navegador (F12)
enablePIXTestMode()
```

#### **2. Verificar Status:**
```javascript
// Ver funções disponíveis
testPIX()
```

#### **3. Desativar Modo de Teste:**
```javascript
// Voltar ao normal
disablePIXTestMode()
```

## 🔧 **Como Funciona o Teste:**

### **Detecção Automática:**
```javascript
// Sistema detecta:
const isAngolan = userLanguage.startsWith('pt') && 
                  !userLanguage.includes('BR') && 
                  !userLanguage.includes('PT');

const isTestMode = localStorage.getItem('pixTestMode') === 'true';

// Se angolano + modo teste = PIX aparece
if (isAngolan && isTestMode) {
    // Mostra PIX para teste
}
```

### **Comportamento:**
- **Angolano normal:** PIX oculto ✅
- **Angolano + teste:** PIX visível com "(Test Mode)" ✅
- **Brasileiro:** PIX visível normalmente ✅
- **Outros:** PIX oculto ✅

## 🧪 **Passos para Testar:**

### **1. Abrir Página de Checkout:**
- Vá para qualquer página de checkout
- Abra console (F12)

### **2. Ativar Teste:**
```javascript
enablePIXTestMode()
```

### **3. Recarregar Página:**
- F5 para recarregar
- PIX deve aparecer no dropdown

### **4. Testar PIX:**
- Selecionar "PIX (Test Mode)"
- Verificar se interface PIX aparece
- Testar geração de QR Code
- Testar Copia e Cola

### **5. Desativar Teste:**
```javascript
disablePIXTestMode()
```

## 📊 **Verificações Importantes:**

### **✅ O que verificar:**
1. **PIX aparece apenas em modo teste** (para angolanos)
2. **Interface PIX funciona** (QR Code + Copia e Cola)
3. **Valor correto** (baseado no resumo)
4. **Moeda correta** (BRL para brasileiros)
5. **PIX desaparece** quando desativar teste

### **🎯 Resultado Esperado:**
- **Angolano normal:** Só PayPal
- **Angolano + teste:** PayPal + PIX (Test Mode)
- **Brasileiro:** PayPal + PIX normal
- **Outros:** Só PayPal

## 🚀 **Comandos Rápidos:**

```javascript
// Ativar teste
enablePIXTestMode()

// Desativar teste  
disablePIXTestMode()

// Ver status
testPIX()

// Verificar localStorage
localStorage.getItem('pixTestMode')
```

## 💡 **Dicas:**

1. **Sempre desative** o teste após testar
2. **Verifique console** para logs de debug
3. **Teste em diferentes páginas** de checkout
4. **Confirme que PIX desaparece** quando desativado

---

**🎉 Agora você pode testar o PIX sendo angolano!** 🇦🇴🧪

