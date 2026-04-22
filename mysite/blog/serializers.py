# blog/serializers.py
from rest_framework import serializers
from .models import Post, Todo
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

User = get_user_model()



class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post          # 어떤 모델을 직렬화할지
        fields = ['id', 'title', 'content', 'created_at']  # 노출할 필드

   


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TodoSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Todo
        fields = ['id', 'title', 'description', 'completed', 'created_at', 'updated_at', 'owner']
        read_only_fields = ['owner']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user) 

        # 커스텀 클레임 추가
        token['name'] = user.get_full_name()
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['role'] = user.role
        token['is_premium'] = user.is_premium

        return token

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return data