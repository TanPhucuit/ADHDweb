from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone

from .models import ScheduleTemplate, Schedule, ScheduleActivity
from .serializers import (
    ScheduleTemplateSerializer, ScheduleSerializer, ScheduleCreateSerializer,
    ScheduleActivitySerializer, ScheduleActivityCreateSerializer
)

class ScheduleTemplateListView(generics.ListAPIView):
    """List available schedule templates"""
    queryset = ScheduleTemplate.objects.all()
    serializer_class = ScheduleTemplateSerializer
    permission_classes = [IsAuthenticated]

class ScheduleListCreateView(generics.ListCreateAPIView):
    """List user schedules or create new schedule"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ScheduleCreateSerializer
        return ScheduleSerializer
    
    def get_queryset(self):
        return Schedule.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete schedule"""
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Schedule.objects.filter(user=self.request.user)

class ScheduleActivityListCreateView(generics.ListCreateAPIView):
    """List schedule activities or create new activity"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ScheduleActivityCreateSerializer
        return ScheduleActivitySerializer
    
    def get_queryset(self):
        schedule_id = self.kwargs.get('schedule_id')
        
        # Ensure user owns the schedule
        schedule = Schedule.objects.filter(
            id=schedule_id,
            user=self.request.user
        ).first()
        
        if not schedule:
            return ScheduleActivity.objects.none()
        
        return ScheduleActivity.objects.filter(
            schedule=schedule
        ).order_by('start_time')

class ScheduleActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete schedule activity"""
    serializer_class = ScheduleActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ScheduleActivity.objects.filter(
            schedule__user=self.request.user
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def schedule_dashboard(request):
    """Get schedule dashboard data"""
    user = request.user
    
    # Basic stats
    schedules = Schedule.objects.filter(user=user)
    total_schedules = schedules.count()
    active_schedules = schedules.filter(is_active=True).count()
    
    return Response({
        'stats': {
            'total_schedules': total_schedules,
            'active_schedules': active_schedules,
        },
        'recent_schedules': ScheduleSerializer(schedules[:5], many=True).data,
        'templates': ScheduleTemplateSerializer(
            ScheduleTemplate.objects.all()[:5],
            many=True
        ).data,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_schedule(request):
    """Get daily schedule overview - simplified"""
    user = request.user
    date_str = request.GET.get('date', timezone.now().date().isoformat())
    
    try:
        target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        target_date = timezone.now().date()
    
    # Get schedules for the day
    schedules = Schedule.objects.filter(
        user=user,
        start_date=target_date,
        is_active=True
    )
    
    return Response({
        'date': target_date,
        'schedules': ScheduleSerializer(schedules, many=True).data
    })