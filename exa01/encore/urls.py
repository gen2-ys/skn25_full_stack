from django.urls import path 
# from .views import hi 
from . import views

app_name = 'encore'

urlpatterns = [
    path("", views.hi),
    #http://127.0.0.1:8005/encore/haha/
    path("haha/", views.haha, name='index'),
    path("<int:question_id>/" ,views.detail, name='detail'),
    path("choice/create/<int:question_id>", views.choice_create,    name="choice_create"),
    path("vote/<int:choice_id>", views.vote,     name="vote"),
    path("create", views.create, name='create'),
]