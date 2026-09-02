from pathlib import Path
from datetime import timedelta
from urllib.parse import unquote, urlparse

from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
def environment_flag(name, default=False):
    """Read common environment flag forms without crashing on deployment labels."""
    value = str(config(name, default='')).strip().lower()
    if not value:
        return default
    if value in {'1', 'true', 'yes', 'on', 'debug', 'development', 'dev'}:
        return True
    if value in {'0', 'false', 'no', 'off', 'production', 'prod', 'release'}:
        return False
    raise ImproperlyConfigured(f'{name} doit etre une valeur booleenne valide.')


# Use a project-specific variable so unrelated system-level DEBUG values do not
# unexpectedly turn a local Django installation into production mode.
DEBUG = environment_flag('DJANGO_DEBUG', default=True)

SECRET_KEY = config('SECRET_KEY', default='')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'django-insecure-&)u$d7x3#e3s8fa$+^vob#yl6&3py93kux)h!5(%xbfy#q)rq8'
    else:
        raise ImproperlyConfigured('SECRET_KEY doit etre defini lorsque DEBUG=False.')

# SECURITY WARNING: don't run with debug turned on in production!
ALLOWED_HOSTS = list(config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1,testserver',
    cast=Csv(),
))


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    
    # Local apps
    'sygmebec_backend.apps.accounts.apps.AccountsConfig',
    'sygmebec_backend.apps.members.apps.MembersConfig',
    'sygmebec_backend.apps.events.apps.EventsConfig',
    'sygmebec_backend.apps.reports.apps.ReportsConfig',
    'sygmebec_backend.apps.letters.apps.LettersConfig',
    'sygmebec_backend.apps.chat.apps.ChatConfig',
    'sygmebec_backend.apps.core.apps.CoreConfig',  # Si core existe
    'sygmebec_backend.apps.vitrine.apps.VitrineConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sygmebec_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sygmebec_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

def database_settings():
    database_url = config('DATABASE_URL', default='').strip()
    if not database_url:
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }

    parsed = urlparse(database_url)
    if parsed.scheme in {'postgres', 'postgresql'}:
        if not parsed.path or parsed.path == '/':
            raise ImproperlyConfigured('DATABASE_URL doit contenir un nom de base PostgreSQL.')
        try:
            port = parsed.port or 5432
        except ValueError as error:
            raise ImproperlyConfigured('DATABASE_URL contient un port invalide.') from error
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': unquote(parsed.path.lstrip('/')),
            'USER': unquote(parsed.username or ''),
            'PASSWORD': unquote(parsed.password or ''),
            'HOST': parsed.hostname or 'localhost',
            'PORT': port,
        }

    if parsed.scheme == 'sqlite':
        database_name = unquote(parsed.path or '')
        if database_name.startswith('//'):
            database_name = database_name[1:]
        elif database_name.startswith('/'):
            database_name = database_name[1:]
        if not database_name:
            database_name = 'db.sqlite3'
        database_path = Path(database_name)
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': database_path if database_path.is_absolute() else BASE_DIR / database_path,
        }

    raise ImproperlyConfigured('DATABASE_URL doit utiliser postgres://, postgresql:// ou sqlite://.')


DATABASES = {'default': database_settings()}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        'OPTIONS': {
            'user_attributes': ('identifiant',),
        },
    },
    {
        'NAME': 'sygmebec_backend.apps.accounts.validators.StrongPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'fr'

TIME_ZONE = 'America/Port-au-Prince'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/6.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.Utilisateur'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # The letters endpoint accepts ``format=docx`` for compatibility with
    # older dashboard builds; DRF must not treat it as a renderer name.
    'URL_FORMAT_OVERRIDE': None,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'public': '20/hour',
        'public-read': '120/hour',
    },
}

# CORS settings (for React frontend)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Disposition']
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Spectacular (DRF YASG) settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Sygmebec API',
    'DESCRIPTION': 'API for Sygmebec application',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'CHECK_REVOKE_TOKEN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Cookie settings for JWT
JWT_COOKIE_SECURE = False  # Mettre à True en production avec HTTPS
JWT_COOKIE_SAMESITE = 'Lax'
FRONTEND_URL = 'http://localhost:5173'
VITRINE_URL = 'http://localhost:5174'
VITRINE_NOTIFICATION_RECIPIENTS = []
RECAPTCHA_SECRET_KEY = ''

CELERY_BROKER_URL = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default=CELERY_BROKER_URL)
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_ALWAYS_EAGER = environment_flag('CELERY_TASK_ALWAYS_EAGER', default=DEBUG)
CELERY_TASK_EAGER_PROPAGATES = environment_flag('CELERY_TASK_EAGER_PROPAGATES', default=DEBUG)

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@sygmebec.org'
