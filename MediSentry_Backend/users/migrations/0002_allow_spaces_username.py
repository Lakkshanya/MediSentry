from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'), # Assuming 0001 is the last one. If failed, I'll auto-merge.
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(
                error_messages={'unique': 'A user with that username already exists.'},
                max_length=150,
                unique=True,
                validators=[django.core.validators.RegexValidator(message='Username can contain letters, numbers, spaces, and @/./+/-/_ characters.', regex='^[\\w.@+\\- ]+$')],
            ),
        ),
    ]
