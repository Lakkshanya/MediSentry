from users.models import User
try:
    User.objects.filter(username__icontains="Lakkshanya").delete()
    print("Deleted 'Lakkshanya' user(s).")
except Exception as e:
    print(e)

# Confirm count
print(f"Remaining Users: {[u.username for u in User.objects.all()]}")
