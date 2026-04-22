from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Question, Answer, Comment

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
    
class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'content', 'create_date', 'modify_date', 'question', 'answer']
        read_only_fields = ['create_date', 'modify_date']

class AnswerSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    voter_count = serializers.SerializerMethodField()
    comment_set = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'author_name', 'question', 'content', 'create_date', 'modify_date', 'voter_count', 'comment_set']
        read_only_fields = ['create_date', 'modify_date']

    def get_voter_count(self, obj):
        return obj.voter.count()
    
class QuestionSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    voter_count = serializers.SerializerMethodField()
    answer_set = AnswerSerializer(many=True, read_only=True)
    comment_set = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'subject', 'content', 'author_name', 'create_date', 'modify_date', 'voter_count', 'answer_set', 'comment_set']
        read_only_fields = ['create_date', 'modify_date']

    def get_voter_count(self, obj):
        return obj.voter.count()