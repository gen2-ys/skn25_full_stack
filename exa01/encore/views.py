from django.shortcuts import render, get_object_or_404, redirect 
from django.http import HttpResponse
from .models import Question, Choice
from django.db import models
from django.utils import timezone



# Create your views here.
def hi(request):
    html = "<h1> 안녕 </h1>"
    return HttpResponse(html)

def haha(request):
    # return render(request, "encore/index.html")
    question_list = Question.objects.order_by('-pub_date')
    return render(request, 'encore/index.html', 
                  {'question_list' : question_list})

def detail(request, question_id ):
    question = get_object_or_404(Question, pk=question_id)
    context = {'question' : question}
    return render(request, 'encore/detail.html', context)

def choice_create(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    question.choice_set.create(choice_text=request.POST.get('content'))
    return redirect('encore:detail' ,question_id=question.id)

 
def vote(request, choice_id):
    print("vote -->")
    if request.method == "POST":
        choice = get_object_or_404(Choice, pk=choice_id)
        choice.votes += 1 
        choice.save()
    return redirect('encore:detail' ,question_id=choice.question.id)

def create(request):
    if request.method == "POST":
        q = Question(question_text = request.POST.get('content'), pub_date=timezone.now())
        q.save()

    return redirect('encore:index')

    
