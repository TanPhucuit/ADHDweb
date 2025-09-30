from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, ParentChildRelation

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'date_of_birth')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'date_of_birth')
        }),
    )

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'timezone', 'language', 'notifications_enabled']
    list_filter = ['timezone', 'language', 'notifications_enabled']
    search_fields = ['user__username', 'user__email']

@admin.register(ParentChildRelation)
class ParentChildRelationAdmin(admin.ModelAdmin):
    list_display = ['parent', 'child', 'relationship_type', 'is_active', 'created_at']
    list_filter = ['relationship_type', 'is_active', 'created_at']
    search_fields = ['parent__username', 'child__username']
