from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.chat_dashboard, name='chat_dashboard'),
    
    # Chat rooms
    path('rooms/', views.ChatRoomListCreateView.as_view(), name='chat_rooms'),
    path('rooms/<int:pk>/', views.ChatRoomDetailView.as_view(), name='chat_room_detail'),
    
    # Messages
    path('rooms/<int:room_id>/messages/', views.MessageListCreateView.as_view(), name='room_messages'),
    path('rooms/<int:room_id>/mark-read/', views.mark_messages_read, name='mark_messages_read'),
    
    # Parent-child chat
    path('parent-child/', views.create_parent_child_chat, name='parent_child_chat'),
    
    # AI Assistant
    path('ai/assistants/', views.AIAssistantListView.as_view(), name='ai_assistants'),
    path('ai/conversations/', views.AIConversationListCreateView.as_view(), name='ai_conversations'),
    path('ai/conversations/<int:pk>/', views.AIConversationDetailView.as_view(), name='ai_conversation_detail'),
    path('ai/send/', views.send_ai_message, name='send_ai_message'),
]