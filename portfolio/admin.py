from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Projeto, Tecnologia, ImagemProjeto

# Configuração do site admin
admin.site.site_header = "Administração do Portfólio"
admin.site.site_title = "Admin Portfólio"
admin.site.index_title = "Painel de Controle"

@admin.register(Tecnologia)
class TecnologiaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'cor_preview', 'icone', 'ativo')
    list_filter = ('categoria', 'ativo')
    search_fields = ('nome', 'categoria')
    list_editable = ('ativo',)
    ordering = ('categoria', 'nome')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'categoria', 'ativo')
        }),
        ('Aparência', {
            'fields': ('icone', 'cor'),
            'description': 'Configure a aparência visual da tecnologia'
        }),
    )
    
    def cor_preview(self, obj):
        if obj.cor:
            return format_html(
                '<div style="width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc; display: inline-block;"></div> {}',
                obj.cor, obj.cor
            )
        return '-'
    cor_preview.short_description = 'Cor'

class ImagemProjetoInline(admin.TabularInline):
    model = ImagemProjeto
    extra = 1
    fields = ('imagem', 'legenda', 'ordem', 'ativo')
    readonly_fields = ('data_upload',)
    
    def get_extra(self, request, obj=None, **kwargs):
        if obj:
            return 0
        return 1

@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = (
        'titulo', 'status_badge', 'destaque_badge', 'tecnologias_preview', 
        'destaque', 'ativo', 'ordem', 'data_criacao'
    )
    list_filter = (
        'status', 'destaque', 'ativo', 'tecnologias', 
        'data_criacao', 'data_conclusao'
    )
    search_fields = ('titulo', 'subtitulo', 'descricao_curta', 'descricao_completa')
    list_editable = ('ativo', 'destaque', 'ordem')
    readonly_fields = ('data_criacao', 'data_atualizacao', 'tecnologias_lista')
    filter_horizontal = ('tecnologias',)
    inlines = [ImagemProjetoInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'subtitulo', 'status')
        }),
        ('Descrições', {
            'fields': ('descricao_curta', 'descricao_completa'),
            'classes': ('wide',)
        }),
        ('Mídia', {
            'fields': ('imagem_principal',)
        }),
        ('Tecnologias', {
            'fields': ('tecnologias', 'tecnologias_lista'),
            'description': 'Selecione as tecnologias utilizadas no projeto'
        }),
        ('Links', {
            'fields': ('link_repositorio', 'link_deploy'),
            'classes': ('collapse',)
        }),
        ('Configurações de Exibição', {
            'fields': ('destaque', 'ordem', 'ativo'),
            'description': 'Configure como o projeto será exibido no site'
        }),
        ('Datas', {
            'fields': ('data_inicio', 'data_conclusao'),
            'classes': ('collapse',)
        }),
        ('Informações do Sistema', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'desenvolvimento': '#ffc107',
            'concluido': '#28a745',
            'pausado': '#6c757d',
            'arquivado': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def destaque_badge(self, obj):
        if obj.destaque:
            return format_html(
                '<span style="background-color: #007bff; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">⭐ DESTAQUE</span>'
            )
        return '-'
    destaque_badge.short_description = 'Destaque'
    
    def tecnologias_preview(self, obj):
        techs = obj.tecnologias.all()[:3]
        if techs:
            preview = ', '.join([tech.nome for tech in techs])
            if obj.tecnologias.count() > 3:
                preview += f' (+{obj.tecnologias.count() - 3})'
            return preview
        return '-'
    tecnologias_preview.short_description = 'Tecnologias'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('tecnologias')
    
    actions = ['marcar_como_destaque', 'remover_destaque', 'ativar_projetos', 'desativar_projetos']
    
    def marcar_como_destaque(self, request, queryset):
        updated = queryset.update(destaque=True)
        self.message_user(request, f'{updated} projeto(s) marcado(s) como destaque.')
    marcar_como_destaque.short_description = "Marcar projetos selecionados como destaque"
    
    def remover_destaque(self, request, queryset):
        updated = queryset.update(destaque=False)
        self.message_user(request, f'{updated} projeto(s) removido(s) do destaque.')
    remover_destaque.short_description = "Remover destaque dos projetos selecionados"
    
    def ativar_projetos(self, request, queryset):
        updated = queryset.update(ativo=True)
        self.message_user(request, f'{updated} projeto(s) ativado(s).')
    ativar_projetos.short_description = "Ativar projetos selecionados"
    
    def desativar_projetos(self, request, queryset):
        updated = queryset.update(ativo=False)
        self.message_user(request, f'{updated} projeto(s) desativado(s).')
    desativar_projetos.short_description = "Desativar projetos selecionados"

@admin.register(ImagemProjeto)
class ImagemProjetoAdmin(admin.ModelAdmin):
    list_display = ('projeto', 'imagem_preview', 'legenda', 'ordem', 'ativo', 'data_upload')
    list_filter = ('ativo', 'projeto', 'data_upload')
    search_fields = ('projeto__titulo', 'legenda')
    list_editable = ('ordem', 'ativo')
    readonly_fields = ('data_upload',)
    
    def imagem_preview(self, obj):
        if obj.imagem:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.imagem.url
            )
        return '-'
    imagem_preview.short_description = 'Preview'
