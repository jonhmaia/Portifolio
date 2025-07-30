from django.conf import settings
from django.utils.translation import gettext_lazy as _


class SEOConfig:
    """Configurações de SEO para o site"""
    
    # Meta tags padrão
    DEFAULT_TITLE = "</> João Marcos Maia - Engenheiro de Software"
    DEFAULT_DESCRIPTION = "Portfólio de João Marcos Maia - Engenheiro de Software especializado em Django, Python e desenvolvimento web. Projetos inovadores e soluções tecnológicas."
    DEFAULT_KEYWORDS = "João Marcos Maia, desenvolvedor, engenheiro software, Django, Python, JavaScript, portfólio, projetos, tecnologia, inovação"
    
    # Open Graph padrão
    DEFAULT_OG_TITLE = "</> João Marcos Maia - Engenheiro de Software"
    DEFAULT_OG_DESCRIPTION = "Portfólio profissional com projetos inovadores em Django, Python e tecnologias web modernas."
    DEFAULT_OG_IMAGE = "/static/images/profile.jpg"
    
    # Twitter Cards padrão
    DEFAULT_TWITTER_TITLE = "</> João Marcos Maia - Engenheiro de Software"
    DEFAULT_TWITTER_DESCRIPTION = "Portfólio profissional com projetos inovadores em Django, Python e tecnologias web modernas."
    DEFAULT_TWITTER_IMAGE = "/static/images/profile.jpg"
    DEFAULT_TWITTER_CREATOR = "@joaomarcosmaia"
    
    # Configurações específicas por página
    PAGE_CONFIGS = {
        'home': {
            'title': "</> João Marcos Maia - Portfólio Profissional",
            'description': "Bem-vindo ao portfólio de João Marcos Maia. Engenheiro de Software especializado em Django, Python e desenvolvimento web full-stack.",
            'keywords': "portfólio, João Marcos Maia, engenheiro software, Django, Python, desenvolvimento web, projetos",
            'og_title': "</> Portfólio João Marcos Maia - Engenheiro de Software",
            'og_description': "Explore meus projetos e experiência em desenvolvimento web com Django, Python e tecnologias modernas.",
        },
        'projects': {
            'title': "</> Projetos - João Marcos Maia",
            'description': "Explore meus projetos de desenvolvimento web, aplicações Django, sistemas Python e soluções tecnológicas inovadoras.",
            'keywords': "projetos, Django, Python, desenvolvimento web, aplicações, sistemas, tecnologia",
            'og_title': "</> Projetos de João Marcos Maia",
            'og_description': "Conheça meus projetos em Django, Python e desenvolvimento web full-stack.",
        },
        'blog': {
            'title': "</> Blog - João Marcos Maia",
            'description': "Artigos sobre desenvolvimento web, Django, Python, boas práticas de programação e tendências tecnológicas.",
            'keywords': "blog, artigos, Django, Python, desenvolvimento web, programação, tecnologia",
            'og_title': "</> Blog de João Marcos Maia",
            'og_description': "Artigos e insights sobre desenvolvimento web, Django e tecnologias modernas.",
        },
        'curriculum': {
            'title': "</> Currículo - João Marcos Maia",
            'description': "Currículo profissional de João Marcos Maia - Experiência em engenharia de software, Django, Python e liderança técnica.",
            'keywords': "currículo, experiência, engenheiro software, Django, Python, liderança técnica",
            'og_title': "</> Currículo de João Marcos Maia",
            'og_description': "Experiência profissional e competências técnicas em engenharia de software.",
        },
    }
    
    @classmethod
    def get_page_config(cls, page_name):
        """Retorna configuração SEO para uma página específica"""
        config = cls.PAGE_CONFIGS.get(page_name, {})
        
        return {
            'title': config.get('title', cls.DEFAULT_TITLE),
            'description': config.get('description', cls.DEFAULT_DESCRIPTION),
            'keywords': config.get('keywords', cls.DEFAULT_KEYWORDS),
            'og_title': config.get('og_title', cls.DEFAULT_OG_TITLE),
            'og_description': config.get('og_description', cls.DEFAULT_OG_DESCRIPTION),
            'og_image': config.get('og_image', cls.DEFAULT_OG_IMAGE),
            'twitter_title': config.get('twitter_title', cls.DEFAULT_TWITTER_TITLE),
            'twitter_description': config.get('twitter_description', cls.DEFAULT_TWITTER_DESCRIPTION),
            'twitter_image': config.get('twitter_image', cls.DEFAULT_TWITTER_IMAGE),
            'twitter_creator': cls.DEFAULT_TWITTER_CREATOR,
            'structured_data': {
                'name': 'João Marcos Maia',
                'job_title': "Engenheiro de Software",
                'description': "Desenvolvedor especializado em Django, Python e tecnologias web modernas",
                'image': cls.DEFAULT_OG_IMAGE,
            }
        }
    
    @classmethod
    def get_project_seo(cls, project):
        """Gera SEO específico para um projeto"""
        title = f"{project.titulo} - João Marcos Maia"
        description = project.descricao_curta or project.descricao_completa[:160]
        keywords = f"{project.titulo}, projeto, {', '.join([tech.nome for tech in project.tecnologias.all()[:5]])}"
        
        return {
            'title': title,
            'description': description,
            'keywords': keywords,
            'og_title': title,
            'og_description': description,
            'og_image': project.imagem_principal.url if project.imagem_principal else cls.DEFAULT_OG_IMAGE,
            'twitter_title': title,
            'twitter_description': description,
            'twitter_image': project.imagem_principal.url if project.imagem_principal else cls.DEFAULT_TWITTER_IMAGE,
            'twitter_creator': cls.DEFAULT_TWITTER_CREATOR,
        }
    
    @classmethod
    def get_article_seo(cls, article):
        """Gera SEO específico para um artigo"""
        title = f"{article.titulo} - Blog João Marcos Maia"
        description = article.resumo or article.conteudo[:160]
        keywords = f"{article.titulo}, blog, artigo, João Marcos Maia, desenvolvimento web"
        
        return {
            'title': title,
            'description': description,
            'keywords': keywords,
            'og_title': title,
            'og_description': description,
            'og_image': article.imagem_destaque.url if article.imagem_destaque else cls.DEFAULT_OG_IMAGE,
            'twitter_title': title,
            'twitter_description': description,
            'twitter_image': article.imagem_destaque.url if article.imagem_destaque else cls.DEFAULT_TWITTER_IMAGE,
            'twitter_creator': cls.DEFAULT_TWITTER_CREATOR,
            'structured_data': {
                'name': 'João Marcos Maia',
                'job_title': str(_("Engenheiro de Software")),
                'description': str(_("Desenvolvedor especializado em Django, Python e tecnologias web modernas")),
                'image': cls.DEFAULT_OG_IMAGE,
            }
        }


def get_seo_context(page_name=None, obj=None):
    """Função helper para obter contexto SEO"""
    if obj:
        if hasattr(obj, 'titulo') and hasattr(obj, 'tecnologias'):
            # É um projeto
            return SEOConfig.get_project_seo(obj)
        elif hasattr(obj, 'titulo') and hasattr(obj, 'conteudo'):
            # É um artigo
            return SEOConfig.get_article_seo(obj)
    
    return SEOConfig.get_page_config(page_name)