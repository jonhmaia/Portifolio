from django import forms
from django.core.exceptions import ValidationError
from .models import Projeto, Tecnologia, ImagemProjeto

class ProjetoAdminForm(forms.ModelForm):
    """Formulário customizado para o admin de Projetos"""
    
    class Meta:
        model = Projeto
        fields = '__all__'
        widgets = {
            'titulo': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Digite o título do projeto...',
                'maxlength': 200
            }),
            'subtitulo': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Subtítulo opcional do projeto...',
                'maxlength': 200
            }),
            'descricao_curta': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Breve descrição do projeto (máx. 300 caracteres)',
                'rows': 3,
                'maxlength': 300
            }),
            'descricao_completa': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Descrição detalhada do projeto...',
                'rows': 8
            }),
            'link_repositorio': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://github.com/usuario/projeto'
            }),
            'link_deploy': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://projeto.vercel.app'
            }),
            'status': forms.Select(attrs={
                'class': 'form-select'
            }),
            'data_inicio': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'data_conclusao': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'ordem': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 0,
                'step': 1
            }),
            'destaque': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'ativo': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'imagem_principal': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            })
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Customizar o campo de tecnologias
        self.fields['tecnologias'].widget = forms.CheckboxSelectMultiple(attrs={'class': 'tech-checkbox'})
        self.fields['tecnologias'].queryset = Tecnologia.objects.filter(ativo=True).order_by('categoria', 'nome')
        
        # Adicionar classes CSS aos campos
        for field_name, field in self.fields.items():
            if field_name not in ['destaque', 'ativo', 'tecnologias']:
                if 'class' not in field.widget.attrs:
                    field.widget.attrs['class'] = 'form-control'
                    
        # Configurar help texts personalizados
        self.fields['titulo'].help_text = 'Nome principal que será exibido no portfólio'
        self.fields['descricao_curta'].help_text = 'Resumo que aparece nos cards de projeto (máx. 300 caracteres)'
        self.fields['descricao_completa'].help_text = 'Descrição detalhada com informações técnicas e objetivos'
        self.fields['imagem_principal'].help_text = 'Imagem de destaque do projeto (recomendado: 800x600px)'
        self.fields['link_repositorio'].help_text = 'URL do código fonte (GitHub, GitLab, etc.)'
        self.fields['link_deploy'].help_text = 'URL do projeto em produção'
        self.fields['ordem'].help_text = 'Ordem de exibição (menor número = maior prioridade)'
        self.fields['destaque'].help_text = 'Marcar para destacar na página inicial'
        
    def clean_titulo(self):
        titulo = self.cleaned_data.get('titulo')
        if titulo:
            titulo = titulo.strip()
            if len(titulo) < 3:
                raise ValidationError('O título deve ter pelo menos 3 caracteres.')
        return titulo
        
    def clean_descricao_curta(self):
        descricao = self.cleaned_data.get('descricao_curta')
        if descricao:
            descricao = descricao.strip()
            if len(descricao) < 10:
                raise ValidationError('A descrição curta deve ter pelo menos 10 caracteres.')
            if len(descricao) > 300:
                raise ValidationError('A descrição curta não pode ter mais de 300 caracteres.')
        return descricao
        
    def clean_link_repositorio(self):
        link = self.cleaned_data.get('link_repositorio')
        if link:
            if not (link.startswith('http://') or link.startswith('https://')):
                raise ValidationError('O link do repositório deve começar com http:// ou https://')
        return link
        
    def clean_link_deploy(self):
        link = self.cleaned_data.get('link_deploy')
        if link:
            if not (link.startswith('http://') or link.startswith('https://')):
                raise ValidationError('O link do deploy deve começar com http:// ou https://')
        return link
        
    def clean(self):
        cleaned_data = super().clean()
        data_inicio = cleaned_data.get('data_inicio')
        data_conclusao = cleaned_data.get('data_conclusao')
        
        if data_inicio and data_conclusao:
            if data_inicio > data_conclusao:
                raise ValidationError('A data de início não pode ser posterior à data de conclusão.')
                
        return cleaned_data

class TecnologiaAdminForm(forms.ModelForm):
    """Formulário customizado para o admin de Tecnologias"""
    
    class Meta:
        model = Tecnologia
        fields = '__all__'
        widgets = {
            'nome': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: Python, React, Django...'
            }),
            'categoria': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: Backend, Frontend, Database...'
            }),
            'icone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: fab fa-python, fab fa-react...'
            }),
            'cor': forms.TextInput(attrs={
                'class': 'form-control',
                'type': 'color',
                'style': 'height: 40px;'
            }),
            'ativo': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Help texts personalizados
        self.fields['nome'].help_text = 'Nome da tecnologia ou ferramenta'
        self.fields['categoria'].help_text = 'Categoria para organização (Backend, Frontend, etc.)'
        self.fields['icone'].help_text = 'Classe do ícone Font Awesome (ex: fab fa-python)'
        self.fields['cor'].help_text = 'Cor representativa da tecnologia'
        
    def clean_nome(self):
        nome = self.cleaned_data.get('nome')
        if nome:
            nome = nome.strip().title()
        return nome
        
    def clean_categoria(self):
        categoria = self.cleaned_data.get('categoria')
        if categoria:
            categoria = categoria.strip().title()
        return categoria

class ImagemProjetoAdminForm(forms.ModelForm):
    """Formulário customizado para o admin de Imagens de Projeto"""
    
    class Meta:
        model = ImagemProjeto
        fields = '__all__'
        widgets = {
            'legenda': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Descrição da imagem...'
            }),
            'ordem': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 0,
                'step': 1
            }),
            'ativo': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Help texts personalizados
        self.fields['imagem'].help_text = 'Imagem do projeto (recomendado: 800x600px)'
        self.fields['legenda'].help_text = 'Descrição opcional da imagem'
        self.fields['ordem'].help_text = 'Ordem de exibição na galeria'