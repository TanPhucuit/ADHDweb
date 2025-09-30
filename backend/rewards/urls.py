from django.urls import path
from . import views

app_name = 'rewards'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.rewards_dashboard, name='rewards_dashboard'),
    
    # Reward categories and rewards
    path('categories/', views.RewardCategoryListView.as_view(), name='reward_categories'),
    path('rewards/', views.RewardListView.as_view(), name='rewards_list'),
    
    # User points management
    path('points/', views.UserPointsView.as_view(), name='user_points'),
    path('points/transactions/', views.PointsTransactionListView.as_view(), name='points_transactions'),
    path('points/award/', views.award_points, name='award_points'),
    
    # Reward claiming
    path('claim/', views.claim_reward, name='claim_reward'),
    path('claimed/', views.UserRewardListView.as_view(), name='claimed_rewards'),
    
    # Achievements
    path('achievements/', views.AchievementListView.as_view(), name='achievements'),
    path('achievements/earned/', views.UserAchievementListView.as_view(), name='earned_achievements'),
    path('achievements/check/', views.check_achievements, name='check_achievements'),
]