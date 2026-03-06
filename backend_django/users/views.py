from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate

class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Authenticate against DB
        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            user_data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
            return Response({
                'token': str(refresh.access_token),
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
