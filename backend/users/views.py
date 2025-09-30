from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from .models import User, Profile, ParentChildRelation
from .serializers import (
    UserSerializer, UserUpdateSerializer, 
    ParentChildRelationSerializer, ProfileSerializer
)

class UserRegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """List users (for admin/parent)"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'parent':
            # Parents can see their children
            child_ids = ParentChildRelation.objects.filter(
                parent=user, is_active=True
            ).values_list('child_id', flat=True)
            return User.objects.filter(id__in=child_ids)
        else:
            # Children can only see themselves
            return User.objects.filter(id=user.id)

class ParentChildRelationView(generics.ListCreateAPIView):
    """Manage parent-child relationships"""
    serializer_class = ParentChildRelationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'parent':
            return ParentChildRelation.objects.filter(parent=user)
        else:
            return ParentChildRelation.objects.filter(child=user)
    
    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_data(request):
    """Get dashboard data for user"""
    user = request.user
    
    # Basic user info
    data = {
        'user': UserSerializer(user).data,
        'user_type': user.user_type,
    }
    
    # Add specific data based on user type
    if user.user_type == 'parent':
        children = ParentChildRelation.objects.filter(
            parent=user, is_active=True
        ).select_related('child')
        data['children'] = [
            UserSerializer(rel.child).data for rel in children
        ]
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response(
            {'error': 'Invalid old password'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'})
