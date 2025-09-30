from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage, AIConversation

User = get_user_model()

class UserChatSerializer(serializers.ModelSerializer):
    """Basic user serializer for chat"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'user_type']

class ChatRoomSerializer(serializers.ModelSerializer):
    """Chat room serializer with participants"""
    participants = UserChatSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source='participants'
    )
    created_by = UserChatSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'room_type', 'participants', 
            'participant_ids', 'created_by', 'created_at', 'updated_at',
            'last_message', 'unread_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """Get the last message in the room"""
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender': last_message.sender.username if last_message.sender else 'System',
                'created_at': last_message.created_at,
                'message_type': last_message.message_type
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import MessageReadStatus
            messages = obj.messages.exclude(sender=request.user)
            read_message_ids = MessageReadStatus.objects.filter(
                user=request.user,
                message__in=messages
            ).values_list('message_id', flat=True)
            return messages.exclude(id__in=read_message_ids).count()
        return 0

class MessageSerializer(serializers.ModelSerializer):
    """Message serializer"""
    sender = UserChatSerializer(read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'room_name', 'sender', 'content', 
            'message_type', 'file_attachment', 'is_edited',
            'created_at'
        ]
        read_only_fields = ['sender', 'created_at']

class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    
    class Meta:
        model = ChatMessage
        fields = ['room', 'content', 'message_type', 'file_attachment']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

class AIAssistantSerializer(serializers.ModelSerializer):
    """AI Assistant serializer - to be implemented"""
    
    class Meta:
        model = AIConversation  # Temporary placeholder
        fields = ['id', 'title']

class AIConversationSerializer(serializers.ModelSerializer):
    """AI Conversation serializer"""
    user = UserChatSerializer(read_only=True)
    assistant = AIAssistantSerializer(read_only=True)
    # AI Assistant functionality to be implemented later
    
    class Meta:
        model = AIConversation
        fields = [
            'id', 'user', 'assistant', 'assistant_id', 'title',
            'conversation_data', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class AIConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AI conversations"""
    
    class Meta:
        model = AIConversation
        fields = ['assistant', 'title']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['conversation_data'] = {'messages': []}
        return super().create(validated_data)

class AIChatMessageSerializer(serializers.Serializer):
    """Serializer for AI chat messages"""
    message = serializers.CharField(max_length=2000)
    conversation_id = serializers.IntegerField()
    
    def validate_conversation_id(self, value):
        """Validate that conversation exists and belongs to user"""
        try:
            conversation = AIConversation.objects.get(
                id=value, 
                user=self.context['request'].user,
                is_active=True
            )
            return value
        except AIConversation.DoesNotExist:
            raise serializers.ValidationError("Conversation not found or access denied")

class ChatStatsSerializer(serializers.Serializer):
    """Serializer for chat statistics"""
    total_rooms = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    active_conversations = serializers.IntegerField()
    recent_activity = serializers.ListField()
    
class ParentChildChatSerializer(serializers.Serializer):
    """Serializer for parent-child chat functionality"""
    child_id = serializers.IntegerField()
    message = serializers.CharField(max_length=1000)
    
    def validate_child_id(self, value):
        """Validate that child belongs to parent"""
        from users.models import ParentChildRelation
        
        try:
            relation = ParentChildRelation.objects.get(
                parent=self.context['request'].user,
                child_id=value,
                is_active=True
            )
            return value
        except ParentChildRelation.DoesNotExist:
            raise serializers.ValidationError("Child not found or access denied")