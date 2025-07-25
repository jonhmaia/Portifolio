from django.urls import path
from . import views

app_name = 'portfolio'

urlpatterns = [
    path('', views.projects, name='projects'),
    path('project/<int:project_id>/', views.project_detail, name='project_detail'),
    
    # URLs para gestão de projetos
    path('manage/', views.manage_projects, name='manage_projects'),
    path('create/', views.create_project, name='create_project'),
    path('edit/<int:project_id>/', views.edit_project, name='edit_project'),
    path('delete/<int:project_id>/', views.delete_project, name='delete_project'),
]