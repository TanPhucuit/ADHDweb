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
    queryset = ScheduleTemplate.objects.filter(is_active=True)
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
        date_filter = self.request.query_params.get('date')
        queryset = Schedule.objects.filter(
            user=self.request.user
        ).select_related('template', 'user').prefetch_related('items')
        
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                queryset = queryset.filter(schedule_date=filter_date)
            except ValueError:
                pass
        
        return queryset.order_by('-schedule_date')

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

class RecurringEventListCreateView(generics.ListCreateAPIView):
    """List recurring events or create new event"""
    serializer_class = RecurringEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RecurringEvent.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_schedule_item(request, item_id):
    """Mark schedule item as completed"""
    try:
        item = ScheduleItem.objects.get(
            id=item_id,
            schedule__user=request.user
        )
    except ScheduleItem.DoesNotExist:
        return Response(
            {'error': 'Schedule item not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    item.completion_status = 'completed'
    item.save()
    
    # Update schedule status if all items completed
    schedule = item.schedule
    all_completed = not schedule.items.filter(
        completion_status__in=['pending', 'in_progress']
    ).exists()
    
    if all_completed:
        schedule.status = 'completed'
        schedule.save()
    
    return Response({
        'message': 'Schedule item completed successfully',
        'item': ScheduleItemSerializer(item).data,
        'schedule_status': schedule.status
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def skip_schedule_item(request, item_id):
    """Mark schedule item as skipped"""
    try:
        item = ScheduleItem.objects.get(
            id=item_id,
            schedule__user=request.user
        )
    except ScheduleItem.DoesNotExist:
        return Response(
            {'error': 'Schedule item not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    item.completion_status = 'skipped'
    item.notes = request.data.get('reason', 'Skipped by user')
    item.save()
    
    return Response({
        'message': 'Schedule item skipped',
        'item': ScheduleItemSerializer(item).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_schedule(request):
    """Get daily schedule overview"""
    date_str = request.GET.get('date', timezone.now().date().isoformat())
    
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        target_date = timezone.now().date()
    
    # Get schedules for the day
    schedules = Schedule.objects.filter(
        user=request.user,
        schedule_date=target_date
    ).prefetch_related('items')
    
    all_items = []
    for schedule in schedules:
        all_items.extend(schedule.items.all())
    
    # Calculate stats
    total_items = len(all_items)
    completed_items = len([item for item in all_items if item.completion_status == 'completed'])
    pending_items = len([item for item in all_items if item.completion_status == 'pending'])
    
    now = timezone.now()
    overdue_items = len([
        item for item in all_items 
        if item.end_time and item.end_time < now and item.completion_status != 'completed'
    ])
    
    completion_rate = (completed_items / total_items * 100) if total_items > 0 else 0
    
    # Sort items by start time
    all_items.sort(key=lambda x: x.start_time)
    
    return Response({
        'date': target_date,
        'total_items': total_items,
        'completed_items': completed_items,
        'pending_items': pending_items,
        'overdue_items': overdue_items,
        'completion_rate': round(completion_rate, 2),
        'items': ScheduleItemSerializer(all_items, many=True).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_schedule(request):
    """Get weekly schedule overview"""
    date_str = request.GET.get('date', timezone.now().date().isoformat())
    
    try:
        start_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        start_date = timezone.now().date()
    
    # Get start of week (Monday)
    week_start = start_date - timedelta(days=start_date.weekday())
    week_end = week_start + timedelta(days=6)
    
    daily_schedules = []
    week_total_items = 0
    week_completed_items = 0
    
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        
        # Get schedules for this day
        schedules = Schedule.objects.filter(
            user=request.user,
            schedule_date=current_date
        ).prefetch_related('items')
        
        day_items = []
        for schedule in schedules:
            day_items.extend(schedule.items.all())
        
        # Calculate daily stats
        total_items = len(day_items)
        completed_items = len([item for item in day_items if item.completion_status == 'completed'])
        pending_items = len([item for item in day_items if item.completion_status == 'pending'])
        
        now = timezone.now()
        overdue_items = len([
            item for item in day_items 
            if item.end_time and item.end_time < now and item.completion_status != 'completed'
        ])
        
        completion_rate = (completed_items / total_items * 100) if total_items > 0 else 0
        
        daily_schedules.append({
            'date': current_date,
            'total_items': total_items,
            'completed_items': completed_items,
            'pending_items': pending_items,
            'overdue_items': overdue_items,
            'completion_rate': round(completion_rate, 2),
            'items': ScheduleItemSerializer(day_items, many=True).data
        })
        
        week_total_items += total_items
        week_completed_items += completed_items
    
    week_completion_rate = (week_completed_items / week_total_items * 100) if week_total_items > 0 else 0
    
    return Response({
        'week_start': week_start,
        'week_end': week_end,
        'daily_schedules': daily_schedules,
        'week_completion_rate': round(week_completion_rate, 2),
        'total_items': week_total_items,
        'completed_items': week_completed_items
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def schedule_dashboard(request):
    """Get schedule dashboard data"""
    user = request.user
    
    # Basic stats
    schedules = Schedule.objects.filter(user=user)
    total_schedules = schedules.count()
    active_schedules = schedules.filter(status='active').count()
    
    # Get all items from last 7 days
    week_ago = timezone.now() - timedelta(days=7)
    recent_items = ScheduleItem.objects.filter(
        schedule__user=user,
        schedule__schedule_date__gte=week_ago.date()
    )
    
    total_items = recent_items.count()
    completed_items = recent_items.filter(completion_status='completed').count()
    completion_rate = (completed_items / total_items * 100) if total_items > 0 else 0
    
    # Overdue items
    now = timezone.now()
    overdue_items = recent_items.filter(
        end_time__lt=now,
        completion_status__in=['pending', 'in_progress']
    ).count()
    
    # Upcoming items (next 24 hours)
    tomorrow = now + timedelta(days=1)
    upcoming_items = ScheduleItem.objects.filter(
        schedule__user=user,
        start_time__gte=now,
        start_time__lte=tomorrow,
        completion_status='pending'
    ).order_by('start_time')[:5]
    
    upcoming_list = []
    for item in upcoming_items:
        upcoming_list.append({
            'id': item.id,
            'title': item.title,
            'start_time': item.start_time,
            'item_type': item.item_type,
            'priority': item.priority
        })
    
    # Weekly progress (last 7 days)
    weekly_progress = []
    for i in range(7):
        day = timezone.now().date() - timedelta(days=6-i)
        day_items = ScheduleItem.objects.filter(
            schedule__user=user,
            schedule__schedule_date=day
        )
        
        day_total = day_items.count()
        day_completed = day_items.filter(completion_status='completed').count()
        day_rate = (day_completed / day_total * 100) if day_total > 0 else 0
        
        weekly_progress.append({
            'date': day,
            'completion_rate': round(day_rate, 2),
            'total_items': day_total,
            'completed_items': day_completed
        })
    
    # Today's schedule
    today = timezone.now().date()
    today_schedule = Schedule.objects.filter(
        user=user,
        schedule_date=today
    ).first()
    
    return Response({
        'stats': {
            'total_schedules': total_schedules,
            'active_schedules': active_schedules,
            'completion_rate': round(completion_rate, 2),
            'overdue_items': overdue_items,
            'upcoming_items': upcoming_list,
            'weekly_progress': weekly_progress
        },
        'today_schedule': ScheduleSerializer(today_schedule).data if today_schedule else None,
        'templates': ScheduleTemplateSerializer(
            ScheduleTemplate.objects.filter(is_active=True)[:5],
            many=True
        ).data,
        'recurring_events': RecurringEventSerializer(
            RecurringEvent.objects.filter(user=user, is_active=True)[:5],
            many=True
        ).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_from_template(request, template_id):
    """Create schedule from template"""
    try:
        template = ScheduleTemplate.objects.get(id=template_id, is_active=True)
    except ScheduleTemplate.DoesNotExist:
        return Response(
            {'error': 'Template not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    schedule_date = request.data.get('date', timezone.now().date())
    if isinstance(schedule_date, str):
        try:
            schedule_date = datetime.strptime(schedule_date, '%Y-%m-%d').date()
        except ValueError:
            schedule_date = timezone.now().date()
    
    # Create schedule
    schedule = Schedule.objects.create(
        user=request.user,
        template=template,
        title=f"{template.name} - {schedule_date}",
        description=template.description,
        schedule_date=schedule_date
    )
    
    # Create items from template
    template_items = template.template_items.all()
    for template_item in template_items:
        start_datetime = timezone.make_aware(
            datetime.combine(
                schedule_date,
                datetime.min.time().replace(
                    hour=template_item.default_start_hour,
                    minute=template_item.default_start_minute
                )
            )
        )
        
        ScheduleItem.objects.create(
            schedule=schedule,
            title=template_item.title,
            description=template_item.description,
            item_type=template_item.item_type,
            start_time=start_datetime,
            duration=template_item.default_duration,
            priority=template_item.priority,
            is_flexible=template_item.is_flexible,
            reminder_minutes=template_item.reminder_minutes,
            color=template_item.color
        )
    
    return Response({
        'message': 'Schedule created from template successfully',
        'schedule': ScheduleSerializer(schedule).data
    })
