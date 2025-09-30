from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from django.utils import timezone
from .models import (
    RewardCategory, Reward, UserPoints, PointsTransaction,
    UserReward, Achievement, UserAchievement
)
from .serializers import (
    RewardCategorySerializer, RewardSerializer, UserPointsSerializer,
    PointsTransactionSerializer, UserRewardSerializer, 
    AchievementSerializer, UserAchievementSerializer
)

class RewardCategoryListView(generics.ListAPIView):
    """List reward categories"""
    queryset = RewardCategory.objects.filter(is_active=True)
    serializer_class = RewardCategorySerializer
    permission_classes = [IsAuthenticated]

class RewardListView(generics.ListAPIView):
    """List available rewards"""
    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        category_id = self.request.query_params.get('category')
        queryset = Reward.objects.filter(is_active=True)
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        return queryset.select_related('category')

class UserPointsView(generics.RetrieveAPIView):
    """Get user points information"""
    serializer_class = UserPointsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        obj, created = UserPoints.objects.get_or_create(
            user=self.request.user
        )
        return obj

class PointsTransactionListView(generics.ListAPIView):
    """List user points transactions"""
    serializer_class = PointsTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PointsTransaction.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

class UserRewardListView(generics.ListAPIView):
    """List user's claimed rewards"""
    serializer_class = UserRewardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserReward.objects.filter(
            user=self.request.user
        ).select_related('reward', 'reward__category').order_by('-claimed_at')

class AchievementListView(generics.ListAPIView):
    """List available achievements"""
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

class UserAchievementListView(generics.ListAPIView):
    """List user's earned achievements"""
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserAchievement.objects.filter(
            user=self.request.user
        ).select_related('achievement').order_by('-earned_at')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def award_points(request):
    """Award points to user"""
    user = request.user
    points = int(request.data.get('points', 0))
    description = request.data.get('description', 'Points awarded')
    reference_id = request.data.get('reference_id')
    
    if points <= 0:
        return Response(
            {'error': 'Points must be positive'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        # Get or create user points
        user_points, created = UserPoints.objects.get_or_create(
            user=user
        )
        
        # Update points
        user_points.total_points += points
        user_points.available_points += points
        user_points.lifetime_earned += points
        user_points.save()
        
        # Create transaction record
        transaction_obj = PointsTransaction.objects.create(
            user=user,
            transaction_type='earned',
            points=points,
            description=description,
            reference_id=reference_id
        )
    
    return Response({
        'message': f'{points} points awarded successfully',
        'user_points': UserPointsSerializer(user_points).data,
        'transaction': PointsTransactionSerializer(transaction_obj).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_reward(request):
    """Claim a reward using points"""
    user = request.user
    reward_id = request.data.get('reward_id')
    
    try:
        reward = Reward.objects.get(id=reward_id, is_active=True)
    except Reward.DoesNotExist:
        return Response(
            {'error': 'Reward not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get user points
    user_points, created = UserPoints.objects.get_or_create(user=user)
    
    # Check if user has enough points
    if user_points.available_points < reward.points_cost:
        return Response(
            {'error': 'Insufficient points'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        # Deduct points
        user_points.available_points -= reward.points_cost
        user_points.lifetime_spent += reward.points_cost
        user_points.save()
        
        # Create user reward
        user_reward = UserReward.objects.create(
            user=user,
            reward=reward,
            points_spent=reward.points_cost,
            status='claimed'
        )
        
        # Create transaction record
        PointsTransaction.objects.create(
            user=user,
            transaction_type='spent',
            points=reward.points_cost,
            description=f'Claimed reward: {reward.name}',
            reference_id=str(user_reward.id)
        )
    
    return Response({
        'message': f'Reward "{reward.name}" claimed successfully',
        'user_reward': UserRewardSerializer(user_reward).data,
        'remaining_points': user_points.available_points
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_achievements(request):
    """Check and award achievements based on user activity"""
    user = request.user
    activity_type = request.data.get('activity_type')  # focus, medication, etc.
    activity_data = request.data.get('activity_data', {})
    
    # This is a simplified achievement system
    # In a real app, you'd have more complex criteria checking
    
    new_achievements = []
    
    # Example: Focus session achievements
    if activity_type == 'focus_completed':
        from focus.models import FocusSession
        
        total_sessions = FocusSession.objects.filter(
            user=user, 
            status='completed'
        ).count()
        
        # Check for session milestones
        milestones = [1, 5, 10, 25, 50, 100]
        for milestone in milestones:
            if total_sessions >= milestone:
                achievement_name = f"Focus Master {milestone}"
                achievement, created = Achievement.objects.get_or_create(
                    name=achievement_name,
                    defaults={
                        'description': f'Complete {milestone} focus sessions',
                        'points_reward': milestone * 10,
                        'criteria': {'focus_sessions': milestone}
                    }
                )
                
                # Award if not already earned
                user_achievement, awarded = UserAchievement.objects.get_or_create(
                    user=user,
                    achievement=achievement
                )
                
                if awarded:
                    new_achievements.append(achievement)
                    
                    # Award points
                    user_points, _ = UserPoints.objects.get_or_create(user=user)
                    points = achievement.points_reward
                    user_points.total_points += points
                    user_points.available_points += points
                    user_points.lifetime_earned += points
                    user_points.save()
                    
                    # Create transaction
                    PointsTransaction.objects.create(
                        user=user,
                        transaction_type='bonus',
                        points=points,
                        description=f'Achievement: {achievement.name}',
                        reference_id=str(user_achievement.id)
                    )
    
    return Response({
        'new_achievements': AchievementSerializer(new_achievements, many=True).data,
        'message': f'{len(new_achievements)} new achievements unlocked!'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rewards_dashboard(request):
    """Get rewards dashboard data"""
    user = request.user
    
    # User points
    user_points, _ = UserPoints.objects.get_or_create(user=user)
    
    # Recent transactions (last 10)
    recent_transactions = PointsTransaction.objects.filter(
        user=user
    ).order_by('-created_at')[:10]
    
    # Available rewards (that user can afford)
    affordable_rewards = Reward.objects.filter(
        is_active=True,
        points_cost__lte=user_points.available_points
    ).select_related('category')[:5]
    
    # Recent achievements (last 5)
    recent_achievements = UserAchievement.objects.filter(
        user=user
    ).select_related('achievement').order_by('-earned_at')[:5]
    
    # Claimed rewards (last 5)
    recent_rewards = UserReward.objects.filter(
        user=user
    ).select_related('reward').order_by('-claimed_at')[:5]
    
    return Response({
        'user_points': UserPointsSerializer(user_points).data,
        'recent_transactions': PointsTransactionSerializer(recent_transactions, many=True).data,
        'affordable_rewards': RewardSerializer(affordable_rewards, many=True).data,
        'recent_achievements': UserAchievementSerializer(recent_achievements, many=True).data,
        'recent_rewards': UserRewardSerializer(recent_rewards, many=True).data,
        'stats': {
            'total_achievements': UserAchievement.objects.filter(user=user).count(),
            'total_rewards_claimed': UserReward.objects.filter(user=user).count(),
            'points_earned_this_week': PointsTransaction.objects.filter(
                user=user,
                transaction_type='earned',
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).aggregate(total=models.Sum('points'))['total'] or 0
        }
    })
