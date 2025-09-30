# Focus serializers
from rest_framework import serializers
from .models import FocusSession, FocusSound, UserFocusSettings

class FocusSessionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = FocusSession
        fields = '__all__'
        read_only_fields = ['id', 'user', 'start_time', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FocusSoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSound
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class UserFocusSettingsSerializer(serializers.ModelSerializer):
    preferred_sound = FocusSoundSerializer(read_only=True)
    preferred_sound_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = UserFocusSettings
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']