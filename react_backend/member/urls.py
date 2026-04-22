from django.urls import path, include 
from .views import SignupView, CustomLoginView
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'skn25'

router = DefaultRouter()
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'answers', views.AnswerViewSet, basename='answer')
router.register(r'comments', views.CommentViewSet, basename='comment')

urlpatterns = [
    #http://127.0.0.1:8000/api/signup
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('', include(router.urls)),
    # path('questions/', question_list_create, name='question_list'),

]