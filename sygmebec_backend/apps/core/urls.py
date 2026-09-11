from django.urls import path
from .settings_views import *
urlpatterns=[
 path('me/',PreferenceView.as_view()), path('organization/',OrganizationView.as_view()),
 path('roles/',RolePolicyView.as_view()), path('sessions/',SessionView.as_view()),
 path('backups/',BackupView.as_view()), path('backups/<int:pk>/download/',BackupDownload.as_view()),
 path('backups/<int:pk>/restore/',BackupRestore.as_view()), path('maintenance/',MaintenanceView.as_view()),
 path('notifications/',NotificationView.as_view()), path('deactivation-request/',DeactivationRequestView.as_view()),
]
