from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    """Chat rooms for parent-child communication"""
    ROOM_TYPES = (
        ('family', 'Family Chat'),
        ('parent_child', 'Parent-Child Chat'),
        ('ai_assistant', 'AI Assistant Chat'),
    )
    
    name = models.CharField(max_length=200)
    room_type = models.CharField(max_length=15, choices=ROOM_TYPES, default='family')
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_rooms')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.room_type})"

class ChatMessage(models.Model):
    """Individual chat messages"""
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System'),
        ('ai_response', 'AI Response'),
    )
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages', null=True, blank=True)
    message_type = models.CharField(max_length=15, choices=MESSAGE_TYPES, default='text')
    content = models.TextField()
    file_attachment = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        sender_name = self.sender.username if self.sender else "System"
        return f"{sender_name}: {self.content[:50]}"

class MessageReadStatus(models.Model):
    """Track which messages have been read by which users"""
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='read_status')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('message', 'user')
    
    def __str__(self):
        return f"{self.user.username} read message {self.message.id}"

class AIConversation(models.Model):
    """AI conversation sessions"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    session_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    context = models.JSONField(default=dict, help_text="Conversation context and history")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - AI Session {self.session_id[:8]}"

class AIMessage(models.Model):
    """Individual AI conversation messages"""
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    )
    
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    tokens_used = models.IntegerField(null=True, blank=True)
    model_used = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
