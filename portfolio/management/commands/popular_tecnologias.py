from django.core.management.base import BaseCommand
from portfolio.models import Tecnologia

class Command(BaseCommand):
    help = 'Popula o banco de dados com tecnologias padrão'
    
    def handle(self, *args, **options):
        tecnologias_data = [
            # Linguagens de Programação
            {'nome': 'Python', 'categoria': 'linguagem', 'icone': 'fab fa-python', 'cor': '#3776ab'},
            {'nome': 'JavaScript', 'categoria': 'linguagem', 'icone': 'fab fa-js-square', 'cor': '#f7df1e'},
            {'nome': 'TypeScript', 'categoria': 'linguagem', 'icone': 'fab fa-js-square', 'cor': '#3178c6'},
            {'nome': 'Java', 'categoria': 'linguagem', 'icone': 'fab fa-java', 'cor': '#ed8b00'},
            {'nome': 'C#', 'categoria': 'linguagem', 'icone': 'fas fa-code', 'cor': '#239120'},
            {'nome': 'PHP', 'categoria': 'linguagem', 'icone': 'fab fa-php', 'cor': '#777bb4'},
            {'nome': 'Go', 'categoria': 'linguagem', 'icone': 'fas fa-code', 'cor': '#00add8'},
            {'nome': 'Rust', 'categoria': 'linguagem', 'icone': 'fas fa-code', 'cor': '#000000'},
            
            # Frameworks Web
            {'nome': 'Django', 'categoria': 'framework', 'icone': 'fas fa-server', 'cor': '#092e20'},
            {'nome': 'Flask', 'categoria': 'framework', 'icone': 'fas fa-server', 'cor': '#000000'},
            {'nome': 'React', 'categoria': 'framework', 'icone': 'fab fa-react', 'cor': '#61dafb'},
            {'nome': 'Vue.js', 'categoria': 'framework', 'icone': 'fab fa-vuejs', 'cor': '#4fc08d'},
            {'nome': 'Angular', 'categoria': 'framework', 'icone': 'fab fa-angular', 'cor': '#dd0031'},
            {'nome': 'Next.js', 'categoria': 'framework', 'icone': 'fas fa-code', 'cor': '#000000'},
            {'nome': 'Express.js', 'categoria': 'framework', 'icone': 'fab fa-node-js', 'cor': '#339933'},
            {'nome': 'Laravel', 'categoria': 'framework', 'icone': 'fab fa-laravel', 'cor': '#ff2d20'},
            {'nome': 'Spring Boot', 'categoria': 'framework', 'icone': 'fas fa-leaf', 'cor': '#6db33f'},
            
            # Bibliotecas
            {'nome': 'Bootstrap', 'categoria': 'biblioteca', 'icone': 'fab fa-bootstrap', 'cor': '#7952b3'},
            {'nome': 'Tailwind CSS', 'categoria': 'biblioteca', 'icone': 'fas fa-palette', 'cor': '#06b6d4'},
            {'nome': 'jQuery', 'categoria': 'biblioteca', 'icone': 'fas fa-code', 'cor': '#0769ad'},
            {'nome': 'Pandas', 'categoria': 'biblioteca', 'icone': 'fas fa-chart-bar', 'cor': '#150458'},
            {'nome': 'NumPy', 'categoria': 'biblioteca', 'icone': 'fas fa-calculator', 'cor': '#013243'},
            {'nome': 'TensorFlow', 'categoria': 'biblioteca', 'icone': 'fas fa-brain', 'cor': '#ff6f00'},
            
            # Bancos de Dados
            {'nome': 'PostgreSQL', 'categoria': 'banco', 'icone': 'fas fa-database', 'cor': '#336791'},
            {'nome': 'MySQL', 'categoria': 'banco', 'icone': 'fas fa-database', 'cor': '#4479a1'},
            {'nome': 'SQLite', 'categoria': 'banco', 'icone': 'fas fa-database', 'cor': '#003b57'},
            {'nome': 'MongoDB', 'categoria': 'banco', 'icone': 'fas fa-leaf', 'cor': '#47a248'},
            {'nome': 'Redis', 'categoria': 'banco', 'icone': 'fas fa-database', 'cor': '#dc382d'},
            
            # Ferramentas
            {'nome': 'Git', 'categoria': 'ferramenta', 'icone': 'fab fa-git-alt', 'cor': '#f05032'},
            {'nome': 'GitHub', 'categoria': 'ferramenta', 'icone': 'fab fa-github', 'cor': '#181717'},
            {'nome': 'Docker', 'categoria': 'ferramenta', 'icone': 'fab fa-docker', 'cor': '#2496ed'},
            {'nome': 'AWS', 'categoria': 'ferramenta', 'icone': 'fab fa-aws', 'cor': '#ff9900'},
            {'nome': 'Heroku', 'categoria': 'ferramenta', 'icone': 'fas fa-cloud', 'cor': '#430098'},
            {'nome': 'Railway', 'categoria': 'ferramenta', 'icone': 'fas fa-train', 'cor': '#0b0d0e'},
            {'nome': 'VS Code', 'categoria': 'ferramenta', 'icone': 'fas fa-code', 'cor': '#007acc'},
            {'nome': 'Figma', 'categoria': 'ferramenta', 'icone': 'fab fa-figma', 'cor': '#f24e1e'},
            
            # Outros
            {'nome': 'HTML5', 'categoria': 'outros', 'icone': 'fab fa-html5', 'cor': '#e34f26'},
            {'nome': 'CSS3', 'categoria': 'outros', 'icone': 'fab fa-css3-alt', 'cor': '#1572b6'},
            {'nome': 'Sass', 'categoria': 'outros', 'icone': 'fab fa-sass', 'cor': '#cc6699'},
            {'nome': 'Node.js', 'categoria': 'outros', 'icone': 'fab fa-node-js', 'cor': '#339933'},
            {'nome': 'API REST', 'categoria': 'outros', 'icone': 'fas fa-exchange-alt', 'cor': '#25d366'},
            {'nome': 'GraphQL', 'categoria': 'outros', 'icone': 'fas fa-project-diagram', 'cor': '#e10098'},
        ]
        
        created_count = 0
        updated_count = 0
        
        for tech_data in tecnologias_data:
            tecnologia, created = Tecnologia.objects.get_or_create(
                nome=tech_data['nome'],
                defaults={
                    'categoria': tech_data['categoria'],
                    'icone': tech_data['icone'],
                    'cor': tech_data['cor'],
                    'ativo': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Tecnologia criada: {tecnologia.nome}')
                )
            else:
                # Atualiza dados se já existe
                tecnologia.categoria = tech_data['categoria']
                tecnologia.icone = tech_data['icone']
                tecnologia.cor = tech_data['cor']
                tecnologia.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Tecnologia atualizada: {tecnologia.nome}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Processo concluído!\n'
                f'📦 {created_count} tecnologias criadas\n'
                f'🔄 {updated_count} tecnologias atualizadas\n'
                f'📊 Total: {created_count + updated_count} tecnologias processadas'
            )
        )