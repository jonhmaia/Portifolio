from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Projeto, Tecnologia, ImagemProjeto
from .forms import ProjetoAdminForm
from datetime import date, timedelta
import tempfile
from PIL import Image
import io

class ProjetoModelTest(TestCase):
    """Testes para o modelo Projeto"""
    
    def setUp(self):
        """Configuração inicial para os testes"""
        self.tecnologia = Tecnologia.objects.create(
            nome='Python',
            categoria='Backend',
            cor='#3776ab',
            ativo=True
        )
        
    def test_criar_projeto_basico(self):
        """Teste criação de projeto com dados básicos"""
        projeto = Projeto.objects.create(
            titulo='Projeto Teste',
            descricao_completa='Descrição completa do projeto teste',
            status='concluido'
        )
        
        self.assertEqual(projeto.titulo, 'Projeto Teste')
        self.assertEqual(projeto.status, 'concluido')
        self.assertTrue(projeto.ativo)
        self.assertFalse(projeto.destaque)
        
    def test_projeto_str_method(self):
        """Teste do método __str__ do modelo Projeto"""
        projeto = Projeto.objects.create(
            titulo='Projeto Teste',
            descricao_completa='Descrição teste'
        )
        
        self.assertEqual(str(projeto), 'Projeto Teste')
        
    def test_projeto_tecnologias_lista(self):
        """Teste propriedade tecnologias_lista"""
        projeto = Projeto.objects.create(
            titulo='Projeto com Tecnologias',
            descricao_completa='Descrição teste'
        )
        
        projeto.tecnologias.add(self.tecnologia)
        
        self.assertIn(self.tecnologia.nome, str(projeto.tecnologias.all()))
        
    def test_projeto_tecnologias_relationship(self):
        """Teste relacionamento many-to-many com tecnologias"""
        projeto = Projeto.objects.create(
            titulo='Projeto Teste',
            descricao_completa='Descrição teste'
        )
        
        projeto.tecnologias.add(self.tecnologia)
        
        self.assertEqual(projeto.tecnologias.count(), 1)
        self.assertIn(self.tecnologia, projeto.tecnologias.all())

class ProjetoFormTest(TestCase):
    """Testes para o formulário ProjetoAdminForm"""
    
    def setUp(self):
        """Configuração inicial para os testes"""
        self.tecnologia = Tecnologia.objects.create(
            nome='Django',
            categoria='Backend',
            cor='#092e20',
            ativo=True
        )
        
        # Criar uma imagem de teste
        self.test_image = self.create_test_image()
        
    def create_test_image(self):
        """Cria uma imagem de teste para upload"""
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'JPEG')
        file.seek(0)
        return SimpleUploadedFile(
            'test_image.jpg',
            file.getvalue(),
            content_type='image/jpeg'
        )
        
    def test_form_valid_data(self):
        """Teste formulário com dados válidos"""
        form_data = {
            'titulo': 'Projeto Teste',
            'descricao_curta': 'Descrição curta do projeto teste',
            'descricao_completa': 'Descrição completa e detalhada do projeto teste',
            'status': 'concluido',
            'link_repositorio': 'https://github.com/usuario/projeto',
            'link_deploy': 'https://projeto.vercel.app',

            'ordem': 1,
            'ativo': True,
            'destaque': False,
            'tecnologias': [self.tecnologia.id]
        }
        
        form = ProjetoAdminForm(data=form_data)
        self.assertTrue(form.is_valid(), f"Erros do formulário: {form.errors}")
        
    def test_form_titulo_muito_curto(self):
        """Teste validação de título muito curto"""
        form_data = {
            'titulo': 'AB',  # Muito curto
            'descricao_completa': 'Descrição completa'
        }
        
        form = ProjetoAdminForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('titulo', form.errors)
        
    def test_form_descricao_curta_muito_curta(self):
        """Teste validação de descrição curta muito curta"""
        form_data = {
            'titulo': 'Projeto Teste',
            'descricao_curta': 'Curta',  # Muito curta
            'descricao_completa': 'Descrição completa'
        }
        
        form = ProjetoAdminForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('descricao_curta', form.errors)
        
    def test_form_descricao_curta_muito_longa(self):
        """Teste validação de descrição curta muito longa"""
        form_data = {
            'titulo': 'Projeto Teste',
            'descricao_curta': 'A' * 301,  # Muito longa
            'descricao_completa': 'Descrição completa'
        }
        
        form = ProjetoAdminForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('descricao_curta', form.errors)
        
    def test_form_link_invalido(self):
        """Teste validação de links inválidos"""
        form_data = {
            'titulo': 'Projeto Teste',
            'descricao_completa': 'Descrição completa',
            'link_repositorio': 'link-invalido',  # Sem http/https
        }
        
        form = ProjetoAdminForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('link_repositorio', form.errors)
        


