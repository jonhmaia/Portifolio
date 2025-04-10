from django.urls import path
from . import views

urlpatterns = [
    path('', views.sobre_mim, name='sobre_mim'),
]
