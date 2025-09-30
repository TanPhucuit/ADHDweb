from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('list/', views.UserListView.as_view(), name='user-list'),
    path('dashboard-data/', views.user_dashboard_data, name='dashboard-data'),
    path('change-password/', views.change_password, name='change-password'),
    path('relationships/', views.ParentChildRelationView.as_view(), name='relationships'),
]