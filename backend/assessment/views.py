from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from django.utils import timezone
from django.db.models import Avg, Count, Q, Sum
from datetime import datetime, timedelta

from .models import (
    AssessmentCategory, Assessment, AssessmentQuestion,
    AssessmentResponse, UserAssessment, WeeklyProgress, 
    AssessmentResult
)
# Simplified imports for now
from rest_framework.response import Response

class AssessmentCategoryListView(generics.ListAPIView):
    """List available assessment categories"""
    queryset = AssessmentCategory.objects.filter(is_active=True)
    serializer_class = AssessmentCategorySerializer
    permission_classes = [IsAuthenticated]

class AssessmentListCreateView(generics.ListCreateAPIView):
    """List user assessments or create new assessment"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AssessmentCreateSerializer
        return AssessmentSerializer
    
    def get_queryset(self):
        return Assessment.objects.filter(
            user=self.request.user
        ).select_related('template', 'user').prefetch_related(
            'responses__question'
        ).order_by('-started_at')

class AssessmentDetailView(generics.RetrieveAPIView):
    """Get assessment details"""
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Assessment.objects.filter(user=self.request.user)

class WeeklyAssessmentListCreateView(generics.ListCreateAPIView):
    """List weekly assessments or create new one"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WeeklyAssessmentCreateSerializer
        return WeeklyAssessmentSerializer
    
    def get_queryset(self):
        return WeeklyAssessment.objects.filter(
            user=self.request.user
        ).order_by('-week_start')

