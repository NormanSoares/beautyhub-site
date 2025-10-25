// Controlador de Idiomas - Beauty Hub
// Sistema responsável por detectar o idioma do navegador e carregar o arquivo de tradução apropriado

class LanguageController {
    constructor() {
        this.supportedLanguages = {
            'pt-BR': {
                name: 'Português (Brasil)',
                file: 'translation-pt-br.js',
                currency: 'BRL',
                country: 'Brazil'
            },
            'pt-PT': {
                name: 'Português (Portugal)',
                file: 'translation-pt-pt.js',
                currency: 'EUR',
                country: 'Portugal'
            },
            'en-US': {
                name: 'English (US)',
                file: 'translation-en.js',
                currency: 'USD',
                country: 'United States'
            },
            'en': {
                name: 'English',
                file: 'translation-en.js',
                currency: 'USD',
                country: 'United States'
            }
        };

        this.init();
    }

    async init() {
        console.log('🌍 Inicializando Controlador de Idiomas...');

        try {
            // Detectar idioma baseado em preferências salvas
            const userLanguage = this.detectUserLanguage();
            console.log(`🔍 Idioma detectado: ${userLanguage}`);

            // Carregar arquivo de tradução baseado na preferência salva
            console.log(`📄 Carregando tradução: ${userLanguage}`);
            await this.loadTranslationFile(userLanguage);

            // Aguardar um pouco para garantir que o sistema de tradução seja inicializado
            await new Promise(resolve => setTimeout(resolve, 200));

            // Aplicar traduções na página atual
            this.applyCurrentPageTranslations();

            console.log(`✅ Sistema de idioma inicializado: ${userLanguage}`);
        } catch (error) {
            console.error('❌ Erro durante inicialização do sistema de idiomas:', error);

            // Fallback para inglês
            console.log('🔄 Fallback para inglês devido a erro...');
            await this.loadTranslationFile('en-US');
        }
    }

    detectUserLanguage() {
        // Verificar se usuário tem preferência salva
        const savedLanguage = localStorage.getItem('userLanguage');
        const selectedCountry = localStorage.getItem('selectedCountry');
        
        if (savedLanguage && selectedCountry) {
            console.log('🌍 Usando preferência salva do usuário:', savedLanguage);
            return savedLanguage;
        }

        // Se não há preferência salva, usar inglês como padrão
        console.log('🇺🇸 Nenhuma preferência salva, usando inglês como padrão');
        
        // NÃO sobrescrever preferências existentes
        if (!localStorage.getItem('userLanguage')) {
            localStorage.setItem('userLanguage', 'en-US');
        }
        if (!localStorage.getItem('selectedCountry')) {
            localStorage.setItem('selectedCountry', 'US');
        }
        if (!localStorage.getItem('userCurrency')) {
            localStorage.setItem('userCurrency', 'USD');
        }
        if (!localStorage.getItem('userCountry')) {
            localStorage.setItem('userCountry', 'US');
        }
        
        return 'en-US';
    }

