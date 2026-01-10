from django.urls import path
from .views import *

urlpatterns = [
    path('', TasksListCreateView.as_view(), name='note-list-create'),
    path('<int:pk>/', TasksDetailView.as_view(), name='note-detail'),
]
