from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Medication, UserMedication, MedicationSchedule, 
    MedicationLog, MedicationReminder
)
from .serializers import (
    MedicationSerializer, UserMedicationSerializer, 
    MedicationScheduleSerializer, MedicationLogSerializer,
    MedicationReminderSerializer
)

class MedicationListView(generics.ListAPIView):
    """List all available medications"""
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

class UserMedicationListCreateView(generics.ListCreateAPIView):
    """List and create user medications"""
    serializer_class = UserMedicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserMedication.objects.filter(
            user=self.request.user, 
            is_active=True
        ).select_related('medication').prefetch_related('schedules')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserMedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, delete user medication"""
    serializer_class = UserMedicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserMedication.objects.filter(user=self.request.user)

class MedicationScheduleListCreateView(generics.ListCreateAPIView):
    """List and create medication schedules"""
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_medication_id = self.kwargs.get('user_medication_id')
        return MedicationSchedule.objects.filter(
            user_medication_id=user_medication_id,
            user_medication__user=self.request.user,
            is_active=True
        )
    
    def perform_create(self, serializer):
        user_medication_id = self.kwargs.get('user_medication_id')
        user_medication = UserMedication.objects.get(
            id=user_medication_id,
            user=self.request.user
        )
        serializer.save(user_medication=user_medication)

class MedicationLogListCreateView(generics.ListCreateAPIView):
    """List and create medication logs"""
    serializer_class = MedicationLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MedicationLog.objects.filter(
            user_medication__user=self.request.user
        ).order_by('-scheduled_time')
    
    def perform_create(self, serializer):
        # Auto-set actual_time if status is 'taken'
        if serializer.validated_data.get('status') == 'taken' and not serializer.validated_data.get('actual_time'):
            serializer.save(actual_time=timezone.now())
        else:
            serializer.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medication_dashboard(request):
    """Get medication dashboard data"""
    user = request.user
    today = timezone.now().date()
    
    # Get user medications
    user_medications = UserMedication.objects.filter(
        user=user, 
        is_active=True
    ).select_related('medication')
    
    # Today's scheduled medications
    today_schedules = []
    for user_med in user_medications:
        schedules = MedicationSchedule.objects.filter(
            user_medication=user_med,
            is_active=True
        )
        
        for schedule in schedules:
            # Check if today matches the schedule
            weekday = str(today.isoweekday())  # 1=Monday, 7=Sunday
            if weekday in schedule.days_of_week:
                scheduled_datetime = timezone.make_aware(
                    datetime.combine(today, schedule.time)
                )
                
                # Check if already logged
                log_exists = MedicationLog.objects.filter(
                    user_medication=user_med,
                    scheduled_time__date=today,
                    scheduled_time__time=schedule.time
                ).exists()
                
                today_schedules.append({
                    'id': schedule.id,
                    'user_medication': UserMedicationSerializer(user_med).data,
                    'scheduled_time': scheduled_datetime,
                    'is_logged': log_exists
                })
    
    # Recent logs (last 7 days)
    week_ago = today - timedelta(days=7)
    recent_logs = MedicationLog.objects.filter(
        user_medication__user=user,
        scheduled_time__date__gte=week_ago
    ).order_by('-scheduled_time')
    
    # Adherence rate (last 30 days)
    month_ago = today - timedelta(days=30)
    total_scheduled = MedicationLog.objects.filter(
        user_medication__user=user,
        scheduled_time__date__gte=month_ago
    ).count()
    
    taken_count = MedicationLog.objects.filter(
        user_medication__user=user,
        scheduled_time__date__gte=month_ago,
        status='taken'
    ).count()
    
    adherence_rate = (taken_count / total_scheduled * 100) if total_scheduled > 0 else 0
    
    return Response({
        'user_medications': UserMedicationSerializer(user_medications, many=True).data,
        'today_schedules': today_schedules,
        'recent_logs': MedicationLogSerializer(recent_logs[:10], many=True).data,
        'adherence_rate': round(adherence_rate, 1),
        'stats': {
            'total_medications': user_medications.count(),
            'scheduled_today': len(today_schedules),
            'taken_today': sum(1 for s in today_schedules if s['is_logged']),
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_medication(request):
    """Quick log medication intake"""
    user_medication_id = request.data.get('user_medication_id')
    scheduled_time = request.data.get('scheduled_time')
    status = request.data.get('status', 'taken')
    notes = request.data.get('notes', '')
    
    try:
        user_medication = UserMedication.objects.get(
            id=user_medication_id,
            user=request.user
        )
        
        # Parse scheduled_time
        if isinstance(scheduled_time, str):
            scheduled_time = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
        
        # Create or update log
        log, created = MedicationLog.objects.get_or_create(
            user_medication=user_medication,
            scheduled_time=scheduled_time,
            defaults={
                'status': status,
                'notes': notes,
                'actual_time': timezone.now() if status == 'taken' else None
            }
        )
        
        if not created:
            log.status = status
            log.notes = notes
            if status == 'taken':
                log.actual_time = timezone.now()
            log.save()
        
        return Response(MedicationLogSerializer(log).data)
        
    except UserMedication.DoesNotExist:
        return Response(
            {'error': 'Medication not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medication_statistics(request):
    """Get medication adherence statistics"""
    user = request.user
    days = int(request.GET.get('days', 30))
    start_date = timezone.now().date() - timedelta(days=days)
    
    logs = MedicationLog.objects.filter(
        user_medication__user=user,
        scheduled_time__date__gte=start_date
    )
    
    total_logs = logs.count()
    taken_logs = logs.filter(status='taken').count()
    missed_logs = logs.filter(status='missed').count()
    
    # Daily adherence
    daily_stats = {}
    for log in logs:
        date_str = log.scheduled_time.date().isoformat()
        if date_str not in daily_stats:
            daily_stats[date_str] = {'scheduled': 0, 'taken': 0}
        daily_stats[date_str]['scheduled'] += 1
        if log.status == 'taken':
            daily_stats[date_str]['taken'] += 1
    
    # Calculate daily adherence rates
    for date_str in daily_stats:
        day_data = daily_stats[date_str]
        day_data['adherence_rate'] = (
            day_data['taken'] / day_data['scheduled'] * 100
            if day_data['scheduled'] > 0 else 0
        )
    
    return Response({
        'period_days': days,
        'total_scheduled': total_logs,
        'taken_count': taken_logs,
        'missed_count': missed_logs,
        'adherence_rate': (taken_logs / total_logs * 100) if total_logs > 0 else 0,
        'daily_stats': daily_stats
    })
