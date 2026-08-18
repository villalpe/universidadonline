from rest_framework import viewsets

from apps.accounts.permissions import IsAdminUserRole
from .models import Career, StudyPlan, Subject, StudyPlanSubject, AcademicPeriod
from .serializers import (
    CareerSerializer,
    StudyPlanSerializer,
    SubjectSerializer,
    StudyPlanSubjectSerializer,
    AcademicPeriodSerializer,
)


class CareerViewSet(viewsets.ModelViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
    permission_classes = [IsAdminUserRole]


class StudyPlanViewSet(viewsets.ModelViewSet):
    queryset = StudyPlan.objects.select_related("career").all()
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAdminUserRole]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminUserRole]


class StudyPlanSubjectViewSet(viewsets.ModelViewSet):
    queryset = StudyPlanSubject.objects.select_related("study_plan", "subject").all()
    serializer_class = StudyPlanSubjectSerializer
    permission_classes = [IsAdminUserRole]


class AcademicPeriodViewSet(viewsets.ModelViewSet):
    queryset = AcademicPeriod.objects.all()
    serializer_class = AcademicPeriodSerializer
    permission_classes = [IsAdminUserRole]