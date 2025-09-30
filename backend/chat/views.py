from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from django.db.models import Q, Count
import json
import openai
from django.conf import settings

from .models import ChatRoom, ChatMessage, AIConversation
from .serializers import (
    ChatRoomSerializer, MessageSerializer, MessageCreateSerializer,
    AIAssistantSerializer, AIConversationSerializer, AIConversationCreateSerializer,
    AIChatMessageSerializer, ChatStatsSerializer, ParentChildChatSerializer
)

class ChatRoomListCreateView(generics.ListCreateAPIView):
    """List user's chat rooms or create new room"""
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages').order_by('-updated_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a chat room"""
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    """List messages in a room or send new message"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        room_id = self.kwargs.get('room_id')
        # Ensure user is participant of the room
        room = ChatRoom.objects.filter(
            id=room_id,
            participants=self.request.user
        ).first()
        
        if not room:
            return ChatMessage.objects.none()
        
        return ChatMessage.objects.filter(room=room).select_related(
            'sender', 'room'
        ).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        room_id = self.kwargs.get('room_id')
        
        # Verify user is participant
        room = ChatRoom.objects.filter(
            id=room_id,
            participants=request.user
        ).first()
        
        if not room:
            return Response(
                {'error': 'Chat room not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Set room in data
        request.data['room'] = room_id
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        
        # Update room's updated_at
        room.updated_at = timezone.now()
        room.save()
        
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )

class AIAssistantListView(generics.ListAPIView):
    """List available AI assistants"""
    # AI Assistant functionality would need to be implemented separately
    serializer_class = AIAssistantSerializer
    permission_classes = [IsAuthenticated]

class AIConversationListCreateView(generics.ListCreateAPIView):
    """List user's AI conversations or create new conversation"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AIConversationCreateSerializer
        return AIConversationSerializer
    
    def get_queryset(self):
        return AIConversation.objects.filter(
            user=self.request.user,
            is_active=True
        ).select_related('assistant').order_by('-updated_at')

class AIConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete AI conversation"""
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_ai_message(request):
    """Send message to AI assistant"""
    serializer = AIChatMessageSerializer(data=request.data, context={'request': request})
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    message = serializer.validated_data['message']
    conversation_id = serializer.validated_data['conversation_id']
    
    try:
        conversation = AIConversation.objects.get(
            id=conversation_id,
            user=request.user,
            is_active=True
        )
    except AIConversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get conversation history
    messages = conversation.conversation_data.get('messages', [])
    
    # Add user message
    user_message = {
        'role': 'user',
        'content': message,
        'timestamp': timezone.now().isoformat()
    }
    messages.append(user_message)
    
    # Prepare messages for OpenAI
    openai_messages = [
        {'role': 'system', 'content': conversation.assistant.system_prompt}
    ]
    
    # Add conversation history (last 10 messages to avoid token limit)
    for msg in messages[-10:]:
        if msg['role'] in ['user', 'assistant']:
            openai_messages.append({
                'role': msg['role'],
                'content': msg['content']
            })
    
    try:
        # Call OpenAI API with new client structure
        from openai import OpenAI
        client = OpenAI(api_key=getattr(settings, 'OPENAI_API_KEY', 'your-api-key-here'))
        
        response = client.chat.completions.create(
            model=conversation.assistant.model_name,
            messages=openai_messages,
            max_tokens=conversation.assistant.max_tokens,
            temperature=conversation.assistant.temperature
        )
        
        ai_response = response.choices[0].message.content
        
        # Add AI response to conversation
        ai_message = {
            'role': 'assistant',
            'content': ai_response,
            'timestamp': timezone.now().isoformat()
        }
        messages.append(ai_message)
        
        # Update conversation
        conversation.conversation_data['messages'] = messages
        conversation.updated_at = timezone.now()
        conversation.save()
        
        return Response({
            'message': message,
            'response': ai_response,
            'conversation_id': conversation_id
        })
        
    except Exception as e:
        return Response(
            {'error': f'AI service error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, room_id):
    """Mark messages as read"""
    try:
        room = ChatRoom.objects.get(
            id=room_id,
            participants=request.user
        )
    except ChatRoom.DoesNotExist:
        return Response(
            {'error': 'Chat room not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Mark all unread messages as read (using read status)
    from .models import MessageReadStatus
    unread_messages = ChatMessage.objects.filter(
        room=room
    ).exclude(sender=request.user).exclude(
        read_status__user=request.user
    )
    
    updated_count = 0
    for message in unread_messages:
        MessageReadStatus.objects.get_or_create(
            message=message,
            user=request.user
        )
        updated_count += 1
    
    return Response({
        'message': f'{updated_count} messages marked as read',
        'updated_count': updated_count
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_parent_child_chat(request):
    """Create or get parent-child chat room"""
    serializer = ParentChildChatSerializer(data=request.data, context={'request': request})
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    child_id = serializer.validated_data['child_id']
    message = serializer.validated_data['message']
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        child = User.objects.get(id=child_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'Child not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Find or create chat room
    room = ChatRoom.objects.filter(
        room_type='parent_child',
        participants__in=[request.user, child]
    ).annotate(
        participant_count=Count('participants')
    ).filter(participant_count=2).first()
    
    if not room:
        room = ChatRoom.objects.create(
            name=f'Chat: {request.user.get_full_name()} & {child.get_full_name()}',
            room_type='parent_child',
            created_by=request.user
        )
        room.participants.add(request.user, child)
    
    # Send message if provided
    if message:
        ChatMessage.objects.create(
            room=room,
            sender=request.user,
            content=message,
            message_type='text'
        )
        
        room.updated_at = timezone.now()
        room.save()
    
    return Response({
        'room': ChatRoomSerializer(room, context={'request': request}).data,
        'message': 'Chat room created/accessed successfully'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_dashboard(request):
    """Get chat dashboard data"""
    user = request.user
    
    # User's chat rooms
    rooms = ChatRoom.objects.filter(participants=user).prefetch_related(
        'participants', 'messages'
    )
    
    # Statistics
    total_rooms = rooms.count()
    total_messages = ChatMessage.objects.filter(room__in=rooms).count()
    
    # Count unread messages using read status
    from .models import MessageReadStatus
    all_messages = ChatMessage.objects.filter(room__in=rooms).exclude(sender=user)
    read_message_ids = MessageReadStatus.objects.filter(
        user=user,
        message__in=all_messages
    ).values_list('message_id', flat=True)
    unread_messages = all_messages.exclude(id__in=read_message_ids).count()
    
    # AI conversations
    ai_conversations = AIConversation.objects.filter(
        user=user,
        is_active=True
    ).count()
    
    # Recent activity (last 10 messages)
    recent_messages = ChatMessage.objects.filter(
        room__in=rooms
    ).select_related(
        'sender', 'room'
    ).order_by('-created_at')[:10]
    
    recent_activity = []
    for msg in recent_messages:
        recent_activity.append({
            'id': msg.id,
            'room_name': msg.room.name,
            'sender': msg.sender.get_full_name(),
            'message': msg.content[:100] + '...' if len(msg.content) > 100 else msg.content,
            'created_at': msg.created_at,
            'message_type': msg.message_type
        })
    
    stats = {
        'total_rooms': total_rooms,
        'total_messages': total_messages,
        'unread_messages': unread_messages,
        'active_conversations': ai_conversations,
        'recent_activity': recent_activity
    }
    
    return Response({
        'stats': stats,
        'rooms': ChatRoomSerializer(rooms[:5], many=True, context={'request': request}).data,
        'ai_conversations': AIConversationSerializer(
            AIConversation.objects.filter(user=user, is_active=True)[:5],
            many=True
        ).data
    })
