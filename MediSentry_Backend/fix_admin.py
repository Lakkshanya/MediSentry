import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisentry_backend.settings')
django.setup()

from users.models import User

def fix_admin_users():
    print("\nFixing Admin & Superuser accounts...")
    
    # 1. Update Superusers to ADMIN role and Verify them
    superusers = User.objects.filter(is_superuser=True)
    for u in superusers:
        u.role = 'ADMIN'
        u.is_active = True
        u.is_verified = True
        u.save()
        print(f" [+] Superuser '{u.username}' is now ADMIN and Verified.")

    # 2. Fix any Admin accounts that might be stuck
    admins = User.objects.filter(role='ADMIN')
    for a in admins:
        a.is_active = True
        a.is_verified = True
        a.save()
        print(f" [+] Admin '{a.username}' is now Verified and Active.")

    print("\nDone! You can now login as Admin smoothly.\n")

if __name__ == "__main__":
    fix_admin_users()
