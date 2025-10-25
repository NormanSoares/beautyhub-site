// Sistema de Tradução para Inglês - Beauty Hub
// Traduções específicas para idioma inglês americano

class EnglishTranslationSystem {
    constructor() {
        this.language = 'en-US';
        this.currency = 'USD';
        this.translations = this.getAllTranslations();
        this.init();
    }

    async init() {
        console.log('🇺🇸 Initializing English Translation System...');
        this.translateCurrentPage();
        console.log('✅ English Translation System initialized');
    }

    translateCurrentPage() {
        // Traduzir elementos com data-translate-key
        this.translateElementsByKey();

        // Traduzir placeholders de formulários
        this.translateFormPlaceholders();

        // Traduzir títulos de produtos
        this.translateProductTitles();

        // Callback para traduções específicas de página
        this.pageSpecificTranslations();

    }

    translateElementsByKey() {
        const elements = document.querySelectorAll('[data-translate-key]');
        elements.forEach(element => {
            // EXCLUIR TODOS os elementos de preço da tradução
            if (element.classList.contains('price-current') || 
                element.classList.contains('price-original') ||
                element.classList.contains('price-discount') ||
                element.closest('.product-price')) {
                console.log('🚫 Pulando tradução de elemento de preço:', element.className);
                return;
            }
            const key = element.getAttribute('data-translate-key');
            const translatedText = this.getTranslation(key);

            if (translatedText && translatedText !== key) {
                // Verificar se o elemento tem filhos (como preços)
                if (element.children.length > 0) {
                    // Se tem filhos, preservar HTML e só traduzir texto direto
                    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    textNodes.forEach(node => {
                        if (node.textContent.trim()) {
                            node.textContent = translatedText;
                        }
                    });
                } else {
                // Preservar HTML se necessário (para elementos com ícones)
                if (element.tagName === 'H3' && element.innerHTML.includes('<i')) {
                    const iconMatch = element.innerHTML.match(/<i[^>]*><\/i>/);
                    if (iconMatch) {
                        element.innerHTML = `${iconMatch[0]} ${translatedText}`;
                    } else {
                        element.textContent = translatedText;
                    }
                } else {
                    element.textContent = translatedText;
                    }
                }
            } else {
                // Use data-default if translation not found or element is empty
                const defaultText = element.getAttribute('data-default');
                if (defaultText && (element.textContent.trim() === '' || element.textContent === key)) {
                    element.textContent = defaultText;
                }
            }
        });
    }

    translateFormPlaceholders() {
        console.log('📝 Translating form placeholders...');
        
        // Traduzir placeholders com data-translate-key
        const inputsWithKey = document.querySelectorAll('input[data-translate-key], textarea[data-translate-key]');
        console.log(`📋 Found ${inputsWithKey.length} inputs with data-translate-key`);

        inputsWithKey.forEach((input, index) => {
            const key = input.getAttribute('data-translate-key');
            if (key) {
                const translatedPlaceholder = this.getTranslation(key);
                console.log(`🔄 [${index + 1}] Placeholder Key: "${key}" -> "${translatedPlaceholder}"`);

                if (translatedPlaceholder) {
                    input.setAttribute('placeholder', translatedPlaceholder);
                }
            }
        });

        console.log('✅ Form placeholder translation completed');
    }

    translateProductTitles() {
        if (typeof window.translateProductTitles === 'function') {
            window.translateProductTitles();
        }
    }

    pageSpecificTranslations() {
        if (typeof window.pageSpecificTranslations === 'function') {
            window.pageSpecificTranslations();
        }
    }

    getTranslation(key) {
        return this.translations[key] || key;
    }

