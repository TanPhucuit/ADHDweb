from django.db import models
from django.conf import settings

class RewardCategory(models.Model):
    """Categories for rewards"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=7, default='#007bff')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Reward Categories"
    
    def __str__(self):
        return self.name

class Reward(models.Model):
    """Available rewards in the system"""
    REWARD_TYPES = (
        ('virtual', 'Virtual Reward'),
        ('physical', 'Physical Reward'),
        ('activity', 'Activity'),
        ('privilege', 'Privilege'),
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(RewardCategory, on_delete=models.CASCADE, related_name='rewards')
    reward_type = models.CharField(max_length=10, choices=REWARD_TYPES, default='virtual')
    points_cost = models.IntegerField(default=0)
    image = models.ImageField(upload_to='rewards/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.points_cost} points)"

class UserPoints(models.Model):
    """User's points tracking"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points')
    total_points = models.IntegerField(default=0)
    available_points = models.IntegerField(default=0)
    lifetime_earned = models.IntegerField(default=0)
    lifetime_spent = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.available_points} points"

class PointsTransaction(models.Model):
    """Points earning and spending history"""
    TRANSACTION_TYPES = (
        ('earned', 'Earned'),
        ('spent', 'Spent'),
        ('bonus', 'Bonus'),
        ('penalty', 'Penalty'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points_transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    points = models.IntegerField()
    description = models.CharField(max_length=200)
    reference_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID of related activity/task")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} {self.transaction_type} {self.points} points"

class UserReward(models.Model):
    """User's claimed/earned rewards"""
    STATUS_CHOICES = (
        ('claimed', 'Claimed'),
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('expired', 'Expired'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='earned_rewards')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    points_spent = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='claimed')
    claimed_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} claimed {self.reward.name}"

class Achievement(models.Model):
    """Achievement badges/milestones"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True)
    badge_image = models.ImageField(upload_to='achievements/', blank=True, null=True)
    points_reward = models.IntegerField(default=0)
    criteria = models.JSONField(help_text="JSON criteria for earning this achievement")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    """User's earned achievements"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'achievement')
    
    def __str__(self):
        return f"{self.user.username} earned {self.achievement.name}"
