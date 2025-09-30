# Medication serializers
from rest_framework import serializers
from .models import (
    Medication, UserMedication, MedicationSchedule, 
    MedicationLog, MedicationReminder
)

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class MedicationScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class UserMedicationSerializer(serializers.ModelSerializer):
    medication = MedicationSerializer(read_only=True)
    medication_id = serializers.IntegerField(write_only=True)
    schedules = MedicationScheduleSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserMedication
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class MedicationLogSerializer(serializers.ModelSerializer):
    user_medication = UserMedicationSerializer(read_only=True)
    user_medication_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MedicationLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class MedicationReminderSerializer(serializers.ModelSerializer):
    user_medication = UserMedicationSerializer(read_only=True)
    
    class Meta:
        model = MedicationReminder
        fields = '__all__'
        read_only_fields = ['id', 'is_sent', 'sent_at', 'created_at']