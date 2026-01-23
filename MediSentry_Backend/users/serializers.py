from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'hospital_id', 'is_verified')
        read_only_fields = ('is_verified',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'hospital_id')
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=str(validated_data['username']).strip(),
            email=str(validated_data.get('email', '')).strip(),
            password=validated_data['password'],
            role=validated_data.get('role', 'DOCTOR'),
            hospital_id=validated_data.get('hospital_id')
        )
        return user
