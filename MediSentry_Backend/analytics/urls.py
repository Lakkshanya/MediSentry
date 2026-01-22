from django.urls import path
from .views import AnalyzeRiskView, AlternativesView

urlpatterns = [
    path('predict/', AnalyzeRiskView.as_view(), name='predict'),
    path('alternatives/<str:drug_name>/', AlternativesView.as_view(), name='alternatives'),
]
