from django.urls import path
from . import views

app_name = 'assessment'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.assessment_dashboard, name='assessment_dashboard'),
    
    # Assessment templates
    path('templates/', views.AssessmentTemplateListView.as_view(), name='assessment_templates'),
    
    # Assessments
    path('assessments/', views.AssessmentListCreateView.as_view(), name='assessments'),
    path('assessments/<int:pk>/', views.AssessmentDetailView.as_view(), name='assessment_detail'),
    path('assessments/<int:assessment_id>/respond/', views.submit_assessment_response, name='submit_response'),
    
    # Weekly assessments
    path('weekly/', views.WeeklyAssessmentListCreateView.as_view(), name='weekly_assessments'),
    
    # Behavior logs
    path('behaviors/', views.BehaviorLogListCreateView.as_view(), name='behavior_logs'),
    path('behaviors/analysis/', views.behavior_analysis, name='behavior_analysis'),
    
    # Progress reports
    path('reports/', views.ProgressReportListView.as_view(), name='progress_reports'),
    path('reports/generate/', views.generate_progress_report, name='generate_report'),
]