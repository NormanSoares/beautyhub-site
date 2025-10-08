/**
 * Sistema de Reviews com Upload de Imagens
 * 67 Beauty Hub
 */

class ReviewSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.createReviewModal();
        this.loadExistingReviews();
    }

    // Verificar se usuário está logado
    getCurrentUser() {
        const userData = localStorage.getItem('userLogin');
        return userData ? JSON.parse(userData) : null;
    }

    // Verificar se usuário pode fazer review
    canUserReview() {
        return this.currentUser !== null;
    }

    // Mostrar modal de review
    showReviewModal(productId, productName) {
        if (!this.canUserReview()) {
            this.showLoginPrompt();
            return;
        }

        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('reviewProductName').textContent = productName;
            document.getElementById('reviewProductId').value = productId;
        }
    }

    // Fechar modal de review
    closeReviewModal() {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.style.display = 'none';
            this.resetReviewForm();
        }
    }

    // Criar modal de review
    createReviewModal() {
        if (document.getElementById('reviewModal')) return;

        const modalHTML = `
            <div id="reviewModal" class="review-modal" style="display: none;">
                <div class="review-modal-content">
                    <div class="review-modal-header">
                        <h3><i class="fas fa-star"></i> Avaliar Produto</h3>
                        <button class="review-close-btn" onclick="reviewSystem.closeReviewModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="review-modal-body">
                        <p class="review-product-info">Avaliando: <span id="reviewProductName"></span></p>
                        <input type="hidden" id="reviewProductId">
                        
                        <form id="reviewForm" enctype="multipart/form-data">
                            <div class="review-form-group">
                                <label>Avaliação (1-5 estrelas):</label>
                                <div class="star-rating">
                                    <input type="radio" name="rating" value="5" id="star5">
                                    <label for="star5" class="star"><i class="fas fa-star"></i></label>
                                    <input type="radio" name="rating" value="4" id="star4">
                                    <label for="star4" class="star"><i class="fas fa-star"></i></label>
                                    <input type="radio" name="rating" value="3" id="star3">
                                    <label for="star3" class="star"><i class="fas fa-star"></i></label>
                                    <input type="radio" name="rating" value="2" id="star2">
                                    <label for="star2" class="star"><i class="fas fa-star"></i></label>
                                    <input type="radio" name="rating" value="1" id="star1">
                                    <label for="star1" class="star"><i class="fas fa-star"></i></label>
                                </div>
                            </div>
                            
                            <div class="review-form-group">
                                <label for="reviewTitle">Título da Avaliação:</label>
                                <input type="text" id="reviewTitle" name="title" placeholder="Ex: Produto excelente!" required>
                            </div>
                            
                            <div class="review-form-group">
                                <label for="reviewComment">Comentário:</label>
                                <textarea id="reviewComment" name="comment" rows="4" placeholder="Conte sua experiência com o produto..." required></textarea>
                            </div>
                            
                            <div class="review-form-group">
                                <label for="reviewImage">Foto do Produto (opcional):</label>
                                <div class="image-upload-container">
                                    <input type="file" id="reviewImage" name="image" accept="image/*" onchange="reviewSystem.previewImage(this)">
                                    <label for="reviewImage" class="image-upload-label">
                                        <i class="fas fa-camera"></i>
                                        <span>Escolher Foto</span>
                                    </label>
                                    <div id="imagePreview" class="image-preview"></div>
                                </div>
                            </div>
                            
                            <div class="review-form-actions">
                                <button type="button" class="btn-cancel" onclick="reviewSystem.closeReviewModal()">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-submit">
                                    <i class="fas fa-paper-plane"></i> Enviar Avaliação
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Adicionar CSS
        this.addReviewStyles();

        // Adicionar event listeners
        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview(e);
        });
    }

    // Adicionar estilos CSS
    addReviewStyles() {
        if (document.getElementById('reviewStyles')) return;

        const styles = `
            <style id="reviewStyles">
                .review-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }

                .review-modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease;
                }

                .review-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    border-bottom: 1px solid #e9ecef;
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    color: white;
                    border-radius: 15px 15px 0 0;
                }

                .review-modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .review-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    transition: background 0.3s ease;
                }

                .review-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .review-modal-body {
                    padding: 30px;
                }

                .review-product-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    font-weight: 500;
                    color: #333;
                }

                .review-form-group {
                    margin-bottom: 25px;
                }

                .review-form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }

                .star-rating {
                    display: flex;
                    flex-direction: row-reverse;
                    gap: 5px;
                    margin-bottom: 10px;
                }

                .star-rating input[type="radio"] {
                    display: none;
                }

                .star-rating label.star {
                    font-size: 2rem;
                    color: #ddd;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }

                .star-rating label.star:hover,
                .star-rating label.star:hover ~ label.star,
                .star-rating input[type="radio"]:checked ~ label.star {
                    color: #ffc107;
                }

                .review-form-group input,
                .review-form-group textarea {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s ease;
                    box-sizing: border-box;
                }

                .review-form-group input:focus,
                .review-form-group textarea:focus {
                    outline: none;
                    border-color: #d4af37;
                }

                .image-upload-container {
                    position: relative;
                }

                .image-upload-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }

                .image-upload-label:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
                }

                #reviewImage {
                    display: none;
                }

                .image-preview {
                    margin-top: 15px;
                    text-align: center;
                }

                .image-preview img {
                    max-width: 200px;
                    max-height: 200px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .review-form-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                    margin-top: 30px;
                }

                .btn-cancel,
                .btn-submit {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-cancel {
                    background: #6c757d;
                    color: white;
                }

                .btn-cancel:hover {
                    background: #5a6268;
                    transform: translateY(-2px);
                }

                .btn-submit {
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    color: white;
                }

                .btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
                }

                .review-section {
                    margin: 40px 0;
                    padding: 30px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }

                .review-section h3 {
                    color: #333;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .review-card {
                    border: 1px solid #e9ecef;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    background: #f8f9fa;
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .review-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .review-user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }

                .review-user-info h4 {
                    margin: 0;
                    color: #333;
                    font-size: 1rem;
                }

                .review-user-info p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .review-stars {
                    color: #ffc107;
                    font-size: 1.2rem;
                }

                .review-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 10px;
                }

                .review-comment {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .review-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    margin-bottom: 15px;
                }

                .review-date {
                    color: #999;
                    font-size: 0.9rem;
                }

                .write-review-btn {
                    background: linear-gradient(135deg, #d4af37, #b8941f);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .write-review-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
                }

                .login-prompt {
                    text-align: center;
                    padding: 40px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    margin: 20px 0;
                }

                .login-prompt h4 {
                    color: #333;
                    margin-bottom: 15px;
                }

                .login-prompt p {
                    color: #666;
                    margin-bottom: 20px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (max-width: 768px) {
                    .review-modal-content {
                        width: 95%;
                        margin: 20px;
                    }

                    .review-modal-body {
                        padding: 20px;
                    }

                    .review-form-actions {
                        flex-direction: column;
                    }

                    .review-header {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Preview da imagem
    previewImage(input) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Resetar formulário
    resetReviewForm() {
        document.getElementById('reviewForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.querySelectorAll('.star-rating input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
    }

    // Mostrar prompt de login
    showLoginPrompt() {
        alert('Você precisa fazer login para avaliar produtos. Clique em "Entrar" no menu superior.');
    }

    // Submeter review
    async submitReview(event) {
        const formData = new FormData(event.target);
        const productId = document.getElementById('reviewProductId').value;
        const productName = document.getElementById('reviewProductName').textContent;

        // Adicionar dados do usuário
        formData.append('userId', this.currentUser.email);
        formData.append('userName', this.currentUser.name);
        formData.append('productId', productId);
        formData.append('productName', productName);
        formData.append('reviewDate', new Date().toISOString());

        try {
            // Simular envio (em produção, enviar para servidor)
            const reviewData = {
                id: 'REVIEW_' + Date.now(),
                productId: productId,
                productName: productName,
                userId: this.currentUser.email,
                userName: this.currentUser.name,
                rating: formData.get('rating'),
                title: formData.get('title'),
                comment: formData.get('comment'),
                image: formData.get('image') ? URL.createObjectURL(formData.get('image')) : null,
                date: new Date().toISOString()
            };

            // Salvar no localStorage (simulação)
            this.saveReview(reviewData);
            
            // Fechar modal
            this.closeReviewModal();
            
            // Mostrar sucesso
            this.showSuccessMessage();
            
            // Recarregar reviews
            this.loadExistingReviews();

        } catch (error) {
            console.error('Erro ao enviar review:', error);
            alert('Erro ao enviar avaliação. Tente novamente.');
        }
    }

    // Salvar review
    saveReview(reviewData) {
        let reviews = JSON.parse(localStorage.getItem('productReviews')) || [];
        reviews.push(reviewData);
        localStorage.setItem('productReviews', JSON.stringify(reviews));
    }

    // Mostrar mensagem de sucesso
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10001;
                animation: slideInRight 0.3s ease;
            ">
                <i class="fas fa-check-circle"></i> Avaliação enviada com sucesso!
            </div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Carregar reviews existentes
    loadExistingReviews() {
        const reviews = JSON.parse(localStorage.getItem('productReviews')) || [];
        const currentProductId = this.getCurrentProductId();
        
        if (currentProductId) {
            this.displayReviews(reviews.filter(review => review.productId === currentProductId));
        }
    }

    // Obter ID do produto atual
    getCurrentProductId() {
        // Tentar obter do URL ou de um elemento na página
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('productId') || this.extractProductIdFromPage();
    }

    // Extrair ID do produto da página
    extractProductIdFromPage() {
        // Implementar lógica para extrair ID do produto da página atual
        const productTitle = document.querySelector('h1, h2, .product-title');
        return productTitle ? productTitle.textContent.trim() : 'unknown';
    }

    // Exibir reviews
    displayReviews(reviews) {
        const container = document.getElementById('reviewsContainer');
        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comments"></i>
                    <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                </div>
            `;
            return;
        }

        const reviewsHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-user">
                        <div class="review-user-avatar">
                            ${review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div class="review-user-info">
                            <h4>${review.userName}</h4>
                            <p>Comprador verificado</p>
                        </div>
                    </div>
                    <div class="review-stars">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                
                <div class="review-title">${review.title}</div>
                <div class="review-comment">${review.comment}</div>
                
                ${review.image ? `<img src="${review.image}" alt="Review image" class="review-image">` : ''}
                
                <div class="review-date">
                    ${new Date(review.date).toLocaleDateString('pt-BR')}
                </div>
            </div>
        `).join('');

        container.innerHTML = reviewsHTML;
    }

    // Criar seção de reviews
    createReviewSection(productId, productName) {
        const reviewSectionHTML = `
            <div class="review-section">
                <h3>
                    <i class="fas fa-star"></i>
                    Avaliações dos Clientes
                </h3>
                
                <div class="review-actions">
                    <button class="write-review-btn" onclick="reviewSystem.showReviewModal('${productId}', '${productName}')">
                        <i class="fas fa-edit"></i>
                        Escrever Avaliação
                    </button>
                </div>
                
                <div id="reviewsContainer">
                    <!-- Reviews serão carregadas aqui -->
                </div>
            </div>
        `;

        return reviewSectionHTML;
    }
}

// Inicializar sistema de reviews
let reviewSystem;
document.addEventListener('DOMContentLoaded', function() {
    reviewSystem = new ReviewSystem();
});

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('reviewModal');
    if (modal && e.target === modal) {
        reviewSystem.closeReviewModal();
    }
});