    getAllTranslations() {
        return {
            // Common translations for all pages
            'checkout_title': 'Checkout',
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'email': 'Email',
            'phone': 'Phone',
            'address': 'Address',
            'city': 'City',
            'state': 'State',
            'zip_code': 'ZIP Code',
            'country': 'Country',
            'payment_method': 'Payment Method',
            'observations': 'Observations',
            'total': 'Total',
            'checkout_button': 'Complete Purchase',
            'order_summary': 'Order Summary',
            'choose_color': 'Choose color:',
            'choose_size': 'Choose size:',
            'basic_offer': 'Basic Offer',
            'premium_offer': 'Premium Offer',
            'complete_offer': 'Complete Offer',
            'nav_home': 'Home',
            'nav_beauty_section': 'Beauty Section',
            'nav_products': 'Products',
            'nav_sections': 'Sections',
            'nav_about': 'About',
            'nav_contact': 'Contact',
            'hero_subtitle': 'Beauty and Comfort Products',
            'hero_description': 'Discover our exclusive selection of beauty and comfort products, carefully chosen for your personal care routine.',
            'hero_products_btn': 'Our Products',
            'hero_order_btn': 'Place Order',
            'products_title': 'Our Products',
            'beauty_section': 'Beauty Products',
            'beauty_description': 'Makeup, hair products and everything you need to enhance your natural beauty.',
            
            // Beauty Store - New elements
            'beauty_hero_title': 'Beauty Products',
            'beauty_hero_subtitle': 'Discover our premium beauty collection',
            'beauty_products_title': 'Featured Products',
            'product_foundation_title': '2 Pack PHOERA Foundation',
            'product_foundation_desc': 'Eliminate spots, dark circles and imperfections with full coverage that lasts 12+ hours. Matte finish that won\'t melt in the heat. Kit with 2 foundations + extras.',
            'product_clips_title': 'Alligator Hair Clips',
            'product_clips_desc': 'Stop losing clips that break. These don\'t slip, don\'t break and hold any hairstyle firm. Kit with 6 pieces in nude tones.',
            'product_mat_title': 'Heat-Resistant Mat',
            'product_mat_desc': 'Protect your countertops from burns and damage. Resists high temperatures without melting. Waterproof and easy to clean.',
            'product_vitamin_title': 'LAIKOU Skincare',
            'product_vitamin_desc': 'Reduce wrinkles, spots and signs of aging. Vitamin C + 24K gold for firmer and brighter skin in 30 days.',
            'product_wrinkle_title': 'Wrinkle Reducer - Red Light Therapy',
            'product_wrinkle_desc': 'Eliminate wrinkles and expression lines at home. Red light + massage + 7 functions. Visible results in 2 weeks.',
            'btn_add_to_cart': 'Add to Cart',
            'btn_buy_now': 'Buy Now',
            'discount_blanket': '42% OFF',
            'discount_pillow': '38% OFF',
            'discount_organizer': '47% OFF',
            'badge_bestseller': 'Bestseller',
            'badge_new': 'New',
            'badge_essential': 'Essential',
            'badge_premium': 'Premium',
            'badge_technology': 'Technology',
            'nav_benefits': 'Benefits',
            'features_title': 'Why choose our Beauty Section?',
            'feature_premium_title': 'Premium Products',
            'feature_premium_desc': 'We select only the best beauty products on the market to ensure exceptional quality.',
            'feature_shipping_title': 'Fast Delivery',
            'feature_shipping_desc': 'Free shipping to all Brazil with delivery in 15-25 business days. Complete tracking.',
            'feature_guarantee_title': 'Total Guarantee',
            'feature_guarantee_desc': '30-day guarantee on all products. Satisfaction guaranteed or your money back.',
            'feature_expert_title': 'Expert Approved',
            'feature_expert_desc': 'Products tested and approved by beauty professionals and dermatologists.',
            'testimonials_title': 'What our customers say',
            'testimonial_1': '"It\'s my absolute favorite foundation, I\'ve bought it several times! I fell in love the first time I used it, and I haven\'t bought a different foundation since then! It\'s super light but with full coverage, matte finish, and I swear it gives an airbrushed look! My skin looks like it doesn\'t even have much makeup!"',
            'testimonial_1_author': '- Brookie, Verified Customer',
            'testimonial_2': '"The hair clips are perfect for my hairstyles. Exceptional quality!"',
            'testimonial_2_author': '- Maria Fernanda, Rio de Janeiro',
            'testimonial_3': '"Phero perfume is divine! I receive many compliments when I wear it. Worth every penny!"',
            'testimonial_3_author': '- Juliana Santos, Belo Horizonte',
            'newsletter_title': 'Stay updated with the latest news!',
            'newsletter_description': 'Receive exclusive offers and beauty tips directly to your email',
            'newsletter_placeholder': 'Your best email',
            'newsletter_button': 'Subscribe',
            'page_title': 'Beauty Section - 67 Beauty Hub',
            'price_foundation_current': '$91.68',
            'price_foundation_original': '$183.36',
            'discount_foundation': '50% OFF',
            'discount_clips': '48% OFF',
            'discount_mat': '94% OFF',
            'discount_vitamin': '70% OFF',
            'discount_wrinkle': '50% OFF',
            'discount_blanket': '42% OFF',
            'discount_pillow': '38% OFF',
            'discount_organizer': '47% OFF',
            'comfort_page_title': 'Comfort Section - 67 Beauty Hub',
            'user_name': 'User',
            'site_name': '67 BEAUTY HUB',
            'login_text': 'Login',
            'my_profile_text': 'My Profile',
            'my_reviews_text': 'My Reviews',
            'logout_text': 'Logout',
            'footer_copyright': '© 2024 67 Beauty Hub. All rights reserved.',
            'comfort_section': 'Comfort Products',
            'comfort_section_description': 'Transform your home into an oasis of comfort and well-being with our exclusive products',
            'comfort_description': 'Items for your well-being and personal comfort, creating a cozy environment at home.',
            'feature_makeup': 'Makeup',
            'feature_skincare': 'Skincare',
            'feature_hair': 'Hair',
            'nav_beauty_section': 'Beauty Section',
            'nav_comfort_section': 'Comfort Section',
            'about_title': 'About 67 Beauty Hub',
            'about_description_1': 'At 67 Beauty Hub, we believe beauty and comfort are perfect together. We are experts in curating the finest beauty and comfort products, handpicked to enhance your everyday wellness routine.',
            'about_description_2': 'With extensive experience in the industry, we carefully select only premium products that deliver exceptional results, safety, and comfort for our valued customers.',
            'about_feature_1': 'Premium Quality Products',
            'about_feature_2': 'Expertly Curated Selection',
            'about_feature_3': 'Lightning-Fast & Secure Delivery',
            'featured_title': 'Featured Products',
            'featured_subtitle': 'Our most sought-after and recommended products',
            'header': 'Beauty Section',
            'subtitle': 'Discover the best beauty and makeup products to enhance your natural beauty',
            'beauty_section_title': 'Beauty Section',
            'beauty_section_subtitle': 'Discover the best beauty and makeup products to enhance your natural beauty',
            'features_title': 'Why choose our Beauty Section?',
            'premium_products': 'Premium Products',
            'premium_description': 'We select only the best beauty products on the market to ensure exceptional quality.',
            'fast_delivery': 'Fast Delivery',
            'fast_delivery_description': 'Free shipping throughout the US with delivery in 3-7 business days. Complete tracking.',
            'total_guarantee': 'Total Guarantee',
            'guarantee_description': '30 days guarantee on all products. Satisfaction guaranteed or your money back.',
            'expert_approved': 'Expert Approved',
            'expert_description': 'Products tested and approved by beauty professionals and dermatologists.',
            'testimonials_title': 'What our customers say',
            'footer_text': '© 2025 67 Beauty Hub - Beauty Section. All rights reserved.',
            'welcome_title': 'Welcome to 67 Beauty Hub',
            'login_subtitle': 'Login to continue browsing',
            'email_label': 'Email',
            'email_placeholder': 'your@email.com',
            'password_label': 'Password',
            'password_placeholder': 'Your password',
            'name_label': 'Name',
            'name_placeholder': 'Your name',
            'login_btn': 'Login',
            'skip_btn': 'Skip',
            'login_success_title': 'Login successful!',
            'login_success_message': 'Welcome to 67 Beauty Hub!',
            'product_phoera_foundation': 'PHOERA Foundation 2-Pack',
            'product_hair_clips': 'Unbreakable Hair Clips',
            'product_heat_mat': 'Heat Shield Mat',
            'product_laiou_skincare': 'LAIKOU Skincare',
            'product_wrinkle_reducer': 'Wrinkle Reducer - Red Light Therapy',
            'product_sofa_cover': '3-in-1 Sofa Cover',
            'product_human_dog_bed': 'Giant Anti-Pain Bed',
            'product_memory_foam_pillow': 'Portable Neck Pillow',
            'feature_wellbeing': 'Well-being',
            'feature_comfort': 'Comfort',
            'feature_relaxation': 'Relaxation',
            'contact_title': 'Contact Us',
            'contact_subtitle': 'Place your order and discover the best beauty and comfort products',
            'address_label': 'Address',
            'address_text': 'Wekwitcha Street<br>Angola - Luanda',
            'phone_label': 'Phone',
            'phone_text': '(+244) 946773551',
            'email_label': 'Email',
            'email_text': 'mojojojo946925@gmail.com',
            'business_hours_label': 'Business Hours',
            'business_hours_text': 'Mon - Fri: 9am to 7pm<br>Sat: 9am to 5pm',
            'name_placeholder': 'Your name',
            'email_placeholder': 'Your email',
            'phone_placeholder': 'Your phone',
            'message_placeholder': 'Your message',
            'place_order_btn': 'Place Order',
            'footer_brand': '67 Beauty Hub',
            'footer_description': 'Where beauty meets comfort. Your wellness journey starts here.',
            'quick_links_label': 'Quick Links',
            'products_label': 'Products',
            'beauty_products': 'Beauty Products',
            'comfort_products': 'Comfort Products',
            'wellbeing': 'Well-being',
            'footer_copyright': '© 2025 67 Beauty Hub. All rights reserved.',
            'phoera_description': 'Get flawless coverage that lasts all day! This full-coverage foundation eliminates spots, dark circles and imperfections for up to 12+ hours. The matte finish won\'t melt in the heat. Kit includes 2 foundations plus bonus items.',
            'clips_description': 'Stop losing clips that break. These don\'t slip, don\'t break and hold any hairstyle firm. Kit with 6 pieces in nude tones.',
            'heat_mat_description': 'Protect your countertops and tables from heat damage! This mat withstands high temperatures without melting or warping. Waterproof and super easy to clean - just wipe and go!',
            'golden_sakura_description': 'Turn back the clock on aging! This powerful anti-aging kit reduces wrinkles, dark spots and fine lines. Vitamin C + 24K gold formula firms and brightens skin in just 30 days for a youthful glow.',
            'wrinkle_wand_description': 'Get spa-quality results at home! This 7-in-1 wrinkle wand uses red light therapy and massage to smooth out wrinkles and fine lines. See visible improvements in just 2 weeks!',
            'sofa_cover_description': 'Revive your old sofa! This 3-in-1 cover transforms any furniture into a cozy lounger. Super easy to remove and wash - just toss in the machine!',
            'anti_pain_bed_description': 'Say goodbye to back and neck pain! This giant bed supports up to 330 lbs and provides ultimate comfort for the best relaxation experience.',
            'neck_pillow_description': 'Travel in comfort! Premium memory foam neck pillow with perfect U-shape design provides amazing cervical support. Compact and lightweight for easy travel.',
            'comfort_guarantee_description': 'Products selected to provide maximum comfort and well-being in your home.',
            'free_delivery_description': 'Free shipping throughout the US. Receive your comfort products in the comfort of your home.',
            'transform_home_description': 'Products that transform any environment into a cozy and comfortable space.',
            'pet_friendly_description': 'Many of our products are perfect for you and your pets to enjoy together.',
            'your_review': 'Your Review:',
            'photo_optional': 'Photo (optional):',
            'submit_review': 'Submit Review',
            'cancel': 'Cancel',
            'please_login_review': 'Please login to add a review.',
            'review_added_success': 'Review added successfully!',
            'paypal_option': 'PayPal',
            'pix_option': 'PIX',
            'fill_email_payment': 'Please fill in email and select a payment method.',
            'paypal_processed': 'PayPal payment has been processed. You will receive a confirmation email shortly.',
            'pix_instructions': 'You will receive PIX payment instructions by email. After payment, your order will be processed.',
            'confirmation_email': 'You will receive a confirmation email shortly.',
            'payment_approved': 'Payment approved!',
            'payment_error': 'Error processing payment. Please try again.',
            'paypal_error': 'PayPal error. Please try again or choose another payment method.',
            'slider_title': 'See the Instant Transformation',
            'slider_description': 'Drag the slider to see the incredible before and after results with PHOERA Foundation',
            'slider_results_title': 'Real results from real customers!',
            'slider_results_description': 'This is what you can achieve with just one application of PHOERA Foundation.',
            'add_to_cart': 'Add to Cart',
            'hair_clips_description': 'Tired of hair clips that slip and break? These stay put all day! Super durable and comfortable, they hold any hairstyle in place. Set of 6 pieces in neutral nude tones that match any look.',
            'laiou_skincare_description': 'Turn back the clock on aging! This powerful anti-aging kit reduces wrinkles, dark spots and fine lines. Vitamin C + 24K gold formula firms and brightens skin in just 30 days for a youthful glow.',
            'wrinkle_reducer_description': 'Get spa-quality results at home! This 7-in-1 wrinkle wand uses red light therapy and massage to smooth out wrinkles and fine lines. See visible improvements in just 2 weeks!',
            'product_phoera': 'PHOERA Foundation Kit',
            'product_clips': 'Unbreakable Hair Clips',
            'product_24k_kit': '24K Anti-Aging Kit',
            'product_wrinkle_wand': '7-in-1 Wrinkle Wand',
            'best_seller': 'Best Seller',
            'new_product': 'New',
            'essential': 'Essential',
            'premium': 'Premium',
            'technology': 'Technology',
            'subscribe_btn': 'Subscribe',
            'most_popular': 'Most Popular',
            'maximum_comfort': 'Maximum Comfort',
            'comfort_features_title': 'Why choose our Comfort Section?',
            'comfort_guaranteed': 'Comfort Guaranteed',
            'free_delivery': 'Free Delivery',
            'transform_home': 'Transform Your Home',
            'pet_friendly': 'Pet-Friendly',
            'products_subtitle': 'Discover our exclusive selection of premium products',
            'country_brazil': 'Brazil',
            'country_portugal': 'Portugal',
            'country_usa': 'United States',
            
            // Discount badges
            'discount_50_off': '50% OFF',
            'discount_48_off': '48% OFF',
            'discount_94_off': '94% OFF',
            'discount_70_off': '70% OFF',
            'btn_buy_now': 'Buy Now',
            
            // Product badges
            'badge_best_seller': 'Best Seller',
            'badge_new_arrival': 'New Arrival',
            'badge_essential': 'Essential',
            'badge_premium': 'Premium',
            'badge_technology': 'Technology',
            
            'explore_beauty_section': 'Explore Beauty Section',
            'explore_comfort_section': 'Explore Comfort Section',
            
            // Comfort Store Products
            'product_sofa_cover_title': '3-in-1 Sofa Cover',
            'product_sofa_cover_desc': 'Revive your old sofa! This 3-in-1 cover transforms any furniture into a cozy lounger. Super easy to remove and wash - just toss in the machine!',
            'product_dog_bed_title': 'Giant Anti-Pain Bed',
            'product_dog_bed_desc': 'Say goodbye to back and neck pain! This giant bed supports up to 330 lbs and provides ultimate comfort for the best relaxation experience.',
            'product_pillow_title': 'Portable Neck Pillow',
            'product_pillow_desc': 'Travel in comfort! Premium memory foam neck pillow with perfect U-shape design provides amazing cervical support. Compact and lightweight for easy travel.',
            
            // Comfort Store Badges
            'badge_most_popular': 'Most Popular',
            'badge_maximum_comfort': 'Maximum Comfort',
            'badge_new': 'New',
            
            // Comfort Store Discounts
            'discount_42_off': '42% OFF',
            'discount_38_off': '38% OFF',
            'discount_47_off': '47% OFF',
            
            // Comfort Store Features
            'comfort_features_title': 'Why Choose Our Comfort Products?',
            'comfort_guaranteed': 'Comfort Guaranteed',
            'comfort_guarantee_description': 'Products selected to provide maximum comfort and well-being in your home.',
            'free_delivery': 'Free Delivery',
            'free_delivery_description': 'Free shipping throughout the US. Receive your comfort products in the comfort of your home.',
            'transform_home': 'Transform Your Home',
            'transform_home_description': 'Products that transform any environment into a cozy and comfortable space.',
            'pet_friendly': 'Pet-Friendly',
            'pet_friendly_description': 'Many of our products are perfect for you and your pets to enjoy together.'
        };
    }

    // Método para traduzir conteúdo dinâmico
    translateContent(key) {
        return this.getTranslation(key);
    }
    
}

// Inicializar sistema quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (!window.englishTranslationSystem) {
        window.englishTranslationSystem = new EnglishTranslationSystem();
    }
});

// Exportar para uso global
window.EnglishTranslationSystem = EnglishTranslationSystem;