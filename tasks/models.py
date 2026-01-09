from django.db import models
from accounts.models import *

# Create your models here.
class Tasks(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,related_name="task_created")
    title = models.CharField(max_length=255)
    description = models.TextField()
    attachment = models.FileField(upload_to="attachments/",
        null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True,blank=True)

    def __str__(self):
        return self.title