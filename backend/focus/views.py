from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import FocusSession, FocusSound, UserFocusSettings
from .serializers import (
    FocusSessionSerializer, FocusSoundSerializer, 
    UserFocusSettingsSerializer
)

class FocusSessionListCreateView(generics.ListCreateAPIView):
    """List and create focus sessions"""
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user).order_by('-start_time')

class FocusSessionDetailView(generics.RetrieveUpdateAPIView):
    """Get, update focus session"""
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

class FocusSoundListView(generics.ListAPIView):
    """List available focus sounds"""
    queryset = FocusSound.objects.filter(is_active=True)
    serializer_class = FocusSoundSerializer
    permission_classes = [IsAuthenticated]

class UserFocusSettingsView(generics.RetrieveUpdateAPIView):
    """Get and update user focus settings"""
    serializer_class = UserFocusSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        obj, created = UserFocusSettings.objects.get_or_create(
            user=self.request.user
        )
        return obj

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_focus_session(request):
    """Start a new focus session"""
    user = request.user
    session_type = request.data.get('session_type', 'pomodoro')
    title = request.data.get('title', '')
    planned_duration = request.data.get('planned_duration', 25)
    
    # End any active sessions
    FocusSession.objects.filter(
        user=user, 
        status='active'
    ).update(status='cancelled', end_time=timezone.now())
    
    # Create new session
    session = FocusSession.objects.create(
        user=user,
        session_type=session_type,
        title=title,
        planned_duration=planned_duration,
        status='active'
    )
    
    return Response(FocusSessionSerializer(session).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_focus_session(request, session_id):
    """End a focus session"""
    try:
        session = FocusSession.objects.get(
            id=session_id, 
            user=request.user
        )
        
        if session.status != 'active':
            return Response(
                {'error': 'Session is not active'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.end_time = timezone.now()
        session.status = request.data.get('status', 'completed')
        
        # Calculate actual duration
        if session.start_time:
            duration = session.end_time - session.start_time
            session.actual_duration = int(duration.total_seconds() / 60)
        
        session.save()
        
        return Response(FocusSessionSerializer(session).data)
        
    except FocusSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def focus_statistics(request):
    """Get focus session statistics"""
    user = request.user
    
    # Get date range (last 7 days by default)
    days = int(request.GET.get('days', 7))
    start_date = timezone.now() - timedelta(days=days)
    
    sessions = FocusSession.objects.filter(
        user=user,
        start_time__gte=start_date,
        status='completed'
    )
    
    total_sessions = sessions.count()
    total_minutes = sum(s.actual_duration or 0 for s in sessions)
    avg_session_length = total_minutes / total_sessions if total_sessions > 0 else 0
    
    # Sessions by type
    session_types = {}
    for session in sessions:
        session_types[session.session_type] = session_types.get(session.session_type, 0) + 1
    
    # Daily breakdown
    daily_stats = {}
    for session in sessions:
        date_str = session.start_time.date().isoformat()
        if date_str not in daily_stats:
            daily_stats[date_str] = {'sessions': 0, 'minutes': 0}
        daily_stats[date_str]['sessions'] += 1
        daily_stats[date_str]['minutes'] += session.actual_duration or 0
    
    return Response({
        'total_sessions': total_sessions,
        'total_minutes': total_minutes,
        'average_session_length': round(avg_session_length, 1),
        'session_types': session_types,
        'daily_stats': daily_stats,
        'period_days': days
    })
