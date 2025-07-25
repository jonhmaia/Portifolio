from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.contrib import messages
from django.shortcuts import redirect

class UnifiedLoginView(LoginView):
    """View unificada de login que redireciona para o dashboard"""
    template_name = 'core/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return reverse_lazy('core:dashboard')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Login - Painel Administrativo'
        return context

class UnifiedLogoutView(LogoutView):
    """View unificada de logout"""
    next_page = reverse_lazy('core:login')
    
    def dispatch(self, request, *args, **kwargs):
        if request.method == 'GET':
            # Se for GET, fazer logout e redirecionar
            from django.contrib.auth import logout
            logout(request)
            messages.success(request, 'Logout realizado com sucesso!')
            return redirect(reverse_lazy('core:login'))
        return super().dispatch(request, *args, **kwargs)