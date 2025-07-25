from django import forms
from .models import Artigo

class ArtigoForm(forms.ModelForm):
    class Meta:
        model = Artigo
        fields = ['titulo', 'resumo', 'conteudo', 'imagem_destaque', 'status']
        widgets = {
            'titulo': forms.TextInput(attrs={
                'class': 'admin-input',
                'placeholder': 'Digite o título do artigo'
            }),
            'resumo': forms.Textarea(attrs={
                'class': 'admin-input admin-textarea',
                'placeholder': 'Escreva um resumo do artigo (máximo 300 caracteres)',
                'rows': 3,
                'maxlength': 300
            }),
            'conteudo': forms.Textarea(attrs={
                'class': 'admin-input admin-textarea',
                'placeholder': 'Conteúdo do artigo (HTML permitido)',
                'rows': 20
            }),
            'imagem_destaque': forms.ClearableFileInput(attrs={
                'class': 'admin-input',
                'accept': 'image/*'
            }),
            'status': forms.Select(attrs={
                'class': 'admin-select'
            })
        }
        labels = {
            'titulo': 'Título do Artigo',
            'resumo': 'Resumo',
            'conteudo': 'Conteúdo',
            'imagem_destaque': 'Imagem de Destaque',
            'status': 'Status de Publicação'
        }
        help_texts = {
            'resumo': 'Um breve resumo que aparecerá na listagem de artigos',
            'imagem_destaque': 'Imagem que aparecerá como destaque do artigo (formatos: JPG, PNG, WebP)',
            'conteudo': 'Use HTML para formatação avançada do conteúdo'
        }