class BehaviorLogListCreateView(generics.ListCreateAPIView):
    """List behavior logs or create new log"""
    serializer_class = BehaviorLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return BehaviorLog.objects.filter(
            user=self.request.user
        ).order_by('-logged_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProgressReportListView(generics.ListAPIView):
    """List progress reports"""
    serializer_class = ProgressReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProgressReport.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assessment_response(request, assessment_id):
    """Submit response to assessment question"""
    try:
        assessment = Assessment.objects.get(
            id=assessment_id,
            user=request.user,
            status='in_progress'
        )
    except Assessment.DoesNotExist:
        return Response(
            {'error': 'Assessment not found or not in progress'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = SubmitResponseSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    question_id = serializer.validated_data['question_id']
    
    try:
        question = AssessmentQuestion.objects.get(
            id=question_id,
            template=assessment.template
        )
    except AssessmentQuestion.DoesNotExist:
        return Response(
            {'error': 'Question not found in this assessment'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create or update response
    response_obj, created = AssessmentResponse.objects.update_or_create(
        assessment=assessment,
        question=question,
        defaults={
            'response_value': serializer.validated_data.get('response_value'),
            'response_text': serializer.validated_data.get('response_text'),
            'score': serializer.validated_data.get('response_value', 0)
        }
    )
    
    # Check if assessment is complete
    total_questions = assessment.template.questions.count()
    completed_responses = assessment.responses.count()
    
    if completed_responses >= total_questions:
        # Calculate total score
        total_score = assessment.responses.aggregate(
            total=Sum('score')
        )['total'] or 0
        
        assessment.status = 'completed'
        assessment.total_score = total_score
        assessment.completed_at = timezone.now()
        assessment.save()
    
    return Response({
        'message': 'Response submitted successfully',
        'response': AssessmentResponseSerializer(response_obj).data,
        'assessment_status': assessment.status,
        'completion_percentage': (completed_responses / total_questions) * 100
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_dashboard(request):
    """Get assessment dashboard data"""
    user = request.user
    
    # Basic stats
    assessments = Assessment.objects.filter(user=user)
    total_assessments = assessments.count()
    completed_assessments = assessments.filter(status='completed').count()
    in_progress_assessments = assessments.filter(status='in_progress').count()
    
    # Average score
    avg_score = assessments.filter(status='completed').aggregate(
        avg=Avg('total_score')
    )['avg'] or 0
    
    # Recent assessments
    recent_assessments = assessments.select_related('template').order_by('-started_at')[:5]
    recent_list = []
    for assessment in recent_assessments:
        recent_list.append({
            'id': assessment.id,
            'template_name': assessment.template.name,
            'status': assessment.status,
            'score': assessment.total_score,
            'started_at': assessment.started_at,
            'completed_at': assessment.completed_at
        })
    
    # Improvement calculation (compare last 2 completed assessments)
    completed = assessments.filter(status='completed').order_by('-completed_at')[:2]
    improvement_percentage = 0
    if len(completed) >= 2:
        latest_score = completed[0].total_score or 0
        previous_score = completed[1].total_score or 0
        if previous_score > 0:
            improvement_percentage = ((latest_score - previous_score) / previous_score) * 100
    
    stats = {
        'total_assessments': total_assessments,
        'completed_assessments': completed_assessments,
        'in_progress_assessments': in_progress_assessments,
        'average_score': round(avg_score, 2),
        'improvement_percentage': round(improvement_percentage, 2),
        'recent_assessments': recent_list
    }
    
    # Weekly assessments (last 4 weeks)
    weekly_assessments = WeeklyAssessment.objects.filter(
        user=user,
        week_start__gte=timezone.now() - timedelta(weeks=4)
    ).order_by('-week_start')
    
    # Behavior logs (last 7 days)
    recent_behaviors = BehaviorLog.objects.filter(
        user=user,
        logged_at__gte=timezone.now() - timedelta(days=7)
    ).order_by('-logged_at')[:10]
    
    return Response({
        'stats': stats,
        'weekly_assessments': WeeklyAssessmentSerializer(weekly_assessments, many=True).data,
        'recent_behaviors': BehaviorLogSerializer(recent_behaviors, many=True).data,
        'templates': AssessmentTemplateSerializer(
            AssessmentTemplate.objects.filter(is_active=True)[:5], 
            many=True
        ).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavior_analysis(request):
    """Analyze behavior patterns"""
    user = request.user
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    behaviors = BehaviorLog.objects.filter(
        user=user,
        logged_at__gte=start_date
    )
    
    total_logs = behaviors.count()
    
    if total_logs == 0:
        return Response({
            'total_logs': 0,
            'most_common_behavior': None,
            'average_intensity': 0,
            'common_triggers': [],
            'time_patterns': {},
            'weekly_trends': []
        })
    
    # Most common behavior
    most_common = behaviors.values('behavior_type').annotate(
        count=Count('behavior_type')
    ).order_by('-count').first()
    
    most_common_behavior = most_common['behavior_type'] if most_common else None
    
    # Average intensity
    avg_intensity = behaviors.aggregate(avg=Avg('intensity'))['avg'] or 0
    
    # Common triggers
    all_triggers = []
    for behavior in behaviors:
        if behavior.triggers:
            all_triggers.extend(behavior.triggers)
    
    trigger_counts = {}
    for trigger in all_triggers:
        trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
    
    common_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    common_triggers = [trigger[0] for trigger in common_triggers]
    
    # Time patterns (hour of day)
    time_patterns = {}
    for behavior in behaviors:
        hour = behavior.logged_at.hour
        time_patterns[hour] = time_patterns.get(hour, 0) + 1
    
    # Weekly trends (last 4 weeks)
    weekly_trends = []
    for i in range(4):
        week_start = timezone.now() - timedelta(weeks=i+1)
        week_end = week_start + timedelta(weeks=1)
        
        week_count = behaviors.filter(
            logged_at__gte=week_start,
            logged_at__lt=week_end
        ).count()
        
        weekly_trends.append({
            'week': f'Week {i+1}',
            'count': week_count,
            'start_date': week_start.date()
        })
    
    weekly_trends.reverse()  # Show oldest to newest
    
    return Response({
        'total_logs': total_logs,
        'most_common_behavior': most_common_behavior,
        'average_intensity': round(avg_intensity, 2),
        'common_triggers': common_triggers,
        'time_patterns': time_patterns,
        'weekly_trends': weekly_trends
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_progress_report(request):
    """Generate progress report for user"""
    user = request.user
    report_type = request.data.get('report_type', 'monthly')
    
    # Determine date range
    if report_type == 'weekly':
        days = 7
    elif report_type == 'monthly':
        days = 30
    else:  # quarterly
        days = 90
    
    period_end = timezone.now()
    period_start = period_end - timedelta(days=days)
    
    # Gather data for report
    assessments = Assessment.objects.filter(
        user=user,
        completed_at__gte=period_start,
        status='completed'
    )
    
    behaviors = BehaviorLog.objects.filter(
        user=user,
        logged_at__gte=period_start
    )
    
    weekly_assessments = WeeklyAssessment.objects.filter(
        user=user,
        week_start__gte=period_start
    )
    
    # Calculate metrics
    avg_assessment_score = assessments.aggregate(avg=Avg('total_score'))['avg'] or 0
    behavior_count = behaviors.count()
    avg_mood = weekly_assessments.aggregate(avg=Avg('mood_rating'))['avg'] or 0
    avg_focus = weekly_assessments.aggregate(avg=Avg('focus_rating'))['avg'] or 0
    
    # Generate insights
    strengths = []
    improvement_areas = []
    recommendations = []
    
    if avg_mood >= 4:
        strengths.append("Maintaining positive mood")
    elif avg_mood < 3:
        improvement_areas.append("Mood regulation")
        recommendations.append("Consider mood tracking and relaxation techniques")
    
    if avg_focus >= 4:
        strengths.append("Good focus and attention")
    elif avg_focus < 3:
        improvement_areas.append("Focus and concentration")
        recommendations.append("Implement focus improvement strategies")
    
    if behavior_count < 5:
        strengths.append("Low challenging behavior frequency")
    else:
        improvement_areas.append("Behavior management")
        recommendations.append("Review behavior triggers and coping strategies")
    
    # Generated data structure
    generated_data = {
        'period_stats': {
            'assessments_completed': assessments.count(),
            'avg_assessment_score': round(avg_assessment_score, 2),
            'behavior_logs': behavior_count,
            'weekly_check_ins': weekly_assessments.count(),
            'avg_mood_rating': round(avg_mood, 2),
            'avg_focus_rating': round(avg_focus, 2)
        },
        'trends': {
            'mood_trend': list(weekly_assessments.values_list('mood_rating', flat=True)),
            'focus_trend': list(weekly_assessments.values_list('focus_rating', flat=True))
        },
        'insights': {
            'top_behaviors': list(behaviors.values('behavior_type').annotate(
                count=Count('behavior_type')
            ).order_by('-count')[:3]),
            'medication_adherence': round(
                weekly_assessments.aggregate(avg=Avg('medication_adherence'))['avg'] or 0, 2
            )
        }
    }
    
    # Create progress report
    report = ProgressReport.objects.create(
        user=user,
        report_type=report_type,
        period_start=period_start,
        period_end=period_end,
        overall_score=round(avg_assessment_score, 2),
        improvement_areas=improvement_areas,
        strengths=strengths,
        recommendations=recommendations,
        generated_data=generated_data
    )
    
    return Response({
        'message': 'Progress report generated successfully',
        'report': ProgressReportSerializer(report).data
    })
