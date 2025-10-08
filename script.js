// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .about-text, .about-image, .contact-item, .contact-form');
    animatedElements.forEach(el => observer.observe(el));
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Por favor, insira um email válido.', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        contactForm.reset();
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Product cards hover effect enhancement
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Loading animation for page
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Initialize translation system
    initializeTranslation();
    
    // Initialize currency system
    initializeCurrency();
    
    // Animate hero elements
    const heroLogo = document.querySelector('.hero-logo');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelector('.hero-buttons');
    
    if (heroLogo) {
        setTimeout(() => heroLogo.style.opacity = '1', 200);
    }
    if (heroSubtitle) {
        setTimeout(() => heroSubtitle.style.opacity = '1', 400);
    }
    if (heroDescription) {
        setTimeout(() => heroDescription.style.opacity = '1', 600);
    }
    if (heroButtons) {
        setTimeout(() => heroButtons.style.opacity = '1', 800);
    }
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    .hero-logo,
    .hero-subtitle,
    .hero-description,
    .hero-buttons {
        opacity: 0;
        transition: opacity 0.6s ease;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .loaded {
        animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Counter animation for statistics (if needed in future)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Lazy loading for images (if added in future)
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #d4af37, #b8941f);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    transition: all 0.3s ease;
    z-index: 1000;
`;

document.body.appendChild(backToTopButton);

// Show/hide back to top button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Back to top functionality
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hover effect for back to top button
backToTopButton.addEventListener('mouseenter', () => {
    backToTopButton.style.transform = 'scale(1.1)';
});

backToTopButton.addEventListener('mouseleave', () => {
    backToTopButton.style.transform = 'scale(1)';
});

// Currency System
let currentCurrency = 'BRL';
let exchangeRates = {
    'BRL': { symbol: 'R$', rate: 1, locale: 'pt-BR' },
    'USD': { symbol: '$', rate: 0.19, locale: 'en-US' },
    'EUR': { symbol: '€', rate: 0.17, locale: 'de-DE' }
};

// Detect user language and set currency automatically
function detectUserCurrency() {
    const userLanguage = navigator.language || navigator.languages[0];
    
    // Detect based on language
    if (userLanguage.startsWith('pt')) {
        // Portuguese (Brazil, Portugal, etc.)
        currentCurrency = 'BRL';
    } else if (userLanguage.startsWith('en')) {
        // English (US, UK, etc.)
        currentCurrency = 'USD';
    } else if (userLanguage.startsWith('de') || userLanguage.startsWith('fr') || userLanguage.startsWith('es') || userLanguage.startsWith('it')) {
        // German, French, Spanish, Italian (European languages)
        currentCurrency = 'EUR';
    } else {
        // Default to BRL for other languages
        currentCurrency = 'BRL';
    }
    
    updateCurrencyDisplay();
}

// Update currency display
function updateCurrencyDisplay() {
    const currencyInfo = exchangeRates[currentCurrency];
    
    // Update featured product prices
    const featuredPrices = [
        { id: 'featuredPrice1', price: 89.90 },
        { id: 'featuredPrice2', price: 129.90 },
        { id: 'featuredPrice3', price: 159.90 }
    ];
    
    featuredPrices.forEach(({ id, price }) => {
        const priceElement = document.getElementById(id);
        if (priceElement) {
            const convertedPrice = price * currencyInfo.rate;
            const formattedPrice = new Intl.NumberFormat(currencyInfo.locale, {
                style: 'currency',
                currency: currentCurrency
            }).format(convertedPrice);
            
            priceElement.textContent = formattedPrice;
        }
    });
    
    // Update cart if it has items
    if (cart.length > 0) {
        updateCartDisplayLegacy();
    }
}

// Format price for display
function formatPrice(price) {
    const currencyInfo = exchangeRates[currentCurrency];
    const convertedPrice = price * currencyInfo.rate;
    return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currentCurrency
    }).format(convertedPrice);
}

// Initialize currency system
function initializeCurrency() {
    detectUserCurrency();
}

// Translation System
const translations = {
    'pt': {
        // Navigation
        'nav-home': 'Início',
        'nav-products': 'Produtos',
        'nav-about': 'Sobre',
        'nav-contact': 'Contato',
        
        // Hero Section
        'hero-subtitle': 'Produtos de Beleza e Conforto',
        'hero-description': 'Descubra nossa seleção exclusiva de produtos de beleza e conforto, cuidadosamente escolhidos para sua rotina de cuidados pessoais.',
        'hero-btn-products': 'Nossos Produtos',
        'hero-btn-order': 'Fazer Pedido',
        
        // Products Section
        'products-title': 'Nossos Produtos',
        'products-subtitle': 'Seleção cuidadosa de produtos de beleza e conforto para sua rotina diária',
        'beauty-products': 'Produtos de Beleza',
        'beauty-description': 'Maquiagem, skincare, produtos capilares e tudo que você precisa para realçar sua beleza natural.',
        'comfort-products': 'Produtos de Conforto',
        'comfort-description': 'Itens para seu bem-estar e conforto pessoal, criando um ambiente acolhedor em casa.',
        
        // About Section
        'about-title': 'Sobre o 67 Beauty Hub',
        'about-text1': 'No 67 Beauty Hub, acreditamos que a beleza e o conforto andam juntos. Somos especialistas em produtos de beleza e conforto, oferecendo uma seleção cuidadosa de itens para sua rotina diária.',
        'about-text2': 'Com anos de experiência no mercado, selecionamos apenas produtos de alta qualidade que combinam eficácia, segurança e conforto para você.',
        
        // Featured Products
        'featured-title': 'Produtos em Destaque',
        'featured-subtitle': 'Nossos produtos mais procurados e recomendados',
        'add-to-cart': 'Adicionar ao Carrinho',
        
        // Contact Section
        'contact-title': 'Entre em Contato',
        'contact-subtitle': 'Faça seu pedido e descubra os melhores produtos de beleza e conforto',
        'contact-address': 'Endereço',
        'contact-phone': 'Telefone',
        'contact-email': 'Email',
        'contact-hours': 'Horário de Funcionamento',
        'contact-form-name': 'Seu nome',
        'contact-form-email': 'Seu email',
        'contact-form-phone': 'Seu telefone',
        'contact-form-message': 'Sua mensagem',
        'contact-form-submit': 'Fazer Pedido',
        
        // Cart
        'cart-title': 'Carrinho de Compras',
        'cart-empty': 'Seu carrinho está vazio',
        'cart-total': 'Total',
        'cart-checkout': 'Finalizar Compra',
        'cart-remove': 'Remover'
    },
    'en': {
        // Navigation
        'nav-home': 'Home',
        'nav-products': 'Products',
        'nav-about': 'About',
        'nav-contact': 'Contact',
        
        // Hero Section
        'hero-subtitle': 'Beauty and Comfort Products',
        'hero-description': 'Discover our exclusive selection of beauty and comfort products, carefully chosen for your personal care routine.',
        'hero-btn-products': 'Our Products',
        'hero-btn-order': 'Place Order',
        
        // Products Section
        'products-title': 'Our Products',
        'products-subtitle': 'Careful selection of beauty and comfort products for your daily routine',
        'beauty-products': 'Beauty Products',
        'beauty-description': 'Makeup, skincare, hair products and everything you need to enhance your natural beauty.',
        'comfort-products': 'Comfort Products',
        'comfort-description': 'Items for your well-being and personal comfort, creating a welcoming environment at home.',
        
        // About Section
        'about-title': 'About 67 Beauty Hub',
        'about-text1': 'At 67 Beauty Hub, we believe that beauty and comfort go hand in hand. We are specialists in beauty and comfort products, offering a careful selection of items for your daily routine.',
        'about-text2': 'With years of experience in the market, we select only high-quality products that combine effectiveness, safety and comfort for you.',
        
        // Featured Products
        'featured-title': 'Featured Products',
        'featured-subtitle': 'Our most sought after and recommended products',
        'add-to-cart': 'Add to Cart',
        
        // Contact Section
        'contact-title': 'Get in Touch',
        'contact-subtitle': 'Place your order and discover the best beauty and comfort products',
        'contact-address': 'Address',
        'contact-phone': 'Phone',
        'contact-email': 'Email',
        'contact-hours': 'Business Hours',
        'contact-form-name': 'Your name',
        'contact-form-email': 'Your email',
        'contact-form-phone': 'Your phone',
        'contact-form-message': 'Your message',
        'contact-form-submit': 'Place Order',
        
        // Cart
        'cart-title': 'Shopping Cart',
        'cart-empty': 'Your cart is empty',
        'cart-total': 'Total',
        'cart-checkout': 'Checkout',
        'cart-remove': 'Remove'
    },
    'es': {
        // Navigation
        'nav-home': 'Inicio',
        'nav-products': 'Productos',
        'nav-about': 'Acerca de',
        'nav-contact': 'Contacto',
        
        // Hero Section
        'hero-subtitle': 'Productos de Belleza y Comodidad',
        'hero-description': 'Descubre nuestra selección exclusiva de productos de belleza y comodidad, cuidadosamente elegidos para tu rutina de cuidado personal.',
        'hero-btn-products': 'Nuestros Productos',
        'hero-btn-order': 'Hacer Pedido',
        
        // Products Section
        'products-title': 'Nuestros Productos',
        'products-subtitle': 'Selección cuidadosa de productos de belleza y comodidad para tu rutina diaria',
        'beauty-products': 'Productos de Belleza',
        'beauty-description': 'Maquillaje, cuidado de la piel, productos para el cabello y todo lo que necesitas para realzar tu belleza natural.',
        'comfort-products': 'Productos de Comodidad',
        'comfort-description': 'Artículos para tu bienestar y comodidad personal, creando un ambiente acogedor en casa.',
        
        // About Section
        'about-title': 'Acerca de 67 Beauty Hub',
        'about-text1': 'En 67 Beauty Hub, creemos que la belleza y la comodidad van de la mano. Somos especialistas en productos de belleza y comodidad, ofreciendo una selección cuidadosa de artículos para tu rutina diaria.',
        'about-text2': 'Con años de experiencia en el mercado, seleccionamos solo productos de alta calidad que combinan eficacia, seguridad y comodidad para ti.',
        
        // Featured Products
        'featured-title': 'Productos Destacados',
        'featured-subtitle': 'Nuestros productos más buscados y recomendados',
        'add-to-cart': 'Agregar al Carrito',
        
        // Contact Section
        'contact-title': 'Ponte en Contacto',
        'contact-subtitle': 'Haz tu pedido y descubre los mejores productos de belleza y comodidad',
        'contact-address': 'Dirección',
        'contact-phone': 'Teléfono',
        'contact-email': 'Email',
        'contact-hours': 'Horario de Atención',
        'contact-form-name': 'Tu nombre',
        'contact-form-email': 'Tu email',
        'contact-form-phone': 'Tu teléfono',
        'contact-form-message': 'Tu mensaje',
        'contact-form-submit': 'Hacer Pedido',
        
        // Cart
        'cart-title': 'Carrito de Compras',
        'cart-empty': 'Tu carrito está vacío',
        'cart-total': 'Total',
        'cart-checkout': 'Finalizar Compra',
        'cart-remove': 'Eliminar'
    }
};

// Detect user language
function detectUserLanguage() {
    const userLanguage = navigator.language || navigator.languages[0];
    const languageCode = userLanguage.split('-')[0];
    
    // Return supported language or default to Portuguese
    return translations[languageCode] ? languageCode : 'pt';
}

// Apply translations
function applyTranslations(languageCode) {
    const t = translations[languageCode];
    if (!t) return;
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#home') link.textContent = t['nav-home'];
        if (href === '#products') link.textContent = t['nav-products'];
        if (href === '#about') link.textContent = t['nav-about'];
        if (href === '#contact') link.textContent = t['nav-contact'];
    });
    
    // Update hero section
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    const heroBtnProducts = document.querySelector('.hero-buttons .btn-primary');
    const heroBtnOrder = document.querySelector('.hero-buttons .btn-secondary');
    
    if (heroSubtitle) heroSubtitle.textContent = t['hero-subtitle'];
    if (heroDescription) heroDescription.textContent = t['hero-description'];
    if (heroBtnProducts) heroBtnProducts.textContent = t['hero-btn-products'];
    if (heroBtnOrder) heroBtnOrder.textContent = t['hero-btn-order'];
    
    // Update products section
    const productsTitle = document.querySelector('.products .section-title');
    const productsSubtitle = document.querySelector('.products .section-subtitle');
    
    if (productsTitle) productsTitle.textContent = t['products-title'];
    if (productsSubtitle) productsSubtitle.textContent = t['products-subtitle'];
    
    // Update about section
    const aboutTitle = document.querySelector('.about-text h2');
    const aboutTexts = document.querySelectorAll('.about-text p');
    
    if (aboutTitle) aboutTitle.textContent = t['about-title'];
    if (aboutTexts[0]) aboutTexts[0].textContent = t['about-text1'];
    if (aboutTexts[1]) aboutTexts[1].textContent = t['about-text2'];
    
    // Update featured products section
    const featuredTitle = document.querySelector('.featured-products .section-title');
    const featuredSubtitle = document.querySelector('.featured-products .section-subtitle');
    
    if (featuredTitle) featuredTitle.textContent = t['featured-title'];
    if (featuredSubtitle) featuredSubtitle.textContent = t['featured-subtitle'];
    
    // Update contact section
    const contactTitle = document.querySelector('.contact .section-title');
    const contactSubtitle = document.querySelector('.contact .section-subtitle');
    
    if (contactTitle) contactTitle.textContent = t['contact-title'];
    if (contactSubtitle) contactSubtitle.textContent = t['contact-subtitle'];
    
    // Update form placeholders
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const messageTextarea = document.querySelector('textarea[name="message"]');
    const submitBtn = document.querySelector('.contact-form .btn-primary');
    
    if (nameInput) nameInput.placeholder = t['contact-form-name'];
    if (emailInput) emailInput.placeholder = t['contact-form-email'];
    if (phoneInput) phoneInput.placeholder = t['contact-form-phone'];
    if (messageTextarea) messageTextarea.placeholder = t['contact-form-message'];
    if (submitBtn) submitBtn.textContent = t['contact-form-submit'];
}

// Initialize translation system
function initializeTranslation() {
    const userLanguage = detectUserLanguage();
    applyTranslations(userLanguage);
}

// Cart System - Variables are declared in index.html

// Add to cart function (legacy - use the one in index.html)
function addToCartLegacy(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplayLegacy();
    showNotification(`${productName} adicionado ao carrinho!`, 'success');
}

// Remove from cart function
function removeFromCartLegacy(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplayLegacy();
    showNotification('Item removido do carrinho', 'info');
}

// Update quantity function
function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productName);
            return;
        }
        updateCartDisplayLegacy();
    }
}

// Update cart display
function updateCartDisplayLegacy() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Calculate total
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = formatPrice(cartTotal);
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart('${item.name}')">Remover</button>
                </div>
            </div>
        `).join('');
    }
}

// Toggle cart modal
function toggleCartLegacy() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('active');
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'error');
        return;
    }
    
    // Simulate checkout process
    showNotification('Redirecionando para o checkout...', 'success');
    
    // Here you would typically redirect to a checkout page or payment gateway
    setTimeout(() => {
        showNotification('Compra finalizada com sucesso!', 'success');
        cart = [];
        updateCartDisplayLegacy();
        toggleCart();
    }, 2000);
}

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    const cartModal = document.getElementById('cartModal');
    const cartIcon = document.querySelector('.cart-icon');
    
    if (cartModal && cartIcon && !cartModal.contains(e.target) && !cartIcon.contains(e.target)) {
        cartModal.classList.remove('active');
    }
});
