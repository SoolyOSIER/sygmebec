import uuid
from .audit import request_context, log_audit

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = str(uuid.uuid4())
        token = request_context.set(request)
        try:
            response = self.get_response(request)
            if request.path.startswith('/api/'):
                module = {'membres':'MEMBERS','evenements':'EVENTS','galerie-images':'GALLERY','demandes-adhesion':'REGISTRATION','rapports':'REPORTS','lettres':'LETTERS','utilisateurs':'USERS','settings':'SETTINGS','auth':'AUTH'}.get(request.path.strip('/').split('/')[2] if len(request.path.strip('/').split('/'))>2 else '', 'SYSTEM')
                action = None
                if response.status_code == 403:
                    action, severity, status = 'ACCESS_DENIED', 'SECURITY', 'DENIED'
                elif response.status_code >= 500:
                    action, severity, status = 'SYSTEM_REQUEST_FAILED', 'CRITICAL', 'FAILURE'
                elif response.status_code >= 400 and request.method not in ('GET','HEAD','OPTIONS'):
                    action, severity, status = module+'_REQUEST_FAILED', 'WARNING', 'FAILURE'
                elif request.method == 'GET' and any(x in request.path for x in ('export','telecharg','download')):
                    action, severity, status = module+'_EXPORTED', 'WARNING', 'SUCCESS'
                if action and not getattr(request, '_audit_logged', False):
                    log_audit(action=action, module=module, request=request, severity=severity, status=status,
                              metadata={'http_status':response.status_code, 'method':request.method})
                response['X-Request-ID'] = request.request_id
            return response
        finally:
            request_context.reset(token)
