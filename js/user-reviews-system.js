// Sistema de Reviews Dinâmicas para Usuários Logados
// Arquivo reutilizável para todas as páginas de checkout

class UserReviewsSystem {
    constructor() {
        this.userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        this.currentUser = null;
        this.productName = this.getProductNameFromURL();
    }

    // Obter nome do produto baseado na URL
    getProductNameFromURL() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        const productMap = {
            'checkout-alligator-clips.html': 'Alligator Hair Clips',
            'checkout-phoera.html': '2 Pack PHOERA Foundation',
            'checkout-heat-resistant-mat.html': 'Heat-Resistant Mat',
            'checkout-golden-sakura.html': 'Golden Sakura Skin Care',
            'checkout-wrinkle-reducer.html': 'Vara de Skincare - Wrinkle Reducer',
            'checkout-sofa-cover.html': 'Detachable Sofa Cover',
            'checkout-cat-litter-box.html': 'Cat Litter Box Automatic',
            'checkout-steam-dryer.html': 'Household Quick Dry',
            'checkout-human-dog-bed.html': 'Human Dog Bed',
            'checkout-snooze-bundle.html': 'Snooze Bundle'
        };
        
        return productMap[filename] || 'Produto';
    }

    // Verificar se usuário está logado
    checkUserLogin() {
        const userData = localStorage.getItem('userLogin');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showReviewForm();
            this.loadUserReviews();
            return true;
        }
        return false;
    }

    // Mostrar formulário de review para usuários logados
    showReviewForm() {
        const reviewForm = document.getElementById('userReviewForm');
        if (reviewForm) {
            reviewForm.style.display = 'block';
        }
    }

    // Carregar reviews de usuários logados
    loadUserReviews() {
        const reviewsContainer = document.querySelector('.reviews-container');
        if (!reviewsContainer || this.userReviews.length === 0) return;

        // Filtrar reviews apenas para este produto
        const productReviews = this.userReviews.filter(review => 
            review.product === this.productName
        );

        if (productReviews.length === 0) return;

        // Adicionar reviews de usuários no início do container
        productReviews.forEach((review, index) => {
            const reviewElement = this.createUserReviewElement(review, index);
            reviewsContainer.insertBefore(reviewElement, reviewsContainer.firstChild);
        });

        this.updateReviewStats(productReviews.length);
    }

    // Criar elemento de review do usuário
    createUserReviewElement(review, index) {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item user-review-item clickable-review';
        reviewDiv.setAttribute('data-review-id', `user-${index}`);
        reviewDiv.setAttribute('data-author', review.author);
        reviewDiv.setAttribute('data-date', review.date);
        reviewDiv.setAttribute('data-stars', review.rating);

        const starsHTML = this.generateStarsHTML(review.rating);
        
        reviewDiv.innerHTML = `
            <div class="user-review-badge">Cliente Verificado</div>
            <div class="review-image">
                <div class="user-review-avatar">
                    <i class="fas fa-user"></i>
                </div>
            </div>
            <div class="review-content">
                <div class="user-review-stars">
                    ${starsHTML}
                </div>
                <p class="user-review-text">"${review.text}"</p>
                <div class="user-review-author">
                    <strong>${review.author}</strong>
                    <span class="user-review-date">Compra verificada - ${review.date}</span>
                </div>
            </div>
        `;

        // Adicionar event listener para modal (se existir)
        if (typeof openReviewModal === 'function') {
            reviewDiv.addEventListener('click', () => {
                openReviewModal(review.author, review.date, review.rating, review.text);
            });
        }

        return reviewDiv;
    }

    // Gerar HTML das estrelas
    generateStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        return starsHTML;
    }

    // Atualizar estatísticas das reviews
    updateReviewStats(userReviewsCount = 0) {
        const totalReviewsElement = document.getElementById('totalReviews');
        const averageRatingElement = document.getElementById('averageRating');
        
        if (totalReviewsElement) {
            const currentTotal = parseInt(totalReviewsElement.textContent) || 0;
            const baseReviews = currentTotal - userReviewsCount;
            const newTotal = baseReviews + userReviewsCount;
            totalReviewsElement.textContent = newTotal;
        }

        // Calcular nova média se houver reviews de usuários
        if (userReviewsCount > 0 && averageRatingElement) {
            const productReviews = this.userReviews.filter(review => 
                review.product === this.productName
            );
            
            if (productReviews.length > 0) {
                const userAverage = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
                const baseRating = 4.6; // Rating base das reviews fixas
                const totalReviews = 4 + productReviews.length; // 4 reviews fixas + reviews de usuários
                const newAverage = ((baseRating * 4) + (userAverage * productReviews.length)) / totalReviews;
                averageRatingElement.textContent = newAverage.toFixed(1);
            }
        }
    }

    // Sistema de avaliação por estrelas
    initializeStarRating() {
        const stars = document.querySelectorAll('.star-rating i');
        const selectedRatingInput = document.getElementById('selectedRating');
        
        if (!stars.length || !selectedRatingInput) return;

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                selectedRatingInput.value = rating;
                
                // Atualizar visual das estrelas
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.className = 'fas fa-star';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.color = '#ffd700';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });

        // Reset ao sair do hover
        const starContainer = document.querySelector('.star-rating');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => {
                const currentRating = parseInt(selectedRatingInput.value);
                stars.forEach((s, i) => {
                    if (i < currentRating) {
                        s.style.color = '#ffd700';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        }
    }

    // Contador de caracteres
    initializeCharacterCounter() {
        const textarea = document.getElementById('reviewText');
        const charCount = document.querySelector('.char-count');
        
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                charCount.textContent = `${length}/500 caracteres`;
                
                if (length > 450) {
                    charCount.style.color = '#e74c3c';
                } else {
                    charCount.style.color = '#666';
                }
            });
        }
    }

    // Submeter review
    initializeReviewSubmission() {
        const form = document.getElementById('submitReviewForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const rating = parseInt(document.getElementById('selectedRating').value);
            const text = document.getElementById('reviewText').value.trim();
            
            if (rating === 0) {
                alert('Por favor, selecione uma avaliação com estrelas.');
                return;
            }
            
            if (text.length < 10) {
                alert('Por favor, escreva pelo menos 10 caracteres na sua avaliação.');
                return;
            }
            
            // Criar nova review
            const newReview = {
                author: this.currentUser.name,
                rating: rating,
                text: text,
                date: this.formatDate(new Date()),
                timestamp: Date.now(),
                product: this.productName
            };
            
            // Adicionar à lista de reviews
            this.userReviews.unshift(newReview);
            localStorage.setItem('userReviews', JSON.stringify(this.userReviews));
            
            // Mostrar mensagem de sucesso
            alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
            
            // Recarregar página para mostrar a nova review
            location.reload();
        });
    }

    // Formatar data para exibição
    formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 dia atrás';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
        return `${Math.ceil(diffDays / 30)} meses atrás`;
    }

    // Inicializar sistema completo
    initialize() {
        if (this.checkUserLogin()) {
            this.initializeStarRating();
            this.initializeCharacterCounter();
            this.initializeReviewSubmission();
        }
    }
}

// Inicializar sistema quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const reviewsSystem = new UserReviewsSystem();
    reviewsSystem.initialize();
});






