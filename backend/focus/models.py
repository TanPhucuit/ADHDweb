from django.db import models
from django.conf import settings

class FocusSession(models.Model):
    """Pomodoro/Focus session tracking"""
    SESSION_TYPES = (
        ('pomodoro', 'Pomodoro'),
        ('focus', 'Focus'),
        ('break', 'Break'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_sessions')
    session_type = models.CharField(max_length=10, choices=SESSION_TYPES, default='pomodoro')
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    planned_duration = models.IntegerField(help_text="Duration in minutes")
    actual_duration = models.IntegerField(null=True, blank=True, help_text="Actual duration in minutes")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.session_type.title()} ({self.planned_duration}min)"

class FocusSound(models.Model):
    """Focus sounds for concentration"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)    
    sound_file = models.FileField(upload_to='focus_sounds/')
    category = models.CharField(max_length=50, default='nature')
    duration = models.IntegerField(help_text="Duration in seconds")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserFocusSettings(models.Model):
    """User's focus/pomodoro settings"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_settings')
    pomodoro_duration = models.IntegerField(default=25, help_text="Minutes")
    short_break_duration = models.IntegerField(default=5, help_text="Minutes")
    long_break_duration = models.IntegerField(default=15, help_text="Minutes")
    sessions_before_long_break = models.IntegerField(default=4)
    auto_start_breaks = models.BooleanField(default=False)
    auto_start_pomodoros = models.BooleanField(default=False)
    sound_enabled = models.BooleanField(default=True)
    notification_enabled = models.BooleanField(default=True)
    preferred_sound = models.ForeignKey(FocusSound, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Focus Settings"
