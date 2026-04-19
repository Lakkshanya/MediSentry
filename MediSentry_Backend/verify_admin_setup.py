import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisentry_backend.settings')
django.setup()

from users.models import User
from django.contrib.auth import authenticate

def analyze():
    print("\n=== Admin Account Diagnostic ===")
    
    # 1. List all accounts
    users = User.objects.all()
    print(f"Total Users: {users.count()}")
    for u in users:
        print(f" - ID: {u.id} | User: '{u.username}' | Email: '{u.email}' | Role: {u.role} | Active: {u.is_active} | Verified: {u.is_verified}")

    # 2. Check for duplicate emails/usernames (potential cause of 400 on register)
    # (Existing accounts already show this)

    # 3. Simulate lookup logic from CustomTokenObtainPairSerializer
    search_term = "Suresh" # Example admin
    print(f"\nSimulating lookup for '{search_term}':")
    
    u_by_email = User.objects.filter(email__iexact=search_term).first()
    print(f" - Found by Email (iexact): {u_by_email.username if u_by_email else 'None'}")
    
    u_by_username = User.objects.filter(username__iexact=search_term).first()
    print(f" - Found by Username (iexact): {u_by_username.username if u_by_username else 'None'}")

    # 4. Check superuser roles
    superusers = User.objects.filter(is_superuser=True)
    print(f"\nSuperusers: {superusers.count()}")
    for s in superusers:
        print(f" - {s.username} | Role: {s.role}")

    print("\n================================")

if __name__ == "__main__":
    analyze()
