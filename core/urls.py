from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),  # Home page
    path('curriculo/', views.sobre_mim, name='sobre_mim'),  # Página de currículo
    
    path("projetos/", views.projetos, name="projetos"), ## Página de projetos

]