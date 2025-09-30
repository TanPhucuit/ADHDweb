from django.db import models
from django.conf import settings

class Schedule(models.Model):
    """Daily/weekly schedules for users"""
    SCHEDULE_TYPES = (
        ('daily', 'Daily Schedule'),
        ('weekly', 'Weekly Schedule'),
        ('custom', 'Custom Schedule'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='schedules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    schedule_type = models.CharField(max_length=10, choices=SCHEDULE_TYPES, default='daily')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class ScheduleActivity(models.Model):
    """Activities within a schedule"""
    ACTIVITY_TYPES = (
        ('medication', 'Medication'),
        ('focus_session', 'Focus Session'),
        ('break', 'Break'),
        ('meal', 'Meal'),
        ('exercise', 'Exercise'),
        ('study', 'Study'),
        ('play', 'Play Time'),
        ('sleep', 'Sleep'),
        ('custom', 'Custom Activity'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    activity_type = models.CharField(max_length=15, choices=ACTIVITY_TYPES, default='custom')
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration = models.IntegerField(help_text="Duration in minutes")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.JSONField(null=True, blank=True, help_text="Days of week, frequency, etc.")
    reminder_enabled = models.BooleanField(default=True)
    reminder_minutes_before = models.IntegerField(default=15)
    color = models.CharField(max_length=7, default='#007bff')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_time']
    
    def __str__(self):
        return f"{self.schedule} - {self.title} ({self.start_time})"

class ActivityCompletion(models.Model):
    """Track completion of scheduled activities"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('cancelled', 'Cancelled'),
        ('in_progress', 'In Progress'),
    )
    
    activity = models.ForeignKey(ScheduleActivity, on_delete=models.CASCADE, related_name='completions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_completions')
    scheduled_date = models.DateField()
    scheduled_start_time = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    completion_notes = models.TextField(blank=True, null=True)
    rating = models.IntegerField(null=True, blank=True, help_text="1-5 rating of the activity")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('activity', 'user', 'scheduled_date')
    
    def __str__(self):
        return f"{self.activity.title} - {self.scheduled_date} ({self.status})"

class ScheduleTemplate(models.Model):
    """Pre-defined schedule templates"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, help_text="school_day, weekend, vacation, etc.")
    template_data = models.JSONField(help_text="JSON structure of the schedule")
    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_templates')
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class ScheduleReminder(models.Model):
    """Reminders for scheduled activities"""
    activity_completion = models.ForeignKey(ActivityCompletion, on_delete=models.CASCADE, related_name='reminders')
    reminder_time = models.DateTimeField()
    message = models.TextField()
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Reminder for {self.activity_completion.activity.title} at {self.reminder_time}"
