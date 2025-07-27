from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Tecnologia(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    icone = models.CharField(max_length=100, blank=True, help_text="Classe do ícone (ex: fab fa-python)")
    cor = models.CharField(max_length=7, default='#000000', help_text="Cor em hexadecimal")
    categoria = models.CharField(max_length=50, choices=[
        ('linguagem', 'Linguagem de Programação'),
        ('framework', 'Framework'),
        ('biblioteca', 'Biblioteca'),
        ('banco', 'Banco de Dados'),
        ('ferramenta', 'Ferramenta'),
        ('outros', 'Outros'),
    ], default='outros')
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Tecnologia'
        verbose_name_plural = 'Tecnologias'
        ordering = ['categoria', 'nome']
    
    def __str__(self):
        return self.nome

class Projeto(models.Model):
    titulo = models.CharField(max_length=100, verbose_name='Título')
    subtitulo = models.CharField(max_length=150, blank=True, verbose_name='Subtítulo')
    descricao_curta = models.TextField(max_length=300, blank=True, verbose_name='Descrição Curta', help_text="Resumo do projeto (máx. 300 caracteres)")
    descricao_completa = models.TextField(blank=True, verbose_name='Descrição Completa')
    imagem_principal = models.ImageField(upload_to='projetos/', blank=True, null=True, verbose_name='Imagem Principal')
    tecnologias = models.ManyToManyField(Tecnologia, verbose_name='Tecnologias')
    link_repositorio = models.URLField(blank=True, null=True, verbose_name='Link do Repositório')
    link_deploy = models.URLField(blank=True, null=True, verbose_name='Link do Deploy/Demo')
    
    # Campos de destaque e organização
    destaque = models.BooleanField(default=False, verbose_name='Projeto em Destaque', help_text="Marque para exibir na página inicial")
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem de Exibição', help_text="Ordem de exibição (0 = primeiro)")
    
    # Status e datas
    status = models.CharField(max_length=20, choices=[
        ('desenvolvimento', 'Em Desenvolvimento'),
        ('concluido', 'Concluído'),
        ('pausado', 'Pausado'),
        ('arquivado', 'Arquivado'),
    ], default='desenvolvimento')
    ativo = models.BooleanField(default=True, verbose_name='Ativo', help_text="Marque para exibir o projeto no site")

    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name='Última Atualização')
    
    class Meta:
        verbose_name = 'Projeto'
        verbose_name_plural = 'Projetos'
        ordering = ['-destaque', 'ordem', '-data_criacao']
    
    def __str__(self):
        return self.titulo
    
    @property
    def tecnologias_lista(self):
        return ", ".join([tech.nome for tech in self.tecnologias.all()])

class ImagemProjeto(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='imagens', verbose_name='Projeto')
    imagem = models.ImageField(upload_to='projetos/galeria/', verbose_name='Imagem')
    legenda = models.CharField(max_length=200, blank=True, verbose_name='Legenda')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    data_upload = models.DateTimeField(auto_now_add=True, verbose_name='Data do Upload')
    
    class Meta:
        verbose_name = 'Imagem do Projeto'
        verbose_name_plural = 'Imagens dos Projetos'
        ordering = ['ordem', 'data_upload']
    
    def __str__(self):
        return f"{self.projeto.titulo} - Imagem {self.ordem}"