    async loadTranslationFile(language) {
        try {
            const languageConfig = this.supportedLanguages[language] || this.supportedLanguages['en-US'];

            console.log(`📄 Carregando arquivo de tradução: ${languageConfig.file}`);

            // Verificar se o script já existe
            const existingScript = document.querySelector(`script[src*="${languageConfig.file}"]`);
            if (existingScript) {
                console.log(`✅ Script ${languageConfig.file} já existe, pulando carregamento`);
                return;
            }

            // Remover scripts existentes antes de carregar novo
            await this.removeExistingTranslationScripts();

            // Criar elemento script dinâmico
            const script = document.createElement('script');

            // Ajustar caminho baseado na localização atual
            const currentPath = window.location.pathname;
            const currentUrl = window.location.href;
            const currentHref = window.location.href;
            let scriptPath = '';

            console.log(`🔍 Debug - currentPath: ${currentPath}`);
            console.log(`🔍 Debug - currentUrl: ${currentUrl}`);
            console.log(`🔍 Debug - currentHref: ${currentHref}`);

            // Detectar se estamos em subpastas de forma mais robusta
            if (currentPath.includes('Produtos') || currentPath.includes('checkout') || 
                currentUrl.includes('Produtos') || currentUrl.includes('checkout') ||
                currentHref.includes('Produtos') || currentHref.includes('checkout') ||
                currentHref.includes('beauty-store') || currentHref.includes('comfort-store')) {
                // Estamos em subpastas, usar caminho relativo
                scriptPath = `../../js/${languageConfig.file}`;
                console.log(`📁 Detectado: subpasta - usando caminho relativo`);
            } else {
                // Estamos na raiz, usar caminho direto
                scriptPath = `js/${languageConfig.file}`;
                console.log(`📁 Detectado: raiz - usando caminho direto`);
            }

            console.log(`📁 Caminho do script: ${scriptPath}`);
            console.log(`🌍 Current path: ${currentPath}`);
            console.log(`🌍 Current URL: ${currentUrl}`);
            
            // Verificar se o caminho está correto
            if (scriptPath.includes('../../js/')) {
                console.log(`✅ Caminho correto para subpasta: ${scriptPath}`);
            } else if (scriptPath.includes('js/')) {
                console.log(`✅ Caminho correto para raiz: ${scriptPath}`);
            } else {
                console.log(`❌ Caminho suspeito: ${scriptPath}`);
            }
            
            script.src = scriptPath;
            script.async = true;

            // Aguardar carregamento do script
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log(`✅ Script carregado com sucesso: ${languageConfig.file}`);
                    resolve();
                };
                script.onerror = (error) => {
                    console.error(`❌ Erro ao carregar script: ${languageConfig.file}`, error);
                    reject(error);
                };
                document.head.appendChild(script);
            });

            // Aguardar um pouco para garantir que o sistema de tradução seja inicializado
            await new Promise(resolve => setTimeout(resolve, 100));

            // Aplicar configurações de idioma
            this.applyLanguageSettings(language, languageConfig);

            console.log(`✅ Arquivo de tradução carregado com sucesso: ${languageConfig.file}`);

        } catch (error) {
            console.error('❌ Erro ao carregar arquivo de tradução:', error);

            // Fallback para inglês
            console.log('🔄 Tentando carregar tradução em inglês...');
            await this.loadTranslationFile('en-US');
        }
    }

    applyLanguageSettings(language, config) {
        // Aplicar configurações ao documento
        document.documentElement.lang = language;

        // Aplicar classe CSS para estilos específicos de idioma
        document.body.classList.remove('lang-en', 'lang-pt-BR', 'lang-pt-PT');
        document.body.classList.add(`lang-${language.split('-')[0]}`);

        // Salvar preferências no localStorage
        localStorage.setItem('userLanguage', language);
        localStorage.setItem('userCurrency', config.currency);
        localStorage.setItem('userCountry', config.country);

        console.log(`✅ Configurações aplicadas: ${language} | ${config.currency} | ${config.country}`);
    }

    // Método para atualizar idioma manualmente
    async updateLanguage(language) {
        if (this.supportedLanguages[language]) {
            console.log(`🔄 Atualizando idioma para: ${language}`);

            // Remover scripts de tradução existentes
            this.removeExistingTranslationScripts();

            // Carregar novo arquivo de tradução
            await this.loadTranslationFile(language);

            console.log(`✅ Idioma atualizado para: ${language}`);
        } else {
            console.error(`❌ Idioma não suportado: ${language}`);
        }
    }

    removeExistingTranslationScripts() {
        // Remover scripts de tradução existentes
        const scripts = document.querySelectorAll('script[src*="translation-"]');
        scripts.forEach(script => {
            script.remove();
        });

        // Limpar instâncias globais
        if (window.englishTranslationSystem) {
            delete window.englishTranslationSystem;
        }
        if (window.portugueseBrTranslationSystem) {
            delete window.portugueseBrTranslationSystem;
        }
        if (window.portuguesePtTranslationSystem) {
            delete window.portuguesePtTranslationSystem;
        }
        
        // Aguardar um pouco para garantir que as instâncias sejam limpas
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    // Método para obter idioma atual
    getCurrentLanguage() {
        return localStorage.getItem('userLanguage') || 'en-US';
    }

    // Método para obter moeda atual
    getCurrentCurrency() {
        return localStorage.getItem('userCurrency') || 'USD';
    }

    // Método para aplicar traduções diretamente
    applyDirectTranslations(language) {
        console.log(`🔧 Aplicando traduções diretas para: ${language}`);
        
        // Detectar dispositivo móvel para otimizações
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log(`📱 Dispositivo móvel detectado: ${isMobile}`);
        
        const translations = {
            'en-US': {
                'page_title': 'Beauty Section - 67 Beauty Hub',
                'beauty_section_title': 'Beauty Section',
                'beauty_section_subtitle': 'Discover the best beauty and makeup products to enhance your natural beauty',
                'nav_home': 'Home',
                'nav_comfort_section': 'Comfort Section',
                'nav_benefits': 'Benefits',
                'country_brazil': 'Brazil',
                'country_portugal': 'Portugal',
                'country_usa': 'United States',
                'login': 'Login',
                'badge_best_seller': 'Best Seller',
                'badge_new_arrival': 'New Arrival',
                'badge_essential': 'Essential',
                'badge_premium': 'Premium',
                'badge_technology': 'Technology',
                'product_foundation_title': '2 Pack PHOERA Foundation',
                'product_foundation_desc': 'Eliminate spots, dark circles and imperfections with full coverage that lasts 12+ hours. Matte finish that doesn\'t melt in heat. Kit with 2 foundations + extras.',
                'product_clips_title': 'Alligator Hair Clips',
                'product_clips_desc': 'Stop losing clips that break. These don\'t slip, don\'t break and hold any hairstyle firm. Kit with 6 pieces in nude tones.',
                'product_mat_title': 'Heat-Resistant Mat',
                'product_mat_desc': 'Protect your table from burns and damage. Resists high temperatures without melting. Waterproof and easy to clean.',
                'product_vitamin_title': 'LAIKOU Skincare',
                'product_vitamin_desc': 'Reduce wrinkles, spots and signs of aging. Vitamin C + 24k gold for firmer and brighter skin in 30 days.',
                'product_wrinkle_title': 'Wrinkle Reducer - Red Light Therapy',
                'product_wrinkle_desc': 'Eliminate wrinkles and expression lines at home. Red light + massage + 7 functions. Visible results in 2 weeks.',
                'discount_50_off': '50% OFF',
                'discount_48_off': '48% OFF',
                'discount_94_off': '94% OFF',
                'discount_70_off': '70% OFF',
                'btn_buy_now': 'Buy Now',
                'features_title': 'Why choose our Beauty Section?',
                'premium_products': 'Premium Products',
                'premium_description': 'We select only the best beauty products on the market to ensure exceptional quality.',
                'fast_delivery': 'Fast Delivery',
                'fast_delivery_description': 'Free shipping throughout Brazil with delivery in 15-25 business days. Complete tracking.',
                'total_guarantee': 'Total Guarantee',
                'guarantee_description': '30-day guarantee on all products. Satisfaction guaranteed or your money back.',
                'expert_approved': 'Expert Approved',
                'expert_description': 'Products tested and approved by beauty professionals and dermatologists.',
                'testimonials_title': 'What our customers say',
                'testimonial_1': '"It\'s my absolute favorite foundation, I\'ve bought it several times! I fell in love the first time I used it, and I haven\'t bought a different foundation since then! It\'s super light but with full coverage, matte finish, and I swear it gives an airbrushed look! My skin looks like it doesn\'t even have much makeup!"',
                'testimonial_1_author': '- Brookie, Verified Customer',
                'testimonial_2': '"The hair clips are perfect for my hairstyles. Exceptional quality!"',
                'testimonial_2_author': '- Maria Fernanda, Rio de Janeiro',
                'testimonial_3': '"The Phero perfume is divine! I receive many compliments when I wear it. Worth every penny!"',
                'testimonial_3_author': '- Juliana Santos, Belo Horizonte',
                'newsletter_title': 'Stay updated with the latest news!',
                'newsletter_description': 'Receive exclusive offers and beauty tips directly in your email',
                'newsletter_placeholder': 'Your best email',
                'newsletter_button': 'Subscribe',
                'footer_text': '© 2024 67 Beauty Hub - Beauty Section. All rights reserved.',
                // Comfort Section Translations
                'comfort_page_title': 'Comfort Section - 67 Beauty Hub',
                'comfort_section_title': 'Comfort Section',
                'comfort_section_subtitle': 'Discover the best comfort and wellness products for your home',
                'product_sofa_cover_title': '3-in-1 Sofa Cover',
                'product_sofa_cover_desc': 'Revive your old sofa! This 3-in-1 cover transforms any furniture into a cozy lounger. Super easy to remove and wash - just toss in the machine!',
                'product_dog_bed_title': 'Giant Anti-Pain Bed',
                'product_dog_bed_desc': 'Say goodbye to back and neck pain! This giant bed supports up to 330 lbs and provides ultimate comfort for the best relaxation experience.',
                'product_pillow_title': 'Portable Neck Pillow',
                'product_pillow_desc': 'Travel in comfort! Premium memory foam neck pillow with perfect U-shape design provides amazing cervical support. Compact and lightweight for easy travel.',
                'badge_most_popular': 'Most Popular',
                'badge_maximum_comfort': 'Maximum Comfort',
                'badge_new': 'New',
                'discount_42_off': '42% OFF',
                'discount_38_off': '38% OFF',
                'discount_47_off': '47% OFF',
                'comfort_features_title': 'Why Choose Our Comfort Products?',
                'comfort_guaranteed': 'Comfort Guaranteed',
                'comfort_guarantee_description': 'Products selected to provide maximum comfort and well-being in your home.',
                'free_delivery': 'Free Delivery',
                'free_delivery_description': 'Free shipping throughout Brazil. Receive your comfort products in the comfort of your home.',
                'transform_home': 'Transform Your Home',
                'transform_home_description': 'Products that transform any environment into a cozy and comfortable space.',
                'pet_friendly': 'Pet Friendly',
                'pet_friendly_description': 'Many of our products are perfect for you and your pets to enjoy together.',
                'testimonials_title': 'What Our Customers Say',
                'testimonial_1': '"The sofa cover completely changed the look of my living room! Super easy to put on and wash."',
                'testimonial_1_author': '- Maria Silva, São Paulo',
                'testimonial_2': '"The portable hair dryer is perfect for my travels. Light and efficient!"',
                'testimonial_2_author': '- João Santos, Rio de Janeiro',
                'testimonial_3': '"The smart litter box is a dream! My cat loves it and so do I."',
                'testimonial_3_author': '- Ana Costa, Belo Horizonte',
                'newsletter_title': 'Stay Updated',
                'newsletter_description': 'Subscribe to receive our latest comfort tips and exclusive offers.',
                'newsletter_placeholder': 'Enter your email',
                'newsletter_button': 'Subscribe',
                // Index.html Translations
                'nav_home': 'Home',
                'nav_products': 'Products',
                'nav_sections': 'Sections',
                'nav_beauty_section': 'Beauty Section',
                'nav_comfort_section': 'Comfort Section',
                'nav_about': 'About',
                'nav_contact': 'Contact',
                'login_btn': 'Login',
                'user_name': 'User',
                'my_profile': 'My Profile',
                'my_reviews': 'My Reviews',
                'logout': 'Logout',
                'hero_subtitle': 'Discover Beauty & Comfort',
                'hero_description': 'Your trusted partner for premium beauty and comfort products',
                'hero_products_btn': 'Explore Products',
                'hero_order_btn': 'Order Now',
                'products_title': 'Our Products',
                'products_subtitle': 'Discover our premium selection of beauty and comfort products',
                'beauty_section': 'Beauty Products',
                'beauty_description': 'Makeup, hair products and everything you need to enhance your natural beauty.',
                'comfort_section': 'Comfort Products',
                'comfort_description': 'Items for your well-being and personal comfort, creating a cozy environment at home.',
                'feature_makeup': 'Makeup',
                'feature_skincare': 'Skincare',
                'feature_hair': 'Hair',
                'feature_wellbeing': 'Well-being',
                'feature_comfort': 'Comfort',
                'feature_relaxation': 'Relaxation',
                'explore_beauty_section': 'Explore Beauty Section',
                'explore_comfort_section': 'Explore Comfort Section',
                'about_title': 'About 67 Beauty Hub',
                'about_description_1': 'We are a company dedicated to providing the best beauty and comfort products for our customers.',
                'about_description_2': 'Our mission is to help you look and feel your best with high-quality products.',
                'about_feature_1': 'Quality Products',
                'about_feature_2': 'Fast Delivery',
                'about_feature_3': 'Customer Support',
                'featured_title': 'Featured Products',
                'featured_subtitle': 'Discover our most popular products',
                'add_to_cart': 'Add to Cart',
                'product_phoera_foundation': 'PHOERA Foundation Kit',
                'phoera_description': 'Get flawless coverage that lasts all day! This full-coverage foundation eliminates spots, dark circles and imperfections for up to 12+ hours. The matte finish won\'t melt in the heat. Kit includes 2 foundations plus bonus items.',
                'product_hair_clips': 'Unbreakable Hair Clips',
                'clips_description': 'Stop losing clips that slip and break! These stay put all day! Super durable and comfortable, they hold any hairstyle firm. Kit with 6 pieces in nude tones.',
                'product_heat_mat': 'Heat Shield Mat',
                'heat_mat_description': 'Protect your countertops and tables from heat damage! This mat withstands high temperatures without melting or warping. Waterproof and super easy to clean - just wipe and go!',
                'product_laiou_skincare': 'LAIKOU Skincare',
                'laiou_skincare_description': 'Reduce wrinkles, spots and signs of aging. Vitamin C + 24k gold for firmer and brighter skin in 30 days.',
                'product_wrinkle_reducer': 'Wrinkle Reducer',
                'wrinkle_reducer_description': 'Eliminate wrinkles and expression lines at home. Red light + massage + 7 functions. Visible results in 2 weeks.',
                'product_sofa_cover': '3-in-1 Sofa Cover',
                'product_human_dog_bed': 'Giant Anti-Pain Bed',
                'anti_pain_bed_description': 'End back and neck pain. Giant bed that supports up to 150kg. Total comfort for relaxation.',
                'product_memory_foam_pillow': 'Portable Neck Pillow',
                'neck_pillow_description': 'End neck pain on trips. High-quality memory foam, U-shaped design for perfect cervical support. Portable and practical.',
                'sofa_cover_description': 'Revive your old sofa! This 3-in-1 cover transforms any furniture into a cozy lounger. Super easy to remove and wash - just toss in the machine!',
                'product_human_dog_bed': 'Giant Anti-Pain Bed',
                'anti_pain_bed_description': 'Say goodbye to back and neck pain! This giant bed supports up to 330 lbs and provides ultimate comfort for the best relaxation experience.',
                'product_memory_foam_pillow': 'Portable Neck Pillow',
                'neck_pillow_description': 'Travel in comfort! Premium memory foam neck pillow with perfect U-shape design provides amazing cervical support. Compact and lightweight for easy travel.',
                'contact_title': 'Contact Us',
                'contact_subtitle': 'Get in touch with us for any questions or support',
                'address_label': 'Address',
                'address_text': 'Wekwitcha Street<br>Angola - Luanda',
                'phone_label': 'Phone',
                'phone_text': '(+244) 946773551',
                'email_label': 'Email',
                'email_text': 'mojojojo946925@gmail.com',
                'business_hours_label': 'Business Hours',
                'business_hours_text': 'Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 4:00 PM<br>Sunday: Closed',
                'name_placeholder': 'Your Name',
                'email_placeholder': 'Your Email',
                'phone_placeholder': 'Your Phone',
                'message_placeholder': 'Your Message',
                'place_order_btn': 'Place Order',
                'footer_brand': '67 Beauty Hub',
                'footer_description': 'Your trusted partner for beauty and comfort products.',
                'products_label': 'Products',
                'footer_copyright': '© 2024 67 Beauty Hub. All rights reserved.',
                'business_hours_label': 'Business Hours',
                'business_hours_text': 'Mon - Fri: 9:00 AM - 6:00 PM<br>Sat: 10:00 AM - 4:00 PM',
                'name_placeholder': 'Your Name',
                'email_placeholder': 'Your Email',
                'phone_placeholder': 'Your Phone',
                'message_placeholder': 'Your Message',
                'place_order_btn': 'Send Message',
                'beauty_products': 'Beauty Products',
                'comfort_products': 'Comfort Products',
                'wellbeing': 'Well-being',
                'quick_links_label': 'Quick Links',
                'contact_info_label': 'Contact Info',
                'follow_us_label': 'Follow Us',
                // Product Prices
                'price_phoera': '$17.39',
                'price_clips': '$3.54',
                'price_mat': '$2.29',
                'price_laiou': '$5.99',
                'price_wrinkle': '$17.45',
                'price_sofa': '$34.99'
            },
            'pt-BR': {
                'page_title': 'Seção Beleza - 67 Beauty Hub',
                'beauty_section_title': 'Seção Beleza',
                'beauty_section_subtitle': 'Descubra os melhores produtos de beleza e maquiagem para realçar sua naturalidade',
                'nav_home': 'Início',
                'nav_comfort_section': 'Seção Conforto',
                'nav_benefits': 'Benefícios',
                'country_brazil': 'Brasil',
                'country_portugal': 'Portugal',
                'country_usa': 'Estados Unidos',
                'login': 'Logar',
                'badge_best_seller': 'Mais Vendido',
                'badge_new_arrival': 'Novidade',
                'badge_essential': 'Essencial',
                'badge_premium': 'Premium',
                'badge_technology': 'Tecnologia',
                'product_foundation_title': 'Kit 2 Bases PHOERA',
                'product_foundation_desc': 'Elimine manchas, olheiras e imperfeições com cobertura total que dura 12+ horas. Acabamento matte que não derrete no calor. Kit com 2 bases + extras.',
                'product_clips_title': 'Grampos de Cabelo Jacaré',
                'product_clips_desc': 'Pare de perder grampos que quebram. Estes não escorregam, não quebram e seguram qualquer penteado firme. Kit com 6 peças em tons nude.',
                'product_mat_title': 'Tapete Anti-Queimadura',
                'product_mat_desc': 'Proteja sua mesa de queimaduras e danos. Resiste a temperaturas altas sem derreter. Impermeável e fácil de limpar.',
                'product_vitamin_title': 'LAIKOU Cuidados da Pele',
                'product_vitamin_desc': 'Reduza rugas, manchas e sinais de envelhecimento. Vitamina C + ouro 24k para pele mais firme e iluminada em 30 dias.',
                'product_wrinkle_title': 'Redutor de Rugas - Terapia de Luz Vermelha',
                'product_wrinkle_desc': 'Elimine rugas e linhas de expressão em casa. Luz vermelha + massagem + 7 funções. Resultados visíveis em 2 semanas.',
                'discount_50_off': '50% OFF',
                'discount_48_off': '48% OFF',
                'discount_94_off': '94% OFF',
                'discount_70_off': '70% OFF',
                'btn_buy_now': 'Comprar Agora',
                'features_title': 'Por que escolher nossa Seção Beleza?',
                'premium_products': 'Produtos Premium',
                'premium_description': 'Selecionamos apenas os melhores produtos de beleza do mercado para garantir qualidade excepcional.',
                'fast_delivery': 'Entrega Rápida',
                'fast_delivery_description': 'Frete grátis para todo o Brasil com entrega em 15-25 dias úteis. Rastreamento completo.',
                'total_guarantee': 'Garantia Total',
                'guarantee_description': '30 dias de garantia em todos os produtos. Satisfação garantida ou seu dinheiro de volta.',
                'expert_approved': 'Aprovado por Especialistas',
                'expert_description': 'Produtos testados e aprovados por profissionais de beleza e dermatologistas.',
                'testimonials_title': 'O que nossas clientes dizem',
                'testimonial_1': '"É minha base absoluta favorita, já comprei várias vezes! Me apaixonei na primeira vez que usei, e não comprei uma base diferente desde então! É super leve mas com cobertura total, acabamento matte, e juro que dá um look aerografado! Minha pele parece que nem tem muita maquiagem!"',
                'testimonial_1_author': '- Brookie, Cliente Verificada',
                'testimonial_2': '"Os prendedores de cabelo são perfeitos para meus penteados. Qualidade excepcional!"',
                'testimonial_2_author': '- Maria Fernanda, Rio de Janeiro',
                'testimonial_3': '"O perfume Phero é divino! Recebo muitos elogios quando uso. Vale cada centavo!"',
                'testimonial_3_author': '- Juliana Santos, Belo Horizonte',
                'newsletter_title': 'Fique por dentro das novidades!',
                'newsletter_description': 'Receba ofertas exclusivas e dicas de beleza direto no seu e-mail',
                'newsletter_placeholder': 'Seu melhor e-mail',
                'newsletter_button': 'Inscrever-se',
                'footer_text': '© 2024 67 Beauty Hub - Seção Beleza. Todos os direitos reservados.',
                // Comfort Section Translations
                'comfort_page_title': 'Seção Conforto - 67 Beauty Hub',
                'comfort_section_title': 'Seção Conforto',
                'comfort_section_subtitle': 'Descubra os melhores produtos de conforto e bem-estar para sua casa',
                'product_sofa_cover_title': 'Capa de Sofá 3 em 1',
                'product_sofa_cover_desc': 'Acabe com sofás gastos e manchados. Transforme qualquer móvel em uma poltrona confortável. Remove e lava em segundos.',
                'product_dog_bed_title': 'Cama Gigante Anti-Dor',
                'product_dog_bed_desc': 'Acabe com dores nas costas e pescoço. Cama gigante que suporta até 150kg. Conforto total para relaxamento.',
                'product_pillow_title': 'Travesseiro Cervical Portátil',
                'product_pillow_desc': 'Acabe com dores no pescoço em viagens. Espuma viscoelástica de alta qualidade, design em U para suporte cervical perfeito. Portátil e prático.',
                'badge_most_popular': 'Mais Popular',
                'badge_maximum_comfort': 'Máximo Conforto',
                'badge_new': 'Novo',
                'discount_42_off': '42% DESCONTO',
                'discount_38_off': '38% DESCONTO',
                'discount_47_off': '47% DESCONTO',
                'comfort_features_title': 'Por que Escolher Nossos Produtos de Conforto?',
                'comfort_guaranteed': 'Conforto Garantido',
                'comfort_guarantee_description': 'Produtos selecionados para proporcionar máximo conforto e bem-estar em sua casa.',
                'free_delivery': 'Entrega Grátis',
                'free_delivery_description': 'Frete grátis para todo o Brasil. Receba seus produtos de conforto no conforto da sua casa.',
                'transform_home': 'Transforme Sua Casa',
                'transform_home_description': 'Produtos que transformam qualquer ambiente em um espaço aconchegante e confortável.',
                'pet_friendly': 'Pet Friendly',
                'pet_friendly_description': 'Muitos dos nossos produtos são perfeitos para você e seus pets aproveitarem juntos.',
                'testimonials_title': 'O que Nossos Clientes Dizem',
                'testimonial_1': '"A capa de sofá mudou completamente o visual da minha sala! Super fácil de colocar e lavar."',
                'testimonial_1_author': '- Maria Silva, São Paulo',
                'testimonial_2': '"O secador portátil é perfeito para minhas viagens. Leve e eficiente!"',
                'testimonial_2_author': '- João Santos, Rio de Janeiro',
                'testimonial_3': '"A caixa de areia inteligente é um sonho! Minha gata adora e eu também."',
                'testimonial_3_author': '- Ana Costa, Belo Horizonte',
                'newsletter_title': 'Fique Atualizado',
                'newsletter_description': 'Inscreva-se para receber nossas dicas de conforto e ofertas exclusivas.',
                'newsletter_placeholder': 'Digite seu e-mail',
                'newsletter_button': 'Inscrever-se',
                // Index.html Translations
                'nav_home': 'Início',
                'nav_products': 'Produtos',
                'nav_sections': 'Seções',
                'nav_beauty_section': 'Seção Beleza',
                'nav_comfort_section': 'Seção Conforto',
                'nav_about': 'Sobre',
                'nav_contact': 'Contato',
                'login_btn': 'Entrar',
                'user_name': 'Usuário',
                'my_profile': 'Meu Perfil',
                'my_reviews': 'Minhas Avaliações',
                'logout': 'Sair',
                'hero_subtitle': 'Descubra Beleza e Conforto',
                'hero_description': 'Seu parceiro de confiança para produtos premium de beleza e conforto',
                'hero_products_btn': 'Explorar Produtos',
                'hero_order_btn': 'Fazer Pedido',
                'products_title': 'Nossos Produtos',
                'products_subtitle': 'Descubra nossa seleção premium de produtos de beleza e conforto',
                'beauty_section': 'Produtos de Beleza',
                'beauty_description': 'Maquiagem, produtos para cabelo e tudo que você precisa para realçar sua beleza natural.',
                'comfort_section': 'Produtos de Conforto',
                'comfort_description': 'Itens para seu bem-estar e conforto pessoal, criando um ambiente aconchegante em casa.',
                'feature_makeup': 'Maquiagem',
                'feature_skincare': 'Cuidados da Pele',
                'feature_hair': 'Cabelo',
                'feature_wellbeing': 'Bem-estar',
                'feature_comfort': 'Conforto',
                'feature_relaxation': 'Relaxamento',
                'explore_beauty_section': 'Explorar Seção Beleza',
                'explore_comfort_section': 'Explorar Seção Conforto',
                'about_title': 'Sobre 67 Beauty Hub',
                'about_description_1': 'Somos uma empresa dedicada a fornecer os melhores produtos de beleza e conforto para nossos clientes.',
                'about_description_2': 'Nossa missão é ajudá-lo a parecer e se sentir melhor com produtos de alta qualidade.',
                'about_feature_1': 'Produtos de Qualidade',
                'about_feature_2': 'Entrega Rápida',
                'about_feature_3': 'Suporte ao Cliente',
                'featured_title': 'Produtos em Destaque',
                'featured_subtitle': 'Descubra nossos produtos mais populares',
                'add_to_cart': 'Adicionar ao Carrinho',
                'product_phoera_foundation': 'Kit Base PHOERA',
                'phoera_description': 'Obtenha cobertura perfeita que dura o dia todo! Esta base de cobertura total elimina manchas, olheiras e imperfeições por até 12+ horas. O acabamento matte não derrete no calor. Kit inclui 2 bases mais itens bônus.',
                'product_hair_clips': 'Grampos de Cabelo Inquebráveis',
                'clips_description': 'Pare de perder grampos que escorregam e quebram! Estes ficam no lugar o dia todo! Super duráveis e confortáveis, seguram qualquer penteado firme. Kit com 6 peças em tons nude.',
                'product_heat_mat': 'Tapete Protetor de Calor',
                'heat_mat_description': 'Proteja suas bancadas e mesas de danos causados pelo calor! Este tapete resiste a altas temperaturas sem derreter ou deformar. Impermeável e super fácil de limpar - apenas limpe e pronto!',
                'product_laiou_skincare': 'LAIKOU Cuidados da Pele',
                'laiou_skincare_description': 'Reduza rugas, manchas e sinais de envelhecimento. Vitamina C + ouro 24k para pele mais firme e iluminada em 30 dias.',
                'product_wrinkle_reducer': 'Redutor de Rugas',
                'wrinkle_reducer_description': 'Elimine rugas e linhas de expressão em casa. Luz vermelha + massagem + 7 funções. Resultados visíveis em 2 semanas.',
                'product_sofa_cover': 'Capa de Sofá 3 em 1',
                'sofa_cover_description': 'Reviva seu sofá velho! Esta capa 3 em 1 transforma qualquer móvel em uma poltrona aconchegante. Super fácil de remover e lavar - apenas jogue na máquina!',
                'product_human_dog_bed': 'Cama Gigante Anti-Dor',
                'anti_pain_bed_description': 'Acabe com dores nas costas e pescoço! Esta cama gigante suporta até 150kg e proporciona conforto total para a melhor experiência de relaxamento.',
                'product_memory_foam_pillow': 'Travesseiro Cervical Portátil',
                'neck_pillow_description': 'Viaje com conforto! Travesseiro cervical de espuma viscoelástica premium com design perfeito em U proporciona suporte cervical incrível. Compacto e leve para viagens fáceis.',
                'contact_title': 'Entre em Contato',
                'contact_subtitle': 'Fale conosco para qualquer dúvida ou suporte',
                'address_label': 'Endereço',
                'address_text': 'Rua Wekwitcha<br>Angola - Luanda',
                'phone_label': 'Telefone',
                'phone_text': '(+244) 946773551',
                'email_label': 'E-mail',
                'email_text': 'mojojojo946925@gmail.com',
                'business_hours_label': 'Horário de Funcionamento',
                'business_hours_text': 'Segunda - Sexta: 9:00 - 18:00<br>Sábado: 10:00 - 16:00<br>Domingo: Fechado',
                'name_placeholder': 'Seu Nome',
                'email_placeholder': 'Seu E-mail',
                'phone_placeholder': 'Seu Telefone',
                'message_placeholder': 'Sua Mensagem',
                'place_order_btn': 'Fazer Pedido',
                'footer_brand': '67 Beauty Hub',
                'footer_description': 'Seu parceiro de confiança para produtos de beleza e conforto.',
                'products_label': 'Produtos',
                'footer_copyright': '© 2024 67 Beauty Hub. Todos os direitos reservados.',
                'business_hours_label': 'Horário de Funcionamento',
                'business_hours_text': 'Seg - Sex: 9:00 - 18:00<br>Sáb: 10:00 - 16:00',
                'name_placeholder': 'Seu Nome',
                'email_placeholder': 'Seu E-mail',
                'phone_placeholder': 'Seu Telefone',
                'message_placeholder': 'Sua Mensagem',
                'place_order_btn': 'Enviar Mensagem',
                'beauty_products': 'Produtos de Beleza',
                'comfort_products': 'Produtos de Conforto',
                'wellbeing': 'Bem-estar',
                'quick_links_label': 'Links Rápidos',
                'contact_info_label': 'Informações de Contato',
                'follow_us_label': 'Siga-nos',
                // Product Prices
                'price_phoera': 'R$ 90,43',
                'price_clips': 'R$ 18,41',
                'price_mat': 'R$ 11,91',
                'price_laiou': 'R$ 31,15',
                'price_wrinkle': 'R$ 90,74',
                'price_sofa': 'R$ 181,95',
                'price_anti_pain_bed': 'R$ 415,95',
                'price_neck_pillow': 'R$ 222,04'
            },
            'pt-PT': {
                'beauty_section_title': 'Secção Beleza',
                'beauty_section_subtitle': 'Descubra os melhores produtos de beleza e maquilhagem para realçar a sua naturalidade',
                'nav_home': 'Início',
                'nav_comfort_section': 'Secção Conforto',
                'nav_benefits': 'Benefícios',
                'login': 'Entrar',
                'product_foundation_title': 'Kit 2 Bases PHOERA',
                'product_clips_title': 'Grampos de Cabelo Jacaré',
                'product_mat_title': 'Tapete Resistente ao Calor',
                'btn_buy_now': 'Comprar Agora',
                // Comfort Section Translations
                'comfort_page_title': 'Secção Conforto - 67 Beauty Hub',
                'product_sofa_cover_title': 'Capa de Sofá 3 em 1',
                'product_sofa_cover_desc': 'Acabe com sofás gastos e manchados. Transforme qualquer móvel numa poltrona confortável. Remove e lava em segundos.',
                'product_dog_bed_title': 'Cama Gigante Anti-Dor',
                'product_dog_bed_desc': 'Acabe com dores nas costas e pescoço. Cama gigante que suporta até 150kg. Conforto total para relaxamento.',
                'product_pillow_title': 'Travesseiro Cervical Portátil',
                'product_pillow_desc': 'Acabe com dores no pescoço em viagens. Espuma viscoelástica de alta qualidade, design em U para suporte cervical perfeito. Portátil e prático.',
                'badge_most_popular': 'Mais Popular',
                'badge_maximum_comfort': 'Máximo Conforto',
                'badge_new': 'Novo',
                'discount_42_off': '42% DESCONTO',
                'discount_38_off': '38% DESCONTO',
                'discount_47_off': '47% DESCONTO',
                'comfort_features_title': 'Porquê Escolher os Nossos Produtos de Conforto?',
                'comfort_guaranteed': 'Conforto Garantido',
                'comfort_guarantee_description': 'Produtos selecionados para proporcionar máximo conforto e bem-estar na sua casa.',
                'free_delivery': 'Entrega Grátis',
                'free_delivery_description': 'Envio gratuito para todo o Brasil. Receba os seus produtos de conforto no conforto da sua casa.',
                'transform_home': 'Transforme a Sua Casa',
                'transform_home_description': 'Produtos que transformam qualquer ambiente num espaço aconchegante e confortável.',
                'pet_friendly': 'Pet Friendly',
                'pet_friendly_description': 'Muitos dos nossos produtos são perfeitos para si e os seus pets aproveitarem juntos.',
                'testimonials_title': 'O que os Nossos Clientes Dizem',
                'testimonial_1': '"A capa de sofá mudou completamente o visual da minha sala! Super fácil de colocar e lavar."',
                'testimonial_1_author': '- Maria Silva, São Paulo',
                'testimonial_2': '"O secador portátil é perfeito para as minhas viagens. Leve e eficiente!"',
                'testimonial_2_author': '- João Santos, Rio de Janeiro',
                'testimonial_3': '"A caixa de areia inteligente é um sonho! A minha gata adora e eu também."',
                'testimonial_3_author': '- Ana Costa, Belo Horizonte',
                'newsletter_title': 'Fique Atualizado',
                'newsletter_description': 'Subscreva-se para receber as nossas dicas de conforto e ofertas exclusivas.',
                'newsletter_placeholder': 'Digite o seu e-mail',
                'newsletter_button': 'Subscrever',
                'comfort_section_title': 'Secção Conforto',
                'comfort_section_subtitle': 'Descubra os melhores produtos de conforto e bem-estar para a sua casa',
                'footer_text': '© 2025 67 Beauty Hub - Secção Conforto. Todos os direitos reservados.',
                // Index.html Translations
                'nav_home': 'Início',
                'nav_products': 'Produtos',
                'nav_sections': 'Secções',
                'nav_beauty_section': 'Secção Beleza',
                'nav_comfort_section': 'Secção Conforto',
                'nav_about': 'Sobre',
                'nav_contact': 'Contacto',
                'login_btn': 'Entrar',
                'user_name': 'Utilizador',
                'my_profile': 'O Meu Perfil',
                'my_reviews': 'As Minhas Avaliações',
                'logout': 'Sair',
                'hero_subtitle': 'Descubra Beleza e Conforto',
                'hero_description': 'O seu parceiro de confiança para produtos premium de beleza e conforto',
                'hero_products_btn': 'Explorar Produtos',
                'hero_order_btn': 'Fazer Pedido',
                'products_title': 'Os Nossos Produtos',
                'products_subtitle': 'Descubra a nossa seleção premium de produtos de beleza e conforto',
                'beauty_section': 'Produtos de Beleza',
                'beauty_description': 'Maquilhagem, produtos para cabelo e tudo o que precisa para realçar a sua beleza natural.',
                'comfort_section': 'Produtos de Conforto',
                'comfort_description': 'Itens para o seu bem-estar e conforto pessoal, criando um ambiente aconchegante em casa.',
                'feature_makeup': 'Maquilhagem',
                'feature_skincare': 'Cuidados da Pele',
                'feature_hair': 'Cabelo',
                'feature_wellbeing': 'Bem-estar',
                'feature_comfort': 'Conforto',
                'feature_relaxation': 'Relaxamento',
                'explore_beauty_section': 'Explorar Secção Beleza',
                'explore_comfort_section': 'Explorar Secção Conforto',
                'about_title': 'Sobre 67 Beauty Hub',
                'about_description_1': 'Somos uma empresa dedicada a fornecer os melhores produtos de beleza e conforto aos nossos clientes.',
                'about_description_2': 'A nossa missão é ajudá-lo a parecer e sentir-se melhor com produtos de alta qualidade.',
                'about_feature_1': 'Produtos de Qualidade',
                'about_feature_2': 'Entrega Rápida',
                'about_feature_3': 'Suporte ao Cliente',
                'featured_title': 'Produtos em Destaque',
                'featured_subtitle': 'Descubra os nossos produtos mais populares',
                'add_to_cart': 'Adicionar ao Carrinho',
                'product_phoera_foundation': 'Kit Base PHOERA',
                'phoera_description': 'Obtenha cobertura perfeita que dura o dia todo! Esta base de cobertura total elimina manchas, olheiras e imperfeições por até 12+ horas. O acabamento mate não derrete no calor. Kit inclui 2 bases mais itens bónus.',
                'product_hair_clips': 'Grampos de Cabelo Inquebráveis',
                'clips_description': 'Pare de perder grampos que escorregam e quebram! Estes ficam no lugar o dia todo! Super duráveis e confortáveis, seguram qualquer penteado firme. Kit com 6 peças em tons nude.',
                'product_heat_mat': 'Tapete Protetor de Calor',
                'heat_mat_description': 'Proteja as suas bancadas e mesas de danos causados pelo calor! Este tapete resiste a altas temperaturas sem derreter ou deformar. Impermeável e super fácil de limpar - apenas limpe e pronto!',
                'product_laiou_skincare': 'LAIKOU Cuidados da Pele',
                'laiou_skincare_description': 'Reduza rugas, manchas e sinais de envelhecimento. Vitamina C + ouro 24k para pele mais firme e iluminada em 30 dias.',
                'product_wrinkle_reducer': 'Redutor de Rugas',
                'wrinkle_reducer_description': 'Elimine rugas e linhas de expressão em casa. Luz vermelha + massagem + 7 funções. Resultados visíveis em 2 semanas.',
                'product_sofa_cover': 'Capa de Sofá 3 em 1',
                'sofa_cover_description': 'Reviva o seu sofá velho! Esta capa 3 em 1 transforma qualquer móvel numa poltrona aconchegante. Super fácil de remover e lavar - apenas jogue na máquina!',
                'product_human_dog_bed': 'Cama Gigante Anti-Dor',
                'anti_pain_bed_description': 'Acabe com dores nas costas e pescoço! Esta cama gigante suporta até 150kg e proporciona conforto total para a melhor experiência de relaxamento.',
                'product_memory_foam_pillow': 'Travesseiro Cervical Portátil',
                'neck_pillow_description': 'Viaje com conforto! Travesseiro cervical de espuma viscoelástica premium com design perfeito em U proporciona suporte cervical incrível. Compacto e leve para viagens fáceis.',
                'contact_title': 'Entre em Contacto',
                'contact_subtitle': 'Fale connosco para qualquer dúvida ou suporte',
                'address_label': 'Endereço',
                'address_text': 'Rua Wekwitcha<br>Angola - Luanda',
                'phone_label': 'Telefone',
                'phone_text': '(+244) 946773551',
                'email_label': 'E-mail',
                'email_text': 'mojojojo946925@gmail.com',
                'business_hours_label': 'Horário de Funcionamento',
                'business_hours_text': 'Segunda - Sexta: 9:00 - 18:00<br>Sábado: 10:00 - 16:00<br>Domingo: Fechado',
                'name_placeholder': 'O Seu Nome',
                'email_placeholder': 'O Seu E-mail',
                'phone_placeholder': 'O Seu Telefone',
                'message_placeholder': 'A Sua Mensagem',
                'place_order_btn': 'Fazer Pedido',
                'footer_brand': '67 Beauty Hub',
                'footer_description': 'O seu parceiro de confiança para produtos de beleza e conforto.',
                'products_label': 'Produtos',
                'footer_copyright': '© 2024 67 Beauty Hub. Todos os direitos reservados.',
                'quick_links_label': 'Links Rápidos',
                'contact_info_label': 'Informações de Contacto',
                'follow_us_label': 'Siga-nos',
                // Product Prices
                'price_phoera': '€16,00',
                'price_clips': '€3,26',
                'price_mat': '€2,11',
                'price_laiou': '€5,51',
                'price_wrinkle': '€16,05',
                'price_sofa': '€32,19',
                'price_anti_pain_bed': '€73,59',
                'price_neck_pillow': '€39,28'
            }
        };

        const currentTranslations = translations[language] || translations['en-US'];
        
        // Aplicar traduções aos elementos com otimização para móvel
        if (isMobile) {
            // Otimização para móvel: batch updates
            console.log('📱 Aplicando otimizações para dispositivo móvel...');
            this.applyMobileOptimizedTranslations(currentTranslations);
        } else {
            // Aplicação normal para desktop
            Object.keys(currentTranslations).forEach(key => {
                const elements = document.querySelectorAll(`[data-translate-key="${key}"]`);
                console.log(`🔍 Procurando elementos para ${key}: encontrados ${elements.length}`);
                
                if (elements.length === 0) {
                    console.log(`❌ Nenhum elemento encontrado para ${key}`);
                } else {
                    elements.forEach(element => {
                        const oldText = element.textContent;
                        element.textContent = currentTranslations[key];
                        console.log(`✅ Traduzido ${key}: "${oldText}" → "${currentTranslations[key]}"`);
                    });
                }
            });
        }
        
        // APLICAR CONVERSÃO DE PREÇOS
        this.convertPrices(language);
        
        console.log(`✅ Traduções diretas aplicadas para: ${language}`);
    }

    // Método otimizado para dispositivos móveis
    applyMobileOptimizedTranslations(translations) {
        console.log('📱 Aplicando traduções otimizadas para móvel...');
        
        // Usar requestAnimationFrame para melhor performance
        requestAnimationFrame(() => {
            const elementsToUpdate = [];
            
            // Coletar todos os elementos que precisam ser atualizados
            Object.keys(translations).forEach(key => {
                const elements = document.querySelectorAll(`[data-translate-key="${key}"]`);
                elements.forEach(element => {
                    elementsToUpdate.push({
                        element: element,
                        newText: translations[key]
                    });
                });
            });
            
            // Aplicar todas as mudanças em batch
            elementsToUpdate.forEach(({ element, newText }) => {
                element.textContent = newText;
            });
            
            console.log(`📱 ${elementsToUpdate.length} elementos atualizados em batch para móvel`);
        });
    }

    // Método para converter preços baseado no idioma/moeda
    convertPrices(language) {
        console.log(`💰 Convertendo preços para: ${language}`);
        
        const exchangeRates = {
            'USD': 1.0,
            'BRL': 5.2,  // 1 USD = 5.2 BRL
            'EUR': 0.92  // 1 USD = 0.92 EUR
        };
        
        const currencySymbols = {
            'USD': '$',
            'BRL': 'R$',
            'EUR': '€'
        };
        
        const currencyMap = {
            'en-US': 'USD',
            'pt-BR': 'BRL',
            'pt-PT': 'EUR'
        };
        
        const currency = currencyMap[language] || 'USD';
        const rate = exchangeRates[currency];
        const symbol = currencySymbols[currency];
        
        console.log(`💰 Moeda: ${currency}, Taxa: ${rate}, Símbolo: ${symbol}`);
        
        // Função para detectar se o preço já está na moeda correta
        const isAlreadyInCurrency = (priceText, targetCurrency) => {
            // Detecção ULTRA robusta para evitar conversões múltiplas
            if (targetCurrency === 'BRL' && priceText.includes('R$')) return true;
            if (targetCurrency === 'EUR' && priceText.includes('€')) return true;
            if (targetCurrency === 'USD' && priceText.includes('$') && !priceText.includes('R$')) return true;
            
            // Verificar se o preço já foi convertido (valores muito altos)
            const priceValue = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            if (priceValue > 1000 && targetCurrency === 'BRL') return true; // Preços BRL muito altos
            if (priceValue > 100 && targetCurrency === 'EUR') return true; // Preços EUR muito altos
            
            // PROTEÇÃO ADICIONAL: Verificar se contém vírgula (formato BRL)
            if (targetCurrency === 'BRL' && priceText.includes(',')) return true;
            
            // PROTEÇÃO ADICIONAL: Verificar se contém símbolo de moeda
            if (priceText.includes('R$') || priceText.includes('€') || priceText.includes('$')) return true;
            
            return false;
        };
        
        // RESET DE PREÇOS PARA VALORES ORIGINAIS USD
        const originalPrices = {
            'price_phoera': '$17.39',
            'price_clips': '$3.54',
            'price_mat': '$2.29',
            'price_laiou': '$5.99',
            'price_wrinkle': '$17.45',
            'price_sofa': '$34.99'
        };
        
        // FORÇAR RESET DE TODOS OS PREÇOS ABSURDOS
        const currentPrices = document.querySelectorAll('.price-current');
        currentPrices.forEach(priceElement => {
            const priceKey = priceElement.getAttribute('data-translate-key');
            if (priceKey && originalPrices[priceKey]) {
                const currentText = priceElement.textContent;
                const currentValue = parseFloat(currentText.replace(/[^0-9.]/g, ''));
                const originalValue = parseFloat(originalPrices[priceKey].replace('$', ''));
                
                // Reset se valor for > 10x o original
                if (currentValue > originalValue * 10) {
                    priceElement.textContent = originalPrices[priceKey];
                    console.log(`💰 FORÇANDO RESET: ${currentText} → ${originalPrices[priceKey]}`);
                }
            }
        });
        
        // Converter preços atuais (após reset)
        currentPrices.forEach(priceElement => {
            const currentText = priceElement.textContent;
            
            // RESET para valor original USD se necessário
            const priceKey = priceElement.getAttribute('data-translate-key');
            if (priceKey && originalPrices[priceKey]) {
                const originalPrice = originalPrices[priceKey];
                const originalValue = parseFloat(originalPrice.replace('$', ''));
                const currentValue = parseFloat(currentText.replace(/[^0-9.]/g, ''));
                
                // Se o valor atual é muito diferente do original, reset
                if (Math.abs(currentValue - originalValue) > originalValue * 0.5) {
                    priceElement.textContent = originalPrice;
                    console.log(`💰 Reset para valor original: ${originalPrice}`);
                }
                
                // PROTEÇÃO ADICIONAL: Reset se valor for absurdamente alto
                if (currentValue > originalValue * 10) {
                    priceElement.textContent = originalPrice;
                    console.log(`💰 Reset por valor absurdo: ${currentValue} → ${originalPrice}`);
                }
            }
            
            // Verificar se já está na moeda correta
            if (isAlreadyInCurrency(currentText, currency)) {
                console.log(`💰 Preço já está em ${currency}: ${currentText}`);
                return;
            }
            
            const priceValue = parseFloat(currentText.replace(/[^0-9.]/g, ''));
            
            // Proteção adicional: não converter se o valor for muito alto
            if (priceValue > 1000 && currency === 'BRL') {
                console.log(`💰 Preço BRL muito alto, pulando conversão: ${currentText}`);
                return;
            }
            
            if (!isNaN(priceValue) && priceValue > 0) {
                const convertedPrice = (priceValue * rate).toFixed(2);
                const formattedPrice = currency === 'BRL' ? 
                    `${symbol} ${convertedPrice.replace('.', ',')}` :
                    `${symbol}${convertedPrice}`;
                
                priceElement.textContent = formattedPrice;
                console.log(`💰 Preço convertido: ${currentText} → ${formattedPrice}`);
            }
        });
        
        // Converter preços originais
        const originalPriceElements = document.querySelectorAll('.price-original');
        originalPriceElements.forEach(priceElement => {
            const originalText = priceElement.textContent;
            
            // Verificar se já está na moeda correta
            if (isAlreadyInCurrency(originalText, currency)) {
                console.log(`💰 Preço original já está em ${currency}: ${originalText}`);
                return;
            }
            
            const priceValue = parseFloat(originalText.replace(/[^0-9.]/g, ''));
            
            // Proteção adicional: não converter se o valor for muito alto
            if (priceValue > 1000 && currency === 'BRL') {
                console.log(`💰 Preço BRL muito alto, pulando conversão: ${currentText}`);
                return;
            }
            
            if (!isNaN(priceValue) && priceValue > 0) {
                const convertedPrice = (priceValue * rate).toFixed(2);
                const formattedPrice = currency === 'BRL' ? 
                    `${symbol} ${convertedPrice.replace('.', ',')}` :
                    `${symbol}${convertedPrice}`;
                
                priceElement.textContent = formattedPrice;
                console.log(`💰 Preço original convertido: ${originalText} → ${formattedPrice}`);
            }
        });
        
        console.log(`✅ Conversão de preços aplicada para: ${currency}`);
    }

    // Método para aplicar traduções na página atual
    applyCurrentPageTranslations() {
        console.log('🔄 Aplicando traduções na página atual...');

        // Detectar dispositivo móvel para ajustar timeout
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const timeout = isMobile ? 200 : 1000; // Timeout menor para móvel
        
        console.log(`📱 Timeout ajustado para ${isMobile ? 'móvel' : 'desktop'}: ${timeout}ms`);

        // Aguardar tempo otimizado baseado no dispositivo
        setTimeout(() => {
            const currentLanguage = this.getCurrentLanguage();
            console.log(`🌍 Aplicando traduções para idioma: ${currentLanguage}`);

            // APLICAR TRADUÇÕES DIRETAMENTE
            this.applyDirectTranslations(currentLanguage);

            // Disparar evento personalizado para sistemas de tradução específicos
            const translationEvent = new CustomEvent('applyTranslations', {
                detail: { language: currentLanguage }
            });
            document.dispatchEvent(translationEvent);

            // Disparar evento de mudança de idioma
            const languageChangedEvent = new CustomEvent('languageChanged', {
                detail: { language: currentLanguage }
            });
            document.dispatchEvent(languageChangedEvent);

            // Aplicar apenas a tradução correta baseada no idioma atual
            switch (currentLanguage) {
                case 'en-US':
                case 'en':
            if (window.englishTranslationSystem) {
                console.log('🇺🇸 Aplicando traduções em inglês...');
                window.englishTranslationSystem.translateCurrentPage();
            }
                    break;
                case 'pt-BR':
            if (window.portugueseBrTranslationSystem) {
                console.log('🇧🇷 Aplicando traduções em português brasileiro...');
                window.portugueseBrTranslationSystem.translateCurrentPage();
            }
                    break;
                case 'pt-PT':
            if (window.portuguesePtTranslationSystem) {
                console.log('🇵🇹 Aplicando traduções em português europeu...');
                window.portuguesePtTranslationSystem.translateCurrentPage();
                    }
                    break;
                default:
                    console.log('⚠️ Idioma não reconhecido, aplicando inglês como fallback');
                    if (window.englishTranslationSystem) {
                        window.englishTranslationSystem.translateCurrentPage();
                    }
            }

            console.log('✅ Aplicação de traduções concluída');
        }, 100);
    }

    // Método para mudar idioma com recarregamento de página
    changeLanguageWithReload(newLanguage) {
        console.log(`🌍 Mudando idioma para: ${newLanguage} com recarregamento`);
        
        // Salvar novo idioma
        localStorage.setItem('userLanguage', newLanguage);
        
        // Recarregar página para aplicar traduções
        window.location.reload();
    }
}

// Inicializar controlador quando DOM estiver carregado (apenas uma vez)
if (!window.languageControllerInitialized) {
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Sistema de Controle de Idiomas...');

        // Inicializar controlador apenas se não existir
        if (!window.languageController) {
    window.languageController = new LanguageController();
        }

    // Aguardar inicialização completa
    setTimeout(() => {
        if (window.languageController) {
            console.log('✅ Sistema de idiomas inicializado com sucesso');

            // Expor função global para atualização manual de idioma
            window.updateLanguage = function(language) {
                if (window.languageController) {
                    window.languageController.updateLanguage(language);
                }
            };

            console.log('🌍 Função updateLanguage() disponível globalmente');
        }
        }, 1000); // Timeout fixo para evitar erro de escopo
});
    
    window.languageControllerInitialized = true;
}

// Exportar para uso global
window.LanguageController = LanguageController;
