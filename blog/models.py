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
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='rascunho')
    data_publicacao = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titulo)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo
