# Create your models here.
from django.db import models

class SobreMim(models.Model):
    nome = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100)
    bio = models.TextField()
    tecnologias = models.CharField(max_length=255)  # Ex: "Python, Django, Supabase"

    def __str__(self):
        return self.nome
