from django.contrib import admin
from .models import FocusSession, FocusSound, UserFocusSettings

@admin.register(FocusSession)
class FocusSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_type', 'title', 'planned_duration', 'actual_duration', 'status', 'start_time']
    list_filter = ['session_type', 'status', 'start_time']
    search_fields = ['user__username', 'title']
    readonly_fields = ['start_time', 'created_at']

@admin.register(FocusSound)
class FocusSoundAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'duration', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'category']

@admin.register(UserFocusSettings)
class UserFocusSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'pomodoro_duration', 'short_break_duration', 'long_break_duration', 'sound_enabled']
    list_filter = ['sound_enabled', 'notification_enabled', 'auto_start_breaks']
    search_fields = ['user__username']
