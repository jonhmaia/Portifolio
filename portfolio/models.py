from django.db import models

class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    imagem = models.ImageField(upload_to='projetos/')
    tecnologias = models.CharField(max_length=200, help_text="Ex: Python, Django, React")
    link_repositorio = models.URLField(blank=True, null=True)
    link_deploy = models.URLField(blank=True, null=True)
    ativo = models.BooleanField(default=True, help_text="Marque para exibir o projeto no site.")
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
