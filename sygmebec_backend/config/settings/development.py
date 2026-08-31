from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Database
DATABASES = {
    'default': config(
        'DATABASE_URL',
        default='sqlite:///db.sqlite3',
        cast=lambda x: {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': x.split('/')[-1],
            'USER': x.split('://')[1].split(':')[0],
            'PASSWORD': x.split(':')[2].split('@')[0],
            'HOST': x.split('@')[1].split(':')[0],
            'PORT': x.split(':')[-1].split('/')[0],
        }
        if x.startswith('postgres') else {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    )
}

# Email for development - console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Debug toolbar
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1']

# Celery
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
