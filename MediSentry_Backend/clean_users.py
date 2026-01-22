from users.models import User

# Delete all users who are NOT doc_test/admin
count, _ = User.objects.exclude(username='doc_test').delete()
print(f"Deleted {count} users.")

# Reset otp/verification for doc_test just in case (optional)
try:
    u = User.objects.get(username='doc_test')
    u.is_verified = True
    u.otp_code = None
    u.save()
    print("Reset doc_test status.")
except User.DoesNotExist:
    pass

print("Data Cleaned.")
