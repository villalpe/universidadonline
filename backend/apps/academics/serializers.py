from rest_framework import serializers

from .models import Career, StudyPlan, Subject, StudyPlanSubject, AcademicPeriod


class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = "__all__"


class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class StudyPlanSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlanSubject
        fields = "__all__"


class AcademicPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPeriod
        fields = "__all__"