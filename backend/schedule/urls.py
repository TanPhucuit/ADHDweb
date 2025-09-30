from django.urls import path
from . import views

app_name = 'schedule'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.schedule_dashboard, name='schedule_dashboard'),
    
    # Schedule templates
    path('templates/', views.ScheduleTemplateListView.as_view(), name='schedule_templates'),
    path('templates/<int:template_id>/create/', views.create_from_template, name='create_from_template'),
    
    # Schedules
    path('schedules/', views.ScheduleListCreateView.as_view(), name='schedules'),
    path('schedules/<int:pk>/', views.ScheduleDetailView.as_view(), name='schedule_detail'),
    
    # Schedule items
    path('schedules/<int:schedule_id>/items/', views.ScheduleItemListCreateView.as_view(), name='schedule_items'),
    path('items/<int:pk>/', views.ScheduleItemDetailView.as_view(), name='schedule_item_detail'),
    path('items/<int:item_id>/complete/', views.complete_schedule_item, name='complete_item'),
    path('items/<int:item_id>/skip/', views.skip_schedule_item, name='skip_item'),
    
    # Daily and weekly views
    path('daily/', views.daily_schedule, name='daily_schedule'),
    path('weekly/', views.weekly_schedule, name='weekly_schedule'),
    
    # Recurring events
    path('recurring/', views.RecurringEventListCreateView.as_view(), name='recurring_events'),
]