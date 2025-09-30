from django.db import models
from django.conf import settings

class AssessmentCategory(models.Model):
    """Categories for assessments (ADHD, focus, behavior, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Assessment Categories"
    
    def __str__(self):
        return self.name

class Assessment(models.Model):
    """Assessment templates/forms"""
    ASSESSMENT_TYPES = (
        ('weekly', 'Weekly Assessment'),
        ('monthly', 'Monthly Assessment'),
        ('diagnostic', 'Diagnostic Assessment'),
        ('progress', 'Progress Assessment'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(AssessmentCategory, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.CharField(max_length=15, choices=ASSESSMENT_TYPES, default='weekly')
    instructions = models.TextField(blank=True, null=True)
    estimated_duration = models.IntegerField(help_text="Estimated duration in minutes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class AssessmentQuestion(models.Model):
    """Questions within an assessment"""
    QUESTION_TYPES = (
        ('multiple_choice', 'Multiple Choice'),
        ('scale', 'Scale (1-5, 1-10)'),
        ('text', 'Text Response'),
        ('yes_no', 'Yes/No'),
        ('checkbox', 'Checkbox'),
    )
    
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    options = models.JSONField(null=True, blank=True, help_text="Options for multiple choice, scale range, etc.")
    is_required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    help_text = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.assessment.title} - Q{self.order}"

class UserAssessment(models.Model):
    """User's assessment instances"""
    STATUS_CHOICES = (
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessments')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='not_started')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.assessment.title} ({self.status})"

class AssessmentResponse(models.Model):
    """User's responses to assessment questions"""
    user_assessment = models.ForeignKey(UserAssessment, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    response_value = models.JSONField(help_text="Stores the actual response value")
    response_text = models.TextField(blank=True, null=True, help_text="For text responses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user_assessment', 'question')
    
    def __str__(self):
        return f"{self.user_assessment} - Q{self.question.order}"

class AssessmentResult(models.Model):
    """Processed assessment results and insights"""
    user_assessment = models.OneToOneField(UserAssessment, on_delete=models.CASCADE, related_name='result')
    overall_score = models.FloatField()
    category_scores = models.JSONField(default=dict, help_text="Scores by category/section")
    insights = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    risk_level = models.CharField(max_length=20, blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user_assessment} - Score: {self.overall_score}"

class WeeklyProgress(models.Model):
    """Weekly progress tracking"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weekly_progress')
    week_start_date = models.DateField()
    focus_sessions_completed = models.IntegerField(default=0)
    medication_adherence_rate = models.FloatField(default=0.0, help_text="Percentage")
    mood_average = models.FloatField(null=True, blank=True)
    sleep_quality_average = models.FloatField(null=True, blank=True)
    behavior_score = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'week_start_date')
    
    def __str__(self):
        return f"{self.user.username} - Week of {self.week_start_date}"
