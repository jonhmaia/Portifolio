from django.urls import path
from . import views
from .auth_views import UnifiedLoginView, UnifiedLogoutView

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('curriculum/', views.curriculum, name='curriculum'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('login/', UnifiedLoginView.as_view(), name='login'),
    path('logout/', UnifiedLogoutView.as_view(), name='logout'),
]