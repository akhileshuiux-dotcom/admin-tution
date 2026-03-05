from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Override standard JWT validation to allow the mock hardcoded login
        # However, for DRF SimpleJWT, we usually validate against DB.
        # But we'll build a custom view for the hardcoded behavior.
        # This serializer is a fallback for standard DB auth.
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
