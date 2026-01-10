from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import *
from .serializers import *


class TasksListCreateView(generics.ListCreateAPIView):
    serializer_class = TasksSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tasks.objects.filter(user=self.request.user).order_by('-created_at')


class TasksDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TasksSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tasks.objects.filter(user=self.request.user).order_by('-created_at')

