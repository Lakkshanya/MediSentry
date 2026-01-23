from rest_framework import generics, permissions, status, views, serializers
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

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow login with email or username
        login_id = str(attrs.get("username") or "").strip()
        password = attrs.get("password")

        user = User.objects.filter(email__iexact=login_id).first()
        if not user:
            user = User.objects.filter(username__iexact=login_id).first()

        if user:
            if not user.check_password(password):
                raise serializers.ValidationError("Incorrect password.")
            
            if not user.is_active or not user.is_verified:
                raise serializers.ValidationError("Account not verified. Please verify your email first.")
            
            attrs["username"] = user.username # simplejwt uses 'username' field
            return super().validate(attrs)
        
        raise serializers.ValidationError("User account not found.")

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        otp = str(random.randint(100000, 999999))
        user = serializer.save(is_active=False, is_verified=False)
        user.otp_code = otp
        user.save()
        
        subject = 'Verify your MediSentry Account'
        html_message = f"""
        <html>
            <body style="font-family: 'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, helvetica, arial, sans-serif; background-color: #f0f2f5; padding: 40px 0; margin: 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <table width="400" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                                <tr>
                                    <td align="center" style="padding: 40px; background-color: #1a73e8;">
                                        <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">MediSentry<span style="color: #8ab4f8;">AI</span></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 40px 30px;">
                                        <h2 style="color: #1c1e21; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">Verify your identity</h2>
                                        <p style="color: #65676b; font-size: 16px; line-height: 24px; margin: 0 0 35px 0;">
                                            Your security is our priority. Please use the verification code below to complete your registration.
                                        </p>
                                        
                                        <table border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border: 2px solid #e1e4e8; border-radius: 12px;">
                                            <tr>
                                                <td align="center" style="padding: 20px 40px;">
                                                    <span style="font-size: 48px; font-weight: 800; color: #1a73e8; letter-spacing: 15px; font-family: 'Courier New', monospace; line-height: 1;">{otp}</span>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="color: #8a8d91; font-size: 13px; margin: 35px 0 0 0;">
                                            This code expires in 10 minutes. If you didn't request this, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #f8f9fa; border-top: 1px solid #e1e4e8;">
                                        <p style="color: #bcc0c4; font-size: 11px; margin: 0;">&copy; 2026 MediSentry AI &bull; Smart Clinical Safety</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
        """
        
        email_thread = threading.Thread(
            target=send_async_email,
            args=(subject, f'Your verification code is: {otp}', [user.email], html_message)
        )
        email_thread.start()

class ForgotPasswordView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user = User.objects.get(email=email)
            otp = str(random.randint(100000, 999999))
            user.otp_code = otp
            user.save()

            subject = 'Reset your MediSentry Password'
            html_message = f"""
            <html>
                <body style="font-family: 'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, helvetica, arial, sans-serif; background-color: #f0f2f5; padding: 40px 0; margin: 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center">
                                <table width="400" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td align="center" style="padding: 40px; background-color: #d32f2f;">
                                            <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">MediSentry<span style="color: #ffcdd2;">AI</span></span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding: 40px 30px;">
                                            <h2 style="color: #1c1e21; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">Password Reset</h2>
                                            <p style="color: #65676b; font-size: 16px; line-height: 24px; margin: 0 0 35px 0;">
                                                We received a request to reset your password. Use the code below to proceed securely.
                                            </p>
                                            
                                            <table border="0" cellspacing="0" cellpadding="0" style="background-color: #fff5f5; border: 2px solid #ffcdd2; border-radius: 12px;">
                                                <tr>
                                                    <td align="center" style="padding: 20px 40px;">
                                                        <span style="font-size: 48px; font-weight: 800; color: #d32f2f; letter-spacing: 15px; font-family: 'Courier New', monospace; line-height: 1;">{otp}</span>
                                                    </td>
                                                </tr>
                                            </table>

                                            <p style="color: #8a8d91; font-size: 13px; margin: 35px 0 0 0;">
                                                If you didn't request this, please ignore this email. Your current password will remain unchanged.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding: 20px; background-color: #f8f9fa; border-top: 1px solid #e1e4e8;">
                                            <p style="color: #bcc0c4; font-size: 11px; margin: 0;">&copy; 2026 MediSentry AI &bull; Smart Clinical Safety</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
            """
            
            email_thread = threading.Thread(
                target=send_async_email,
                args=(subject, f'Your reset code is: {otp}', [user.email], html_message)
            )
            email_thread.start()
            
            return Response({'message': 'OTP sent to email.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = str(request.data.get('otp', '')).strip()
        new_password = request.data.get('new_password')

        print(f"\n[PASSWORD RESET DEBUG Start]")
        print(f" - Request Email: '{email}'")
        print(f" - Request OTP:   '{otp}'")

        try:
            user = User.objects.get(email=email)
            print(f" - Found User:    {user.username}")
            print(f" - Stored OTP:    '{user.otp_code}'")

            stored_otp = str(user.otp_code).strip()
            
            if stored_otp == otp and otp != "":
                print(f" [SUCCESS] OTP Matched!")
                user.set_password(new_password)
                user.otp_code = None
                user.save()
                
                # Send Success Email
                self.send_password_reset_success_email(user.email)
                
                return Response({'message': 'Password reset successful.'})
            else:
                print(f" [FAILURE] OTP Mismatch! Stored: '{stored_otp}', Sent: '{otp}'")
                return Response({'error': f'Invalid OTP. Please check the code sent to your email.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            print(f" [FAILURE] User not found: {email}")
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def send_password_reset_success_email(self, email):
        subject = 'MediSentry - Password Updated Successfully'
        html_message = """
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 30px; color: #2e7d32;">✔</span>
                    </div>
                    <h1 style="color: #2e7d32; font-size: 24px; margin-bottom: 10px;">Security Alert</h1>
                    <p style="font-size: 16px; color: #333;">Your password was adjusted successfully.</p>
                    <p style="font-size: 14px; color: #666; line-height: 22px;">
                        If you performed this action, you can ignore this email. <br/>
                        If you **did not** reset your password, please contact your hospital administrator immediately.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
                    <p style="font-size: 11px; color: #999;">&copy; 2026 MediSentry AI &bull; Smart Clinical Safety</p>
                </div>
            </body>
        </html>
        """
        try:
            send_mail(
                subject, 
                'Your MediSentry password has been reset successfully.', 
                'security@medisentry.com', 
                [email], 
                html_message=html_message
            )
        except:
            pass

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
