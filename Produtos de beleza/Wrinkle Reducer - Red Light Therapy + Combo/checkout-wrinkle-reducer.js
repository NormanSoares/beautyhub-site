// Wrinkle Reducer Checkout JavaScript
// Arquivo separado para funcionalidades específicas do produto

// Gallery variables and functions
let currentImageIndex = 0;
const galleryImages = [
    'Galeria/516848824_2127249251135000_2813377934115782079_n.jpg',
    'Galeria/71dJJYFOQjL._SL1500_.jpg',
    'Galeria/71L1N+QaTmL._SL1500_.jpg',
    'Galeria/817HWP9F6RL._SL1500_.jpg',
    'Galeria/S052cd5c603c64089ac481807139e8ad0Q.webp',
    'Galeria/Sbaed238c364448428b965c54b0951570d.webp',
    'Galeria/Screenshot 2025-09-20 144606.png',
    'Galeria/Screenshot 2025-09-20 144640.png',
    'Galeria/Screenshot 2025-09-20 144719.png',
    'Galeria/Screenshot 2025-09-20 150819.png',
    'Galeria/Screenshot 2025-09-20 150848.png',
    'Galeria/Screenshot 2025-09-20 150912.png'
];

function initializeProductGallery() {
    const mainImage = document.getElementById('galleryMainImage');
    const indicatorsContainer = document.getElementById('galleryIndicators');

    // Create indicators
    galleryImages.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'gallery-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToImage(index));
        indicatorsContainer.appendChild(indicator);
    });

    updateImage();
}

function updateImage() {
    const mainImage = document.getElementById('galleryMainImage');
    if (mainImage) {
        mainImage.src = galleryImages[currentImageIndex];
    }

    // Update indicators
    const indicators = document.querySelectorAll('.gallery-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentImageIndex);
    });

    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentImageIndex === 0;
        nextBtn.disabled = currentImageIndex === galleryImages.length - 1;
    }
}

function goToImage(index) {
    if (index >= 0 && index < galleryImages.length) {
        currentImageIndex = index;
        updateImage();
    }
}

function nextImage() {
    if (currentImageIndex < galleryImages.length - 1) {
        currentImageIndex++;
        updateImage();
    }
}

function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateImage();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Wrinkle Reducer checkout loaded successfully');

    // Inicializar funcionalidades básicas
    initializeProductGallery();
    initializeCheckoutSystem();
    initializePaymentSystem();
});


function initializeCheckoutSystem() {
    console.log('Initializing checkout system...');

    // Configurar ofertas do produto
    const offers = {
        basic: {
            name: '7-in-1 Wrinkle Wand',
            price: 17.45,
            currency: 'USD'
        }
    };

    // Configurar formulário de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const email = formData.get('email');
            const paymentMethod = formData.get('paymentMethod');

            if (!email || !paymentMethod) {
                alert('Please fill in all required fields');
                return;
            }

            // Processar checkout
            processOrder(formData);
        });
    }
}

function initializePaymentSystem() {
    console.log('Initializing payment system...');

    // Sistema de seleção de país/moeda
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            const selectedMethod = this.value;
            console.log('Payment method changed to:', selectedMethod);
        });
    }
}

function processOrder(formData) {
    console.log('Processing order...');

    // Criar dados do pedido
    const orderData = {
        id: 'ORDER_' + Date.now(),
        product: '7-in-1 Wrinkle Wand',
        customer: {
            email: formData.get('email'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName')
        },
        paymentMethod: formData.get('paymentMethod'),
        total: 17.45,
        currency: 'USD',
        timestamp: new Date().toISOString()
    };

    // Salvar pedido no localStorage
    saveOrderToStorage(orderData);

    // Mostrar mensagem de sucesso
    alert(`Order placed successfully!\n\nProduct: ${orderData.product}\nTotal: $${orderData.total}\n\nYou will receive a confirmation email shortly.`);

    // Redirecionar para página inicial
    window.location.href = '../../index.html';
}

function saveOrderToStorage(orderData) {
    try {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        console.log('Order saved to storage:', orderData.id);
    } catch (error) {
        console.error('Error saving order:', error);
    }
}

// Funções globais para dropdown de bandeiras
function toggleFlagDropdown() {
    const dropdown = document.querySelector('.flag-dropdown');
    const menu = document.getElementById('flagDropdownMenu');
    if (dropdown && menu) {
        dropdown.classList.toggle('open');
        menu.classList.toggle('open');
    }
}

function selectFlagOption(currency, flagEmoji) {
    // Update selected flag
    const selectedFlag = document.getElementById('selectedFlag');
    if (selectedFlag) {
        selectedFlag.textContent = flagEmoji;
    }

    // Close dropdown
    const dropdown = document.querySelector('.flag-dropdown');
    const menu = document.getElementById('flagDropdownMenu');
    if (dropdown && menu) {
        dropdown.classList.remove('open');
        menu.classList.remove('open');
    }

    console.log(`Currency changed to: ${currency}, Flag: ${flagEmoji}`);
}

// Fechar dropdown quando clicar fora
document.addEventListener('click', function(e) {
    const dropdown = document.querySelector('.flag-dropdown');
    const menu = document.getElementById('flagDropdownMenu');
    if (dropdown && menu && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        menu.classList.remove('open');
    }
});
