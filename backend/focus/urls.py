from django.urls import path
from . import views

app_name = 'focus'

urlpatterns = [
    path('sessions/', views.FocusSessionListCreateView.as_view(), name='session-list'),
    path('sessions/<int:pk>/', views.FocusSessionDetailView.as_view(), name='session-detail'),
    path('sessions/start/', views.start_focus_session, name='start-session'),
    path('sessions/<int:session_id>/end/', views.end_focus_session, name='end-session'),
    path('sounds/', views.FocusSoundListView.as_view(), name='sound-list'),
    path('settings/', views.UserFocusSettingsView.as_view(), name='user-settings'),
    path('statistics/', views.focus_statistics, name='statistics'),
]