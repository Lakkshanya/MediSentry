
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisentry_backend.settings')
django.setup()

from django.apps import apps
from django.contrib.auth import get_user_model

def wipe_data():
    print("Starting database cleanup...")
    
    # List of apps to clean
    target_apps = ['prescriptions', 'analytics', 'users']
    
    for app_name in target_apps:
        try:
            app_config = apps.get_app_config(app_name)
            for model in app_config.get_models():
                count = model.objects.count()
                if count > 0:
                    print(f"Deleting {count} records from {model.__name__}...")
                    model.objects.all().delete()
                    print(f"  - Deleted.")
                else:
                    print(f"  - No records in {model.__name__}")
        except LookupError:
            print(f"App '{app_name}' not found.")
            
    # Also clean User model explicitly if not covered (it is in 'users' app usually, but AUTH_USER_MODEL is 'users.User')
    User = get_user_model()
    count = User.objects.count()
    if count > 0:
        print(f"Deleting {count} Users (including superusers)...")
        User.objects.all().delete()
        print("All users deleted.")
    
    print("Database cleanup complete.")

if __name__ == '__main__':
    wipe_data()
