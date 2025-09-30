from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    AssessmentTemplate, Assessment, AssessmentQuestion, 
    AssessmentResponse, WeeklyAssessment, BehaviorLog, 
    ProgressReport
)

User = get_user_model()

class UserAssessmentSerializer(serializers.ModelSerializer):
    """Basic user serializer for assessments"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name']

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    """Assessment question serializer"""
    
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id', 'template', 'question_text', 'question_type',
            'options', 'is_required', 'order', 'scoring_criteria'
        ]

class AssessmentTemplateSerializer(serializers.ModelSerializer):
    """Assessment template with questions"""
    questions = AssessmentQuestionSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = AssessmentTemplate
        fields = [
            'id', 'name', 'description', 'template_type', 'age_range',
            'estimated_duration', 'scoring_method', 'is_active',
            'created_at', 'questions', 'total_questions'
        ]
    
    def get_total_questions(self, obj):
        return obj.questions.count()

class AssessmentResponseSerializer(serializers.ModelSerializer):
    """Assessment response serializer"""
    question = AssessmentQuestionSerializer(read_only=True)
    
    class Meta:
        model = AssessmentResponse
        fields = [
            'id', 'assessment', 'question', 'response_value',
            'response_text', 'score', 'created_at'
        ]

class AssessmentSerializer(serializers.ModelSerializer):
    """Assessment with responses"""
    user = UserAssessmentSerializer(read_only=True)
    template = AssessmentTemplateSerializer(read_only=True)
    responses = AssessmentResponseSerializer(many=True, read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = [
            'id', 'user', 'template', 'status', 'total_score',
            'max_possible_score', 'started_at', 'completed_at',
            'responses', 'completion_percentage', 'notes'
        ]
    
    def get_completion_percentage(self, obj):
        if obj.template:
            total_questions = obj.template.questions.count()
            completed_responses = obj.responses.count()
            if total_questions > 0:
                return (completed_responses / total_questions) * 100
        return 0

class AssessmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating assessments"""
    template_id = serializers.IntegerField()
    
    class Meta:
        model = Assessment
        fields = ['template_id']
    
    def validate_template_id(self, value):
        try:
            template = AssessmentTemplate.objects.get(id=value, is_active=True)
            return value
        except AssessmentTemplate.DoesNotExist:
            raise serializers.ValidationError("Template not found or inactive")
    
    def create(self, validated_data):
        template = AssessmentTemplate.objects.get(id=validated_data['template_id'])
        assessment = Assessment.objects.create(
            user=self.context['request'].user,
            template=template,
            status='in_progress',
            max_possible_score=template.questions.count() * 5  # Assuming 5-point scale
        )
        return assessment

class SubmitResponseSerializer(serializers.Serializer):
    """Serializer for submitting assessment responses"""
    question_id = serializers.IntegerField()
    response_value = serializers.IntegerField(required=False)
    response_text = serializers.CharField(max_length=1000, required=False)
    
    def validate(self, data):
        if not data.get('response_value') and not data.get('response_text'):
            raise serializers.ValidationError("Either response_value or response_text is required")
        return data

class WeeklyAssessmentSerializer(serializers.ModelSerializer):
    """Weekly assessment serializer"""
    user = UserAssessmentSerializer(read_only=True)
    
    class Meta:
        model = WeeklyAssessment
        fields = [
            'id', 'user', 'week_start', 'mood_rating', 'focus_rating',
            'sleep_quality', 'medication_adherence', 'behavior_notes',
            'parent_notes', 'goals_met', 'challenges', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class BehaviorLogSerializer(serializers.ModelSerializer):
    """Behavior log serializer"""
    user = UserAssessmentSerializer(read_only=True)
    
    class Meta:
        model = BehaviorLog
        fields = [
            'id', 'user', 'behavior_type', 'intensity', 'duration',
            'triggers', 'location', 'time_of_day', 'notes',
            'logged_at', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class ProgressReportSerializer(serializers.ModelSerializer):
    """Progress report serializer"""
    user = UserAssessmentSerializer(read_only=True)
    
    class Meta:
        model = ProgressReport
        fields = [
            'id', 'user', 'report_type', 'period_start', 'period_end',
            'overall_score', 'improvement_areas', 'strengths',
            'recommendations', 'generated_data', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class AssessmentStatsSerializer(serializers.Serializer):
    """Assessment statistics serializer"""
    total_assessments = serializers.IntegerField()
    completed_assessments = serializers.IntegerField()
    in_progress_assessments = serializers.IntegerField()
    average_score = serializers.FloatField()
    improvement_percentage = serializers.FloatField()
    recent_assessments = serializers.ListField()
    
class BehaviorAnalysisSerializer(serializers.Serializer):
    """Behavior analysis serializer"""
    total_logs = serializers.IntegerField()
    most_common_behavior = serializers.CharField()
    average_intensity = serializers.FloatField()
    common_triggers = serializers.ListField()
    time_patterns = serializers.DictField()
    weekly_trends = serializers.ListField()

class WeeklyAssessmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating weekly assessments"""
    
    class Meta:
        model = WeeklyAssessment
        fields = [
            'mood_rating', 'focus_rating', 'sleep_quality',
            'medication_adherence', 'behavior_notes', 'parent_notes',
            'goals_met', 'challenges'
        ]
    
    def create(self, validated_data):
        # Set week_start to beginning of current week
        from django.utils import timezone
        import datetime
        
        now = timezone.now()
        week_start = now - datetime.timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        validated_data['user'] = self.context['request'].user
        validated_data['week_start'] = week_start
        
        return super().create(validated_data)