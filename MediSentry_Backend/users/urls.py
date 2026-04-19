from django.urls import path
from .views import RegisterView, UserProfileView, VerifyEmailView, NotificationView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]
