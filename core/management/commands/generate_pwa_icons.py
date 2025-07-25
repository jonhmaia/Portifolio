from django.core.management.base import BaseCommand
from django.conf import settings
import os
from PIL import Image, ImageDraw, ImageFont
import io

class Command(BaseCommand):
    help = 'Gera ícones PWA em diferentes tamanhos'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            default='static/images/profile.jpg',
            help='Caminho para a imagem fonte'
        )
        parser.add_argument(
            '--output-dir',
            type=str,
            default='static/images/',
            help='Diretório de saída para os ícones'
        )
    
    def handle(self, *args, **options):
        source_path = options['source']
        output_dir = options['output_dir']
        
        # Tamanhos de ícones necessários para PWA
        icon_sizes = [
            16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512,
            # Tamanhos específicos do Windows
            70, 150, 310
        ]
        
        # Tamanhos especiais
        special_sizes = {
            '310x150': (310, 150),  # Wide tile para Windows
        }
        
        try:
            # Verifica se o arquivo fonte existe
            if not os.path.exists(source_path):
                self.stdout.write(
                    self.style.ERROR(f'Arquivo fonte não encontrado: {source_path}')
                )
                return
            
            # Cria o diretório de saída se não existir
            os.makedirs(output_dir, exist_ok=True)
            
            # Abre a imagem fonte
            with Image.open(source_path) as source_img:
                # Converte para RGBA se necessário
                if source_img.mode != 'RGBA':
                    source_img = source_img.convert('RGBA')
                
                # Gera ícones quadrados
                for size in icon_sizes:
                    self._generate_square_icon(source_img, size, output_dir)
                
                # Gera ícones especiais
                for name, (width, height) in special_sizes.items():
                    self._generate_special_icon(source_img, width, height, name, output_dir)
                
                # Gera favicon.ico
                self._generate_favicon(source_img, output_dir)
                
                # Gera ícone SVG para Safari
                self._generate_safari_icon(output_dir)
            
            self.stdout.write(
                self.style.SUCCESS('Ícones PWA gerados com sucesso!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erro ao gerar ícones: {str(e)}')
            )
    
    def _generate_square_icon(self, source_img, size, output_dir):
        """
        Gera um ícone quadrado
        """
        # Redimensiona mantendo proporção
        icon = source_img.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Cria uma nova imagem com fundo transparente
        final_icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Centraliza a imagem
        x = (size - icon.width) // 2
        y = (size - icon.height) // 2
        final_icon.paste(icon, (x, y), icon if icon.mode == 'RGBA' else None)
        
        # Salva o ícone
        output_path = os.path.join(output_dir, f'icon-{size}x{size}.png')
        final_icon.save(output_path, 'PNG', optimize=True)
        
        self.stdout.write(f'Gerado: {output_path}')
    
    def _generate_special_icon(self, source_img, width, height, name, output_dir):
        """
        Gera ícones com dimensões especiais
        """
        # Cria uma nova imagem com as dimensões especificadas
        icon = Image.new('RGBA', (width, height), (59, 130, 246, 255))  # Cor tema
        
        # Redimensiona a imagem fonte para caber
        source_copy = source_img.copy()
        source_copy.thumbnail((width // 2, height // 2), Image.Resampling.LANCZOS)
        
        # Centraliza a imagem
        x = (width - source_copy.width) // 2
        y = (height - source_copy.height) // 2
        icon.paste(source_copy, (x, y), source_copy if source_copy.mode == 'RGBA' else None)
        
        # Salva o ícone
        output_path = os.path.join(output_dir, f'icon-{name}.png')
        icon.save(output_path, 'PNG', optimize=True)
        
        self.stdout.write(f'Gerado: {output_path}')
    
    def _generate_favicon(self, source_img, output_dir):
        """
        Gera favicon.ico com múltiplos tamanhos
        """
        favicon_sizes = [16, 32, 48]
        icons = []
        
        for size in favicon_sizes:
            icon = source_img.copy()
            icon.thumbnail((size, size), Image.Resampling.LANCZOS)
            
            # Cria uma nova imagem quadrada
            final_icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            x = (size - icon.width) // 2
            y = (size - icon.height) // 2
            final_icon.paste(icon, (x, y), icon if icon.mode == 'RGBA' else None)
            
            icons.append(final_icon)
        
        # Salva como favicon.ico
        output_path = os.path.join(output_dir, 'favicon.ico')
        icons[0].save(
            output_path,
            format='ICO',
            sizes=[(icon.width, icon.height) for icon in icons],
            append_images=icons[1:]
        )
        
        self.stdout.write(f'Gerado: {output_path}')
    
    def _generate_safari_icon(self, output_dir):
        """
        Gera ícone SVG para Safari pinned tab
        """
        svg_content = '''
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#3b82f6"/>
            <text x="50" y="60" font-family="Arial, sans-serif" font-size="40" 
                  font-weight="bold" text-anchor="middle" fill="white">JM</text>
        </svg>
        '''
        
        output_path = os.path.join(output_dir, 'safari-pinned-tab.svg')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content.strip())
        
        self.stdout.write(f'Gerado: {output_path}')