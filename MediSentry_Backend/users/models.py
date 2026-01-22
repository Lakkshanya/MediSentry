from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        DOCTOR = 'DOCTOR', 'Doctor'
        PHARMACIST = 'PHARMACIST', 'Pharmacist'
        ADMIN = 'ADMIN', 'Admin'

    # Override username to allow spaces (Using a regex that permits spaces)
    import django.core.validators
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[django.core.validators.RegexValidator(
            regex=r'^[\w.@+\- ]+$',
            message='Username can contain letters, numbers, spaces, and @/./+/-/_ characters.'
        )],
        error_messages={
            'unique': "A user with that username already exists.",
        },
    )

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DOCTOR)
    hospital_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
