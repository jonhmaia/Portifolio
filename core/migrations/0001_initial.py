# Generated by Django 5.2 on 2025-04-08 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SobreMim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100)),
                ('cargo', models.CharField(max_length=100)),
                ('bio', models.TextField()),
                ('tecnologias', models.CharField(max_length=255)),
            ],
        ),
    ]
