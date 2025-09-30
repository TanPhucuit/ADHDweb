from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .serializers import LoginSerializer, PasswordResetSerializer
from users.serializers import UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    
    return Response(
        serializer.errors, 
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        # Delete the token
        Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response(
            {'error': 'Logout failed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Get current user info"""
    return Response(UserSerializer(request.user).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset"""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        # In a real app, you would send an email here
        # For now, just return success
        return Response({
            'message': 'Password reset link sent to your email'
        })
    
    return Response(
        serializer.errors, 
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    """Verify if token is valid"""
    token = request.data.get('token')
    if not token:
        return Response(
            {'error': 'Token is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        token_obj = Token.objects.get(key=token)
        user = token_obj.user
        if user.is_active:
            return Response({
                'valid': True,
                'user': UserSerializer(user).data
            })
        else:
            return Response(
                {'valid': False, 'error': 'User is inactive'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Token.DoesNotExist:
        return Response(
            {'valid': False, 'error': 'Invalid token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
