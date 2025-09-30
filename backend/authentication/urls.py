from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user-info/', views.user_info, name='user-info'),
    path('password-reset/', views.password_reset_request, name='password-reset'),
    path('verify-token/', views.verify_token, name='verify-token'),
]