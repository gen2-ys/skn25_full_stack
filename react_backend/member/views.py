from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

from .models import Question, Answer, Comment
from .serializers import QuestionSerializer, AnswerSerializer, CommentSerializer, UserSerializer

class BoardPagination(PageNumberPagination):
    page_size = 5


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "회원가입이 완료되었습니다."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "아이디 또는 비밀번호가 올바르지 않습니다."
            }, status=status.HTTP_400_BAD_REQUEST)


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.order_by('-create_date')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    pagination_class = BoardPagination

    def get_queryset(self):
        qs = super().get_queryset()
        kw = self.request.query_params.get('kw', '')
        if kw:
            qs = qs.filter(
                Q(subject__icontains=kw) | 
                Q(content__icontains=kw)
            ).distinct()
        return qs
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user, create_date=timezone.now())

    def perform_update(self, serializer):
        serializer.save(modify_date=timezone.now())
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        question = self.get_object()
        if request.user in question.voter.all():
            question.voter.remove(request.user)
            return Response({'status': 'unvoted', 'voter_count': question.voter.count()}, status=status.HTTP_200_OK)
        else:
            question.voter.add(request.user)
            return Response({'status': 'voted', 'voter_count': question.voter.count()}, status=status.HTTP_200_OK)


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all().order_by('-create_date')
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, create_date=timezone.now())

    def perform_update(self, serializer):
        serializer.save(modify_date=timezone.now())

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        answer = self.get_object()
        if request.user in answer.voter.all():
            answer.voter.remove(request.user)
            return Response({'status': 'unvoted', 'voter_count': answer.voter.count()}, status=status.HTTP_200_OK)
        else:
            answer.voter.add(request.user)
            return Response({'status': 'voted', 'voter_count': answer.voter.count()}, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-create_date')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, create_date=timezone.now())

    def perform_update(self, serializer):
        serializer.save(modify_date=timezone.now()) 