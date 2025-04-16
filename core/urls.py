from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),  # Home page
    path('curriculo/', views.sobre_mim, name='sobre_mim'),  # Página de currículo
    path("projetos/", views.projetos, name="projetos"), ## Página de projetos
    path('admin-projetos/', views.admin_projetos, name='admin_projetos'),
    path('admin-projetos/criar/', views.criar_projeto, name='criar_projeto'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('admin-projetos/excluir/<int:id>/', views.excluir_projeto, name='excluir_projeto'),
    path('admin-projetos/editar/<int:id>/', views.editar_projeto, name='editar_projeto'),

]
