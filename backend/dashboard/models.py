from django.db import models
from django.conf import settings

class DashboardWidget(models.Model):
    """Dashboard widgets configuration"""
    WIDGET_TYPES = (
        ('focus_trends', 'Focus Trends'),
        ('medication_adherence', 'Medication Adherence'),
        ('weekly_progress', 'Weekly Progress'),
        ('upcoming_activities', 'Upcoming Activities'),
        ('points_summary', 'Points Summary'),
        ('recent_achievements', 'Recent Achievements'),
        ('mood_tracker', 'Mood Tracker'),
        ('quick_actions', 'Quick Actions'),
    )
    
    name = models.CharField(max_length=100)
    widget_type = models.CharField(max_length=25, choices=WIDGET_TYPES)
    description = models.TextField(blank=True, null=True)
    default_config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserDashboard(models.Model):
    """User's personalized dashboard configuration"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dashboard')
    layout = models.JSONField(default=dict, help_text="Dashboard layout configuration")
    theme = models.CharField(max_length=20, default='light')
    refresh_interval = models.IntegerField(default=300, help_text="Seconds")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Dashboard"

class UserDashboardWidget(models.Model):
    """User's dashboard widget instances"""
    dashboard = models.ForeignKey(UserDashboard, on_delete=models.CASCADE, related_name='widgets')
    widget = models.ForeignKey(DashboardWidget, on_delete=models.CASCADE)
    position = models.JSONField(help_text="x, y, width, height")
    config = models.JSONField(default=dict, help_text="Widget-specific configuration")
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.dashboard.user.username} - {self.widget.name}"

class DashboardMetrics(models.Model):
    """Daily dashboard metrics snapshot"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_metrics')
    date = models.DateField()
    
    # Focus metrics
    focus_sessions_completed = models.IntegerField(default=0)
    total_focus_time = models.IntegerField(default=0, help_text="Minutes")
    focus_sessions_goal = models.IntegerField(default=0)
    
    # Medication metrics
    medications_taken = models.IntegerField(default=0)
    medications_scheduled = models.IntegerField(default=0)
    medication_adherence_rate = models.FloatField(default=0.0)
    
    # Activity metrics
    activities_completed = models.IntegerField(default=0)
    activities_scheduled = models.IntegerField(default=0)
    activity_completion_rate = models.FloatField(default=0.0)
    
    # Points and rewards
    points_earned_today = models.IntegerField(default=0)
    points_spent_today = models.IntegerField(default=0)
    total_available_points = models.IntegerField(default=0)
    
    # Mood and wellbeing
    mood_score = models.FloatField(null=True, blank=True, help_text="1-5 scale")
    energy_level = models.FloatField(null=True, blank=True, help_text="1-5 scale")
    sleep_hours = models.FloatField(null=True, blank=True)
    sleep_quality = models.FloatField(null=True, blank=True, help_text="1-5 scale")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'date')
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"

class SystemNotification(models.Model):
    """System-wide notifications"""
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('success', 'Success'),
        ('error', 'Error'),
        ('reminder', 'Reminder'),
    )
    
    PRIORITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    target_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='system_notifications')
    is_global = models.BooleanField(default=False, help_text="Show to all users")
    action_url = models.URLField(blank=True, null=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.notification_type})"

class UserNotificationStatus(models.Model):
    """Track which notifications users have seen/dismissed"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_status')
    notification = models.ForeignKey(SystemNotification, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'notification')
    
    def __str__(self):
        return f"{self.user.username} - {self.notification.title}"
