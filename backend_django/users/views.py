from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # MVP Hardcoded login matching Express
        if email == 'demo@guardiantutoring.com' and password == 'password':
            user_data = {
                'id': 'mock-id',
                'name': 'Sarah Jenkins',
                'email': 'demo@guardiantutoring.com',
                'role': 'Admission Manager'
            }
            # Create a fake token structure that doesn't actually exist in the DB
            # For a real DB user, we'd do: RefreshToken.for_user(user)
            # Since we just need a string formatted like a JWT, we can create one manually or mock it
            # To keep it simple, we'll return a static mock token for the mock user
            import jwt
            from django.conf import settings
            token = jwt.encode(
                {'id': user_data['id'], 'role': user_data['role']}, 
                settings.SECRET_KEY, 
                algorithm='HS256'
            )

            return Response({
                'token': token,
                'user': user_data
            }, status=status.HTTP_200_OK)

        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class MeView(APIView):
    permission_classes = [AllowAny] # In Express this didn't enforce a real check, just returned mock

    def get(self, request):
        # Mock endpoint to verify session matching Express
        return Response({
            'user': {
                'id': 'mock-id',
                'name': 'Sarah Jenkins',
                'email': 'demo@guardiantutoring.com',
                'role': 'Admission Manager'
            }
        })
