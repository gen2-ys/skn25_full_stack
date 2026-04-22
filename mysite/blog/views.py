from django.shortcuts import render, redirect
from .models import Post
from .forms import PostForm
from django.views.generic import ListView, DetailView, CreateView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from .serializers import PostSerializer


@api_view(['GET', 'POST'])
def post_list(request):
    """
    GET  : 모든 Post 목록 반환
    POST : 새로운 Post 생성
    """
    if request.method == 'GET':
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)   # many=True → 복수 객체 직렬화
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()          # DB에 저장
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def post_detail(request, pk):
    """
    URL에서 넘어온 pk(primary key)로 특정 Post를 조회한다.
    """
    post = Post.objects.get(pk=pk)                 # 단일 객체 가져오기
    return render(request, 'blog/post_detail.html', {'post': post})


def post_create(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            form.save()                     # DB에 저장
            return redirect('post-list')    # 생성 후 목록 페이지로 이동
    else:
        form = PostForm()                   # GET 요청 시 빈 폼 보여주기
    return render(request, 'blog/post_form.html', {'form': form})




class PostListView(ListView):
    model = Post                     # 어떤 모델을 보여줄지
    template_name = 'blog/post_list.html'  # 템플릿 경로 (생략 시 자동 탐색)
    context_object_name = 'posts'    # 템플릿에서 사용할 변수 이름
    paginate_by = 5                  # 선택 사항: 페이지네이션


class PostCreateView(CreateView):
    model = Post
    form_class = PostForm            # forms.py에 정의한 폼 사용
    template_name = 'blog/post_form.html'
    success_url = '/blog/'           # 저장 후 이동할 URL (또는 reverse_lazy 사용)



# class PostListCreate(generics.ListCreateAPIView):
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer

from rest_framework.views import APIView
class PostListCreate(APIView):
    def get(self, request):
        queryset = Post.objects.all() 
        return Response(PostSerializer(queryset, many=True).data)
    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# views.py
from rest_framework import generics, permissions, status
from .serializers import TodoSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Todo
from .serializers import TodoSerializer, MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class TodoListCreate(generics.ListCreateAPIView):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TodoRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(owner=self.request.user)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)