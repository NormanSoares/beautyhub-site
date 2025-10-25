// Sistema de Modal Simples para 67 Beauty Hub
// Apenas login com nome e email

// Sistema de Login Simples
function createSimpleLoginModal() {
    const modalHTML = `
        <div class="modal-overlay" id="simpleLoginModal">
            <div class="modal-container">
                <div class="modal-header">
                    <button class="modal-close" onclick="closeModal('simpleLoginModal')">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2 class="modal-title" data-translate-key="login_title">Login</h2>
                    <p class="modal-subtitle" data-translate-key="login_subtitle">Enter your data to access</p>
                </div>
                <div class="modal-body">
                    <form id="simpleLoginForm" onsubmit="handleSimpleLogin(event)">
                        <div class="form-group">
                            <label for="simpleName" data-translate-key="name_label">Name</label>
                            <input type="text" id="simpleName" name="name" required placeholder="Your name">
                        </div>
                        <div class="form-group">
                            <label for="simpleEmail" data-translate-key="email_label">Email</label>
                            <input type="email" id="simpleEmail" name="email" required placeholder="your@email.com">
                        </div>
                        <button type="submit" class="btn-modal btn-primary-modal">
                            <i class="fas fa-sign-in-alt"></i>
                            <span data-translate-key="login_btn">Login</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
        document.getElementById('simpleLoginModal').classList.add('show');
    }, 10);
}

function handleSimpleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    
    if (name && email) {
        const userData = {
            name: name,
            email: email,
            provider: 'simple'
        };
        
        localStorage.setItem('userLogin', JSON.stringify(userData));
        showUserMenu(userData.name);
        closeModal('simpleLoginModal');
        showNotification('Login successful!', 'success');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Função de abertura de modal (para compatibilidade)
function openSimpleLoginModal() {
    createSimpleLoginModal();
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});