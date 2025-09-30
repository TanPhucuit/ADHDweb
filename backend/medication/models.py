from django.db import models
from django.conf import settings

class Medication(models.Model):
    """Medication information"""
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    dosage_form = models.CharField(max_length=50, help_text="tablet, capsule, liquid, etc.")
    strength = models.CharField(max_length=50, help_text="mg, ml, etc.")
    manufacturer = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.strength})"

class UserMedication(models.Model):
    """User's prescribed medications"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='medications')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    prescribed_by = models.CharField(max_length=200, help_text="Doctor's name")
    dosage = models.CharField(max_length=100, help_text="e.g., 1 tablet, 5ml")
    frequency = models.CharField(max_length=100, help_text="e.g., twice daily, every 8 hours")
    instructions = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.medication.name}"

class MedicationSchedule(models.Model):
    """Scheduled times for taking medication"""
    user_medication = models.ForeignKey(UserMedication, on_delete=models.CASCADE, related_name='schedules')
    time = models.TimeField()
    days_of_week = models.CharField(max_length=7, default='1234567', help_text="1=Monday, 7=Sunday")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user_medication} at {self.time}"

class MedicationLog(models.Model):
    """Log of medication taken"""
    STATUS_CHOICES = (
        ('taken', 'Taken'),
        ('missed', 'Missed'),
        ('delayed', 'Delayed'),
        ('skipped', 'Skipped'),
    )
    
    user_medication = models.ForeignKey(UserMedication, on_delete=models.CASCADE, related_name='logs')
    scheduled_time = models.DateTimeField()
    actual_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user_medication} - {self.status} at {self.scheduled_time}"

class MedicationReminder(models.Model):
    """Medication reminders/notifications"""
    user_medication = models.ForeignKey(UserMedication, on_delete=models.CASCADE, related_name='reminders')
    reminder_time = models.DateTimeField()
    message = models.TextField()
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Reminder for {self.user_medication} at {self.reminder_time}"
