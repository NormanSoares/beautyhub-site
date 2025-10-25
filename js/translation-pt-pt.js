// Sistema de Tradução para Português Europeu - Beauty Hub
// Traduções específicas para idioma português de Portugal

class PortuguesePtTranslationSystem {
    constructor() {
        this.language = 'pt-PT';
        this.currency = 'EUR';
        this.translations = this.getAllTranslations();
        this.init();
    }

    async init() {
        console.log('🇵🇹 Inicializando Sistema de Tradução em Português (Portugal)...');
        this.translateCurrentPage();
        console.log('✅ Sistema de Tradução em Português (Portugal) inicializado');
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
        console.log('📝 Traduzindo placeholders de formulários...');
        
        // Traduzir placeholders com data-translate-key
        const inputsWithKey = document.querySelectorAll('input[data-translate-key], textarea[data-translate-key]');
        console.log(`📋 Encontrados ${inputsWithKey.length} inputs com data-translate-key`);

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

        // Traduzir placeholders normais (fallback)
        const inputs = document.querySelectorAll('input[placeholder]:not([data-translate-key]), textarea[placeholder]:not([data-translate-key])');
        console.log(`📋 Encontrados ${inputs.length} inputs com placeholder normal`);

        inputs.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                const translatedPlaceholder = this.getTranslation(placeholder.toLowerCase().replace(/\s+/g, '_'));
                if (translatedPlaceholder) {
                    input.setAttribute('placeholder', translatedPlaceholder);
                }
            }
        });

        console.log('✅ Tradução de placeholders concluída');
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
            // Traduções comuns a todas as páginas
            'checkout_title': 'Finalizar Compra',
            'first_name': 'Nome',
            'last_name': 'Apelido',
            'email': 'E-mail',
            'phone': 'Telefone',
            'address': 'Endereço',
            'city': 'Cidade',
            'state': 'Distrito',
            'zip_code': 'Código Postal',
            'country': 'País',
            'payment_method': 'Método de Pagamento',
            'observations': 'Observações',
            'total': 'Total',
            'checkout_button': 'Finalizar Compra',
            'order_summary': 'Resumo do Pedido',
            'choose_color': 'Escolha a cor:',
            'choose_size': 'Escolha o tamanho:',
            'basic_offer': 'Oferta Básica',
            'premium_offer': 'Oferta Premium',
            'complete_offer': 'Oferta Completa',
            'nav_home': 'Início',
            'nav_beauty_section': 'Seção Beleza',
            'nav_products': 'Produtos',
            'nav_sections': 'Secções',
            'nav_about': 'Sobre',
            'nav_contact': 'Contacto',
            'hero_subtitle': 'Produtos de Beleza e Conforto',
            'hero_description': 'Descubra a nossa seleção exclusiva de produtos de beleza e conforto, cuidadosamente escolhidos para a sua rotina de cuidados pessoais.',
            'hero_products_btn': 'Os Nossos Produtos',
            'hero_order_btn': 'Fazer Encomenda',
            'products_title': 'Os Nossos Produtos',
            'beauty_section': 'Produtos de Beleza',
            'beauty_description': 'Maquilhagem, produtos capilares e tudo o que precisa para realçar a sua beleza natural.',
            
            // Beauty Store - Novos elementos
            'beauty_hero_title': 'Produtos de Beleza',
            'beauty_hero_subtitle': 'Descubra a nossa coleção premium de beleza',
            'beauty_products_title': 'Produtos em Destaque',
            'product_foundation_title': '2 Pack PHOERA Foundation',
            'product_foundation_desc': 'Elimine manchas, olheiras e imperfeições com cobertura total que dura 12+ horas. Acabamento mate que não derrete no calor. Kit com 2 bases + extras.',
            'product_clips_title': 'Alligator Hair Clips',
            'product_clips_desc': 'Pare de perder ganchos que quebram. Estes não escorregam, não quebram e seguram qualquer penteado firme. Kit com 6 peças em tons nude.',
            'product_mat_title': 'Heat-Resistant Mat',
            'product_mat_desc': 'Proteja a sua mesa de queimaduras e danos. Resiste a altas temperaturas sem derreter. À prova de água e fácil de limpar.',
            'product_vitamin_title': 'LAIKOU Skincare',
            'product_vitamin_desc': 'Reduza rugas, manchas e sinais de envelhecimento. Vitamina C + ouro 24k para pele mais firme e iluminada em 30 dias.',
            'product_wrinkle_title': 'Vara de Skincare - Wrinkle Reducer - Red Light Therapy',
            'product_wrinkle_desc': 'Elimine rugas e linhas de expressão em casa. Luz vermelha + massagem + 7 funções. Resultados visíveis em 2 semanas.',
            'btn_add_to_cart': 'Adicionar ao Carrinho',
            'btn_buy_now': 'Comprar Agora',
            'discount_blanket': '42% DESCONTO',
            'discount_pillow': '38% DESCONTO',
            'discount_organizer': '47% DESCONTO',
            'badge_bestseller': 'Mais Vendido',
            'badge_new': 'Novidade',
            'badge_essential': 'Essencial',
            'badge_premium': 'Premium',
            'badge_technology': 'Tecnologia',
            'nav_benefits': 'Benefícios',
            'features_title': 'Por que escolher a nossa Seção Beleza?',
            'feature_premium_title': 'Produtos Premium',
            'feature_premium_desc': 'Selecionamos apenas os melhores produtos de beleza do mercado para garantir qualidade excepcional.',
            'feature_shipping_title': 'Entrega Rápida',
            'feature_shipping_desc': 'Portes grátis para todo o Brasil com entrega em 15-25 dias úteis. Rastreamento completo.',
            'feature_guarantee_title': 'Garantia Total',
            'feature_guarantee_desc': '30 dias de garantia em todos os produtos. Satisfação garantida ou o seu dinheiro de volta.',
            'feature_expert_title': 'Aprovado por Especialistas',
            'feature_expert_desc': 'Produtos testados e aprovados por profissionais de beleza e dermatologistas.',
            'testimonials_title': 'O que as nossas clientes dizem',
            'testimonial_1': '"É a minha base absoluta favorita, já comprei várias vezes! Apaixonei-me na primeira vez que usei, e não comprei uma base diferente desde então! É super leve mas com cobertura total, acabamento matte, e juro que dá um look aerografado! A minha pele parece que nem tem muita maquilhagem!"',
            'testimonial_1_author': '- Brookie, Cliente Verificada',
            'testimonial_2': '"Os prendedores de cabelo são perfeitos para os meus penteados. Qualidade excepcional!"',
            'testimonial_2_author': '- Maria Fernanda, Rio de Janeiro',
            'testimonial_3': '"O perfume Phero é divino! Recebo muitos elogios quando uso. Vale cada cêntimo!"',
            'testimonial_3_author': '- Juliana Santos, Belo Horizonte',
            'newsletter_title': 'Fique a par das novidades!',
            'newsletter_description': 'Receba ofertas exclusivas e dicas de beleza diretamente no seu e-mail',
            'newsletter_placeholder': 'O seu melhor e-mail',
            'newsletter_button': 'Subscrever',
            'page_title': 'Seção Beleza - 67 Beauty Hub',
            'price_foundation_current': '€91,68',
            'price_foundation_original': '€183,36',
            'discount_foundation': '50% OFF',
            'discount_clips': '48% OFF',
            'discount_mat': '94% OFF',
            'discount_vitamin': '70% OFF',
            'discount_wrinkle': '50% OFF',
            'discount_blanket': '42% DESCONTO',
            'discount_pillow': '38% DESCONTO',
            'discount_organizer': '47% DESCONTO',
            'comfort_page_title': 'Seção Conforto - 67 Beauty Hub',
            'user_name': 'Utilizador',
            'site_name': '67 BEAUTY HUB',
            'login_text': 'Entrar',
            'my_profile_text': 'O Meu Perfil',
            'my_reviews_text': 'As Minhas Avaliações',
            'logout_text': 'Sair',
            'footer_copyright': '© 2024 67 Beauty Hub. Todos os direitos reservados.',
            'comfort_section': 'Produtos de Conforto',
            'comfort_section_description': 'Transforme a sua casa num oásis de conforto e bem-estar com os nossos produtos exclusivos',
            'comfort_description': 'Itens para o seu bem-estar e conforto pessoal, criando um ambiente acolhedor em casa.',
            'feature_makeup': 'Maquilhagem',
            'feature_skincare': 'Cuidados de Pele',
            'feature_hair': 'Cabelos',
            'nav_beauty_section': 'Secção Beleza',
            'nav_comfort_section': 'Secção Conforto',
            'about_title': 'Sobre o 67 Beauty Hub',
            'about_description_1': 'No 67 Beauty Hub, acreditamos que a beleza e o conforto andam juntos. Somos especialistas em produtos de beleza e conforto, oferecendo uma seleção cuidadosa de itens para a sua rotina diária.',
            'about_description_2': 'Com anos de experiência no mercado, selecionamos apenas produtos de alta qualidade que combinam eficácia, segurança e conforto para si.',
            'about_feature_1': 'Produtos de alta qualidade',
            'about_feature_2': 'Seleção cuidadosa',
            'about_feature_3': 'Entrega rápida e segura',
            'featured_title': 'Produtos em Destaque',
            'featured_subtitle': 'Os nossos produtos mais procurados e recomendados',
            'header': 'Secção Beleza',
            'subtitle': 'Descubra os melhores produtos de beleza e maquilhagem para realçar a sua beleza natural',
            'beauty_section_title': 'Secção Beleza',
            'beauty_section_subtitle': 'Descubra os melhores produtos de beleza e maquilhagem para realçar a sua beleza natural',
            'features_title': 'Por que escolher a nossa Secção Beleza?',
            'premium_products': 'Produtos Premium',
            'premium_description': 'Selecionamos apenas os melhores produtos de beleza do mercado para garantir qualidade excecional.',
            'fast_delivery': 'Entrega Rápida',
            'fast_delivery_description': 'Portes grátis para toda a Europa com entrega em 7-15 dias úteis. Rastreamento completo.',
            'total_guarantee': 'Garantia Total',
            'guarantee_description': '30 dias de garantia em todos os produtos. Satisfação garantida ou o seu dinheiro de volta.',
            'expert_approved': 'Aprovado por Especialistas',
            'expert_description': 'Produtos testados e aprovados por profissionais de beleza e dermatologistas.',
            'testimonials_title': 'O que as nossas clientes dizem',
            'footer_text': '© 2025 67 Beauty Hub - Secção Beleza. Todos os direitos reservados.',
            'welcome_title': 'Bem-vindo à 67 Beauty Hub',
            'login_subtitle': 'Faça login para continuar a navegar',
            'email_label': 'Email',
            'email_placeholder': 'seu@email.com',
            'password_label': 'Palavra-passe',
            'password_placeholder': 'A sua palavra-passe',
            'name_label': 'Nome',
            'name_placeholder': 'O seu nome',
            'login_btn': 'Entrar',
            'skip_btn': 'Saltar',
            'login_success_title': 'Login realizado com sucesso!',
            'login_success_message': 'Bem-vindo à 67 Beauty Hub!',
            'testimonial_1': 'Esta é a minha base absoluta favorita, já comprei várias vezes! Apaixonei-me na primeira vez que usei, e não comprei uma base diferente desde então! É super leve mas com cobertura total, acabamento matte, e juro que dá um look aerografado! A minha pele parece que nem tem muita maquilhagem!',
            'testimonial_1_author': '- Brookie, Cliente Verificada',
            'testimonial_2': 'Os prendedores de cabelo são perfeitos para os meus penteados. Qualidade excecional!',
            'testimonial_2_author': '- Maria Fernanda, Rio de Janeiro',
            'testimonial_3': 'O perfume Phero é divino! Recebo muitos elogios quando uso. Vale cada cêntimo!',
            'testimonial_3_author': '- Juliana Santos, Belo Horizonte',
            'product_phoera_foundation': 'Kit 2 Bases PHOERA',
            'product_hair_clips': 'Grampos Anti-Quebra',
            'product_heat_mat': 'Tapete Protetor de Calor',
            'product_laiou_skincare': 'LAIKOU Cuidados da Pele',
            'product_wrinkle_reducer': 'Redutor de Rugas - Terapia de Luz Vermelha',
            'product_sofa_cover': 'Capa Sofá 3 em 1',
            'product_human_dog_bed': 'Cama Gigante Anti-Dor',
            'product_memory_foam_pillow': 'Travesseiro Cervical Portátil',
            'feature_wellbeing': 'Bem-estar',
            'feature_comfort': 'Conforto',
            'feature_relaxation': 'Relaxamento',
            'contact_title': 'Contacte-nos',
            'contact_subtitle': 'Faça o seu pedido e descubra os melhores produtos de beleza e conforto',
            'address_label': 'Morada',
            'phone_label': 'Telefone',
            'email_label': 'Email',
            'business_hours_label': 'Horário de Funcionamento',
            'business_hours_text': 'Seg - Sex: 9h às 19h<br>Sáb: 9h às 17h',
            'name_placeholder': 'O seu nome',
            'email_placeholder': 'O seu email',
            'phone_placeholder': 'O seu telefone',
            'message_placeholder': 'A sua mensagem',
            'place_order_btn': 'Fazer Pedido',
            'footer_brand': '67 Beauty Hub',
            'footer_description': 'Onde beleza encontra conforto. A sua jornada de bem-estar começa aqui.',
            'quick_links_label': 'Links Rápidos',
            'nav_home': 'Início',
            'nav_about': 'Sobre',
            'nav_contact': 'Contacto',
            'products_label': 'Produtos',
            'beauty_products': 'Produtos de Beleza',
            'comfort_products': 'Produtos de Conforto',
            'wellbeing': 'Bem-estar',
            'footer_copyright': '© 2025 67 Beauty Hub. Todos os direitos reservados.',
            'phoera_description': 'Elimine manchas, olheiras e imperfeições com cobertura total que dura 12+ horas. Acabamento mate que não derrete no calor. Kit com 2 bases + extras.',
            'clips_description': 'Pare de perder ganchos que quebram. Estes não escorregam, não quebram e seguram qualquer penteado firme. Kit com 6 peças em tons nude.',
            'heat_mat_description': 'Proteja a sua mesa de queimaduras e danos. Resiste a altas temperaturas sem derreter. À prova de água e fácil de limpar.',
            'golden_sakura_description': 'Reduza rugas, manchas e sinais de envelhecimento. Vitamina C + ouro 24k para pele mais firme e iluminada em 30 dias.',
            'wrinkle_wand_description': 'Elimine rugas e linhas de expressão em casa. Luz vermelha + massagem + 7 funções. Resultados visíveis em 2 semanas.',
            'sofa_cover_description': 'Acabe com sofás gastos e manchados. Transforme qualquer móvel numa poltrona confortável. Remove e lava em segundos.',
            'anti_pain_bed_description': 'Acabe com dores nas costas e pescoço. Cama gigante que suporta até 150kg. Conforto total para relaxamento.',
            'neck_pillow_description': 'Acabe com dores no pescoço em viagens. Espuma viscoelástica de alta qualidade, design em U para suporte cervical perfeito. Portátil e prático.',
            'hair_clips_description': 'Cansada de grampos que escorregam e quebram? Estes ficam no lugar o dia todo! Super duráveis e confortáveis, eles prendem qualquer penteado. Kit com 6 peças em tons nude neutros que combinam com qualquer look.',
            'laiou_skincare_description': 'Reverta o envelhecimento! Este poderoso kit anti-idade reduz rugas, manchas escuras e linhas finas. Fórmula de Vitamina C + ouro 24k firma e ilumina a pele em apenas 30 dias para um brilho jovem.',
            'wrinkle_reducer_description': 'Obtenha resultados de spa em casa! Esta varinha anti-rugas 7 em 1 usa terapia de luz vermelha e massagem para suavizar rugas e linhas finas. Veja melhorias visíveis em apenas 2 semanas!',
            'comfort_guarantee_description': 'Produtos selecionados para proporcionar máximo conforto e bem-estar na sua casa.',
            'free_delivery_description': 'Envio grátis em todo o país. Receba os seus produtos de conforto no conforto da sua casa.',
            'transform_home_description': 'Produtos que transformam qualquer ambiente num espaço aconchegante e confortável.',
            'pet_friendly_description': 'Muitos dos nossos produtos são perfeitos para si e os seus animais de estimação aproveitarem juntos.',
            'your_review': 'A Sua Avaliação:',
            'photo_optional': 'Foto (opcional):',
            'submit_review': 'Enviar Avaliação',
            'cancel': 'Cancelar',
            'please_login_review': 'Por favor, faça login para adicionar uma avaliação.',
            'review_added_success': 'Avaliação adicionada com sucesso!',
            'paypal_option': 'PayPal',
            'pix_option': 'PIX',
            'fill_email_payment': 'Por favor, preencha o email e selecione um método de pagamento.',
            'paypal_processed': 'Pagamento PayPal foi processado. Receberá um email de confirmação em breve.',
            'pix_instructions': 'Receberá instruções de pagamento PIX por email. Após o pagamento, o seu pedido será processado.',
            'confirmation_email': 'Receberá um email de confirmação em breve.',
            'payment_approved': 'Pagamento aprovado!',
            'payment_error': 'Erro no processamento do pagamento. Tente novamente.',
            'paypal_error': 'Erro do PayPal. Tente novamente ou escolha outro método de pagamento.',
            'slider_title': 'Veja a Transformação Instantânea',
            'slider_description': 'Arraste o slider para ver os incríveis resultados antes e depois com a Base PHOERA',
            'slider_results_title': 'Resultados reais de clientes reais!',
            'slider_results_description': 'Isto é o que pode alcançar com apenas uma aplicação da Base PHOERA.',
            'country_brazil': 'Brasil',
            'country_portugal': 'Portugal',
            'country_usa': 'Estados Unidos',
            
            // Discount badges
            'discount_50_off': '50% OFF',
            'discount_48_off': '48% OFF',
            'discount_94_off': '94% OFF',
            'discount_70_off': '70% OFF',
            'btn_buy_now': 'Comprar Agora',
            
            // Product badges
            'badge_best_seller': 'Mais Vendido',
            'badge_new_arrival': 'Novidade',
            'badge_essential': 'Essencial',
            'badge_premium': 'Premium',
            'badge_technology': 'Tecnologia',
            
            'explore_beauty_section': 'Explorar Secção Beleza',
            'explore_comfort_section': 'Explorar Secção Conforto',
            
            // Comfort Store Products
            'product_sofa_cover_title': 'Capa Sofá 3 em 1',
            'product_sofa_cover_desc': 'Acabe com sofás gastos e manchados. Transforme qualquer móvel numa poltrona confortável. Remove e lava em segundos.',
            'product_dog_bed_title': 'Cama Gigante Anti-Dor',
            'product_dog_bed_desc': 'Acabe com dores nas costas e pescoço. Cama gigante que suporta até 150kg. Conforto total para relaxamento.',
            'product_pillow_title': 'Travesseiro Cervical Portátil',
            'product_pillow_desc': 'Acabe com dores no pescoço em viagens. Espuma viscoelástica de alta qualidade, design em U para suporte cervical perfeito. Portátil e prático.',
            
            // Comfort Store Badges
            'badge_most_popular': 'Mais Popular',
            'badge_maximum_comfort': 'Conforto Máximo',
            'badge_new': 'Novidade',
            
            // Comfort Store Discounts
            'discount_42_off': '42% OFF',
            'discount_38_off': '38% OFF',
            'discount_47_off': '47% OFF',
            
            // Comfort Store Features
            'comfort_features_title': 'Por que escolher a nossa Secção Conforto?',
            'comfort_guaranteed': 'Conforto Garantido',
            'comfort_guarantee_description': 'Produtos selecionados para proporcionar máximo conforto e bem-estar na sua casa.',
            'free_delivery': 'Entrega Grátis',
            'free_delivery_description': 'Envio grátis em todo o país. Receba os seus produtos de conforto no conforto da sua casa.',
            'transform_home': 'Transforme a Sua Casa',
            'transform_home_description': 'Produtos que transformam qualquer ambiente num espaço aconchegante e confortável.',
            'pet_friendly': 'Amigável para Animais',
            'pet_friendly_description': 'Muitos dos nossos produtos são perfeitos para si e os seus animais de estimação aproveitarem juntos.'
        };
    }

    // Método para traduzir conteúdo dinâmico
    translateContent(key) {
        return this.getTranslation(key);
    }
    
    // Função removida - estilos já definidos no CSS
}

// Inicializar sistema quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (!window.portuguesePtTranslationSystem) {
        window.portuguesePtTranslationSystem = new PortuguesePtTranslationSystem();
    }
});

// Exportar para uso global
window.PortuguesePtTranslationSystem = PortuguesePtTranslationSystem;
