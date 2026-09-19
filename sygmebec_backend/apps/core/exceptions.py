from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """Custom exception handler for consistent error responses."""
    response = exception_handler(exc, context)
    request = context.get('request')
    request_id = getattr(getattr(request, '_request', request), 'request_id', '')

    if response is not None:
        payload = response.data
        message = payload.get('detail', payload) if isinstance(payload, dict) else payload
        return Response({
            'success': False,
            'error': {
                'code': response.status_code,
                'message': message,
                'data': payload,
                'request_id': request_id,
            },
            'request_id': request_id,
        }, status=response.status_code)
    
    return Response({
        'success': False,
        'error': {
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'Une erreur interne est survenue.',
            'data': None,
            'request_id': request_id,
        },
        'request_id': request_id,
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
