from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Artigo(models.Model):
    STATUS_CHOICES = (
        ('rascunho', 'Rascunho'),
        ('publicado', 'Publicado'),
    )
    titulo = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='artigos_blog')
    conteudo = models.TextField()
    imagem_destaque = models.ImageField(upload_to='blog/imagens/', blank=True, null=True, verbose_name='Imagem de Destaque')
    resumo = models.TextField(max_length=300, blank=True, help_text='Resumo do artigo (máximo 300 caracteres)')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='rascunho')
    visualizacoes = models.PositiveIntegerField(default=0)
    data_publicacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titulo)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo
