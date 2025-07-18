from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.articles, name='articles'),
    path('article/<slug:slug>/', views.article_detail, name='article_detail'),
]