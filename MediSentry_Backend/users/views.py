from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
import random

User = get_user_model()

from django.core.mail import send_mail

import threading

def send_async_email(subject, message, recipient_list, html_message):
    try:
        send_mail(
            subject,
            message,
            'noreply@medisentry.com',
            recipient_list,
            fail_silently=True,
            html_message=html_message
        )
        print(f" [EMAIL THREAD] Sent to {recipient_list}")
    except Exception as e:
        print(f" [EMAIL THREAD ERROR] {e}")

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Save user first (Serializer creates it)
        user = serializer.save(is_active=False, is_verified=False)
        
        # EXPLICITLY Save OTP to DB (Bypassing Serializer .create limitation)
        user.otp_code = otp
        user.save()
        
        print(f" [DEBUG] User Created: {user.email}, OTP Stored: {user.otp_code}")
        
        # HTML Email Content
        subject = 'Verify your MediSentry Account'
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="color: #1a73e8; text-align: center; margin-bottom: 20px;">MediSentry</h1>
                    <p style="font-size: 16px; color: #333; text-align: center;">Welcome to the future of medical safety.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 14px; color: #555; text-align: center;">Your verification code is:</p>
                    <div style="background-color: #e8f0fe; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1a73e8; letter-spacing: 5px;">{otp}</span>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center;">Enter this code in the app to verify your account.</p>
                </div>
            </body>
        </html>
        """
        
        # Send Email in Background Thread to prevent UI blocking
        email_thread = threading.Thread(
            target=send_async_email,
            args=(subject, f'Your verification code is: {otp}', [user.email], html_message)
        )
        email_thread.start()

class VerifyEmailView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = str(request.data.get('otp', '')).strip()
        
        print(f"\n[OTC VERIFY DEBUG Start]")
        print(f" - Request Email: '{email}'")
        print(f" - Request OTP:   '{otp}'")
        
        try:
            user = User.objects.get(email=email)
            print(f" - Found User:    {user.username}")
            print(f" - Stored OTP:    '{user.otp_code}'")
            print(f" - Is Verified:   {user.is_verified}")
            
            # Robust comparison
            stored_otp = str(user.otp_code).strip()
            
            if stored_otp == otp:
                print(f" [SUCCESS] OTP Matched!")
                user.is_active = True
                user.is_verified = True
                user.otp_code = None # Clear OTP
                user.save()
                
                # Send Success Email
                self.send_success_email(user.email)
                
                return Response({'message': 'Email verified successfully! Login to continue.'}, status=status.HTTP_200_OK)
            else:
                print(f" [FAILURE] OTP Mismatch! '{stored_otp}' != '{otp}'")
                return Response({'error': f'Invalid OTP. Sent: {otp}, Expected: {stored_otp}'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            print(f" [FAILURE] User not found for email: {email}")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def send_success_email(self, email):
        subject = 'Welcome to MediSentry!'
        html_message = """
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h1 style="color: #2e7d32; text-align: center; margin-bottom: 20px;">Verification Successful</h1>
                    <p style="font-size: 16px; color: #333; text-align: center;">Your email has been verified.</p>
                    <p style="font-size: 14px; color: #555; text-align: center;">You can now log in to access the MediSentry Dashboard.</p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open App</a>
                    </div>
                </div>
            </body>
        </html>
        """
        try:
            send_mail(
                subject,
                'Your email has been verified. Welcome to MediSentry!',
                'noreply@medisentry.com',
                [email],
                fail_silently=True,
                html_message=html_message
            )
        except:
            pass

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class NotificationView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Simulate Redis Notification Queue
        notifications = [
            {"id": 1, "title": "High Risk Alert", "message": "New prescription for Alice Risk requires verification.", "read": False, "time": "2 mins ago"},
            {"id": 2, "title": "System Update", "message": "AI Models updated to v2.0", "read": True, "time": "1 hour ago"}
        ]
        return Response(notifications)
