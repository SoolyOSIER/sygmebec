from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_utilisateur_administrateur_principal'),
    ]

    operations = [
        migrations.AlterField(
            model_name='utilisateur',
            name='role_acces',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='utilisateurs',
                to='accounts.roleacces',
            ),
        ),
    ]
