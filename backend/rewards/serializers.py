# Rewards serializers
from rest_framework import serializers
from .models import (
    RewardCategory, Reward, UserPoints, PointsTransaction,
    UserReward, Achievement, UserAchievement
)

class RewardCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardCategory
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class RewardSerializer(serializers.ModelSerializer):
    category = RewardCategorySerializer(read_only=True)
    
    class Meta:
        model = Reward
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserPointsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = UserPoints
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class PointsTransactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = PointsTransaction
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']

class UserRewardSerializer(serializers.ModelSerializer):
    reward = RewardSerializer(read_only=True)
    reward_id = serializers.IntegerField(write_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = UserReward
        fields = '__all__'
        read_only_fields = ['id', 'user', 'claimed_at']

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ['id', 'user', 'earned_at']