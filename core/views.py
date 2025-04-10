from django.shortcuts import render
from .models import SobreMim

def sobre_mim(request):
    dados = SobreMim.objects.first()
    return render(request, 'sobre_mim.html', {'dados': dados})
