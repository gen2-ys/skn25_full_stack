from django.urls import path
from . import views   # 같은 폴더의 views.py
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import MyTokenObtainPairView
from .views import TodoListCreate, TodoRetrieveUpdateDestroy
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MyTokenObtainPairView, 
    TodoListCreate, 
    TodoRetrieveUpdateDestroy,
    LogoutView
)

urlpatterns = [
    path('', views.post_list, name='post-list'),          # /blog/
    path('<int:pk>/', views.post_detail, name='post-detail'),  # /blog/1/
    # path('new/', views.post_create, name='post-create'), # /blog/new/
    path('new/', views.PostCreateView.as_view(), name='post-create'),
    path('posts/', views.PostListCreate.as_view(), name='post-list'),
    
    # JWT 인증 관련 URL
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    
    # Todo 비즈니스 로직 URL
    path('api/todos/', TodoListCreate.as_view(), name='todo-list-create'),
    path('api/todos/<int:pk>/', TodoRetrieveUpdateDestroy.as_view(), name='todo-retrieve-update-destroy'),

]