class ProjetoViewTest(TestCase):
    """Testes para as views do portfolio"""
    
    def setUp(self):
        """Configuração inicial para os testes"""
        self.client = Client()
        
        # Criar usuário superusuário
        self.superuser = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='testpass123'
        )
        
        # Criar usuário comum
        self.user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='testpass123'
        )
        
        # Criar tecnologia
        self.tecnologia = Tecnologia.objects.create(
            nome='React',
            categoria='Frontend',
            cor='#61dafb',
            ativo=True
        )
        
        # Criar projeto
        self.projeto = Projeto.objects.create(
            titulo='Projeto Teste',
            descricao_curta='Descrição curta',
            descricao_completa='Descrição completa do projeto',
            status='concluido',
            ativo=True
        )
        
    def test_projects_view_public(self):
        """Teste view pública de projetos"""
        response = self.client.get(reverse('portfolio:projects'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Projeto Teste')
        
    def test_project_detail_view(self):
        """Teste view de detalhes do projeto"""
        response = self.client.get(
            reverse('portfolio:project_detail', args=[self.projeto.id])
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.projeto.titulo)
        
    def test_manage_projects_requires_superuser(self):
        """Teste que gerenciamento requer superusuário"""
        # Sem login
        response = self.client.get(reverse('portfolio:manage_projects'))
        self.assertEqual(response.status_code, 302)  # Redirect para login
        
        # Com usuário comum
        self.client.login(username='user', password='testpass123')
        response = self.client.get(reverse('portfolio:manage_projects'))
        self.assertEqual(response.status_code, 302)  # Redirect para login
        
        # Com superusuário
        self.client.login(username='admin', password='testpass123')
        response = self.client.get(reverse('portfolio:manage_projects'))
        self.assertEqual(response.status_code, 200)
        
    def test_create_project_get(self):
        """Teste GET da view de criação de projeto"""
        self.client.login(username='admin', password='testpass123')
        response = self.client.get(reverse('portfolio:create_project'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Criar Novo Projeto')
        
    def test_create_project_post_valid(self):
        """Teste POST válido para criação de projeto"""
        self.client.login(username='admin', password='testpass123')
        
        # Criar imagem de teste
        test_image = self.create_test_image()
        
        form_data = {
            'titulo': 'Novo Projeto',
            'descricao_curta': 'Descrição curta do novo projeto',
            'descricao_completa': 'Descrição completa e detalhada do novo projeto',
            'status': 'desenvolvimento',
            'link_repositorio': 'https://github.com/usuario/novo-projeto',
            'ordem': 1,
            'ativo': True,
            'destaque': False,
            'tecnologias': [self.tecnologia.id],
            'imagem_principal': test_image,

        }
        
        response = self.client.post(
            reverse('portfolio:create_project'),
            data=form_data,
            follow=True
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Projeto.objects.filter(titulo='Novo Projeto').exists()
        )
        
    def test_create_project_post_invalid(self):
        """Teste POST inválido para criação de projeto"""
        self.client.login(username='admin', password='testpass123')
        
        form_data = {
            'titulo': '',  # Título vazio (inválido)
            'descricao_completa': 'Descrição completa'
        }
        
        response = self.client.post(
            reverse('portfolio:create_project'),
            data=form_data
        )
        
        self.assertEqual(response.status_code, 200)
        # Verificar que o projeto não foi criado
        self.assertFalse(Projeto.objects.filter(titulo='').exists())
        
    def test_edit_project_get(self):
        """Teste GET da view de edição de projeto"""
        self.client.login(username='admin', password='testpass123')
        response = self.client.get(
            reverse('portfolio:edit_project', args=[self.projeto.id])
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, f'Editar: {self.projeto.titulo}')
        
    def test_edit_project_post_valid(self):
        """Teste POST válido para edição de projeto"""
        self.client.login(username='admin', password='testpass123')
        
        form_data = {
            'titulo': 'Projeto Editado',
            'descricao_curta': 'Descrição editada',
            'descricao_completa': 'Descrição completa editada',
            'status': 'concluido',
            'ordem': 1,
            'ativo': True,
            'destaque': True,
            'tecnologias': [self.tecnologia.id],

        }
        
        response = self.client.post(
            reverse('portfolio:edit_project', args=[self.projeto.id]),
            data=form_data,
            follow=True
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verificar se o projeto foi atualizado
        projeto_atualizado = Projeto.objects.get(id=self.projeto.id)
        self.assertEqual(projeto_atualizado.titulo, 'Projeto Editado')
        self.assertTrue(projeto_atualizado.destaque)
        
    def test_delete_project(self):
        """Teste exclusão de projeto"""
        self.client.login(username='admin', password='testpass123')
        
        response = self.client.post(
            reverse('portfolio:delete_project', args=[self.projeto.id])
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            Projeto.objects.filter(id=self.projeto.id).exists()
        )
        
    def create_test_image(self):
        """Cria uma imagem de teste para upload"""
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color='blue')
        image.save(file, 'JPEG')
        file.seek(0)
        return SimpleUploadedFile(
            'test_image.jpg',
            file.getvalue(),
            content_type='image/jpeg'
        )

class TecnologiaModelTest(TestCase):
    """Testes para o modelo Tecnologia"""
    
    def test_criar_tecnologia(self):
        """Teste criação de tecnologia"""
        tecnologia = Tecnologia.objects.create(
            nome='Vue.js',
            categoria='Frontend',
            cor='#4fc08d',
            ativo=True
        )
        
        self.assertEqual(tecnologia.nome, 'Vue.js')
        self.assertEqual(tecnologia.categoria, 'Frontend')
        self.assertTrue(tecnologia.ativo)
        
    def test_tecnologia_str_method(self):
        """Teste do método __str__ do modelo Tecnologia"""
        tecnologia = Tecnologia.objects.create(
            nome='Angular',
            categoria='Frontend'
        )
        
        self.assertEqual(str(tecnologia), 'Angular')

class IntegrationTest(TestCase):
    """Testes de integração completos"""
    
    def setUp(self):
        """Configuração inicial"""
        self.client = Client()
        self.superuser = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='testpass123'
        )
        
    def test_complete_project_workflow(self):
        """Teste do fluxo completo de criação e visualização de projeto"""
        # Login como superusuário
        self.client.login(username='admin', password='testpass123')
        
        # Criar tecnologia
        tecnologia = Tecnologia.objects.create(
            nome='Node.js',
            categoria='Backend',
            cor='#339933',
            ativo=True
        )
        
        # Criar projeto via formulário
        form_data = {
            'titulo': 'Projeto Integração',
            'descricao_curta': 'Projeto para teste de integração completa',
            'descricao_completa': 'Descrição detalhada do projeto de integração',
            'status': 'concluido',
            'link_repositorio': 'https://github.com/test/integracao',
            'link_deploy': 'https://integracao.vercel.app',
            'ordem': 1,
            'ativo': True,
            'destaque': True,
            'tecnologias': [tecnologia.id],

        }
        
        # Criar projeto
        response = self.client.post(
            reverse('portfolio:create_project'),
            data=form_data,
            follow=True
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verificar se projeto foi criado
        projeto = Projeto.objects.get(titulo='Projeto Integração')
        self.assertTrue(projeto.ativo)
        self.assertTrue(projeto.destaque)
        self.assertIn(tecnologia, projeto.tecnologias.all())
        
        # Verificar se aparece na listagem pública
        response = self.client.get(reverse('portfolio:projects'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Projeto Integração')
        
        # Verificar detalhes do projeto
        response = self.client.get(
            reverse('portfolio:project_detail', args=[projeto.id])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, projeto.titulo)
