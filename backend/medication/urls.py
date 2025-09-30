from django.urls import path
from . import views

app_name = 'medication'

urlpatterns = [
    path('medications/', views.MedicationListView.as_view(), name='medication-list'),
    path('user-medications/', views.UserMedicationListCreateView.as_view(), name='user-medication-list'),
    path('user-medications/<int:pk>/', views.UserMedicationDetailView.as_view(), name='user-medication-detail'),
    path('user-medications/<int:user_medication_id>/schedules/', views.MedicationScheduleListCreateView.as_view(), name='medication-schedule-list'),
    path('logs/', views.MedicationLogListCreateView.as_view(), name='medication-log-list'),
    path('dashboard/', views.medication_dashboard, name='dashboard'),
    path('log/', views.log_medication, name='log-medication'),
    path('statistics/', views.medication_statistics, name='statistics'),
]