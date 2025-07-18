from django.contrib import admin
from .models import Artigo

@admin.register(Artigo)
class ArtigoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'autor', 'status', 'data_publicacao')
    list_filter = ('status', 'data_publicacao', 'autor')
    search_fields = ('titulo', 'conteudo')
    list_editable = ('status',)
    readonly_fields = ('slug', 'data_publicacao')
    prepopulated_fields = {'slug': ('titulo',)}
