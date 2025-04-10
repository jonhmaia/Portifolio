from django.shortcuts import render
from django.utils.translation import activate
from django.conf import settings
from .models import SobreMim



def sobre_mim(request):
    # Se não houver cookie de idioma, ativa pt-br manualmente
    if 'django_language' not in request.COOKIES:
        activate('pt-br')

    dados = SobreMim.objects.first()
    return render(request, 'sobre_mim.html', {'dados': dados})