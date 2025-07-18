from django.contrib import admin
from .models import Projeto

@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'ativo', 'data_criacao')
    list_filter = ('ativo', 'data_criacao')
    search_fields = ('titulo', 'descricao', 'tecnologias')
    list_editable = ('ativo',)
    readonly_fields = ('data_criacao',)
