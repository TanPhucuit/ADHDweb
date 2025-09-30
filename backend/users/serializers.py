# User serializers
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Profile, ParentChildRelation

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar', 'bio', 'timezone', 'language', 'notifications_enabled']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'phone_number', 'date_of_birth', 'profile', 
                 'password', 'password_confirm', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        # Create profile
        Profile.objects.create(user=user)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'user_type', 'phone_number', 
                 'date_of_birth', 'profile']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile
        if profile_data:
            profile, created = Profile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance

class ParentChildRelationSerializer(serializers.ModelSerializer):
    parent = UserSerializer(read_only=True)
    child = UserSerializer(read_only=True)
    parent_id = serializers.IntegerField(write_only=True)
    child_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ParentChildRelation
        fields = ['id', 'parent', 'child', 'parent_id', 'child_id', 
                 'relationship_type', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']