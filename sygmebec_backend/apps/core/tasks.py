"""Scheduled operations for the administration module."""

from celery import shared_task

from .audit import log_audit
from .operations import scheduled_maintenance


@shared_task(bind=True, autoretry_for=(), max_retries=0)
def run_system_maintenance(self):
    """Run the configured backup and audit-retention policies once a day."""
    try:
        result = scheduled_maintenance()
        log_audit(
            action='SYSTEM_TASK_COMPLETED',
            module='SYSTEM',
            summary='Maintenance planifiée terminée',
            metadata=result,
            source='TASK',
        )
        return result
    except Exception as error:
        # The task can fail independently of a user request, so write a
        # compact diagnostic without storing server secrets or a traceback.
        log_audit(
            action='SYSTEM_TASK_FAILED',
            module='SYSTEM',
            status='FAILURE',
            severity='CRITICAL',
            summary='La maintenance planifiée a échoué',
            metadata={'task': self.name, 'error_type': error.__class__.__name__},
            source='TASK',
        )
        raise
