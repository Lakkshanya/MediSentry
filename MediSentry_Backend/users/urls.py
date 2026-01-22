from django.urls import path
from .views import RegisterView, UserProfileView, VerifyEmailView, NotificationView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
]
