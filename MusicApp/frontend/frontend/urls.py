from django.urls import path, re_path
from .views import front

app_name = "frontend"

urlpatterns = [
    path('', front, name = ''),
    path('join', front, name='join'),
    re_path(r'^.*/$', front)
]