from django.urls import path, re_path
from .views import front

urlpatterns = [
    path('', front),
    path('join', front, name='join'),
    re_path(r'^.*/$', front)
]