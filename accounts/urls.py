from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *
urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UserProfileView.as_view(), name='profile_update'),
    path('reset-password/', reset_password, name='reset_password'),
    path('logout/', logout, name='logout'),

]
