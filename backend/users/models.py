from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Extended User model"""
    USER_TYPES = (
        ('parent', 'Parent'),
        ('child', 'Child'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='parent')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"

class Profile(models.Model):
    """User profile with additional information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class ParentChildRelation(models.Model):
    """Relationship between parent and child users"""
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children')
    child = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parents')
    relationship_type = models.CharField(max_length=20, default='parent-child')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('parent', 'child')
    
    def __str__(self):
        return f"{self.parent.username} -> {self.child.username}"
