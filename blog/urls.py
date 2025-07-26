from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    # URLs públicas
    path('', views.articles, name='articles'),
    path('article/<slug:slug>/', views.article_detail, name='article_detail'),
    
    # URLs de gerenciamento (protegidas)
    path('manage/', views.manage_articles, name='manage_articles'),
    path('create/', views.create_article, name='create_article'),
    path('edit/<int:pk>/', views.edit_article, name='edit_article'),
    path('delete/<int:pk>/', views.delete_article, name='delete_article'),
    path('ajax/delete/<int:pk>/', views.delete_article_ajax, name='delete_article_ajax'),
]