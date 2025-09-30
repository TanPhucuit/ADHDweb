from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    ScheduleTemplate, Schedule, ScheduleActivity,
    ActivityCompletion, ScheduleReminder
)

User = get_user_model()

class UserScheduleSerializer(serializers.ModelSerializer):
    """Basic user serializer for schedules"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name']

class ScheduleActivitySerializer(serializers.ModelSerializer):
    """Schedule activity serializer"""
    is_completed = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduleActivity
        fields = [
            'id', 'schedule', 'title', 'description', 'activity_type',
            'start_time', 'end_time', 'duration', 'priority',
            'is_recurring', 'recurrence_pattern', 'reminder_enabled',
            'reminder_minutes_before', 'color', 'is_completed', 'is_overdue'
        ]
    
    def get_is_completed(self, obj):
        # Check if there's a completed activity completion for today
        from django.utils import timezone
        today = timezone.now().date()
        return obj.completions.filter(
            scheduled_date=today,
            status='completed'
        ).exists()
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        # Check if activity is overdue based on completions
        completion = obj.completions.filter(scheduled_date=today).first()
        if completion and completion.status == 'completed':
            return False
        # Simple check - if end_time has passed today
        now = timezone.now()
        today_end = timezone.make_aware(timezone.datetime.combine(today, obj.end_time))
        return now > today_end

class ScheduleTemplateSerializer(serializers.ModelSerializer):
    """Schedule template serializer"""
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduleTemplate
        fields = [
            'id', 'name', 'description', 'template_type',
            'age_group', 'is_active', 'created_at', 'items_count'
        ]
    
    def get_items_count(self, obj):
        return obj.template_items.count()

class ScheduleSerializer(serializers.ModelSerializer):
    """Schedule with items"""
    user = UserScheduleSerializer(read_only=True)
    template = ScheduleTemplateSerializer(read_only=True)
    activities = ScheduleActivitySerializer(many=True, read_only=True)
    completion_rate = serializers.SerializerMethodField()
    next_item = serializers.SerializerMethodField()
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'user', 'template', 'title', 'description',
            'start_date', 'schedule_type', 'activities', 'completion_rate',
            'next_item', 'created_at', 'updated_at'
        ]
    
    def get_completion_rate(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        total_activities = obj.activities.count()
        if total_activities == 0:
            return 0
        completed_count = 0
        for activity in obj.activities.all():
            if activity.completions.filter(scheduled_date=today, status='completed').exists():
                completed_count += 1
        return (completed_count / total_activities) * 100
    
    def get_next_item(self, obj):
        from django.utils import timezone
        now = timezone.now()
        today = now.date()
        
        # Find next activity that hasn't been completed today
        for activity in obj.activities.filter(start_time__gte=now.time()).order_by('start_time'):
            if not activity.completions.filter(scheduled_date=today, status='completed').exists():
                return {
                    'id': activity.id,
                    'title': activity.title,
                    'start_time': activity.start_time,
                    'activity_type': activity.activity_type
                }
        return None

class ScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating schedules"""
    template_id = serializers.IntegerField(required=False)
    
    class Meta:
        model = Schedule
        fields = ['title', 'description', 'schedule_date', 'template_id']
    
    def create(self, validated_data):
        template_id = validated_data.pop('template_id', None)
        template = None
        
        if template_id:
            try:
                template = ScheduleTemplate.objects.get(id=template_id, is_active=True)
            except ScheduleTemplate.DoesNotExist:
                pass
        
        schedule = Schedule.objects.create(
            user=self.context['request'].user,
            template=template,
            **validated_data
        )
        
        # Create items from template if available
        if template:
            template_items = template.template_items.all()
            for template_item in template_items:
                # Template functionality would need to be implemented
                # based on actual ScheduleTemplate structure
                pass
        
        return schedule

class ScheduleActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating schedule activities"""
    
    class Meta:
        model = ScheduleActivity
        fields = [
            'schedule', 'title', 'description', 'activity_type',
            'start_time', 'end_time', 'duration', 'priority',
            'is_recurring', 'recurrence_pattern', 'reminder_enabled',
            'reminder_minutes_before', 'color'
        ]
    
    def validate(self, data):
        # Ensure end_time is after start_time
        if data.get('start_time') and data.get('end_time'):
            if data['end_time'] <= data['start_time']:
                raise serializers.ValidationError("End time must be after start time")
        
        # Calculate end_time from duration if not provided
        if data.get('start_time') and data.get('duration') and not data.get('end_time'):
            data['end_time'] = data['start_time'] + data['duration']
        
        return data

# class ReminderSerializer(serializers.ModelSerializer):
#     """Reminder serializer - to be implemented"""
#     pass

# class RecurringEventSerializer(serializers.ModelSerializer):
#     """Recurring event serializer - to be implemented"""
#     pass

class ScheduleStatsSerializer(serializers.Serializer):
    """Schedule statistics serializer"""
    total_schedules = serializers.IntegerField()
    active_schedules = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    overdue_items = serializers.IntegerField()
    upcoming_items = serializers.ListField()
    weekly_progress = serializers.ListField()

class DailyScheduleSerializer(serializers.Serializer):
    """Daily schedule overview serializer"""
    date = serializers.DateField()
    total_items = serializers.IntegerField()
    completed_items = serializers.IntegerField()
    pending_items = serializers.IntegerField()
    overdue_items = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    activities = ScheduleActivitySerializer(many=True)

class WeeklyScheduleSerializer(serializers.Serializer):
    """Weekly schedule overview serializer"""
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    daily_schedules = DailyScheduleSerializer(many=True)
    week_completion_rate = serializers.FloatField()
    total_items = serializers.IntegerField()
    completed_items = serializers.IntegerField()